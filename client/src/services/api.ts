import type {
  ExchangeRateState,
  InvoiceRecord,
  WalletInfo,
  LanguageCode,
  PaymentStatus,
} from '../types/soundbox';

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  'http://localhost:4000';

const BACKEND_URL = rawBaseUrl.replace(/\/+$/, '');

const FALLBACK_XOF_PER_BTC = 38_500_000;

export interface InvoicesResponse {
  invoices: InvoiceRecord[];
  todayTotals: {
    totalXof: number;
    totalSats: number;
    count: number;
  };
}

export interface InvoiceStatusResponse {
  invoice: InvoiceRecord;
  newlySettled: boolean;
  preimageVerified: boolean;
}

export interface SecurityAuditPayload {
  eventType: 'SPOOF_REJECTED' | 'UNSETTLED_HOLD' | 'DUPLICATE_REPLAY' | 'RATE_FALLBACK' | 'PERMISSIONS_AUDIT';
  invoiceId?: string;
  paymentHashPrefix?: string;
  reason: string;
}

function mapDbRowToInvoice(row: Record<string, unknown>): InvoiceRecord {
  return {
    id: String(row.id),
    amountXof: Number(row.amount_xof || 0),
    amountSats: Number(row.amount_sats || 0),
    bolt11: String(row.bolt11 || ''),
    paymentHash: String(row.payment_hash || ''),
    status: (row.status as PaymentStatus) || 'UNPAID',
    createdAt: new Date(String(row.created_at)).getTime() || Date.now(),
    settledAt: row.settled_at ? new Date(String(row.settled_at)).getTime() : undefined,
    expiresAt: row.expires_at ? new Date(String(row.expires_at)).getTime() : Date.now() + 600000,
    rateSource: String(row.rate_source || 'CoinGecko Live'),
    preimageVerified: Number(row.preimage_verified) === 1,
    announcementPlayed: Number(row.announcement_played) === 1,
    isSimulation: false,
    language: (row.language as LanguageCode) || 'fr',
  };
}

// 1. Health check
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${BACKEND_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

// 2. Wallet API Methods
export async function getWalletStatus(): Promise<WalletInfo | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/wallet/status`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.connected) return null;

    return {
      alias: data.alias || 'Lightning Node Dakar',
      network: data.network || 'bitcoin',
      pubkeyPrefix: data.pubkeyPrefix,
      relayHost: data.relayHost,
      methods: data.supportedMethods || ['make_invoice', 'lookup_invoice'],
      isReceiveOnly: !data.hasPayPermission,
    };
  } catch (err) {
    console.warn('Failed to fetch wallet status from backend:', err);
    return null;
  }
}

export async function connectWallet(nwcUri: string): Promise<WalletInfo> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/wallet/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nwcUri }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data.error ||
          'Échec de connexion NWC. Vérifiez le format de l’URI et la disponibilité du relay.'
      );
    }

    return {
      alias: data.alias || 'Lightning Node Dakar',
      network: data.network || 'bitcoin',
      pubkeyPrefix: data.pubkeyPrefix,
      relayHost: data.relayHost,
      methods: data.supportedMethods || ['make_invoice', 'lookup_invoice'],
      isReceiveOnly: data.hasPayPermission === false,
    };
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : 'Impossible de joindre le serveur pour connecter le portefeuille.';
    throw new Error(msg);
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/wallet/disconnect`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('Error disconnecting wallet:', err);
  }
}

// 3. Exchange Rate API
export async function fetchLiveExchangeRate(amount = 5000): Promise<ExchangeRateState> {
  // First attempt backend endpoint
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${BACKEND_URL}/api/rates/xof?amount=${amount}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      return {
        xofPerBtc: data.rateXofPerBtc,
        lastUpdated: data.fetchedAt,
        isOfflineFallback: Boolean(data.isFallback),
        rateSource: data.rateSource || 'CoinGecko Live (XOF/BTC)',
      };
    }
  } catch {
    // Backend offline / timed out
  }

  // Fallback direct CoinGecko
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://api.coingecko.com/api/v3/exchange_rates', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const xof = data.rates?.xof?.value;
      if (typeof xof === 'number' && xof > 0) {
        return {
          xofPerBtc: xof,
          lastUpdated: new Date().toISOString(),
          isOfflineFallback: false,
          rateSource: 'CoinGecko Direct (XOF/BTC)',
        };
      }
    }
  } catch {
    // Both failed
  }

  return {
    xofPerBtc: FALLBACK_XOF_PER_BTC,
    lastUpdated: new Date().toISOString(),
    isOfflineFallback: true,
    rateSource: 'Référence Hors-Ligne (Repli BCEAO)',
  };
}

// 4. Invoices API
export async function getInvoices(): Promise<InvoicesResponse> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/invoices`);
    if (!res.ok) throw new Error('Failed to fetch invoices');
    const data = await res.json();
    return {
      invoices: (data.invoices || []).map((row: Record<string, unknown>) => mapDbRowToInvoice(row)),
      todayTotals: data.todayTotals || { totalXof: 0, totalSats: 0, count: 0 },
    };
  } catch {
    return {
      invoices: [],
      todayTotals: { totalXof: 0, totalSats: 0, count: 0 },
    };
  }
}

export async function createPosInvoice(params: {
  amountXof?: number;
  amountSats?: number;
  note?: string;
  language: LanguageCode;
  rateSource: string;
}): Promise<InvoiceRecord> {
  const isBackendUp = await checkBackendHealth();

  if (isBackendUp) {
    const res = await fetch(`${BACKEND_URL}/api/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data.error ||
          'Erreur lors de la création de facture Lightning. Vérifiez que votre portefeuille NWC est connecté.'
      );
    }
    return mapDbRowToInvoice(data);
  }

  // Graceful offline fallback simulation when backend is completely offline
  const now = Date.now();
  const randomHex = (len: number) =>
    Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const paymentHash = randomHex(64);
  const sats = params.amountSats || 13000;
  const bolt11 = `lnbc${sats}0n1p${randomHex(50)}sovereignsoundbox${randomHex(40)}`;

  return {
    id: `inv_sim_${now}`,
    amountXof: params.amountXof || 5000,
    amountSats: sats,
    bolt11,
    paymentHash,
    status: 'UNPAID',
    createdAt: now,
    expiresAt: now + 10 * 60 * 1000,
    rateSource: params.rateSource,
    preimageVerified: false,
    announcementPlayed: false,
    isSimulation: true,
    language: params.language,
    note: params.note || 'Sovereign Soundbox Merchant Sale',
  };
}

export async function checkInvoiceStatus(id: string): Promise<InvoiceStatusResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/invoices/${id}/status`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      invoice: mapDbRowToInvoice(data.invoice),
      newlySettled: Boolean(data.newlySettled),
      preimageVerified: Boolean(data.preimageVerified),
    };
  } catch {
    return null;
  }
}

export async function ackAudioAnnouncement(id: string): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/invoices/${id}/ack-audio`, {
      method: 'POST',
    });
  } catch (err) {
    console.warn('Failed to acknowledge audio announcement:', err);
  }
}

export async function reportSecurityAudit(payload: SecurityAuditPayload): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/security/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Non-blocking
  }
}

export async function fetchSecurityAuditLogs(): Promise<Array<{
  id: number;
  event_type: string;
  invoice_id?: string;
  payment_hash_prefix?: string;
  reason: string;
  created_at: string;
}>> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/security/audit`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.logs || [];
  } catch {
    return [];
  }
}
