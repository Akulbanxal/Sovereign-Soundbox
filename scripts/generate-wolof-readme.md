# Sovereign Soundbox — Native Wolof Audio Voice Clips Guide

This guide documents how to drop pre-rendered, zero-latency native Wolof voice clips into `client/public/audio/wo/` to enable studio-quality Dakar merchant voice announcements without runtime cloud dependencies or heavy client-side ML models.

---

## 1. Directory Structure

Audio clips are resolved under `client/public/audio/`:

```text
client/public/audio/
├── wo/                      # Wolof audio clips
│   ├── jot_naa.mp3          # "Jot na" (Received / Verified)
│   ├── franc_cfa.mp3        # "Franc CFA"
│   ├── benn.mp3             # 1
│   ├── naar.mp3             # 2
│   ├── junni.mp3            # 1,000
│   ├── juroomi_junni.mp3    # 5,000
│   ├── fukki_junni.mp3      # 10,000
│   └── teemeer.mp3          # 100 / 500
└── fr/                      # French audio clips
    ├── paiement_recu.mp3
    ├── francs_cfa.mp3
    └── mille.mp3
```

---

## 2. Generating Clips with `xTTS-v2-wolof` or Piper TTS

You can synthesize audio clips using open-weights models such as Coqui `xTTS-v2` fine-tuned on Senegalese Wolof or Mozilla Common Voice Wolof:

### Example Python Synthesis Script
```python
from TTS.api import TTS

# Load Wolof voice model checkpoint
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2", gpu=True)

# Generate clips
clips = {
    "jot_naa.wav": "Jot na ci Lightning",
    "juroomi_junni.wav": "Juróomi junni",
    "franc_cfa.wav": "Franc CFA",
}

for filename, text in clips.items():
    tts.tts_to_file(text=text, file_path=f"client/public/audio/wo/{filename}", language="fr")
```

---

## 3. Fallback Mechanism in `soundboxAudioEngine`

If static `.mp3` or `.wav` clips are absent in `client/public/audio/wo/`:
1. The engine automatically plays the **signature two-tone harmonic soundbox chime** (`523.25 Hz C5 -> 783.99 Hz G5`).
2. Synthesizes phonetic Wolof phrases via the local browser speech synthesizer using accurate cardinal number decomposition (e.g. `5,000 CFA` $\to$ *juróomi junni Franc CFA jot na ci Lightning*).
3. The real-time frequency spectrum drives the **3D Soundbox acoustic wave rings** and the **AudioWaveformBar** visualizer simultaneously.
