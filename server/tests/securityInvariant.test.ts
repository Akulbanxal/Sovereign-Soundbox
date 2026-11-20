import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  verifyLightningInvoice,
} from '../src/services/nwcService.js';
import { dbQueries } from '../src/db/database.js';
import {
  encryptSecret,
  decryptSecret,
  redactNwcUri,
  verifyPreimageHash,
} from '../src/utils/crypto.js';

describe('Sovereign Soundbox - Security Invariants & Settlement Verification Suite', () => {

  // TEST 1: Pending Invoice Invariant
  it('Test 1 [Pending Invoice Invariant]: Should return PENDING when wallet reports pending or accepted status', async () => {
    const paymentHash = crypto.randomBytes(32).toString('hex');
    const mockClient = {
      lookupInvoice: async () => ({
        state: 'pending',
        amount: 50000,
        settled: false,
      }),
    };

    const result = await verifyLightningInvoice(paymentHash, 50000, mockClient);

    assert.equal(result.status, 'PENDING', 'Pending invoice must be classified as PENDING');
    assert.equal(result.preimageVerified, false, 'Preimage must not be verified on pending invoice');
    assert.equal(result.settledAt, undefined, 'settledAt must not be defined for pending invoice');
  });

  // TEST 2: Underpayment Rejection
  it('Test 2 [Underpayment Rejection]: Should reject settled invoice if settled amount is less than expected', async () => {
    const paymentHash = crypto.randomBytes(32).toString('hex');
    const mockClient = {
      lookupInvoice: async () => ({
        state: 'settled',
        amount: 1000, // Underpayment: expected 50,000 msats
        settled: true,
      }),
    };

    const result = await verifyLightningInvoice(paymentHash, 50000, mockClient);

    assert.equal(result.status, 'FAILED', 'Underpaid invoice must be rejected as FAILED');
    assert.equal(result.preimageVerified, false, 'Underpaid invoice must never have verified preimage');

    const auditLogs = dbQueries.getSecurityAuditLogs(5);
    const underpaymentLog = auditLogs.find(
      (log) => log.event_type === 'SPOOF_REJECTED' && log.reason.includes('UNDERPAYMENT REJECTED')
    );
    assert.ok(underpaymentLog, 'An adversarial SPOOF_REJECTED audit entry must be recorded in SQLite');
  });

  // TEST 3: Preimage Tampering Detection
  it('Test 3 [Preimage Tampering Detection]: Should reject fake preimage that does not match SHA-256 payment hash', async () => {
    const realPreimage = crypto.randomBytes(32);
    const legitimatePaymentHash = crypto.createHash('sha256').update(realPreimage).digest('hex');

    // Attacker crafts or intercepts a forged/fake preimage
    const forgedPreimage = 'deadbeef'.repeat(8);

    assert.equal(
      verifyPreimageHash(forgedPreimage, legitimatePaymentHash),
      false,
      'SHA256(forgedPreimage) must not match legitimate payment hash'
    );

    const mockClient = {
      lookupInvoice: async () => ({
        state: 'settled',
        amount: 50000,
        settled: true,
        preimage: forgedPreimage,
        settled_at: Math.floor(Date.now() / 1000),
      }),
    };

    const result = await verifyLightningInvoice(legitimatePaymentHash, 50000, mockClient);

    assert.equal(result.status, 'FAILED', 'Tampered preimage must cause verification status FAILED');
    assert.equal(result.preimageVerified, false, 'Preimage must be flagged as unverified');

    const auditLogs = dbQueries.getSecurityAuditLogs(5);
    const spoofLog = auditLogs.find(
      (log) => log.event_type === 'SPOOF_REJECTED' && log.reason.includes('failed SHA-256 verification')
    );
    assert.ok(spoofLog, 'Adversarial preimage mismatch must log SPOOF_REJECTED in SQLite audit trail');
  });

  // TEST 4: Valid Settlement & Concurrency / Idempotency
  it('Test 4 [Concurrency & Single-Trigger Guarantee]: Concurrently updating settlement returns newlySettled=true EXACTLY once', async () => {
    const invoiceId = `test_inv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const preimage = crypto.randomBytes(32);
    const paymentHash = crypto.createHash('sha256').update(preimage).digest('hex');

    // Insert legitimate invoice in SQLite
    dbQueries.insertInvoice({
      id: invoiceId,
      amount_xof: 5000,
      amount_sats: 85,
      amount_msats: 85000,
      rate_xof_per_btc: 58500000,
      rate_source: 'CoinGecko Live Test',
      bolt11: 'lnbc850n1pjtest...',
      payment_hash: paymentHash,
      status: 'UNPAID',
      language: 'fr',
      expires_at: new Date(Date.now() + 900000).toISOString(),
    });

    const initialInvoice = dbQueries.getInvoiceById(invoiceId);
    assert.ok(initialInvoice, 'Invoice must be found in SQLite');
    assert.equal(initialInvoice.status, 'UNPAID');
    assert.equal(initialInvoice.announcement_played, 0);

    // Run 10 concurrent settlement attempts simultaneously
    const settledTimestamp = new Date().toISOString();
    const attempts = await Promise.all(
      Array.from({ length: 10 }, async () => {
        return dbQueries.updateInvoiceSettled(invoiceId, settledTimestamp);
      })
    );

    const winningCount = attempts.filter((won) => won === true).length;
    const losingCount = attempts.filter((won) => won === false).length;

    assert.equal(winningCount, 1, 'EXACTLY ONE concurrent call must win and return newlySettled=true');
    assert.equal(losingCount, 9, 'All 9 remaining concurrent calls must return newlySettled=false');

    const updatedInvoice = dbQueries.getInvoiceById(invoiceId);
    assert.equal(updatedInvoice?.status, 'PAID');
    assert.equal(updatedInvoice?.announcement_played, 0, 'announcement_played must remain 0 until acknowledged');

    // Acknowledge audio announcement
    dbQueries.ackInvoiceAudio(invoiceId);
    const ackedInvoice = dbQueries.getInvoiceById(invoiceId);
    assert.equal(ackedInvoice?.announcement_played, 1, 'announcement_played must be 1 after ackInvoiceAudio');
  });

  // TEST 5: Encryption & Zero-Leak Redaction
  it('Test 5 [Encryption & Zero-Leak Redaction]: Round-trip AES-256-GCM and safe URI redaction', () => {
    const rawSecret = 'b0b1cafe'.repeat(8);
    const testUri = `nostr+walletconnect://0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef?relay=wss://relay.getalby.com/v1&secret=${rawSecret}&lud16=merchant@getalby.com`;

    // 1. AES-256-GCM round-trip test
    const encrypted = encryptSecret(testUri);
    assert.notEqual(encrypted, testUri, 'Ciphertext must not match plaintext');
    assert.ok(encrypted.includes(':'), 'Ciphertext must contain IV and auth tag delimiters');

    const decrypted = decryptSecret(encrypted);
    assert.equal(decrypted, testUri, 'Decrypted ciphertext must match original testUri exactly');

    // 2. Redaction verification
    const redacted = redactNwcUri(testUri);
    assert.equal(redacted.relayHost, 'relay.getalby.com');
    assert.equal(redacted.pubkeyPrefix, '01234567');

    // Audit that NO part of rawSecret exists anywhere in redacted representation
    const serializedRedaction = JSON.stringify(redacted);
    assert.equal(
      serializedRedaction.includes(rawSecret),
      false,
      'Redacted diagnostic object MUST NOT contain the NWC secret anywhere'
    );
    assert.equal(
      serializedRedaction.includes('nostr+walletconnect://'),
      false,
      'Redacted diagnostic object MUST NOT contain full URI scheme'
    );
  });
});
