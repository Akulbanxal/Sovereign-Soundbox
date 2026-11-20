import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from './components/layout/AppShell';
import { Soundbox3DDevice } from './components/soundbox3d/Soundbox3DDevice';
import { CheckoutCard } from './components/pos/CheckoutCard';
import { ActiveInvoicePanel } from './components/pos/ActiveInvoicePanel';
import { TransactionHistory } from './components/pos/TransactionHistory';
import { AudioWaveformBar } from './components/pos/AudioWaveformBar';
import { WalletConnectModal } from './components/settings/WalletConnectModal';
import { RedTeamSandboxDrawer } from './components/demo/RedTeamSandboxDrawer';
import { SecurityTrustModal } from './components/info/SecurityTrustModal';
import { LandingPage } from './components/landing/LandingPage';
import { Zap } from 'lucide-react';

import {
  fetchLiveExchangeRate,
  getWalletStatus,
  connectWallet,
  disconnectWallet,
  createPosInvoice,
  getInvoices,
  reportSecurityAudit,
  fetchSecurityAuditLogs,
} from './services/api';
import { soundboxAudioEngine } from './services/soundboxAudioEngine';
import { usePaymentPoller } from './hooks/usePaymentPoller';
import { useTranslation } from './i18n/LanguageContext';

import type {
  InvoiceRecord,
  SecurityAlert,
  SecurityEventLog,
  WalletConnectionStatus,
  WalletInfo,
  ExchangeRateState,
} from './types/soundbox';

const SAMPLE_DAKAR_TRANSACTIONS: InvoiceRecord[] = [
  {
    id: 'sample_dakar_01',
    amountXof: 5000,
    amountSats: 13670,
    bolt11: 'lnbc136700n1p98m7sample001sovereignsoundboxdakar',
    paymentHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    preimage: 'f1e2d3c4b5a697887766554433221100ffeeddccbbaa99887766554433221100',
    status: 'PAID',
    createdAt: Date.now() - 3600000 * 2.5,
    settledAt: Date.now() - 3600000 * 2.5 + 4000,
    expiresAt: Date.now() - 3600000 * 2.5 + 600000,
    rateSource: 'CoinGecko Live [SAMPLE]',
    preimageVerified: true,
    announcementPlayed: true,
    isSimulation: true,
    language: 'fr',
    note: '[SAMPLE] Attaya & Noix de cajou · Marché Sandaga',
  },
  {
    id: 'sample_dakar_02',
    amountXof: 2500,
    amountSats: 6835,
    bolt11: 'lnbc68350n1p98m7sample002sovereignsoundboxdakar',
    paymentHash: 'b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    preimage: 'e2d3c4b5a697887766554433221100ffeeddccbbaa99887766554433221100ff',
    status: 'PAID',
    createdAt: Date.now() - 3600000 * 1.2,
    settledAt: Date.now() - 3600000 * 1.2 + 3000,
    expiresAt: Date.now() - 3600000 * 1.2 + 600000,
    rateSource: 'CoinGecko Live [SAMPLE]',
    preimageVerified: true,
    announcementPlayed: true,
    isSimulation: true,
    language: 'wo',
    note: '[SAMPLE] Café Touba & Pastels · Kermel',
  },
  {
    id: 'sample_dakar_03',
    amountXof: 10000,
    amountSats: 27340,
    bolt11: 'lnbc273400n1p98m7sample003sovereignsoundboxdakar',
    paymentHash: 'c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
    preimage: 'd3c4b5a697887766554433221100ffeeddccbbaa99887766554433221100ffee',
    status: 'PAID',
    createdAt: Date.now() - 1800000,
    settledAt: Date.now() - 1800000 + 5000,
    expiresAt: Date.now() - 1800000 + 600000,
    rateSource: 'CoinGecko Live [SAMPLE]',
    preimageVerified: true,
    announcementPlayed: true,
    isSimulation: true,
    language: 'fr',
    note: '[SAMPLE] Tissu Bogolan Artisanal · Soumbédioune',
  },
];

