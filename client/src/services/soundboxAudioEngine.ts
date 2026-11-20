import type { InvoiceRecord, LanguageCode } from '../types/soundbox';
import { formatSpokenXofAmount } from '../utils/numberToWords';

const STORAGE_KEY_VOLUME = 'sovereign_soundbox_volume';
const STORAGE_KEY_MUTED = 'sovereign_soundbox_muted';

class SoundboxAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private analyserDataArray: Uint8Array<ArrayBuffer> | null = null;
  private volume: number = 0.9;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;
  public currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    // Restore persisted sound preferences
    try {
      const savedVol = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (savedVol !== null) {
        this.volume = Math.max(0, Math.min(1, parseFloat(savedVol)));
      }
      const savedMuted = localStorage.getItem(STORAGE_KEY_MUTED);
      if (savedMuted !== null) {
        this.isMuted = savedMuted === 'true';
      }
    } catch {
      // LocalStorage unavailable
    }
  }

  /**
   * Initializes the AudioContext, master gain node, and real-time frequency analyser.
   */
  private ensureAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain Node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

      // Analyser Node for real-time waveform UI
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyserDataArray = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));

      // Routing: Sound Sources -> MasterGain -> Analyser -> Destination
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Unlocks AudioContext during user interaction (e.g. tapping "Generate Payment QR").
   * Bypasses iOS Safari and macOS strict autoplay restrictions.
   */
  public unlockAudio(): void {
    try {
      const ctx = this.ensureAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (!this.isUnlocked) {
        // Play an imperceptible silent buffer to ensure device audio is active
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        this.isUnlocked = true;
      }

      // Prime SpeechSynthesis during synchronous user gesture for WebKit/Safari
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.resume();
          const primeUtterance = new SpeechSynthesisUtterance(' ');
          primeUtterance.volume = 0;
          primeUtterance.rate = 10;
          window.speechSynthesis.speak(primeUtterance);
        } catch {}
      }
    } catch (err) {
      console.debug('AudioContext unlock note:', err);
    }
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, this.volume.toString());
    } catch {}

    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem(STORAGE_KEY_MUTED, muted.toString());
    } catch {}

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public isAudioMuted(): boolean {
    return this.isMuted;
  }

  public getAnalyserData(): Uint8Array {
    if (!this.analyser || !this.analyserDataArray) {
      return new Uint8Array(16);
    }
    this.analyser.getByteFrequencyData(this.analyserDataArray);
    return this.analyserDataArray;
  }

  public playNeutralTestTone(): void {
    if (this.isMuted) return;
    this.unlockAudio();

    try {
      const ctx = this.ensureAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {
      console.warn('Test tone error:', e);
    }
  }

  /**
   * Subtle alert tone when an adversarial attack is rejected
   */
  public playRejectionAlertTone(): void {
    if (this.isMuted) return;
    this.unlockAudio();

    try {
      const ctx = this.ensureAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch (e) {
      console.warn('Rejection alert tone error:', e);
    }
  }

  /**
   * Warm Two-Tone Harmonic Confirmation Chime (C5 523.25 Hz -> G5 783.99 Hz)
   * Designed specifically for noisy West African market environments.
   */
  public playHarmonicChime(): Promise<void> {
    if (this.isMuted) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const ctx = this.ensureAudioContext();
        const now = ctx.currentTime;

        const notes = [
          { freq: 523.25, time: 0, dur: 0.24 },
          { freq: 783.99, time: 0.16, dur: 0.44 },
        ];

        notes.forEach(({ freq, time, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + time);

          gain.gain.setValueAtTime(0, now + time);
          gain.gain.linearRampToValueAtTime(0.35, now + time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

          osc.connect(gain);
          gain.connect(this.masterGain!);

          osc.start(now + time);
          osc.stop(now + time + dur + 0.05);
        });

        setTimeout(resolve, 520);
      } catch {
        resolve();
      }
    });
  }

  /**
   * STRICTLY GATED: Announces verified payment settlement.
   * Can ONLY be called when invoice.status === 'PAID' && !invoice.isSimulation.
   */
  public async announceVerifiedPayment(
    invoice: InvoiceRecord,
    language: LanguageCode = 'fr'
  ): Promise<void> {
    if (invoice.status !== 'PAID' || invoice.isSimulation) {
      console.warn(
        '[SOUNDBOX SECURITY GATE] Blocked: Audio confirmation is gated strictly to real verified settled invoices.'
      );
      return;
    }

    if (this.isMuted) return;

    this.unlockAudio();
    this.playHarmonicChime();
    setTimeout(() => {
      this.speakAmountPhrase(invoice.amountXof, language, false);
    }, 450);
  }

  /**
   * Preview sound for clearly labeled Red-Team / demo simulation.
   */
  public async playDemoPreview(amountXof: number, language: LanguageCode = 'fr'): Promise<void> {
    if (this.isMuted) return;
    this.unlockAudio();
    this.playHarmonicChime();
    setTimeout(() => {
      this.speakAmountPhrase(amountXof, language, true);
    }, 450);
  }

  /**
   * Voice player with automatic seamless fallback:
   * Uses browser SpeechSynthesis with natural phrasing from numberToWords.
   */
  private speakAmountPhrase(amountXof: number, lang: LanguageCode, isDemo = false): void {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.resume();

      const phrase = formatSpokenXofAmount(amountXof, lang);
      const textToSpeak = isDemo ? `${phrase.sentence}` : phrase.sentence;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      if (lang === 'en') {
        utterance.lang = 'en-US';
      } else {
        utterance.lang = 'fr-FR';
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = this.volume;

      // Retain utterance on class to prevent Safari GC bug
      this.currentUtterance = utterance;
      utterance.onend = () => {
        this.currentUtterance = null;
      };
      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        this.currentUtterance = null;
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis playback error:', err);
    }
  }
}

export const soundboxAudioEngine = new SoundboxAudioEngine();
