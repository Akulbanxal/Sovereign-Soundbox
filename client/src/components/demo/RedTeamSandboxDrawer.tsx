import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  Flame,
  Clock,
  AlertOctagon,
  HelpCircle,
  CopyX,
  ShieldCheck,
} from 'lucide-react';
import type { SecurityAlert, SecurityEventLog } from '../../types/soundbox';
import { useTranslation } from '../../i18n/LanguageContext';

interface RedTeamSandboxDrawerProps {
  onSimulateFakeScreenshot: () => void;
  onSimulateHoldInvoice: () => void;
  onSimulateDuplicateReplay: () => void;
  onSimulatePayBlock: () => void;
  onSimulateVerifiedSettlement: () => void;
  activeSecurityAlert: SecurityAlert;
  securityLogs: SecurityEventLog[];
}

export const RedTeamSandboxDrawer: React.FC<RedTeamSandboxDrawerProps> = ({
  onSimulateFakeScreenshot,
  onSimulateHoldInvoice,
  onSimulateDuplicateReplay,
  onSimulatePayBlock,
  onSimulateVerifiedSettlement,
  activeSecurityAlert,
  securityLogs,
}) => {
  const { t, formatRelativeTime } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [lastExecutedAttack, setLastExecutedAttack] = useState<
    'fake_screenshot' | 'unsettled_hold' | 'duplicate_replay' | 'pay_block' | 'valid_settlement' | null
  >(null);

  const handleTestFakeScreenshot = () => {
    setLastExecutedAttack('fake_screenshot');
    onSimulateFakeScreenshot();
  };

  const handleTestHoldInvoice = () => {
    setLastExecutedAttack('unsettled_hold');
    onSimulateHoldInvoice();
  };

  const handleTestDuplicateReplay = () => {
    setLastExecutedAttack('duplicate_replay');
    onSimulateDuplicateReplay();
  };

  const handleTestPayBlock = () => {
    setLastExecutedAttack('pay_block');
    onSimulatePayBlock();
  };

  const handleTestVerifiedSettlement = () => {
    setLastExecutedAttack('valid_settlement');
    onSimulateVerifiedSettlement();
  };

  return (
    <div className="w-full bg-surface border-2 border-pending/40 rounded-3xl overflow-hidden shadow-flagship">
      {/* Banner / Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 bg-pending/10 hover:bg-pending/15 border-b border-pending/20 flex items-center justify-between text-left transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="px-2.5 py-0.5 rounded-full bg-pending text-surface font-mono font-extrabold text-[11px] tracking-wider uppercase flex items-center gap-1 shadow-xs">
            <Flame className="w-3.5 h-3.5" />
            <span>{t('redteam_drawer_badge')}</span>
          </div>
          {activeSecurityAlert !== 'NONE' && (
            <span className="px-2.5 py-0.5 rounded-full bg-danger text-surface font-mono text-[10px] font-bold animate-pulse">
              {t('redteam_alert_active', { alert: activeSecurityAlert })}
            </span>
          )}
          <span className="text-xs font-bold font-mono text-ink hidden sm:inline">
            {t('redteam_drawer_title')}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold text-pending-dark">
          <span>{isOpen ? t('redteam_toggle_hide') : t('redteam_toggle_show')}</span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </button>

      {/* Expandable Drawer Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-5 flex flex-col gap-5 bg-gradient-to-b from-canvas to-surface"
          >
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-surface border border-border-warm text-xs">
              <HelpCircle className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
              <p className="text-muted leading-relaxed">
                {t('redteam_explainer')}
              </p>
            </div>

            {/* Dynamic Real-Time Test Outcome Banner */}
            {lastExecutedAttack && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
                  lastExecutedAttack === 'fake_screenshot' || lastExecutedAttack === 'pay_block'
                    ? 'bg-danger-light/90 border-danger/40 text-danger-dark'
                    : lastExecutedAttack === 'unsettled_hold' || lastExecutedAttack === 'duplicate_replay'
                    ? 'bg-pending-light/90 border-pending/40 text-pending-dark'
                    : 'bg-verified-light/90 border-verified/40 text-verified-dark'
                }`}
              >
                <div className="flex items-start gap-3">
                  {lastExecutedAttack === 'fake_screenshot' || lastExecutedAttack === 'pay_block' ? (
                    <AlertOctagon className="w-5 h-5 text-danger flex-shrink-0 mt-0.5 animate-pulse" />
                  ) : lastExecutedAttack === 'unsettled_hold' ? (
                    <Clock className="w-5 h-5 text-pending flex-shrink-0 mt-0.5 animate-pulse" />
                  ) : lastExecutedAttack === 'duplicate_replay' ? (
                    <CopyX className="w-5 h-5 text-pending flex-shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-verified flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-mono font-extrabold text-xs tracking-tight">
                      {lastExecutedAttack === 'fake_screenshot'
                        ? t('redteam_attack1_feedback')
                        : lastExecutedAttack === 'unsettled_hold'
                        ? t('redteam_attack2_feedback')
                        : lastExecutedAttack === 'duplicate_replay'
                        ? t('redteam_attack3_feedback')
                        : lastExecutedAttack === 'pay_block'
                        ? t('redteam_attack_pay_feedback')
                        : t('redteam_attack4_feedback')}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-3.5 py-1.5 rounded-xl bg-surface border border-border-warm hover:bg-canvas text-forest text-xs font-mono font-bold flex-shrink-0 shadow-2xs transition-colors self-end sm:self-auto cursor-pointer"
                >
                  {t('redteam_btn_view_twin')}
                </button>
              </motion.div>
            )}

            {/* 4 Adversarial Trigger Cards + 1 Valid Settlement Reference Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Test 1: Fake Screenshot Attack */}
              <div
                className={`bg-surface border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xs transition-all ${
                  lastExecutedAttack === 'fake_screenshot'
                    ? 'border-danger ring-2 ring-danger/20'
                    : 'border-border-warm hover:border-danger/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-danger uppercase tracking-wider flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      {t('redteam_attack1_tag')}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-danger-light text-danger-dark font-bold">
                      Spoof
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-ink mb-1">
                    {t('redteam_attack1_title')}
                  </h4>
                  <p className="text-[11px] text-muted leading-relaxed">
                    {t('redteam_attack1_desc')}
                  </p>
                </div>
                <button
                  onClick={handleTestFakeScreenshot}
                  className="w-full py-2.5 px-3 rounded-xl bg-danger-light hover:bg-danger/20 text-danger-dark font-mono font-bold text-xs border border-danger/30 transition-colors flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>{t('redteam_attack1_btn')}</span>
                </button>
              </div>

              {/* Test 2: Unsettled Hold Invoice */}
              <div
                className={`bg-surface border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xs transition-all ${
                  lastExecutedAttack === 'unsettled_hold'
                    ? 'border-pending ring-2 ring-pending/20'
                    : 'border-border-warm hover:border-pending/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-pending uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {t('redteam_attack2_tag')}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pending-light text-pending-dark font-bold">
                      Pending
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-ink mb-1">
                    {t('redteam_attack2_title')}
                  </h4>
                  <p className="text-[11px] text-muted leading-relaxed">
                    {t('redteam_attack2_desc')}
                  </p>
                </div>
                <button
                  onClick={handleTestHoldInvoice}
                  className="w-full py-2.5 px-3 rounded-xl bg-pending-light hover:bg-pending/20 text-pending-dark font-mono font-bold text-xs border border-pending/30 transition-colors flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>{t('redteam_attack2_btn')}</span>
                </button>
              </div>

              {/* Test 3: Duplicate Replay Attack */}
              <div
                className={`bg-surface border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xs transition-all ${
                  lastExecutedAttack === 'duplicate_replay'
                    ? 'border-pending ring-2 ring-pending/20'
                    : 'border-border-warm hover:border-pending/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-pending uppercase tracking-wider flex items-center gap-1">
                      <CopyX className="w-3.5 h-3.5" />
                      {t('redteam_attack3_tag')}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pending-light text-pending-dark font-bold">
                      Replay
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-ink mb-1">
                    {t('redteam_attack3_title')}
                  </h4>
                  <p className="text-[11px] text-muted leading-relaxed">
                    {t('redteam_attack3_desc')}
                  </p>
                </div>
                <button
                  onClick={handleTestDuplicateReplay}
                  className="w-full py-2.5 px-3 rounded-xl bg-canvas hover:bg-border-warm text-ink font-mono font-bold text-xs border border-border-warm transition-colors flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <CopyX className="w-4 h-4 text-pending" />
                  <span>{t('redteam_attack3_btn')}</span>
                </button>
              </div>

              {/* Test 4: Least-Privilege pay_invoice Block */}
              <div
                className={`bg-surface border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xs transition-all ${
                  lastExecutedAttack === 'pay_block'
                    ? 'border-danger ring-2 ring-danger/20'
                    : 'border-border-warm hover:border-danger/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-danger uppercase tracking-wider flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      {t('redteam_attack_pay_tag')}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-danger-light text-danger-dark font-bold">
                      Blocked
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-ink mb-1">
                    {t('redteam_attack_pay_title')}
                  </h4>
                  <p className="text-[11px] text-muted leading-relaxed">
                    {t('redteam_attack_pay_desc')}
                  </p>
                </div>
                <button
                  onClick={handleTestPayBlock}
                  className="w-full py-2.5 px-3 rounded-xl bg-danger-light hover:bg-danger/20 text-danger-dark font-mono font-bold text-xs border border-danger/30 transition-colors flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>{t('redteam_attack_pay_btn')}</span>
                </button>
              </div>

              {/* Test 5: Real Settlement Reference */}
              <div
                className={`bg-surface border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xs transition-all md:col-span-2 lg:col-span-2 ${
                  lastExecutedAttack === 'valid_settlement'
                    ? 'border-verified ring-2 ring-verified/20'
                    : 'border-border-warm hover:border-verified/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-verified uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-verified" />
                      {t('redteam_attack4_tag')}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-verified-light text-verified-dark font-bold">
                      Valid Settlement
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-ink mb-1">
                    {t('redteam_attack4_title')}
                  </h4>
                  <p className="text-[11px] text-muted leading-relaxed">
                    {t('redteam_attack4_desc')}
                  </p>
                </div>
                <button
                  onClick={handleTestVerifiedSettlement}
                  className="w-full py-2.5 px-3 rounded-xl bg-verified-light hover:bg-verified-light/80 text-verified-dark font-mono font-bold text-xs border border-verified/40 transition-colors flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-verified" />
                  <span>{t('redteam_attack4_btn')}</span>
                </button>
              </div>
            </div>

            {/* Live Security Event Log Console */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border-warm">
              <span className="text-xs font-mono font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-gold" />
                <span>{t('redteam_logs_title')}</span>
              </span>

              <div className="bg-canvas border border-border-warm rounded-2xl p-3 max-h-44 overflow-y-auto flex flex-col gap-2 font-mono text-[11px]">
                {securityLogs.length === 0 ? (
                  <span className="text-muted text-center py-4">{t('redteam_logs_empty')}</span>
                ) : (
                  securityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 bg-surface border border-border-warm rounded-xl flex flex-col gap-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold ${
                            log.severity === 'danger'
                              ? 'text-danger'
                              : log.severity === 'warning'
                              ? 'text-pending'
                              : 'text-verified'
                          }`}
                        >
                          [{log.type}] {log.title}
                        </span>
                        <span className="text-[10px] text-muted tabular-nums">
                          {formatRelativeTime(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-muted leading-relaxed">{log.detail}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
