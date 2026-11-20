# Sovereign Soundbox (WAEMU / Senegal)

> **"Don't trust the screenshot. Trust the settlement."**
>
> An instant, settlement-verified Bitcoin Lightning merchant Point of Sale (POS) and audio confirmation soundbox engineered for merchants across Senegal and the WAEMU region (West African CFA Franc / XOF).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![NIP-47 Compliant](https://img.shields.io/badge/Nostr-NIP--47%20(NWC)-purple.svg)](https://github.com/nostr-protocol/nips/blob/master/47.md)
[![Security Invariants](https://img.shields.io/badge/Security%20Tests-5%2F5%20Passing-brightgreen.svg)](#security-guarantees--invariant-test-suite)

---

## 1. Problem & Solution

### The Epidemic: Counterfeit Payment Screens
In high-throughput West African retail markets (such as Marché Sandaga or Tilène in Dakar), mobile money and digital payment fraud is rampant. Fraudsters show shopkeepers convincing spoofed transaction confirmation screens, pre-recorded screen captures, or modified APKs claiming funds were sent. 

For a busy merchant serving multiple customers in a noisy market:
- Unlocking a personal smartphone to inspect a banking app or blockchain explorer interrupts checkout flow.
- Push notifications are frequently delayed by congested cellular towers.
- Merchants often surrender goods on faith, suffering direct financial loss.

### The Solution: Sovereign Soundbox
**Sovereign Soundbox** brings the proven tactile soundbox hardware paradigm—popularized in Asian micro-retail—to the Bitcoin Lightning Network in West Africa:
1. **Instant Spoken Confirmation**: As soon as a Lightning invoice settles on the merchant's node, the soundbox chimes and loudly announces the verified CFA amount in **French** or native Senegalese **Wolof** (*"Jot naa juróomi junni CFA"*).
2. **Interactive 3D Hardware Twin**: A Three.js physical device twin complete with ivory tactile chassis, baobab grille, dynamic LED status halo, acoustic wave emissions, and OLED counter display.
3. **Dual-Denomination Cash Keypad**: Merchants type familiar CFA amounts (e.g., 5,000 FCFA), which are converted in real-time to Satoshis with offline fallback protection.

---

## 2. Threat Model & Settlement Invariants

### What Sovereign Soundbox Proves
- **Cryptographic Settlement**: Proves that the exact BOLT11 invoice generated for the active transaction transitioned to `PAID` status on the merchant's connected Lightning node.
- **Preimage Verification**: When provided by the wallet, verifies $\text{SHA-256}(\text{preimage}) == \text{payment\_hash}$ in constant time to prevent relay spoofing or forged notifications.
- **Underpayment Rejection**: Enforces that received millisatoshis $\ge$ expected millisatoshis. Any partial payment or truncated payment attempt is rejected as `FAILED`.
- **Single-Trigger Idempotency**: Atomic SQLite state locks guarantee the audio confirmation chime plays **exactly once** per settled transaction, preventing replay attacks.

### What Sovereign Soundbox Does NOT Claim
- **No Off-Band Phone Screen Protection**: It does not prevent customers from showing fake screens on their own devices; it renders customer screens **irrelevant** because merchants only release goods upon hearing the soundbox audio announcement.
- **Non-Custodial Architecture**: Sovereign Soundbox never holds or custodies merchant funds. Payments settle directly into the merchant's self-sovereign Lightning node or NWC wallet.
- **Remote Node Security**: It does not secure an already compromised remote node whose master private keys were leaked elsewhere.

---

## 3. System Architecture

```text
+---------------------------------------------------------------------------------+
|                               CUSTOMER SMARTPHONE                               |
|                     Scans BOLT11 QR (Phoenix, Blink, Cash App)                 |
+----------------------------------------+----------------------------------------+
                                         | Pays Lightning Invoice
                                         v
+---------------------------------------------------------------------------------+
|                        BITCOIN LIGHTNING NETWORK & NWC                          |
|             (Merchant Node: Alby Hub, Umbrel, Start9, LNbits, Phoenixd)          |
+----------------------------------------+----------------------------------------+
                                         ^
                                         | NIP-47 Encrypted Nostr Relay
                                         | (make_invoice, lookup_invoice)
                                         v
+---------------------------------------------------------------------------------+
|                         SOVEREIGN SOUNDBOX BACKEND API                          |
|                             (Node.js + Express + TypeScript)                    |
|                                                                                 |
|  [Rate Limiter] -> [AES-256-GCM Vault] -> [NIP-47 Engine] -> [Preimage Verifier]|
|                                   |                                             |
|                                   v                                             |
|                     [SQLite Database (WAL Mode)]                                |
|          (invoices, wallet_config, zero-PII security_audit_logs)                |
+----------------------------------------+----------------------------------------+
                                         ^
                                         | REST API / Polling (2.5s)
                                         v
+---------------------------------------------------------------------------------+
|                        SOVEREIGN SOUNDBOX FRONTEND (PWA)                        |
|                         (React 18 + Vite + Tailwind CSS)                        |
|                                                                                 |
|  +--------------------+  +----------------------+  +-------------------------+  |
|  | Tactile POS Keypad |  | 3D Soundbox Hardware |  | Gated Web Audio Engine  |  |
|  | (CFA & Sats Mode)  |  | Twin (Three.js OLED) |  | (French & Wolof Speech) |  |
|  +--------------------+  +----------------------+  +-------------------------+  |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  | Red-Team Sandbox: 4 Adversarial Triggers (Screenshot, Underpayment, etc.)|  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

---

## 4. Security Guarantees

1. **Least-Privilege NIP-47**:
   - The soundbox backend operates exclusively with `make_invoice` and `lookup_invoice` permissions.
   - If a merchant mistakenly connects an NWC connection string containing `pay_invoice`, the UI immediately displays a prominent security warning urging them to restrict permissions.
2. **AES-256-GCM Credential Encryption**:
   - Sensitive NWC URIs are encrypted at rest using native `node:crypto` AES-256-GCM with random 12-byte IVs and authentication tags.
3. **Sliding-Window Rate Limiting**:
   - Protects invoice creation and wallet connection endpoints against denial-of-service and brute-force polling.
4. **Zero-PII Audit Policy**:
   - Customer phone numbers, names, IP addresses, private keys, and raw NWC secret keys are never written to logs or database records.

---

## 5. Step-by-Step Local Setup

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/sovereign-soundbox.git
cd sovereign-soundbox
npm install
```

### 2. Environment Configuration
Create a `.env` file from the provided example:
```bash
cp .env.example .env
```

Edit `.env` (optional for local testing; sensible fallbacks are automatically generated):
```ini
# Optional: Receive-only NIP-47 connection URI for live settlement
NWC_TEST_URI=

# Optional: 32-byte hex key for persistent AES-256-GCM encryption at rest
SERVER_ENCRYPTION_KEY=

# Server port and client origin
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Run Validation Scripts (Phase 0)
Verify exchange rate conversion and NWC readiness:
```bash
npm run validate:all
```

### 4. Run the Security Invariant Test Suite
Verify that all 5 cryptographic settlement and idempotency invariants pass:
```bash
npm test
```

### 5. Launch Development Servers
Start both the Express backend API (`:4000`) and the Vite React frontend (`:5173`) concurrently:
```bash
npm run dev
```

Open your browser at:
```text
http://localhost:5173
```

---

## 6. Security Guarantees & Invariant Test Suite

The test suite in [`server/tests/securityInvariant.test.ts`](file:///Users/akul/Desktop/Sovereign%20soundbox/server/tests/securityInvariant.test.ts) validates the five core settlement invariants using Node's native test runner (`node --test` via `tsx`):

| Test Case | Invariant Tested | Expected Behavior |
|:---|:---|:---|
| **Test 1** | Pending Invoice Invariant | Unsettled invoice lookup returns `PENDING`; audio remains silent. |
| **Test 2** | Underpayment Rejection | Settlement for $< \text{expectedMsats}$ rejects as `FAILED` and logs `SPOOF_REJECTED`. |
| **Test 3** | Preimage Tampering Defense | Forged preimage where $\text{SHA-256}(\text{preimage}) \ne \text{hash}$ rejects as `FAILED`. |
| **Test 4** | Atomic Concurrency & Single Trigger | 10 simultaneous verification requests produce **exactly 1** `newlySettled: true`. |
| **Test 5** | Zero-Leak Redaction & AES-256 | AES-256-GCM round-trip passes; `redactNwcUri` exposes zero secrets or URI parameters. |

Run tests anytime with:
```bash
npm test
```

---

## 7. Deployment Configuration

### Frontend (Vercel)
The client directory includes [`client/vercel.json`](file:///Users/akul/Desktop/Sovereign%20soundbox/client/vercel.json) with SPA rewrite rules:
```bash
cd client
npm run build
# Deploy to Vercel
```

### Backend (Render / VPS / Railway)
The backend requires a **persistent disk mount** so that SQLite database records (`invoices`, `wallet_config`, `security_audit_logs`) persist across container deploys. See [`server/render.yaml`](file:///Users/akul/Desktop/Sovereign%20soundbox/server/render.yaml):
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Disk Mount**: Mount persistent disk to `/var/data` with environment variable `SQLITE_DB_PATH=/var/data/soundbox.db`.

---

## 8. License

Released under the **MIT License**. Built for sovereign merchants across West Africa.
