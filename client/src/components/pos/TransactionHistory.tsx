import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  Clock,
  XCircle,
  Volume2,
  Filter,
  ShieldCheck,
  Receipt,
  Wallet,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { InvoiceRecord } from '../../types/soundbox';
import { useTranslation } from '../../i18n/LanguageContext';
import { ReceiptModal } from './ReceiptModal';

interface TransactionHistoryProps {
  transactions: InvoiceRecord[];
  onReplayChime: (tx: InvoiceRecord) => void;
  isLoading?: boolean;
  walletConnected?: boolean;
  onOpenWalletModal?: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onReplayChime,
  isLoading = false,
  walletConnected = true,
  onOpenWalletModal,
}) => {
  const { t, formatRelativeTime, formatCfa } = useTranslation();
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<InvoiceRecord | null>(null);

  const filteredTx = transactions.filter((tx) => {
    if (filter === 'PAID') return tx.status === 'PAID';
    if (filter === 'PENDING') return tx.status === 'PENDING' || tx.status === 'UNPAID';
    return true;
  });

  return (
    <>
      <div
        className="bg-surface rounded-3xl border border-border-warm p-5 shadow-flagship flex flex-col gap-4"
        aria-labelledby="sales-history-heading"
      >
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border-warm gap-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-forest" aria-hidden="true" />
            <h3
              id="sales-history-heading"
              className="font-extrabold text-sm text-forest uppercase tracking-wider font-mono"
            >
              {t('history_title')}
            </h3>
            <span
              className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-canvas text-muted border border-border-warm tabular-nums"
              aria-label={`${transactions.length} transactions`}
            >
              {transactions.length}
            </span>
          </div>

          {/* Filter Pills */}
          <div
            className="flex items-center gap-1 bg-canvas p-1 rounded-xl border border-border-warm text-xs font-mono"
            role="group"
            aria-label="Filtrer"
          >
            <Filter className="w-3.5 h-3.5 text-muted ml-1 hidden sm:block" aria-hidden="true" />
            {(['ALL', 'PAID', 'PENDING'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                aria-pressed={filter === opt}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filter === opt
                    ? 'bg-forest text-surface shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {opt === 'ALL'
                  ? t('history_filter_all')
                  : opt === 'PAID'
                  ? t('history_filter_paid')
                  : t('history_filter_pending')}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction List / Skeletons / Empty States */}
        <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto pr-1">
          {isLoading ? (
            /* Crisp Shimmer Skeletons */
            <div className="flex flex-col gap-2.5" aria-busy="true">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-canvas border border-border-warm/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-border-warm/40" />
                    <div className="flex flex-col gap-1.5">
                      <div className="w-24 h-4 bg-border-warm/50 rounded-md" />
                      <div className="w-32 h-3 bg-border-warm/30 rounded-md" />
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-border-warm/40" />
                </div>
              ))}
            </div>
          ) : filteredTx.length === 0 ? (
            /* Context-Aware Empty State */
            !walletConnected ? (
              <div className="py-7 px-4 text-center font-mono text-xs flex flex-col items-center justify-center gap-3 bg-canvas/70 rounded-2xl border border-dashed border-border-warm">
                <div className="w-10 h-10 rounded-2xl bg-gold/15 flex items-center justify-center text-gold-dark">
                  <Wallet className="w-5 h-5 text-gold" aria-hidden="true" />
                </div>
                <div className="max-w-xs">
                  <p className="font-bold text-ink">{t('history_empty_no_wallet')}</p>
                  <p className="text-[11px] text-muted mt-1 leading-relaxed">
                    {t('history_empty_no_wallet_subtext')}
                  </p>
                </div>
                {onOpenWalletModal && (
                  <button
                    onClick={onOpenWalletModal}
                    className="px-3.5 py-1.5 bg-forest hover:bg-forest-hover text-surface text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    <span>{t('history_btn_connect_wallet')}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="py-7 px-4 text-center font-mono text-xs flex flex-col items-center justify-center gap-2.5 bg-canvas/60 rounded-2xl border border-dashed border-border-warm">
                <div className="w-10 h-10 rounded-2xl bg-forest/10 flex items-center justify-center text-forest">
                  <Receipt className="w-5 h-5 text-forest" aria-hidden="true" />
                </div>
                <div className="max-w-xs">
                  <p className="font-bold text-ink">{t('history_empty_connected')}</p>
                  <p className="text-[11px] text-muted mt-1 whitespace-pre-line leading-relaxed">
                    {t('history_empty_connected_subtext')}
                  </p>
                </div>
              </div>
            )
          ) : (
            filteredTx.map((tx) => {
              const isPaid = tx.status === 'PAID';
              const isPending = tx.status === 'PENDING' || tx.status === 'UNPAID';
              const relativeTime = formatRelativeTime(tx.settledAt || tx.createdAt);

              return (
                <div
                  key={tx.id}
                  className="group bg-canvas hover:bg-surface border border-border-warm hover:border-forest/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all shadow-xs"
                >
                  {/* Status Icon & Transaction Details */}
                  <div
                    onClick={() => isPaid && setSelectedReceipt(tx)}
                    className={`flex items-center gap-3 flex-1 min-w-0 ${isPaid ? 'cursor-pointer' : ''}`}
                    title={isPaid ? 'Cliquer pour afficher le reçu complet' : undefined}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${
                        isPaid
                          ? 'bg-verified-light text-verified-dark group-hover:scale-105'
                          : isPending
                          ? 'bg-pending-light text-pending-dark'
                          : 'bg-danger-light text-danger-dark'
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="w-5 h-5 text-verified" aria-hidden="true" />
                      ) : isPending ? (
                        <Clock className="w-5 h-5 text-pending" aria-hidden="true" />
                      ) : (
                        <XCircle className="w-5 h-5 text-danger" aria-hidden="true" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
                        <span className="font-extrabold text-sm text-ink">
                          {formatCfa(tx.amountXof)}
                        </span>
                        <span className="text-[11px] text-muted">
                          ({tx.amountSats.toLocaleString()} sats)
                        </span>
                        {isPaid && (
                          <ExternalLink className="w-3 h-3 text-muted/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-muted mt-0.5">
                        <span className="tabular-nums">{relativeTime}</span>
                        <span>•</span>
                        <span className="uppercase text-[10px] font-bold px-1 rounded bg-surface border border-border-warm">
                          {tx.language}
                        </span>
                        {tx.isSimulation && (
                          <span className="text-[10px] text-gold font-bold px-1.5 py-0.5 rounded bg-gold/10 border border-gold/30">
                            {tx.note?.includes('[SAMPLE]') ? t('sample_badge') : t('history_simulation_badge')}
                          </span>
                        )}
                        {tx.note && (
                          <span className="text-[10px] text-muted truncate max-w-[140px] hidden md:inline">
                            {tx.note.replace('[SAMPLE] ', '')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Replay Chime for PAID only */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPaid ? (
                      <button
                        onClick={() => onReplayChime(tx)}
                        className="p-2 rounded-xl bg-surface hover:bg-verified-light/60 border border-border-warm text-forest transition-colors shadow-xs"
                        title={t('history_replay_audio_title')}
                        aria-label={t('history_replay_audio_title')}
                      >
                        <Volume2 className="w-4 h-4 text-forest" aria-hidden="true" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-pending-light text-pending-dark border border-pending/30">
                        {t('history_badge_pending')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Security notice at bottom */}
        <div className="pt-2 border-t border-border-warm/80 flex items-center justify-between text-[11px] font-mono text-muted">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-verified" aria-hidden="true" />
            <span>{t('history_idempotency_badge')}</span>
          </span>
          <span>{t('history_zero_keys_logged')}</span>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      <ReceiptModal
        invoice={selectedReceipt}
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
      />
    </>
  );
};
