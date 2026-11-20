import type { LanguageCode } from '../types/soundbox';

class SoundboxAudioEngine {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Plays the signature West African merchant soundbox rising chime.
   * Dual harmonic chord (523Hz C5 -> 659Hz E5 -> 784Hz G5 -> 1046Hz C6) with warm analog release.
   */
  public playSettlementChime(isMuted = false): void {
    if (isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Frequencies for celebratory merchant chime
      const notes = [523.25, 659.25, 783.99, 1046.5];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.5);
      });
    } catch (e) {
      console.warn('Audio chime playback error:', e);
    }
  }

  /**
   * Plays sharp rejection buzzer on simulated fraudulent screenshots or expired invoices.
   */
  public playRejectionAlert(isMuted = false): void {
    if (isMuted) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      [220, 185].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.3, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.2);
      });
    } catch (e) {
      console.warn('Audio alert playback error:', e);
    }
  }

  /**
   * Announces the verified settlement in Wolof, French, or English via Web SpeechSynthesis.
   */
  public speakSettlement(
    amountXof: number,
    lang: LanguageCode,
    isMuted = false
  ): void {
    if (isMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    let text = '';
    let voiceLang = 'fr-FR';

    if (lang === 'wo') {
      // Phonetic French-adapted Wolof speech synthesis for Dakar merchants
      text = `${amountXof.toLocaleString('fr-SN')} Franc CFA jott na ci Lightning.`;
      voiceLang = 'fr-FR';
    } else if (lang === 'fr') {
      text = `Paiement de ${amountXof.toLocaleString('fr-FR')} Francs CFA reçu sur Lightning.`;
      voiceLang = 'fr-FR';
    } else {
      text = `Payment of ${amountXof.toLocaleString()} CFA Francs received on Lightning.`;
      voiceLang = 'en-US';
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    window.speechSynthesis.speak(utterance);
  }
}

export const audioEngine = new SoundboxAudioEngine();

