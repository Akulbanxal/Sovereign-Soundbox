import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Volume2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import type { InvoiceRecord } from '../../types/soundbox';
import { useTranslation } from '../../i18n/LanguageContext';

interface ActiveInvoicePanelProps {
  invoice: InvoiceRecord;
  onCancel: () => void;
  onReplayChime?: () => void;
  onSimulatePay?: () => void;
}

export const ActiveInvoicePanel: React.FC<ActiveInvoicePanelProps> = ({
  invoice,
  onCancel,
  onReplayChime,
  onSimulatePay,
}) => {
  const { t, formatCfa } = useTranslation();
  const [copied, setCopied] = useState<boolean>(false);
  const [showProofDrawer, setShowProofDrawer] = useState<boolean>(false);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(600); // 10 minutes default

  const isPaid = invoice.status === 'PAID';
  const isExpired = invoice.status === 'EXPIRED';
  const isFailed = invoice.status === 'FAILED';

  // Live countdown timer
  useEffect(() => {
    if (isPaid || isExpired || isFailed) return;

    const interval = setInterval(() => {
      const remainingMs = invoice.expiresAt - Date.now();
      const remSec = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeftSec(remSec);
      if (remSec <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [invoice.expiresAt, isPaid, isExpired, isFailed]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invoice.bolt11);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPercent = Math.min(100, Math.max(0, (timeLeftSec / 600) * 100));
  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="bg-surface rounded-3xl border border-border-warm p-5 md:p-6 shadow-flagship flex flex-col gap-5">
      {/* Top Status Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-border-warm gap-2">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-mono font-semibold text-muted hover:text-ink transition-colors p-1 rounded-lg hover:bg-canvas"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('btn_back_to_keypad')}</span>
        </button>

        <div className="flex items-center gap-2">
          {isPaid ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-verified-light text-verified-dark border border-verified/30 text-xs font-bold font-mono">
              <ShieldCheck className="w-4 h-4 text-verified" />
              <span>{t('status_verified_paid')}</span>
            </div>
          ) : isExpired ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger-light text-danger-dark border border-danger/30 text-xs font-bold font-mono">
              <span>{t('status_expired')}</span>
            </div>
          ) : isFailed ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger-light text-danger-dark border border-danger/30 text-xs font-bold font-mono">
              <span>{t('status_failed')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pending-light text-pending-dark border border-pending/30 text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-pending animate-ping" />
              <span>{t('status_awaiting_settlement')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Amount Header Display */}
      <div className="text-center flex flex-col items-center gap-1">
        <span className="text-xs font-mono uppercase text-muted font-bold tracking-wider">
          {t('invoice_title')}
        </span>
        <div className="flex items-baseline justify-center gap-2 font-mono tabular-nums">
          <span className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
            {formatCfa(invoice.amountXof)}
          </span>
          <span className="text-sm md:text-base font-bold text-gold-dark">
            ({invoice.amountSats.toLocaleString()} SATS)
          </span>
        </div>
      </div>

      {/* QR Code Container with High-Contrast Canvas */}
      <div className="flex flex-col items-center justify-center gap-3 bg-canvas p-6 rounded-2xl border border-border-warm shadow-inner">
        <div className="p-3 bg-surface rounded-2xl border-2 border-forest/15 shadow-warm-sm">
          <QRCodeSVG
            value={`lightning:${invoice.bolt11}`}
            size={220}
            level="M"
            includeMargin={false}
            className="w-48 h-48 md:w-56 md:h-56"
          />
        </div>

        {/* Copy Invoice String Pill */}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-forest/5 text-ink border border-border-warm rounded-full text-xs font-mono font-medium shadow-xs transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-verified" />
              <span className="text-verified-dark font-bold">{t('btn_copied')}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-muted" />
              <span className="truncate max-w-[200px] md:max-w-[260px]">{invoice.bolt11}</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-muted text-center max-w-xs font-mono">
          {t('invoice_qr_scan_instruction')}
        </p>

        {/* Simulation Quick Action Button (Visible during Demo Mode) */}
        {invoice.isSimulation && !isPaid && !isExpired && !isFailed && onSimulatePay && (
          <button
            onClick={onSimulatePay}
            className="w-full mt-2 py-3 px-4 bg-forest hover:bg-forest-hover text-surface font-mono font-bold text-xs rounded-xl border border-gold/40 flex items-center justify-center gap-2 shadow-warm-md hover:shadow-warm-lg transition-all animate-pulse active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 text-gold fill-gold" />
            <span>{t('demo_btn_simulate_pay')}</span>
          </button>
        )}
      </div>

      {/* Expiry Countdown Progress Bar */}
      {!isPaid && !isExpired && !isFailed && (
        <div className="flex flex-col gap-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-pending" />
              <span>{t('label_expires_in')}</span>
            </span>
            <span className="font-bold text-ink tabular-nums">{timeFormatted}</span>
          </div>
          <div className="w-full bg-border-warm h-2 rounded-full overflow-hidden">
            <div
              className="bg-pending h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Replay Voice Chime Button (PAID status only) */}
      {isPaid && onReplayChime && (
        <button
          onClick={onReplayChime}
          className="w-full py-3 bg-verified-light hover:bg-verified-light/80 text-verified-dark font-mono font-bold text-xs rounded-2xl border border-verified/40 flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <Volume2 className="w-4 h-4 text-verified" />
          <span>{t('replay_chime_btn')}</span>
        </button>
      )}

      {/* LIVE CRYPTOGRAPHIC VERIFICATION PIPELINE STRIP */}
      <div className="bg-canvas border border-border-warm rounded-2xl p-4 flex flex-col gap-3 font-mono text-xs shadow-xs">
        <div className="flex items-center justify-between border-b border-border-warm pb-2">
          <span className="font-extrabold text-forest uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-gold" />
            <span>{t('pipeline_title')}</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-border-warm text-muted">
            {isPaid ? '4/4' : isFailed ? '0/4' : '2/4'} {t('gate_status_confirmed')}
          </span>
        </div>

        {/* 4 Connected Pipeline Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
          {/* Step 1: Invoice Created */}
          <div className="p-2.5 rounded-xl border bg-verified-light/60 border-verified/40 text-verified-dark flex flex-col gap-1 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold">{t('pipeline_step1')}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-verified flex-shrink-0" />
            </div>
            <span className="text-[10px] text-muted leading-tight">{t('pipeline_step1_desc')}</span>
          </div>

          {/* Step 2: Wallet Lookup */}
          <div
            className={`p-2.5 rounded-xl border flex flex-col gap-1 shadow-2xs transition-all ${
              isPaid
                ? 'bg-verified-light/60 border-verified/40 text-verified-dark'
                : !isExpired && !isFailed
                ? 'bg-pending-light/60 border-pending/40 text-pending-dark'
                : 'bg-surface border-border-warm text-muted'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">{t('pipeline_step2')}</span>
              {isPaid ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-verified flex-shrink-0" />
              ) : !isExpired && !isFailed ? (
                <span className="w-2 h-2 rounded-full bg-pending animate-ping flex-shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-danger flex-shrink-0" />
              )}
            </div>
            <span className="text-[10px] text-muted leading-tight">{t('pipeline_step2_desc')}</span>
          </div>

          {/* Step 3: Preimage SHA-256 */}
          <div
            className={`p-2.5 rounded-xl border flex flex-col gap-1 shadow-2xs transition-all ${
              isPaid && invoice.preimageVerified
                ? 'bg-verified-light/60 border-verified/40 text-verified-dark'
                : isFailed
                ? 'bg-danger-light/60 border-danger/40 text-danger-dark'
                : 'bg-surface border-border-warm text-muted'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">{t('pipeline_step3')}</span>
              {isPaid && invoice.preimageVerified ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-verified flex-shrink-0" />
              ) : isFailed ? (
                <AlertCircle className="w-3.5 h-3.5 text-danger flex-shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-border-warm flex-shrink-0" />
              )}
            </div>
            <span className="text-[10px] text-muted leading-tight">{t('pipeline_step3_desc')}</span>
          </div>

          {/* Step 4: Audio Confirmation */}
          <div
            className={`p-2.5 rounded-xl border flex flex-col gap-1 shadow-2xs transition-all ${
              isPaid
                ? 'bg-verified-light/60 border-verified/40 text-verified-dark'
                : 'bg-surface border-border-warm text-muted'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">{t('pipeline_step4')}</span>
              {isPaid ? (
                <Volume2 className="w-3.5 h-3.5 text-verified flex-shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-border-warm flex-shrink-0" />
              )}
            </div>
            <span className="text-[10px] text-muted leading-tight">{t('pipeline_step4_desc')}</span>
          </div>
        </div>
      </div>

      {/* Collapsible Cryptographic Proof Drawer */}
      <div className="border border-border-warm rounded-2xl overflow-hidden font-mono text-xs">
        <button
          onClick={() => setShowProofDrawer(!showProofDrawer)}
          className="w-full p-3 bg-canvas hover:bg-surface flex items-center justify-between text-muted hover:text-ink transition-colors"
        >
          <span className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>{showProofDrawer ? t('proof_drawer_toggle_close') : t('proof_drawer_toggle_open')}</span>
          </span>
          {showProofDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {showProofDrawer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 bg-surface border-t border-border-warm flex flex-col gap-3 text-[11px]"
            >
              <div>
                <span className="text-muted block mb-0.5">{t('proof_payment_hash')}</span>
                <code className="bg-canvas p-1.5 rounded block break-all select-all border border-border-warm tabular-nums">
                  {invoice.paymentHash}
                </code>
              </div>

              {invoice.preimage && (
                <div>
                  <span className="text-muted block mb-0.5">{t('proof_preimage_label')}</span>
                  <code className="bg-canvas p-1.5 rounded block break-all select-all border border-border-warm text-verified-dark font-bold tabular-nums">
                    {invoice.preimage}
                  </code>
                  <span className="text-[10px] text-verified font-bold mt-0.5 block">
                    ✓ {t('proof_preimage_verified')} (SHA-256)
                  </span>
                </div>
              )}

              <div>
                <span className="text-muted block mb-0.5">{t('proof_bolt11_label')}</span>
                <code className="bg-canvas p-1.5 rounded block break-all select-all border border-border-warm text-[10px] max-h-24 overflow-y-auto">
                  {invoice.bolt11}
                </code>
              </div>

              <div className="flex items-center justify-between text-muted pt-2 border-t border-border-warm/70 text-[10px]">
                <span>{t('proof_rate_source')} {invoice.rateSource}</span>
                <span>{t('proof_zero_pii_note')}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
