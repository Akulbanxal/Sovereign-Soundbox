import React from 'react';
import {
  Volume2,
  VolumeX,
  Settings,
  ShieldCheck,
  AlertCircle,
  Globe,
  Radio,
  Zap,
} from 'lucide-react';
import type { LanguageCode, WalletConnectionStatus, WalletInfo } from '../../types/soundbox';
import { useTranslation } from '../../i18n/LanguageContext';

interface AppShellProps {
  children?: React.ReactNode;
  rightPanelContent?: React.ReactNode;
  bottomDrawer?: React.ReactNode;
  walletStatus: WalletConnectionStatus;
  walletInfo?: WalletInfo | null;
  isDemoMode?: boolean;
  onToggleDemoMode?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenSecurityModal?: () => void;
  rateInfoText?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  rightPanelContent,
  bottomDrawer,
  walletStatus,
  walletInfo,
  isDemoMode = false,
  onToggleDemoMode,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onOpenSecurityModal,
  rateInfoText = '5,000 XOF ≈ 13,015 sats',
}) => {
  const { t, language, setLanguage } = useTranslation();
  const isConnected =
    walletStatus === 'connected_receive_only' || walletStatus === 'connected_full_warning';
  const isReceiveOnly = walletStatus === 'connected_receive_only';

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-gold/20 selection:text-forest">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border-warm px-4 py-3 shadow-warm-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 md:gap-4">
          {/* Brand & Emblem */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <svg
                className="w-10 h-10 md:w-11 md:h-11 rounded-xl shadow-warm-sm transition-transform hover:scale-105"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="100" height="100" rx="22" fill="#0F3D2E" />
                <circle cx="50" cy="50" r="38" stroke="#C8963E" strokeOpacity="0.3" strokeWidth="2.5" strokeDasharray="4 4" />
                <circle cx="50" cy="50" r="30" stroke="#C8963E" strokeOpacity="0.6" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="22" stroke="#C8963E" strokeOpacity="0.9" strokeWidth="2.5" />
                <path
                  d="M48 24L32 52H50L46 76L70 44H52L56 24Z"
                  fill="#C8963E"
                  stroke="#FAF7F2"
                  strokeWidth="1.5"
                />
              </svg>
              {/* Online Pulse Indicator */}
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-verified' : 'bg-pending'}`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 border-2 border-surface ${isConnected ? 'bg-verified' : 'bg-pending'}`} />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base md:text-lg tracking-tight text-forest">
                  {t('app_name')}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-gold/15 text-gold-dark rounded border border-gold/30">
                  {t('app_region')}
                </span>
              </div>
              <p className="text-xs text-muted flex items-center gap-1">
                <span>{walletInfo?.alias || t('greeting_market')}</span>
                <span className="text-border-warm">•</span>
                <span className="text-[11px] font-mono text-forest/75 font-medium">{t('nav_nip47_badge')}</span>
              </p>
            </div>
          </div>

          {/* Controls & Status Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Demo Mode Toggle Button */}
            {onToggleDemoMode && (
              <button
                onClick={onToggleDemoMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono border transition-all shadow-xs ${
                  isDemoMode
                    ? 'bg-gold/20 text-gold-dark border-gold/50 shadow-warm-xs'
                    : 'bg-canvas text-muted hover:text-ink border-border-warm'
                }`}
                title={isDemoMode ? t('demo_exit_btn') : t('demo_activate_btn')}
              >
                <Zap className={`w-3.5 h-3.5 ${isDemoMode ? 'text-gold fill-gold' : 'text-muted'}`} />
                <span>{t('nav_demo_mode_badge')}</span>
              </button>
            )}

            {/* Wallet Status Pill -> Opens Wallet Modal */}
            <button
              onClick={onOpenSettings}
              title={t('nav_settings_tooltip')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors shadow-sm ${
                isConnected
                  ? isReceiveOnly
                    ? 'bg-verified-light/70 border-verified/40 text-verified-dark hover:bg-verified-light'
                    : 'bg-danger-light/80 border-danger/40 text-danger-dark hover:bg-danger-light'
                  : 'bg-pending-light/80 border-pending/40 text-pending-dark hover:bg-pending-light'
              }`}
            >
              {isConnected ? (
                <>
                  <ShieldCheck className={`w-3.5 h-3.5 ${isReceiveOnly ? 'text-verified' : 'text-danger'}`} />
                  <span className="hidden md:inline font-semibold">
                    {isReceiveOnly ? t('nav_connected_receive_only') : t('nav_warning_pay_permission')}
                  </span>
                  <span className="md:hidden font-semibold">{t('nav_connected_short')}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-pending" />
                  <span className="font-semibold">{t('nav_disconnected')}</span>
                </>
              )}
            </button>

            {/* Language Selector (FR | WO | EN) */}
            <div className="relative inline-flex items-center bg-canvas rounded-lg p-0.5 border border-border-warm text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-muted ml-1.5 mr-0.5 hidden sm:block" />
              {(['fr', 'wo', 'en'] as LanguageCode[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded-md uppercase transition-all ${
                    language === lang
                      ? 'bg-forest text-surface shadow-xs font-bold'
                      : 'text-muted hover:text-ink'
                  }`}
                  title={
                    lang === 'fr'
                      ? 'Français (Dakar)'
                      : lang === 'wo'
                      ? 'Wolof (Ndakaaru)'
                      : 'English'
                  }
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Soundbox Mute/Volume Toggle */}
            <button
              onClick={onToggleMute}
              className={`p-2 rounded-lg border transition-all ${
                isMuted
                  ? 'bg-danger-light/60 border-danger/30 text-danger-dark hover:bg-danger-light'
                  : 'bg-canvas border-border-warm text-forest hover:bg-surface hover:border-forest/30'
              }`}
              title={isMuted ? t('nav_mute_tooltip_muted') : t('nav_mute_tooltip_active')}
              aria-label={isMuted ? t('nav_mute_tooltip_muted') : t('nav_mute_tooltip_active')}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-danger" />
              ) : (
                <Volume2 className="w-4 h-4 text-forest" />
              )}
            </button>

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-canvas border border-border-warm text-muted hover:text-ink hover:bg-surface hover:border-muted/40 transition-colors"
              title={t('nav_settings_tooltip')}
              aria-label={t('nav_settings_tooltip')}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 md:py-6 flex flex-col gap-6">
        {/* Top Info Banner */}
        <div className="bg-surface rounded-2xl p-3 border border-border-warm shadow-warm-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-gold flex-shrink-0 animate-pulse" />
            <span className="text-muted leading-relaxed">
              {t('banner_merchant_intro')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted flex-shrink-0 tabular-nums">
            <Zap className="w-3.5 h-3.5 text-gold" />
            <span className="hidden sm:inline">{t('banner_guaranteed_rate')}</span>
            <span className="font-semibold text-ink">{rateInfoText}</span>
          </div>
        </div>

        {/* 2-Column Desktop / 1-Column Mobile Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: POS Keypad & Active Invoicing */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {children}
          </div>

          {/* Right Column: 3D Hardware Soundbox Twin & History */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {rightPanelContent}
          </div>
        </div>

        {/* Bottom Red-Team Sandbox Section */}
        {bottomDrawer && (
          <div className="w-full mt-2">
            {bottomDrawer}
          </div>
        )}
      </main>

      {/* Footer info bar */}
      <footer className="border-t border-border-warm bg-surface/50 py-3.5 px-4 text-center text-xs text-muted">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span>{t('footer_copyright')}</span>
            {onOpenSecurityModal && (
              <button
                onClick={onOpenSecurityModal}
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface hover:bg-forest/10 text-forest border border-border-warm hover:border-forest/30 font-semibold transition-colors text-[11px]"
                title={t('footer_security_link')}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                <span>{t('footer_security_link')}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            {onOpenSecurityModal && (
              <button
                onClick={onOpenSecurityModal}
                className="md:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface text-forest border border-border-warm font-semibold text-[10px]"
              >
                <ShieldCheck className="w-3 h-3 text-forest" />
                <span>{t('footer_security_link')}</span>
              </button>
            )}
            <span className={isConnected ? 'text-verified font-medium' : 'text-pending font-medium'}>
              ● {isConnected ? t('footer_status_connected') : t('footer_status_disconnected')}
            </span>
            <span>{t('footer_region_jurisdiction')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
