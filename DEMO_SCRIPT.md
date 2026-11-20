# Sovereign Soundbox — 90-Second Hackathon Judge Demo Script

> **Core Philosophy**: *"Don't trust the screenshot. Trust the settlement."*  
> **Target Audience**: Dakar Bitcoin Hack Judges, African Fintech Investors & Node Operators  
> **Total Duration**: 90 Seconds  
> **Languages Demonstrated**: Wolof (*"Juroomi junni Franc CFA jot na ci Lightning"*) & French (*"Paiement de cinq mille Francs CFA reçu sur Lightning"*)

---

## Pre-Demo Checklist (15 seconds before recording)
1. Ensure `npm run dev` is running on `http://localhost:5173`.
2. Unmute system audio and adjust output volume to ~80%.
3. Default dashboard starts with pre-seeded Dakar merchant sales (`17 500 CFA`) for an immediate populated merchant register experience.
4. Keep the 3D Hardware Soundbox visible on the right panel.

---

## Scene 1: The Problem & Visual Counterfeit Attack (0:00 – 0:25)
- **Visual**: Focus on the 3D Soundbox Twin (gold bezel, baobab chassis, OLED screen).
- **Presenter (0:00 – 0:12)**:
  > *"In high-throughput West African retail markets like Marché Sandaga in Dakar, merchants face an epidemic of fake mobile money screenshots and spoofed receipts. Busy shopkeepers cannot stop checkout to unlock smartphones and check explorers."*
- **Action**: In the **Red-Team Security Console**, click **"Déclencher Fausse Capture"** (`Trigger Fake Screenshot`).
- **Visual & Audio Result**:
  - The 3D Soundbox delivers a **sharp horizontal recoil shake** animation.
  - The LED halo flashes crimson (`#DC2626`).
  - The 3D OLED screen prominently displays: `⚠ SPOOF REJECTED · REJECTED: NO PROOF`.
  - A tactile low-frequency rejection buzz sounds, while the payment voice remains **100% silent**.
- **Presenter (0:12 – 0:25)**:
  > *"Notice that: the 3D Soundbox recoils with an alert flash, the OLED screen declares 'NO PROOF', and the speaker stays completely silent. If the soundbox doesn't speak, the merchant never releases the merchandise."*

---

## Scene 2: Pending Invoices & Least-Privilege Protection (0:25 – 0:45)
- **Action 1**: Click **"Simuler Facture Suspendue"** (`Simulate Held Invoice`).
- **Visual Result**:
  - Soundbox LED ring transitions to an amber scanning pulse (`#D97706`).
  - OLED screen displays `AWAITING PROOF…` while voice output is blocked.
- **Action 2**: Click **"Tester Blocage Retrait"** (`Least-Privilege pay_invoice Block`).
- **Visual Result**:
  - Red-Team console displays: `[MOINDRE PRIVILÈGE APPLIQUÉ] Clé NIP-47 en lecture seule. Ordre de paiement rejeté.`
- **Presenter (0:25 – 0:45)**:
  > *"Pending HTLCs without revealed secrets remain silent. And if an attacker tampers with the connection, our least-privilege NIP-47 engine strictly refuses outbound `pay_invoice` calls. The register can only receive, never drain."*

---

## Scene 3: Settlement-Verified Voice Confirmation in Wolof (0:45 – 1:10)
- **Action**:
  1. Click the language switcher in the header to **WO** (Wolof). Notice every string across the UI and 3D screen translates immediately.
  2. On the POS keypad, tap `5 000 CFA` and click **"Defar QR bu bees"** (`Generate Payment QR`).
  3. Click **"⚡ Simuler le Paiement Client"** (`Simulate Customer Payment`) or test live via connected NWC node.
- **Audio Output**:
  - Warm two-tone harmonic chime rings (`523 Hz C5 -> 784 Hz G5`).
  - Native spoken Wolof confirmation announces loud and clear:
    > *"Juroomi junni Franc CFA jot na ci Lightning."*
- **Visual Result**:
  - The 3D Soundbox ignites an emerald green (`#10B981`) halo.
  - Translucent 3D acoustic shockwave rings radiate outward from the speaker grille.
  - Golden/emerald celebration micro-particles float above the chassis.
  - The **Cryptographic Verification Pipeline Strip** illuminates all 4 stages: `1. Facture NWC` → `2. Nœud Interrogé` → `3. Preimage SHA-256 Validée` → `4. Ojaal ak Kàddu`.
- **Presenter (0:45 – 1:10)**:
  > *"The moment the payment settles on the merchant's node, the soundbox chimes and speaks in authentic Wolof: 'Juroomi junni Franc CFA jot na ci Lightning'. The 4-stage cryptographic pipeline proves the preimage in SHA-256 before a single word is spoken."*

---

## Scene 4: Camera Presets, Digital Receipts & Audit Trail (1:10 – 1:25)
- **Action**:
  1. Click camera preset **"3/4 Angle"** then **"Face"** on the 3D twin to show smooth countertop angles.
  2. Click on the verified receipt in **Historique des Ventes** to open the printable/shareable digital receipt modal showing the verified SHA-256 preimage stamp.
- **Presenter (1:10 – 1:25)**:
  > *"Merchants get 1-click camera angles, zero-PII printable receipts with cryptographic preimage proofs, and atomic SQLite single-trigger idempotency so duplicate relay messages never trigger a double chime."*

---

## Scene 5: Closing Statement (1:25 – 1:30)
- **Presenter**:
  > *"Sovereign Soundbox: Bringing Asian micro-retail soundbox certainty to Bitcoin Lightning across West Africa. Don't trust the screenshot. Trust the settlement."*

