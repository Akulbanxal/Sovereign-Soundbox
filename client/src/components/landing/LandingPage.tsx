import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Volume2,
  Zap,
  ArrowRight,
  Globe,
  Lock,
  Smartphone,
  CheckCircle2,
  XCircle,
  Hash,
  Terminal,
} from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import { Soundbox3DDevice } from '../soundbox3d/Soundbox3DDevice';
import type { LanguageCode, PaymentStatus, SecurityAlert } from '../../types/soundbox';

interface LandingPageProps {
  onLaunchPos: () => void;
  onLaunchRedTeam: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchPos,
  onLaunchRedTeam,
}) => {
  const { t, language, setLanguage } = useTranslation();

  // Interactive 3D Soundbox preview state on the landing hero
  const [previewState, setPreviewState] = useState<'unpaid' | 'spoof' | 'paid'>('paid');

  const previewStatus: PaymentStatus = previewState === 'paid' ? 'PAID' : 'UNPAID';
  const previewSecurityAlert: SecurityAlert =
    previewState === 'spoof' ? 'SPOOF_REJECTED' : 'NONE';

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-gold/20 selection:text-forest">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border-warm px-4 sm:px-6 py-3.5 shadow-warm-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Sovereign Soundbox Emblem */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <svg
                className="w-10 h-10 rounded-xl shadow-warm-sm transition-transform hover:scale-105"
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
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-verified" />
                <span className="relative inline-flex rounded-full h-3 w-3 border-2 border-surface bg-verified" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base md:text-lg tracking-tight text-forest">
                  {t('app_name')}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-gold/15 text-gold-dark rounded border border-gold/30">
                  {t('landing_nav_badge')}
                </span>
              </div>
              <p className="text-xs text-muted font-mono">
                Bitcoin Lightning · NIP-47 Nostr Wallet Connect
              </p>
            </div>
          </div>

          {/* Right Controls: Language Switcher & Launch CTA */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Language Switcher Pill */}
            <div className="inline-flex items-center bg-canvas rounded-lg p-0.5 border border-border-warm text-xs font-semibold shadow-2xs">
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

            {/* Launch POS Button */}
            <button
              onClick={onLaunchPos}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-forest text-surface hover:bg-forest-light transition-all shadow-warm-sm active:scale-98"
            >
              <span>{t('landing_nav_cta')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION (Split 2-Column Layout) */}
      <section className="relative overflow-hidden py-12 md:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Category / Region Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 text-gold-dark border border-gold/30 text-xs font-bold tracking-wide mb-6 shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 fill-gold text-gold" />
              <span>{t('landing_hero_badge')}</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-ink tracking-tight leading-[1.15] mb-5"
            >
              <span className="text-forest">{t('landing_hero_headline').split('.')[0]}.</span>{' '}
              <span className="text-gold-dark underline decoration-gold/40 decoration-wavy decoration-2">
                {t('landing_hero_headline').split('.')[1] || ''}
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-base sm:text-lg text-muted max-w-xl leading-relaxed mb-8"
            >
              {t('landing_hero_subheadline')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-6"
            >
              <button
                onClick={onLaunchPos}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold bg-forest text-surface hover:bg-forest-light transition-all shadow-warm-md hover:shadow-warm-lg active:scale-98"
              >
                <span>{t('landing_hero_cta_primary')}</span>
                <ArrowRight className="w-5 h-5 text-gold" />
              </button>

              <button
                onClick={onLaunchRedTeam}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold bg-surface text-forest border-2 border-forest/20 hover:border-forest/50 hover:bg-forest/5 transition-all shadow-warm-xs active:scale-98"
              >
                <Terminal className="w-4 h-4 text-gold-dark" />
                <span>{t('landing_hero_cta_secondary')}</span>
              </button>
            </motion.div>

            {/* Guarantee Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-2 text-xs text-muted font-mono"
            >
              <ShieldCheck className="w-4 h-4 text-verified flex-shrink-0" />
              <span>{t('landing_hero_guarantee')}</span>
            </motion.div>
          </div>

          {/* Right Column: Interactive 3D Soundbox Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full bg-surface rounded-2xl border border-border-warm shadow-warm-md p-4 flex flex-col"
            >
              {/* Showcase Header & Interactive State Selector */}
              <div className="flex items-center justify-between pb-3 border-b border-border-warm mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  {t('landing_preview_badge')}
                </span>

                {/* State Pills */}
                <div className="flex items-center gap-1 bg-canvas p-1 rounded-lg border border-border-warm text-xs font-semibold">
                  <button
                    onClick={() => setPreviewState('unpaid')}
                    className={`px-2 py-1 rounded transition-all text-[11px] ${
                      previewState === 'unpaid'
                        ? 'bg-pending text-surface font-bold shadow-2xs'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {t('landing_preview_state_unpaid')}
                  </button>
                  <button
                    onClick={() => setPreviewState('spoof')}
                    className={`px-2 py-1 rounded transition-all text-[11px] ${
                      previewState === 'spoof'
                        ? 'bg-danger text-surface font-bold shadow-2xs'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {t('landing_preview_state_spoof')}
                  </button>
                  <button
                    onClick={() => setPreviewState('paid')}
                    className={`px-2 py-1 rounded transition-all text-[11px] ${
                      previewState === 'paid'
                        ? 'bg-verified text-surface font-bold shadow-2xs'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {t('landing_preview_state_paid')}
                  </button>
                </div>
              </div>

              {/* Embedded 3D Hardware Soundbox Twin */}
              <div className="w-full flex justify-center">
                <Soundbox3DDevice
                  status={previewStatus}
                  securityAlert={previewSecurityAlert}
                  amountXof={5000}
                  amountSats={13670}
                  isMuted={false}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. 3-STEP MERCHANT WORKFLOW STRIP */}
      <section className="py-14 bg-surface border-y border-border-warm px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-2">
              {t('landing_how_title')}
            </h2>
            <p className="text-sm sm:text-base text-muted">
              {t('landing_how_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-canvas rounded-2xl p-6 border border-border-warm shadow-warm-xs flex flex-col justify-between hover:border-gold/50 transition-colors">
              <div>
                <span className="text-3xl font-black text-gold/80 font-mono tracking-tight block mb-4">
                  {t('landing_step1_num')}
                </span>
                <h3 className="text-lg font-bold text-ink mb-2">
                  {t('landing_step1_title')}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {t('landing_step1_desc')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border-warm/60 flex items-center gap-2 text-xs font-mono text-forest font-semibold">
                <Smartphone className="w-4 h-4 text-gold-dark" />
                <span>WAEMU XOF/BTC Live Rate</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-canvas rounded-2xl p-6 border border-border-warm shadow-warm-xs flex flex-col justify-between hover:border-gold/50 transition-colors">
              <div>
                <span className="text-3xl font-black text-gold/80 font-mono tracking-tight block mb-4">
                  {t('landing_step2_num')}
                </span>
                <h3 className="text-lg font-bold text-ink mb-2">
                  {t('landing_step2_title')}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {t('landing_step2_desc')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border-warm/60 flex items-center gap-2 text-xs font-mono text-forest font-semibold">
                <Lock className="w-4 h-4 text-gold-dark" />
                <span>NIP-47 Nostr Protocol</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-canvas rounded-2xl p-6 border border-border-warm shadow-warm-xs flex flex-col justify-between hover:border-gold/50 transition-colors">
              <div>
                <span className="text-3xl font-black text-gold/80 font-mono tracking-tight block mb-4">
                  {t('landing_step3_num')}
                </span>
                <h3 className="text-lg font-bold text-ink mb-2">
                  {t('landing_step3_title')}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {t('landing_step3_desc')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border-warm/60 flex items-center gap-2 text-xs font-mono text-forest font-semibold">
                <Volume2 className="w-4 h-4 text-gold-dark" />
                <span>Français & Wolof Speech</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY SOVEREIGN SOUNDBOX: COMPARISON BAND */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-2">
              {t('landing_why_title')}
            </h2>
            <p className="text-sm sm:text-base text-muted">
              {t('landing_why_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Fraud Threat (Visual Vulnerability) */}
            <div className="bg-danger-light/50 border border-danger/30 rounded-2xl p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/30 flex items-center justify-center text-danger">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-danger-dark">
                  {t('landing_why_fraud_title')}
                </h3>
              </div>
              <div className="space-y-4 text-sm text-danger-dark/90 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-danger">•</span>
                  <p>{t('landing_why_fraud_p1')}</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-danger">•</span>
                  <p>{t('landing_why_fraud_p2')}</p>
                </div>
              </div>
            </div>

            {/* The Sovereign Soundbox Solution (Cryptographic Proof) */}
            <div className="bg-verified-light/50 border border-verified/30 rounded-2xl p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-verified/10 border border-verified/30 flex items-center justify-center text-verified">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-verified-dark">
                  {t('landing_why_soundbox_title')}
                </h3>
              </div>
              <div className="space-y-4 text-sm text-verified-dark/90 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-verified">•</span>
                  <p>{t('landing_why_soundbox_p1')}</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-verified">•</span>
                  <p>{t('landing_why_soundbox_p2')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECURITY & ARCHITECTURE GUARANTEES STRIP */}
      <section className="py-14 bg-surface border-t border-border-warm px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              {t('landing_guarantees_title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Receive-Only */}
            <div className="p-5 rounded-xl bg-canvas border border-border-warm flex flex-col">
              <div className="w-9 h-9 rounded-lg bg-forest/10 text-forest flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-ink mb-1.5">
                {t('landing_badge_receive_only')}
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                {t('landing_badge_receive_only_desc')}
              </p>
            </div>

            {/* 2. SHA-256 */}
            <div className="p-5 rounded-xl bg-canvas border border-border-warm flex flex-col">
              <div className="w-9 h-9 rounded-lg bg-gold/15 text-gold-dark flex items-center justify-center mb-3">
                <Hash className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-ink mb-1.5">
                {t('landing_badge_sha256')}
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                {t('landing_badge_sha256_desc')}
              </p>
            </div>

            {/* 3. Zero-PII */}
            <div className="p-5 rounded-xl bg-canvas border border-border-warm flex flex-col">
              <div className="w-9 h-9 rounded-lg bg-verified/15 text-verified-dark flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-ink mb-1.5">
                {t('landing_badge_zero_pii')}
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                {t('landing_badge_zero_pii_desc')}
              </p>
            </div>

            {/* 4. Zero Rental */}
            <div className="p-5 rounded-xl bg-canvas border border-border-warm flex flex-col">
              <div className="w-9 h-9 rounded-lg bg-forest/10 text-forest flex items-center justify-center mb-3">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-ink mb-1.5">
                {t('landing_badge_zero_rental')}
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                {t('landing_badge_zero_rental_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA & FOOTER */}
      <footer className="mt-auto bg-forest text-surface py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-surface mb-1">
              {t('landing_footer_cta_title')}
            </h3>
            <p className="text-xs text-surface/70 font-mono">
              Sovereign Soundbox © 2026 · Dakar Bitcoin Hack · WAEMU · BCEAO
            </p>
          </div>

          <button
            onClick={onLaunchPos}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gold text-forest hover:bg-gold-light transition-all shadow-warm-sm active:scale-98"
          >
            <span>{t('landing_footer_cta_btn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