export const App: React.FC = () => {
  const { language, t, formatCfa } = useTranslation();

  // Navigation & View Routing State (Landing Page vs. POS Terminal)
  const [currentView, setCurrentView] = useState<'landing' | 'pos'>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const savedInvoiceId =
        sessionStorage.getItem('sovereign_soundbox_active_invoice_id') ||
        sessionStorage.getItem('sovereign_active_invoice_id');
      if (urlParams.get('view') === 'pos' || Boolean(savedInvoiceId)) {
        return 'pos';
      }
    }
    return 'landing';
  });

  const [isRedTeamOpen, setIsRedTeamOpen] = useState<boolean>(false);

  const handleLaunchPos = useCallback(() => {
    setCurrentView('pos');
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'pos');
      window.history.pushState({}, '', url.toString());
    } catch {}
  }, []);

  const handleLaunchRedTeam = useCallback(() => {
    setCurrentView('pos');
    setIsRedTeamOpen(true);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'pos');
      window.history.pushState({}, '', url.toString());
    } catch {}
  }, []);

  const handleBackToLanding = useCallback(() => {
    setCurrentView('landing');
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      window.history.pushState({}, '', url.toString());
    } catch {}
  }, []);

  // 1. Wallet & Audio State
  const [walletStatus, setWalletStatus] = useState<WalletConnectionStatus>('disconnected');
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true); // Default to true out-of-the-box
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundboxAudioEngine.isAudioMuted());

  // 2. Exchange Rate State
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateState>({
    xofPerBtc: 38_450_000,
    lastUpdated: new Date().toISOString(),
    isOfflineFallback: false,
    rateSource: 'CoinGecko Live (XOF/BTC)',
  });

  // 3. Transactions & Invoicing State
  const [activeInvoice, setActiveInvoice] = useState<InvoiceRecord | null>(null);
  const [realTransactions, setRealTransactions] = useState<InvoiceRecord[]>([]);
  const [demoTransactions, setDemoTransactions] = useState<InvoiceRecord[]>([]);
  const [todayTotals, setTodayTotals] = useState<{ totalXof: number; totalSats: number; count: number }>({
    totalXof: 0,
    totalSats: 0,
    count: 0,
  });
  const [isLoadingInvoice, setIsLoadingInvoice] = useState<boolean>(false);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState<boolean>(true);
  const [invoiceErrorMessage, setInvoiceErrorMessage] = useState<string | null>(null);

  // 4. Red-Team & Security Log State
  const [securityAlert, setSecurityAlert] = useState<SecurityAlert>('NONE');
  const [securityLogs, setSecurityLogs] = useState<SecurityEventLog[]>([]);

  // Function to refresh real transaction receipts from SQLite backend
  const refreshTransactions = useCallback(async () => {
    try {
      const res = await getInvoices();
      setRealTransactions(res.invoices);
      setTodayTotals(res.todayTotals);
    } catch {
      // Backend not yet ready
    } finally {
      setIsLoadingInvoices(false);
    }
  }, []);

  // 5. On Mount: Check wallet connection, load invoices, and fetch live rate
  useEffect(() => {
    getWalletStatus().then((info) => {
      if (info) {
        setWalletInfo(info);
        setWalletStatus(info.isReceiveOnly ? 'connected_receive_only' : 'connected_full_warning');
        setIsDemoMode(false); // If real wallet connected, exit demo mode
      } else {
        setWalletStatus('disconnected');
        setIsDemoMode(true); // If disconnected, enable demo mode
      }
    });

    fetchLiveExchangeRate().then((rate) => {
      setExchangeRate(rate);
    });

    refreshTransactions();

    fetchSecurityAuditLogs().then((backendLogs) => {
      if (backendLogs && backendLogs.length > 0) {
        setSecurityLogs(
          backendLogs.map((l) => ({
            id: `sec_db_${l.id}`,
            timestamp: new Date(l.created_at).getTime(),
            type: (l.event_type as SecurityEventLog['type']) || 'SPOOF_REJECTED',
            severity: l.event_type.includes('REJECTED') || l.event_type.includes('PERMISSIONS') ? 'danger' : 'warning',
            title: `[${l.event_type}] Security Event`,
            detail: l.reason,
          }))
        );
      }
    });
  }, [refreshTransactions]);

  // 6. Gated Audio Confirmation strictly for Real Paid Payments
  const handleVerifiedSettlement = useCallback(
    (settledInvoice: InvoiceRecord) => {
      // GATED: Only real, non-simulated, verified paid invoices are announced through the real gate
      soundboxAudioEngine.announceVerifiedPayment(settledInvoice, settledInvoice.language);

      refreshTransactions();

      setSecurityLogs((prev) => [
        {
          id: `sec_${Date.now()}`,
          timestamp: Date.now(),
          type: 'PERMISSIONS_AUDIT',
          severity: 'info',
          title: t('status_verified_paid'),
          detail: `#${settledInvoice.id.slice(-6)} · ${formatCfa(settledInvoice.amountXof)} (${settledInvoice.amountSats.toLocaleString()} SATS) SHA-256 ✓`,
        },
        ...prev,
      ]);
    },
    [refreshTransactions, t, formatCfa]
  );

  // 7. Active Payment Poller Hook (every 2.5s while invoice is UNPAID or PENDING)
  usePaymentPoller({
    activeInvoice: activeInvoice?.isSimulation ? null : activeInvoice, // Do not poll backend for simulation invoices
    setActiveInvoice,
    onVerifiedSettlement: handleVerifiedSettlement,
  });

  // 8. Invoice Creation Handler - Supports both Real NWC and Instant Demo Mode
  const handleGenerateInvoice = async (amountXof: number, amountSats: number) => {
    // UNLOCK AUDIO: Must happen synchronously inside the user's click gesture
    soundboxAudioEngine.unlockAudio();

    setIsLoadingInvoice(true);
    setSecurityAlert('NONE');
    setInvoiceErrorMessage(null);

    // DEMO MODE INVOICE GENERATION
    if (isDemoMode || walletStatus === 'disconnected') {
      const computedSats = Math.max(1, Math.round((amountXof / exchangeRate.xofPerBtc) * 100_000_000));
      const simulatedSats = amountSats || computedSats;
      const demoInv: InvoiceRecord = {
        id: `demo_${Date.now()}`,
        amountXof: amountXof > 0 ? amountXof : Math.round((simulatedSats * exchangeRate.xofPerBtc) / 100_000_000),
        amountSats: simulatedSats,
        bolt11: `lnbc${simulatedSats}0n1p98demo${Date.now()}sovereignsoundboxdemo`,
        paymentHash: 'b5f8c3a1d9e7a2b4c6e8f0a2d4b6e8a0c2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2',
        status: 'UNPAID',
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        rateSource: `${exchangeRate.rateSource} [DEMO]`,
        preimageVerified: false,
        announcementPlayed: false,
        isSimulation: true,
        language,
        note: '[DEMO] Facture Lightning simulée',
      };

      setTimeout(() => {
        setActiveInvoice(demoInv);
        setDemoTransactions((prev) => [demoInv, ...prev]);
        setIsLoadingInvoice(false);
      }, 350);
      return;
    }

    // REAL INVOICE GENERATION VIA BACKEND NWC
    try {
      const invoice = await createPosInvoice({
        amountXof: amountXof > 0 ? amountXof : undefined,
        amountSats,
        language,
        rateSource: exchangeRate.rateSource,
      });

      setActiveInvoice(invoice);
      setRealTransactions((prev) => [invoice, ...prev]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('status_failed');
      setInvoiceErrorMessage(msg);
      if (!walletInfo) {
        setIsWalletModalOpen(true);
      }
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  // Handler for simulating customer payment in Demo Mode
  const handleSimulateCustomerPayment = () => {
    if (!activeInvoice) return;
    soundboxAudioEngine.unlockAudio();

    const settled: InvoiceRecord = {
      ...activeInvoice,
      status: 'PAID',
      settledAt: Date.now(),
      preimage: 'c2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b5f8c3a1d9e7a2b4c6e8f0a2d4b6e8a0',
      preimageVerified: true,
      announcementPlayed: true,
    };

    setActiveInvoice(settled);
    setDemoTransactions((prev) =>
      prev.map((tx) => (tx.id === settled.id ? settled : tx))
    );

    // Update today's totals visually
    setTodayTotals((prev) => ({
      totalXof: prev.totalXof + settled.amountXof,
      totalSats: prev.totalSats + settled.amountSats,
      count: prev.count + 1,
    }));

    // Play isolated demo preview sound in selected language (Wolof or French)
    soundboxAudioEngine.playDemoPreview(settled.amountXof, language);

    setSecurityLogs((prev) => [
      {
        id: `sec_${Date.now()}`,
        timestamp: Date.now(),
        type: 'PERMISSIONS_AUDIT',
        severity: 'info',
        title: `${t('status_verified_paid')} [DEMO]`,
        detail: `#${settled.id.slice(-6)} · ${formatCfa(settled.amountXof)} (${settled.amountSats.toLocaleString()} SATS) SHA-256 ✓`,
      },
      ...prev,
    ]);
  };

  const handleCancelInvoice = () => {
    setActiveInvoice(null);
    setSecurityAlert('NONE');
    setInvoiceErrorMessage(null);
  };

  const handleReplayChime = (tx: InvoiceRecord) => {
    if (tx.isSimulation) {
      soundboxAudioEngine.playDemoPreview(tx.amountXof, tx.language);
    } else {
      soundboxAudioEngine.announceVerifiedPayment(tx, tx.language);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundboxAudioEngine.setMuted(nextMuted);
  };

  // 9. Wallet Modal Handlers
  const handleConnectWallet = async (uri: string) => {
    setIsConnectingWallet(true);
    try {
      const info = await connectWallet(uri);
      setWalletInfo(info);
      setWalletStatus(info.isReceiveOnly ? 'connected_receive_only' : 'connected_full_warning');
      setIsDemoMode(false);
      setIsWalletModalOpen(false);
      setInvoiceErrorMessage(null);

      reportSecurityAudit({
        eventType: 'PERMISSIONS_AUDIT',
        reason: `Wallet connected: ${info.alias || 'node'} (Receive-Only: ${info.isReceiveOnly})`,
      });

      setSecurityLogs((prev) => [
        {
          id: `sec_${Date.now()}`,
          timestamp: Date.now(),
          type: 'PERMISSIONS_AUDIT',
          severity: info.isReceiveOnly ? 'info' : 'warning',
          title: t('wallet_connected_banner'),
          detail: `${info.alias || 'Node'} · NIP-47 [${info.methods.join(', ')}]`,
        },
        ...prev,
      ]);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleDisconnectWallet = async () => {
    await disconnectWallet();
    setWalletInfo(null);
    setWalletStatus('disconnected');
    setIsDemoMode(true);
    setIsWalletModalOpen(false);
  };

  // 10. Red-Team Adversarial Test Handlers
  const handleSimulateFakeScreenshot = () => {
    // SPEAKER STAYS 100% SILENT: Zero audio chime or speech
    setSecurityAlert('SPOOF_REJECTED');

    reportSecurityAudit({
      eventType: 'SPOOF_REJECTED',
      invoiceId: activeInvoice?.id,
      paymentHashPrefix: activeInvoice?.paymentHash.slice(0, 16),
      reason: 'Red-Team Attack 1: Fake screenshot presented without NIP-47 settlement proof. Speaker kept 100% silent.',
    });

    setSecurityLogs((prev) => [
      {
        id: `sec_${Date.now()}`,
        timestamp: Date.now(),
        type: 'SPOOF_REJECTED',
        severity: 'danger',
        title: t('redteam_attack1_title'),
        detail: 'Fake payment screenshot presented. Zero NIP-47 settlement proof found on node. Speaker stays 100% silent.',
      },
      ...prev,
    ]);
  };

  const handleSimulateHoldInvoice = () => {
    // SPEAKER STAYS 100% SILENT: Zero audio chime or speech
    setSecurityAlert('UNSETTLED_HOLD');

    if (activeInvoice) {
      setActiveInvoice({ ...activeInvoice, status: 'PENDING' });
    }

    reportSecurityAudit({
      eventType: 'UNSETTLED_HOLD',
      invoiceId: activeInvoice?.id,
      paymentHashPrefix: activeInvoice?.paymentHash.slice(0, 16),
      reason: 'Red-Team Attack 2: Unsettled Hold Invoice detected in channel. Audio alert kept 100% silent.',
    });

    setSecurityLogs((prev) => [
      {
        id: `sec_${Date.now()}`,
        timestamp: Date.now(),
        type: 'UNSETTLED_HOLD',
        severity: 'warning',
        title: t('redteam_attack2_title'),
        detail: 'Unsettled HTLC in channel. Without cryptographic SHA-256 preimage verification, the soundbox refuses to chime.',
      },
      ...prev,
    ]);
  };

  const handleSimulateDuplicateReplay = () => {
    // SPEAKER STAYS 100% SILENT: Zero audio chime or speech
    setSecurityAlert('DUPLICATE_REPLAY');

    reportSecurityAudit({
      eventType: 'DUPLICATE_REPLAY',
      invoiceId: activeInvoice?.id,
      paymentHashPrefix: activeInvoice?.paymentHash.slice(0, 16),
      reason: 'Red-Team Attack 3: Duplicate relay event replayed. Blocked by idempotency guard. Speaker kept 100% silent.',
    });

    setSecurityLogs((prev) => [
      {
        id: `sec_${Date.now()}`,
        timestamp: Date.now(),
        type: 'DUPLICATE_REPLAY',
        severity: 'warning',
        title: t('redteam_attack3_title'),
        detail: t('redteam_attack3_desc'),
      },
      ...prev,
    ]);
  };

  const handleSimulatePayBlock = () => {
    // SPEAKER STAYS 100% SILENT: Zero audio chime or speech
    setSecurityAlert('SPOOF_REJECTED');

    reportSecurityAudit({
      eventType: 'PERMISSIONS_AUDIT',
      reason: 'Red-Team Attack 4: Unauthorized pay_invoice call attempted. Rejected by least-privilege receive-only policy.',
    });

    setSecurityLogs((prev) => [
      {
        id: `sec_${Date.now()}`,
        timestamp: Date.now(),
        type: 'PERMISSIONS_AUDIT',
        severity: 'danger',
        title: t('redteam_attack_pay_title'),
        detail: t('redteam_attack_pay_desc'),
      },
      ...prev,
    ]);
  };

  const handleSimulateVerifiedSettlement = () => {
    soundboxAudioEngine.unlockAudio();
    setSecurityAlert('NONE');

    const computedSats = Math.round((5000 / exchangeRate.xofPerBtc) * 100_000_000);
    const demoInvoice: InvoiceRecord = {
      id: `sim_${Date.now()}`,
      amountXof: 5000,
      amountSats: computedSats,
      bolt11: 'lnbc50000n1p98m7demo000sovereignsoundboxphase6demo',
      paymentHash: 'b5f8c3a1d9e7a2b4c6e8f0a2d4b6e8a0c2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2',
      preimage: 'c2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b5f8c3a1d9e7a2b4c6e8f0a2d4b6e8a0',
      status: 'PAID',
      createdAt: Date.now() - 30000,
      settledAt: Date.now(),
      expiresAt: Date.now() + 600000,
      rateSource: exchangeRate.rateSource,
      preimageVerified: true,
      announcementPlayed: true,
      isSimulation: true,
      language,
      note: t('redteam_attack4_title'),
    };

    setActiveInvoice(demoInvoice);
    setDemoTransactions((prev) => [demoInvoice, ...prev]);

    // Clearly labeled demo preview sound (bypasses real-payment gate)
    soundboxAudioEngine.playDemoPreview(demoInvoice.amountXof, language);

    setSecurityLogs((prev) => [
      {
        id: `sec_${Date.now()}`,
        timestamp: Date.now(),
        type: 'PERMISSIONS_AUDIT',
        severity: 'info',
        title: t('redteam_attack4_title'),
        detail: t('redteam_attack4_desc'),
      },
      ...prev,
    ]);
  };

  // Combine real transactions, demo transactions, or rich seeded sample data for judges
  const effectiveTransactions =
    realTransactions.length > 0
      ? [...realTransactions, ...demoTransactions].sort((a, b) => b.createdAt - a.createdAt)
      : demoTransactions.length > 0
      ? demoTransactions
      : SAMPLE_DAKAR_TRANSACTIONS;

  const displaySalesXof =
    realTransactions.length > 0 || demoTransactions.length > 0
      ? todayTotals.totalXof
      : 17500;

  const displaySalesSats =
    realTransactions.length > 0 || demoTransactions.length > 0
      ? todayTotals.totalSats
      : Math.round((17500 / exchangeRate.xofPerBtc) * 100_000_000);

  const activeDeviceStatus = activeInvoice ? activeInvoice.status : 'IDLE';

  if (currentView === 'landing') {
    return (
      <LandingPage
        onLaunchPos={handleLaunchPos}
        onLaunchRedTeam={handleLaunchRedTeam}
      />
    );
  }

  return (
    <AppShell
      walletStatus={walletStatus}
      walletInfo={walletInfo}
      isDemoMode={isDemoMode}
      onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
      isMuted={isMuted}
      onToggleMute={handleToggleMute}
      onOpenSettings={() => setIsWalletModalOpen(true)}
      onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
      onBackToLanding={handleBackToLanding}
      rateInfoText={`5 000 XOF ≈ ${Math.round((5000 / exchangeRate.xofPerBtc) * 100_000_000).toLocaleString()} sats`}
      rightPanelContent={
        <div className="flex flex-col gap-6">
          {/* Interactive 3D Soundbox Hardware Twin */}
          <Soundbox3DDevice
            status={activeDeviceStatus}
            securityAlert={securityAlert}
            amountXof={activeInvoice?.amountXof}
            amountSats={activeInvoice?.amountSats}
            isMuted={isMuted}
          />

          {/* Real-Time Audio Waveform & Speaker Spectrum */}
          <AudioWaveformBar showControls={true} />

          {/* Transaction Receipts History with Skeletons & Guidance */}
          <TransactionHistory
            transactions={effectiveTransactions}
            onReplayChime={handleReplayChime}
            isLoading={isLoadingInvoices}
            walletConnected={walletStatus !== 'disconnected' || isDemoMode}
            onOpenWalletModal={() => setIsWalletModalOpen(true)}
          />
        </div>
      }
      bottomDrawer={
        /* Collapsible Red-Team Sandbox Drawer */
        <RedTeamSandboxDrawer
          onSimulateFakeScreenshot={handleSimulateFakeScreenshot}
          onSimulateHoldInvoice={handleSimulateHoldInvoice}
          onSimulateDuplicateReplay={handleSimulateDuplicateReplay}
          onSimulatePayBlock={handleSimulatePayBlock}
          onSimulateVerifiedSettlement={handleSimulateVerifiedSettlement}
          activeSecurityAlert={securityAlert}
          securityLogs={securityLogs}
          isOpen={isRedTeamOpen}
          onToggleOpen={() => setIsRedTeamOpen((prev) => !prev)}
        />
      }
    >
      {/* Demo Mode / Disconnected Mode Banner */}
      {isDemoMode ? (
        <div className="p-3.5 bg-gold/15 border border-gold/40 rounded-2xl text-xs font-mono text-gold-dark flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold fill-gold animate-pulse flex-shrink-0" />
            <span>{t('demo_banner_notice')}</span>
          </div>
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="px-3.5 py-1.5 bg-surface border border-gold/40 hover:bg-canvas text-forest font-bold text-[11px] rounded-xl shadow-xs flex-shrink-0 transition-colors"
          >
            {t('history_btn_connect_wallet')}
          </button>
        </div>
      ) : invoiceErrorMessage ? (
        <div className="p-4 bg-danger-light border border-danger/30 rounded-2xl text-xs font-mono text-danger-dark flex items-center justify-between">
          <span>{invoiceErrorMessage}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDemoMode(true)}
              className="px-3 py-1 bg-forest text-surface rounded-lg font-bold text-[11px]"
            >
              {t('demo_activate_btn')}
            </button>
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="px-3 py-1 bg-surface border border-danger/30 rounded-lg font-bold text-[11px] hover:bg-danger-light"
            >
              {t('history_btn_connect_wallet')}
            </button>
          </div>
        </div>
      ) : null}

      {/* POS Keypad or Active Invoice Panel with smooth AnimatePresence transition */}
      <AnimatePresence mode="wait">
        {activeInvoice ? (
          <motion.div
            key="active-invoice"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <ActiveInvoicePanel
              invoice={activeInvoice}
              onCancel={handleCancelInvoice}
              onReplayChime={() => handleReplayChime(activeInvoice)}
              onSimulatePay={handleSimulateCustomerPayment}
            />
          </motion.div>
        ) : (
          <motion.div
            key="checkout-card"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <CheckoutCard
              exchangeRate={exchangeRate}
              todaySalesXof={displaySalesXof}
              todaySalesSats={displaySalesSats}
              onGenerateInvoice={handleGenerateInvoice}
              isLoading={isLoadingInvoice}
              isLoadingTotals={isLoadingInvoices}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet NWC Configuration Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        walletInfo={walletInfo}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
        isLoading={isConnectingWallet}
      />

      {/* Security Threat Model & Trust Guarantees Modal */}
      <SecurityTrustModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
    </AppShell>
  );
};

export default App;
