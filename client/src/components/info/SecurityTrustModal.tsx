import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Lock, Cpu, X } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

interface SecurityTrustModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityTrustModal: React.FC<SecurityTrustModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="security-modal-title"
    >
      <div className="bg-surface border border-border-warm rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-flagship-lg flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border-warm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest/10 flex items-center justify-center text-forest flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-forest" />
            </div>
            <div>
              <h3 id="security-modal-title" className="text-lg font-extrabold text-forest tracking-tight">
                {t('trust_modal_title')}
              </h3>
              <p className="text-xs text-muted font-mono">
                {t('trust_modal_subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('trust_btn_close')}
            className="p-2 rounded-xl bg-canvas hover:bg-border-warm/40 text-muted hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Philosophy Banner */}
        <div className="bg-gradient-to-r from-forest/5 via-gold/10 to-transparent border border-forest/20 rounded-2xl p-4 flex items-center gap-3">
          <Lock className="w-6 h-6 text-forest flex-shrink-0" />
          <div className="text-xs text-ink font-mono">
            <span className="font-extrabold text-forest uppercase tracking-wider block text-[11px]">
              {t('trust_philosophy_title')}
            </span>
            <span className="italic leading-relaxed block mt-0.5">
              {t('trust_philosophy_quote')}
            </span>
          </div>
        </div>

        {/* Comparison: What it Proves vs What it Does NOT Claim */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Column 1: What it Proves */}
          <div className="bg-verified-light/50 border border-verified/30 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-verified-dark font-extrabold uppercase text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-verified" />
              <span>{t('trust_proves_title')}</span>
            </div>
            <ul className="space-y-2 text-ink/90 leading-relaxed text-[11px]">
              <li className="flex items-start gap-1.5">
                <span className="text-verified font-bold">✓</span>
                <span>{t('trust_proves_item1')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-verified font-bold">✓</span>
                <span>{t('trust_proves_item2')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-verified font-bold">✓</span>
                <span>{t('trust_proves_item3')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-verified font-bold">✓</span>
                <span>{t('trust_proves_item4')}</span>
              </li>
            </ul>
          </div>

          {/* Column 2: What it Does NOT Claim */}
          <div className="bg-pending-light/50 border border-pending/30 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-pending-dark font-extrabold uppercase text-[11px]">
              <AlertTriangle className="w-4 h-4 text-pending" />
              <span>{t('trust_not_claim_title')}</span>
            </div>
            <ul className="space-y-2 text-ink/90 leading-relaxed text-[11px]">
              <li className="flex items-start gap-1.5">
                <span className="text-pending font-bold">✕</span>
                <span>{t('trust_not_claim_item1')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-pending font-bold">✕</span>
                <span>{t('trust_not_claim_item2')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-pending font-bold">✕</span>
                <span>{t('trust_not_claim_item3')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Security Architecture Guarantees */}
        <div className="bg-canvas border border-border-warm rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-forest font-extrabold text-xs uppercase font-mono">
            <Cpu className="w-4 h-4 text-gold" />
            <span>{t('trust_tech_title')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-mono">
            <div className="bg-surface p-2.5 rounded-xl border border-border-warm">
              <span className="font-bold text-forest block mb-1">{t('trust_tech_item1_title')}</span>
              <p className="text-muted leading-tight">
                {t('trust_tech_item1_desc')}
              </p>
            </div>

            <div className="bg-surface p-2.5 rounded-xl border border-border-warm">
              <span className="font-bold text-forest block mb-1">{t('trust_tech_item2_title')}</span>
              <p className="text-muted leading-tight">
                {t('trust_tech_item2_desc')}
              </p>
            </div>

            <div className="bg-surface p-2.5 rounded-xl border border-border-warm">
              <span className="font-bold text-forest block mb-1">{t('trust_tech_item3_title')}</span>
              <p className="text-muted leading-tight">
                {t('trust_tech_item3_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="flex items-center justify-between pt-2 border-t border-border-warm">
          <span className="text-[11px] font-mono text-muted">
            {t('trust_footer_audit')}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-forest hover:bg-forest-hover text-surface text-xs font-bold rounded-xl shadow-warm-sm transition-colors"
          >
            {t('trust_btn_close')}
          </button>
        </div>
      </div>
    </div>
  );
};
