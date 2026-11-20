import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, BellRing } from 'lucide-react';
import { soundboxAudioEngine } from '../../services/soundboxAudioEngine';
import { useTranslation } from '../../i18n/LanguageContext';

interface AudioWaveformBarProps {
  showControls?: boolean;
}

export const AudioWaveformBar: React.FC<AudioWaveformBarProps> = ({ showControls = true }) => {
  const { t } = useTranslation();
  const [volume, setVolume] = useState<number>(soundboxAudioEngine.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(soundboxAudioEngine.isAudioMuted());
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Direct DOM manipulation on the 16 bars to avoid 60fps React re-renders!
    const updateWaveform = () => {
      if (!isMounted) return;

      const data = soundboxAudioEngine.getAnalyserData();
      const step = Math.floor(data.length / 16) || 1;

      for (let i = 0; i < 16; i++) {
        const barElem = barsRef.current[i];
        if (barElem) {
          const val = data[i * step] || 0;
          const height = isMuted ? 4 : Math.max(4, Math.min(28, Math.round((val / 255) * 28)));
          barElem.style.height = `${height}px`;
          if (height > 10) {
            barElem.style.backgroundColor = '#C8963E'; // Gold active
          } else {
            barElem.style.backgroundColor = 'rgba(15, 61, 46, 0.4)'; // Forest subtle
          }
        }
      }

      animRef.current = requestAnimationFrame(updateWaveform);
    };

    animRef.current = requestAnimationFrame(updateWaveform);

    return () => {
      isMounted = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isMuted]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundboxAudioEngine.setVolume(val);
    if (val > 0 && isMuted) {
      setIsMuted(false);
      soundboxAudioEngine.setMuted(false);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundboxAudioEngine.setMuted(nextMuted);
  };

  const handleTestCalibration = () => {
    soundboxAudioEngine.unlockAudio();
    soundboxAudioEngine.playNeutralTestTone();
  };

  return (
    <div className="w-full bg-surface border border-border-warm rounded-2xl p-4 shadow-flagship flex flex-col gap-3">
      {/* Waveform Visualization Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-forest/10 flex items-center justify-center text-forest">
            {isMuted ? <VolumeX className="w-4 h-4 text-danger" /> : <Volume2 className="w-4 h-4 text-forest" />}
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-forest tracking-wider uppercase font-mono">
              {t('audio_spectrum_title')}
            </h4>
            <p className="text-[10px] text-muted font-mono tabular-nums">
              {isMuted
                ? t('audio_output_muted')
                : t('audio_output_active', { vol: Math.round(volume * 100) })}
            </p>
          </div>
        </div>

        {/* Real-Time Animated Waveform Bars (Direct DOM without React re-render overhead) */}
        <div className="flex items-center gap-1 h-8 px-2.5 bg-canvas rounded-xl border border-border-warm">
          {Array.from({ length: 16 }).map((_, idx) => (
            <div
              key={idx}
              ref={(el) => {
                barsRef.current[idx] = el;
              }}
              className="w-1 rounded-full transition-[height] duration-75"
              style={{ height: '4px', backgroundColor: 'rgba(15, 61, 46, 0.4)' }}
            />
          ))}
        </div>
      </div>

      {/* Interactive Sound Controls */}
      {showControls && (
        <div className="pt-2 border-t border-border-warm/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          {/* Volume Slider */}
          <div className="w-full sm:w-auto flex-1 flex items-center gap-2">
            <label htmlFor="soundbox-volume-slider" className="text-[11px] text-muted font-medium w-16 cursor-pointer">
              {t('audio_volume_label')}
            </label>
            <input
              id="soundbox-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label={t('audio_volume_label')}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={isMuted ? 0 : Math.round(volume * 100)}
              aria-valuetext={isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              className="w-full h-1.5 bg-border-warm rounded-lg appearance-none cursor-pointer accent-forest"
            />
            <span className="text-[11px] font-bold text-ink w-8 text-right tabular-nums" aria-hidden="true">
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Mute Button */}
            <button
              onClick={handleToggleMute}
              aria-label={isMuted ? t('audio_btn_unmute') : t('audio_btn_mute')}
              aria-pressed={isMuted}
              className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-colors ${
                isMuted
                  ? 'bg-danger-light text-danger-dark border-danger/30'
                  : 'bg-canvas text-forest hover:bg-surface border-border-warm'
              }`}
            >
              {isMuted ? t('audio_btn_unmute') : t('audio_btn_mute')}
            </button>

            {/* Neutral Calibration Tone Button */}
            <button
              onClick={handleTestCalibration}
              aria-label={t('audio_test_tone_title')}
              className="px-3 py-1.5 rounded-xl bg-canvas hover:bg-surface border border-border-warm text-ink hover:text-forest font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              title={t('audio_test_tone_title')}
            >
              <BellRing className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
              <span>{t('audio_test_tone_btn')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
