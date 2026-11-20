import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  Link2,
  Unlink,
  Check,
  Lock,
} from 'lucide-react';
import type { WalletInfo } from '../../types/soundbox';
import { useTranslation } from '../../i18n/LanguageContext';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletInfo?: WalletInfo | null;
  onConnect: (uri: string) => Promise<void>;
  onDisconnect: () => void;
  isLoading?: boolean;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  walletInfo,
  onConnect,
  onDisconnect,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [uriInput, setUriInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmed = uriInput.trim();

    if (!trimmed.startsWith('nostr+walletconnect://')) {
      setErrorMsg('Veuillez entrer une URI NIP-47 valide (nostr+walletconnect://...)');
      return;
    }

    try {
      await onConnect(trimmed);
      // STRICT CONSTRAINT: Immediately wipe the input state to avoid keeping secrets in frontend memory
      setUriInput('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Échec de la connexion NWC');
      setUriInput('');
    }
  };

  const hasPayInvoice = walletInfo?.methods?.includes('pay_invoice');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-surface border border-border-warm rounded-3xl p-6 shadow-flagship-lg flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border-warm">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                <Link2 className="w-5 h-5 text-forest" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-forest tracking-tight">
                  {t('wallet_modal_title')}
                </h3>
                <p className="text-xs text-muted font-mono">
                  {t('wallet_modal_subtitle')}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Fermer"
              className="p-2 rounded-xl hover:bg-canvas text-muted hover:text-ink transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Connection Status Card */}
          {walletInfo ? (
            <div className="flex flex-col gap-4">
              <div className="bg-canvas border border-border-warm rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-muted uppercase">
                    {t('wallet_connected_banner')}
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-verified-light text-verified-dark border border-verified/30 text-xs font-bold font-mono">
                    <span className="w-2 h-2 rounded-full bg-verified animate-pulse" />
                    <span>{t('nav_connected_short')}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">{t('wallet_relay_label')}</span>
                    <span className="font-bold text-ink truncate max-w-[200px]">
                      {walletInfo.relayHost || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted">{t('wallet_pubkey_label')}</span>
                    <span className="font-bold text-ink">
                      {walletInfo.pubkeyPrefix || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted">{t('wallet_methods_label')}</span>
                    <span className="text-ink font-semibold">
                      {walletInfo.methods.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Warning if pay_invoice is enabled */}
              {hasPayInvoice && (
                <div className="bg-danger-light border border-danger/40 rounded-2xl p-4 flex items-start gap-3 text-xs">
                  <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-danger-dark uppercase font-mono">
                      {t('wallet_warning_pay_perm_title')}
                    </span>
                    <p className="text-danger-dark leading-relaxed">
                      {t('wallet_warning_pay_perm_desc')}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={onDisconnect}
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-danger-light hover:bg-danger-light/80 border border-danger/30 text-danger-dark font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Unlink className="w-4 h-4" />
                <span>{isLoading ? t('wallet_btn_disconnecting') : t('wallet_btn_disconnect')}</span>
              </button>
            </div>
          ) : (
            /* Connection Input Form */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-ink uppercase">
                  {t('wallet_input_label')}
                </label>
                <input
                  type="password"
                  value={uriInput}
                  onChange={(e) => setUriInput(e.target.value)}
                  placeholder={t('wallet_input_placeholder')}
                  className="w-full p-3.5 bg-canvas border border-border-warm rounded-2xl font-mono text-xs focus:outline-none focus:border-forest text-ink"
                  autoComplete="off"
                  spellCheck="false"
                />
                <p className="text-[11px] text-muted font-mono">
                  {t('wallet_input_helper')}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-danger-light border border-danger/30 rounded-xl text-xs font-mono text-danger-dark">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !uriInput.trim()}
                className="w-full py-3.5 px-6 rounded-2xl bg-forest hover:bg-forest-hover disabled:bg-muted/40 text-surface font-extrabold text-xs font-mono tracking-wider uppercase shadow-flagship transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                    <span>{t('wallet_btn_connecting')}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-gold" />
                    <span>{t('wallet_btn_connect')}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Notice Box */}
          <div className="p-4 bg-canvas border border-border-warm rounded-2xl flex items-start gap-3 text-[11px] font-mono text-muted">
            <Lock className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink block">{t('wallet_security_box_title')}</span>
              <p>{t('wallet_security_box_p1')}</p>
              <p>{t('wallet_security_box_p2')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
