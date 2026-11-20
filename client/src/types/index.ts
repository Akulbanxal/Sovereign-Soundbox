export * from './soundbox';

export type SupportedLanguage = 'FR' | 'WO' | 'EN';

export interface SoundboxAudioState {
  isMuted: boolean;
  volume: number; // 0 to 1
}

export interface POSSessionState {
  language: SupportedLanguage;
  walletStatus: import('./soundbox').WalletConnectionStatus;
  audio: SoundboxAudioState;
}
