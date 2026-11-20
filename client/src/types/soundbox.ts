export type PaymentStatus = 'IDLE' | 'UNPAID' | 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';

export type SecurityAlert = 'NONE' | 'SPOOF_REJECTED' | 'UNSETTLED_HOLD' | 'DUPLICATE_REPLAY';

export type LanguageCode = 'fr' | 'wo' | 'en';

export type WalletConnectionStatus = 'disconnected' | 'connecting' | 'connected_receive_only' | 'connected_full_warning';

export interface WalletInfo {
  alias?: string;
  network?: string;
  pubkeyPrefix?: string;
  relayHost?: string;
  methods: string[];
  isReceiveOnly: boolean;
}

export interface InvoiceRecord {
  id: string;
  amountXof: number;
  amountSats: number;
  bolt11: string;
  paymentHash: string;
  preimage?: string;
  status: PaymentStatus;
  createdAt: number; // Unix timestamp in ms
  settledAt?: number;
  expiresAt: number; // Unix timestamp in ms
  rateSource: string;
  preimageVerified: boolean;
  announcementPlayed?: boolean;
  isSimulation: boolean;
  language: LanguageCode;
  note?: string;
}

export interface SecurityEventLog {
  id: string;
  timestamp: number;
  type: 'SPOOF_REJECTED' | 'UNSETTLED_HOLD' | 'DUPLICATE_REPLAY' | 'RATE_FALLBACK' | 'PERMISSIONS_AUDIT';
  severity: 'warning' | 'danger' | 'info';
  title: string;
  detail: string;
  proofDetails?: {
    paymentHash?: string;
    preimageStatus?: string;
    relayReport?: string;
  };
}

export interface ExchangeRateState {
  xofPerBtc: number;
  lastUpdated: string;
  isOfflineFallback: boolean;
  rateSource: string;
}

export interface SoundboxAudioConfig {
  isMuted: boolean;
  volume: number; // 0 to 1
  language: LanguageCode;
}

