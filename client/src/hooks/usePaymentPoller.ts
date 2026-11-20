import { useEffect, useRef } from 'react';
import { checkInvoiceStatus, ackAudioAnnouncement } from '../services/api';
import type { InvoiceRecord } from '../types/soundbox';

const ACTIVE_INVOICE_STORAGE_KEY = 'sovereign_soundbox_active_invoice_id';

interface UsePaymentPollerParams {
  activeInvoice: InvoiceRecord | null;
  setActiveInvoice: React.Dispatch<React.SetStateAction<InvoiceRecord | null>>;
  onVerifiedSettlement: (invoice: InvoiceRecord) => void;
}

export function usePaymentPoller({
  activeInvoice,
  setActiveInvoice,
  onVerifiedSettlement,
}: UsePaymentPollerParams) {
  const isSettlementHandledRef = useRef<Record<string, boolean>>({});

  // 1. Browser Refresh Resilience: Restore active invoice on browser reload
  useEffect(() => {
    const savedId = sessionStorage.getItem(ACTIVE_INVOICE_STORAGE_KEY);
    if (savedId && !activeInvoice) {
      checkInvoiceStatus(savedId)
        .then((res) => {
          if (!res) {
            sessionStorage.removeItem(ACTIVE_INVOICE_STORAGE_KEY);
            return;
          }

          setActiveInvoice(res.invoice);

          if (res.invoice.status === 'PAID') {
            sessionStorage.removeItem(ACTIVE_INVOICE_STORAGE_KEY);
            if (res.newlySettled && !res.invoice.announcementPlayed) {
              onVerifiedSettlement(res.invoice);
              ackAudioAnnouncement(res.invoice.id);
            }
          }
        })
        .catch(() => {
          sessionStorage.removeItem(ACTIVE_INVOICE_STORAGE_KEY);
        });
    }
  }, [activeInvoice, setActiveInvoice, onVerifiedSettlement]);

  // 2. Synchronize active invoice ID with sessionStorage
  useEffect(() => {
    if (activeInvoice && (activeInvoice.status === 'UNPAID' || activeInvoice.status === 'PENDING')) {
      sessionStorage.setItem(ACTIVE_INVOICE_STORAGE_KEY, activeInvoice.id);
    } else if (
      !activeInvoice ||
      activeInvoice.status === 'PAID' ||
      activeInvoice.status === 'EXPIRED' ||
      activeInvoice.status === 'FAILED'
    ) {
      sessionStorage.removeItem(ACTIVE_INVOICE_STORAGE_KEY);
    }
  }, [activeInvoice]);

  // 3. Periodic Polling (every 2.5 seconds) while invoice is UNPAID or PENDING
  useEffect(() => {
    if (
      !activeInvoice ||
      activeInvoice.isSimulation ||
      (activeInvoice.status !== 'UNPAID' && activeInvoice.status !== 'PENDING')
    ) {
      return;
    }

    const invoiceId = activeInvoice.id;
    let isMounted = true;

    const poll = async () => {
      try {
        const result = await checkInvoiceStatus(invoiceId);
        if (!result || !isMounted) return;

        const updatedInvoice = result.invoice;

        // Atomically update state
        setActiveInvoice((current) => {
          if (!current || current.id !== invoiceId) return current;
          return updatedInvoice;
        });

        // Single-Trigger Guarantee:
        // Trigger announcement ONLY when newly settled AND announcement has NOT yet been played
        if (
          result.newlySettled &&
          !updatedInvoice.announcementPlayed &&
          !isSettlementHandledRef.current[invoiceId]
        ) {
          isSettlementHandledRef.current[invoiceId] = true;
          onVerifiedSettlement(updatedInvoice);

          // Acknowledge audio playback idempotently to prevent duplicate announcement
          ackAudioAnnouncement(invoiceId);
        }
      } catch (err) {
        console.debug('Polling check error:', err);
      }
    };

    const intervalId = setInterval(poll, 2500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [activeInvoice?.id, activeInvoice?.status, activeInvoice?.isSimulation, setActiveInvoice, onVerifiedSettlement]);
}
