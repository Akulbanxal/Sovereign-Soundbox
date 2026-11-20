import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  Share2,
  Check,
  ShieldCheck,
  Lock,
  Zap,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { InvoiceRecord } from '../../types/soundbox';
import { useTranslation } from '../../i18n/LanguageContext';

interface ReceiptModalProps {
  invoice: InvoiceRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ invoice, isOpen, onClose }) => {
  const { t, formatCfa, language } = useTranslation();
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !invoice) return null;

  const dateObj = new Date(invoice.settledAt || invoice.createdAt);
  const locale = language === 'wo' ? 'wo-SN' : language === 'fr' ? 'fr-SN' : 'en-US';
  const dateFormatted = dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeFormatted = dateObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const textReceipt = `==============================
${t('receipt_brand_header')}
${t('receipt_market_tag')}
==============================
${t('receipt_label_tx_id')} ${invoice.id}
${t('receipt_label_date')} ${dateFormatted} - ${timeFormatted}
${t('receipt_label_amount_xof')} ${formatCfa(invoice.amountXof)}
${t('receipt_label_amount_sats')} ${invoice.amountSats.toLocaleString()} SATS
${t('receipt_label_status')} ${t('status_verified_paid')}
${t('proof_payment_hash')} ${invoice.paymentHash.slice(0, 16)}...
==============================
${t('receipt_security_guarantee')}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t('receipt_brand_header')} #${invoice.id.slice(-6)}`,
          text: textReceipt,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(textReceipt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const truncatedHash = invoice.paymentHash
    ? `${invoice.paymentHash.slice(0, 10)}...${invoice.paymentHash.slice(-8)}`
    : 'N/A';

  const truncatedPreimage = invoice.preimage
    ? `${invoice.preimage.slice(0, 10)}...${invoice.preimage.slice(-8)}`
    : null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-surface border border-border-warm rounded-3xl p-6 shadow-flagship-lg flex flex-col gap-5 relative max-h-[92vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label={t('receipt_btn_close')}
            className="absolute top-5 right-5 p-2 rounded-xl bg-canvas hover:bg-border-warm/40 text-muted hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Printable Receipt Paper Container */}
          <div
            id="printable-receipt"
            className="bg-canvas border border-dashed border-border-warm rounded-2xl p-5 flex flex-col gap-4 text-ink font-mono text-xs shadow-inner"
          >
            {/* Header / Brand */}
            <div className="text-center pb-3 border-b border-border-warm flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-gold shadow-warm-sm mb-1">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 id="receipt-modal-title" className="text-sm font-extrabold text-forest tracking-tight">
                {t('receipt_brand_header')}
              </h3>
              <p className="text-[11px] text-muted">{t('receipt_market_tag')}</p>
            </div>

            {/* Verified Stamp Badge */}
            <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-full bg-verified-light text-verified-dark font-extrabold text-[11px] border border-verified/40 tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4 text-verified" />
              <span>{t('receipt_verified_stamp')}</span>
            </div>

            {/* Amount Callout */}
            <div className="bg-surface rounded-xl p-4 border border-border-warm text-center flex flex-col gap-1">
              <span className="text-[11px] text-muted font-bold uppercase">{t('receipt_label_amount_xof')}</span>
              <span className="text-3xl font-extrabold text-forest tracking-tight tabular-nums">
                {formatCfa(invoice.amountXof)}
              </span>
              <div className="flex items-center justify-center gap-1 text-[11px] text-gold-dark font-semibold">
                <Zap className="w-3.5 h-3.5 text-gold" />
                <span className="tabular-nums">{invoice.amountSats.toLocaleString()} satoshis</span>
              </div>
            </div>

            {/* Detailed Metadata Grid */}
            <div className="space-y-2 text-[11px] pt-1">
              <div className="flex items-center justify-between py-1 border-b border-border-warm/60">
                <span className="text-muted">{t('receipt_label_tx_id')}</span>
                <span className="font-bold text-ink truncate max-w-[170px]">#{invoice.id}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border-warm/60">
                <span className="text-muted flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted" />
                  {t('receipt_label_date')}
                </span>
                <span className="font-bold text-ink">{dateFormatted}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border-warm/60">
                <span className="text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted" />
                  {t('receipt_label_time')}
                </span>
                <span className="font-bold text-ink">{timeFormatted}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border-warm/60">
                <span className="text-muted">{t('receipt_label_status')}</span>
                <span className="font-bold text-verified-dark uppercase text-[10px] px-2 py-0.5 rounded bg-verified-light">
                  {t('status_verified_paid')}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border-warm/60">
                <span className="text-muted">{t('receipt_label_payment_hash')}</span>
                <span className="font-bold text-ink" title={invoice.paymentHash}>
                  {truncatedHash}
                </span>
              </div>

              {truncatedPreimage && (
                <div className="flex items-center justify-between py-1 border-b border-border-warm/60">
                  <span className="text-muted">{t('receipt_label_preimage')}</span>
                  <span className="font-bold text-verified-dark" title={invoice.preimage}>
                    {truncatedPreimage} ✓
                  </span>
                </div>
              )}
            </div>

            {/* Security Guarantee Note */}
            <div className="p-2.5 rounded-xl bg-surface border border-border-warm/80 text-[10px] text-muted leading-tight flex items-start gap-1.5">
              <Lock className="w-3.5 h-3.5 text-forest flex-shrink-0 mt-0.5" />
              <span>{t('receipt_security_guarantee')}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 px-3.5 rounded-2xl bg-canvas hover:bg-surface border border-border-warm text-ink hover:text-forest font-bold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4 text-forest" />
              <span>{t('receipt_btn_print')}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex-1 py-3 px-3.5 rounded-2xl bg-forest hover:bg-forest-hover text-surface font-bold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 shadow-warm-sm"
            >
              {copied ? <Check className="w-4 h-4 text-gold" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? t('receipt_btn_copied') : t('receipt_btn_share')}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

