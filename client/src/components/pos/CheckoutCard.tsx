import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Delete,
  RotateCcw,
  QrCode,
  Zap,
  TrendingUp,
  WifiOff,
  Sparkles,
} from 'lucide-react';
import type { ExchangeRateState } from '../../types/soundbox';
import { useTranslation } from '../../i18n/LanguageContext';

interface CheckoutCardProps {
  exchangeRate: ExchangeRateState;
  todaySalesXof: number;
  todaySalesSats: number;
  onGenerateInvoice: (amountXof: number, amountSats: number) => void;
  isLoading?: boolean;
  isLoadingTotals?: boolean;
}

const CFA_CHIPS = [500, 1000, 2500, 5000, 10000];

export const CheckoutCard: React.FC<CheckoutCardProps> = ({
  exchangeRate,
  todaySalesXof,
  todaySalesSats,
  onGenerateInvoice,
  isLoading = false,
  isLoadingTotals = false,
}) => {
  const { t, formatCfa } = useTranslation();
  const [inputVal, setInputVal] = useState<string>('5000');
  const [isSatsModeManual, setIsSatsModeManual] = useState<boolean>(false);
  const [manualSatsInput, setManualSatsInput] = useState<string>('13010');

  const currentAmountXof = Math.max(0, parseInt(inputVal || '0', 10));

  // Compute satoshis from current XOF and live rate
  const computedSats = Math.max(
    1,
    Math.round((currentAmountXof / exchangeRate.xofPerBtc) * 100_000_000)
  );

  const activeSats = isSatsModeManual
    ? Math.max(1, parseInt(manualSatsInput || '0', 10))
    : computedSats;

  // Keypad Handlers
  const handleDigit = (digit: string) => {
    if (isSatsModeManual) {
      if (manualSatsInput === '0' || manualSatsInput === '') {
        setManualSatsInput(digit);
      } else if (manualSatsInput.length < 9) {
        setManualSatsInput(manualSatsInput + digit);
      }
    } else {
      if (inputVal === '0' || inputVal === '') {
        setInputVal(digit);
      } else if (inputVal.length < 8) {
        setInputVal(inputVal + digit);
      }
    }
  };

  const handleBackspace = () => {
    if (isSatsModeManual) {
      setManualSatsInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else {
      setInputVal((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    }
  };

  const handleClear = () => {
    if (isSatsModeManual) {
      setManualSatsInput('0');
    } else {
      setInputVal('0');
    }
  };

  const handleChipClick = (amount: number) => {
    setInputVal(amount.toString());
    if (isSatsModeManual) {
      const sats = Math.round((amount / exchangeRate.xofPerBtc) * 100_000_000);
      setManualSatsInput(sats.toString());
    }
  };

  const handleTriggerInvoice = () => {
    if (currentAmountXof <= 0 && !isSatsModeManual) return;
    onGenerateInvoice(currentAmountXof, activeSats);
  };

  return (
    <div className="bg-surface rounded-3xl border border-border-warm p-5 md:p-6 shadow-flagship flex flex-col gap-5">
      {/* Merchant Greeting & Verified Sales Summary Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-warm gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>{t('greeting_market')}</span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold text-forest tracking-tight">
            {t('greeting_headline')}
          </h2>
        </div>

        {/* Today's Sales Strip */}
        <div
          className="bg-canvas border border-border-warm rounded-2xl px-3.5 py-2 flex items-center gap-3 shadow-xs"
          aria-live="polite"
        >
          <div className="w-8 h-8 rounded-xl bg-forest/10 flex items-center justify-center text-forest" aria-hidden="true">
            <TrendingUp className="w-4 h-4 text-forest" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider block font-semibold">
              {t('sales_today_label')}
            </span>
            {isLoadingTotals ? (
              <div className="flex items-center gap-2 mt-1 animate-pulse">
                <div className="w-20 h-4 bg-border-warm/50 rounded-md" />
                <div className="w-16 h-3 bg-border-warm/30 rounded-md" />
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
                <span className="text-sm font-bold text-ink">
                  {formatCfa(todaySalesXof)}
                </span>
                <span className="text-[11px] text-muted">
                  ({todaySalesSats.toLocaleString()} sats)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Amount Display Card */}
      <div className="bg-gradient-to-br from-canvas to-surface border border-border-warm rounded-2xl p-4 md:p-5 flex flex-col gap-2 shadow-inner">
        <div className="flex items-center justify-between text-xs text-muted font-mono font-medium">
          <span>{isSatsModeManual ? t('amount_display_sats_label') : t('amount_display_fiat_label')}</span>
          <button
            onClick={() => setIsSatsModeManual(!isSatsModeManual)}
            aria-pressed={isSatsModeManual}
            aria-label={t('toggle_mode_tooltip')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors shadow-xs ${
              isSatsModeManual
                ? 'bg-gold/20 text-gold-dark border-gold/40 font-bold'
                : 'bg-surface text-muted hover:text-ink border-border-warm'
            }`}
            title={t('toggle_mode_tooltip')}
          >
            {exchangeRate.isOfflineFallback ? (
              <WifiOff className="w-3 h-3 text-pending" aria-hidden="true" />
            ) : (
              <Zap className="w-3 h-3 text-gold" aria-hidden="true" />
            )}
            <span>{isSatsModeManual ? t('toggle_mode_sats_manual') : t('toggle_mode_fiat_active')}</span>
          </button>
        </div>

        {/* Large Amount Screen with Tabular Numerals */}
        <div className="flex items-baseline justify-between py-1" aria-live="polite">
          <span className="text-3xl md:text-5xl font-extrabold font-mono text-ink tracking-tight tabular-nums">
            {isSatsModeManual
              ? parseInt(manualSatsInput || '0', 10).toLocaleString()
              : parseInt(inputVal || '0', 10).toLocaleString('fr-SN')}
          </span>
          <span className="text-base md:text-xl font-bold font-mono text-forest ml-2">
            {isSatsModeManual ? 'SATS' : 'FCFA'}
          </span>
        </div>

        {/* Live Conversion Pill */}
        <div className="pt-2 border-t border-border-warm/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-forest font-semibold tabular-nums">
            <Zap className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
            <span>
              {isSatsModeManual
                ? t('conversion_rate_approx_fiat', {
                    fiat: Math.round((activeSats * exchangeRate.xofPerBtc) / 100_000_000).toLocaleString('fr-SN'),
                  })
                : t('conversion_rate_approx_sats', {
                    sats: activeSats.toLocaleString(),
                  })}
            </span>
          </div>
          <span className="text-[10px] text-muted truncate">
            {t('rate_source_prefix')} {exchangeRate.rateSource}
          </span>
        </div>
      </div>

      {/* Quick CFA Chips */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
        role="group"
        aria-label="Montants rapides CFA"
      >
        {CFA_CHIPS.map((chip) => (
          <motion.button
            key={chip}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleChipClick(chip)}
            aria-label={t('chip_add_amount', { amount: chip.toLocaleString('fr-SN') })}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all whitespace-nowrap shadow-xs tabular-nums ${
              currentAmountXof === chip && !isSatsModeManual
                ? 'bg-forest text-surface border-forest shadow-warm-sm'
                : 'bg-canvas hover:bg-surface border-border-warm text-ink hover:border-forest/40'
            }`}
          >
            {t('chip_add_amount', { amount: chip.toLocaleString('fr-SN') })}
          </motion.button>
        ))}
      </div>

      {/* Tactile Numeric Keypad */}
      <div className="grid grid-cols-3 gap-2.5" role="group" aria-label="Keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0'].map((digit) => (
          <motion.button
            key={digit}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleDigit(digit)}
            aria-label={digit}
            className="h-13 md:h-14 rounded-2xl bg-canvas hover:bg-surface border border-border-warm hover:border-forest/30 font-mono text-xl md:text-2xl font-bold text-ink shadow-xs transition-all flex items-center justify-center active:bg-border-warm/40 tabular-nums cursor-pointer"
          >
            {digit}
          </motion.button>
        ))}

        {/* Backspace Button */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleBackspace}
          aria-label={t('keypad_backspace_title')}
          className="h-13 md:h-14 rounded-2xl bg-canvas hover:bg-surface border border-border-warm text-muted hover:text-danger font-mono font-bold shadow-xs transition-all flex items-center justify-center cursor-pointer"
          title={t('keypad_backspace_title')}
        >
          <Delete className="w-5 h-5" aria-hidden="true" />
        </motion.button>
      </div>

      {/* Action Row: Clear + Generate Payment QR */}
      <div className="flex items-center gap-3 pt-1">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleClear}
          aria-label={t('keypad_clear')}
          className="px-4 py-3.5 rounded-2xl bg-canvas hover:bg-surface border border-border-warm text-muted hover:text-ink font-mono text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          title={t('keypad_clear')}
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>{t('keypad_clear')}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleTriggerInvoice}
          disabled={isLoading || (currentAmountXof <= 0 && !isSatsModeManual)}
          aria-label={t('btn_generate_qr')}
          className="relative overflow-hidden flex-1 py-3.5 px-6 rounded-2xl bg-forest hover:bg-forest-hover disabled:bg-muted/40 text-surface font-extrabold text-sm md:text-base tracking-wide shadow-flagship hover:shadow-flagship-lg transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] group cursor-pointer disabled:cursor-not-allowed"
        >
          {/* Shimmering glass-edge highlight sweep */}
          <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-surface/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.4s_infinite] pointer-events-none" />
          <QrCode className="w-5 h-5 text-gold relative z-10" aria-hidden="true" />
          <span className="relative z-10">{isLoading ? t('btn_generating') : t('btn_generate_qr')}</span>
        </motion.button>
      </div>
    </div>
  );
};
