import { NWCClient } from '@getalby/sdk/nwc';
import { dbQueries } from '../db/database.js';
import { decryptSecret, encryptSecret, redactNwcUri, verifyPreimageHash } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

let activeClient: NWCClient | null = null;

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Timeout: ${label} did not respond within ${ms / 1000}s`));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Gets or initializes the active NWCClient from the encrypted database config.
 */
export async function getActiveNwcClient(): Promise<NWCClient | null> {
  if (activeClient) {
    return activeClient;
  }

  const config = dbQueries.getWalletConfig();
  if (!config) {
    return null;
  }

  try {
    const rawUri = decryptSecret(config.encrypted_nwc_uri);
    activeClient = new NWCClient({
      nostrWalletConnectUrl: rawUri,
    });
    return activeClient;
  } catch (err) {
    logger.error('Failed to initialize active NWCClient from stored credentials', err);
    return null;
  }
}

/**
 * Cleanly closes the active NWC client relay connections.
 */
export function closeActiveNwcClient(): void {
  if (activeClient) {
    try {
      activeClient.close();
      logger.info('Closed active NWC client connections.');
    } catch (err) {
      logger.warn('Error closing NWC client connections', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
    activeClient = null;
  }
}

export interface WalletStatusResponse {
  connected: boolean;
  alias?: string;
  network?: string;
  relayHost?: string;
  pubkeyPrefix?: string;
  supportedMethods: string[];
  hasPayPermission: boolean;
  balanceMsats?: number;
  connectedAt?: string;
}

/**
 * Tests connection with a new NWC URI, extracts capabilities, encrypts, and saves to database.
 * NEVER returns raw NWC URI.
 */
export async function testAndSaveConnection(rawNwcUri: string): Promise<WalletStatusResponse> {
  const trimmed = rawNwcUri.trim();

  // Validate basic NWC URI format
  if (!trimmed.startsWith('nostr+walletconnect://')) {
    throw new Error('URI must begin with nostr+walletconnect://');
  }
  if (!trimmed.includes('relay=') || !trimmed.includes('secret=')) {
    throw new Error('Invalid NWC URI: missing required relay or secret parameters.');
  }

  const { relayHost, pubkeyPrefix } = redactNwcUri(trimmed);
  logger.info(`Testing NWC connection for pubkey ${pubkeyPrefix}... to ${relayHost}`);

  const testClient = new NWCClient({
    nostrWalletConnectUrl: trimmed,
  });

  try {
    const info = await withTimeout(testClient.getInfo(), 8000, 'getInfo()');
    const methods = info.methods || [];
    const hasPayPermission = methods.includes('pay_invoice');

    if (hasPayPermission) {
      logger.warn(
        `SECURITY WARNING: pay_invoice is enabled on connected wallet (${pubkeyPrefix}...). Receive-only credentials recommended.`
      );
    }

    // Encrypt secret with AES-256-GCM
    const encrypted = encryptSecret(trimmed);

    // Save to database
    dbQueries.saveWalletConfig({
      encrypted_nwc_uri: encrypted,
      relay_host: relayHost,
      pubkey_prefix: pubkeyPrefix,
      supported_methods: methods,
      has_pay_permission: hasPayPermission,
    });

    // Reset cached active client so new connection is used
    closeActiveNwcClient();

    let balanceMsats: number | undefined;
    if (methods.includes('get_balance')) {
      try {
        const bal = await withTimeout(testClient.getBalance(), 5000, 'getBalance()');
        balanceMsats = bal.balance;
      } catch {
        // Balance check is optional
      }
    }

    return {
      connected: true,
      alias: info.alias || 'Lightning Node',
      network: info.network || 'bitcoin',
      relayHost,
      pubkeyPrefix,
      supportedMethods: methods,
      hasPayPermission,
      balanceMsats,
      connectedAt: new Date().toISOString(),
    };
  } finally {
    testClient.close();
  }
}

/**
 * Generates a Lightning invoice on the merchant's connected wallet via NIP-47.
 */
export async function createLightningInvoice(
  amountMsats: number,
  description: string
): Promise<{ bolt11: string; paymentHash: string; expiresAt: string }> {
  const client = await getActiveNwcClient();
  if (!client) {
    throw new Error('No merchant wallet connected. Connect an NWC wallet first.');
  }

  logger.info(`Requesting invoice for ${amountMsats} msats (${Math.round(amountMsats / 1000)} sats)...`);

  const res = await withTimeout(
    client.makeInvoice({
      amount: amountMsats,
      description,
      expiry: 900, // 15 minutes
    }),
    8000,
    'makeInvoice()'
  );

  if (!res.invoice || !res.payment_hash) {
    throw new Error('NWC wallet returned incomplete invoice response (missing bolt11 or payment_hash).');
  }

  const expiresAt = res.expires_at
    ? new Date(res.expires_at * 1000).toISOString()
    : new Date(Date.now() + 900 * 1000).toISOString();

  return {
    bolt11: res.invoice,
    paymentHash: res.payment_hash,
    expiresAt,
  };
}

export interface VerificationResult {
  status: 'PAID' | 'PENDING' | 'UNPAID' | 'EXPIRED' | 'FAILED';
  preimageVerified: boolean;
  settledAt?: string;
  preimage?: string;
}

/**
 * Normalizes wallet responses safely across providers (Alby Hub, Rizful, LNbits NWC).
 * Cryptographically verifies SHA-256(preimage) == paymentHash if preimage is returned.
 */
export async function verifyLightningInvoice(
  paymentHash: string,
  expectedMsats: number,
  clientOverride?: { lookupInvoice: (params: { payment_hash: string }) => Promise<unknown> }
): Promise<VerificationResult> {
  const client = clientOverride || (await getActiveNwcClient());
  if (!client) {
    throw new Error('No merchant wallet connected.');
  }

  try {
    const res = (await withTimeout(
      client.lookupInvoice({ payment_hash: paymentHash }),
      8000,
      'lookupInvoice()'
    )) as Record<string, unknown>;

    // Normalize state across NWC wallets
    const state = (res.state || res.status || '').toString().toLowerCase();
    const isSettled = res.settled === true || state === 'settled';
    const type = (res.type || '').toString().toLowerCase();
    const amountMsats = Number(res.amount || res.amount_msat || 0);
    const preimage = (res.preimage || res.payment_preimage) as string | undefined;

    if (state === 'expired') {
      return { status: 'EXPIRED', preimageVerified: false };
    }

    if (state === 'failed') {
      return { status: 'FAILED', preimageVerified: false };
    }

    // Explicitly treat accepted / pending as unsettled PENDING
    if (state === 'pending' || state === 'accepted') {
      return { status: 'PENDING', preimageVerified: false };
    }

    if (isSettled && (!type || type === 'incoming')) {
      // Underpayment guard: reject if amount is less than expected
      if (amountMsats < expectedMsats) {
        logger.error('UNDERPAYMENT REJECTED: Invoice settled for less than expected msats!', {
          expectedMsats,
          actualMsats: amountMsats,
          paymentHashPrefix: paymentHash.slice(0, 16),
        });

        dbQueries.insertSecurityAuditLog({
          event_type: 'SPOOF_REJECTED',
          payment_hash_prefix: paymentHash.slice(0, 16),
          reason: `UNDERPAYMENT REJECTED: Expected ${expectedMsats} msats, received ${amountMsats} msats.`,
        });

        return { status: 'FAILED', preimageVerified: false };
      }

      if (typeof preimage === 'string' && preimage.trim().length > 0) {
        const isPreimageValid = verifyPreimageHash(preimage, paymentHash);

        if (!isPreimageValid) {
          logger.error('CRITICAL SECURITY ANOMALY: Preimage returned from wallet failed SHA-256 verification!', {
            paymentHashPrefix: paymentHash.slice(0, 16),
          });

          dbQueries.insertSecurityAuditLog({
            event_type: 'SPOOF_REJECTED',
            payment_hash_prefix: paymentHash.slice(0, 16),
            reason: 'CRITICAL: Preimage from lookup_invoice failed SHA-256 verification against payment_hash',
          });

          return { status: 'FAILED', preimageVerified: false };
        }

        return {
          status: 'PAID',
          preimageVerified: true,
          settledAt: res.settled_at
            ? new Date(Number(res.settled_at) * 1000).toISOString()
            : new Date().toISOString(),
          preimage,
        };
      }

      // Settled without preimage provided by wallet
      return {
        status: 'PAID',
        preimageVerified: false,
        settledAt: res.settled_at
          ? new Date(Number(res.settled_at) * 1000).toISOString()
          : new Date().toISOString(),
      };
    }

    return { status: 'UNPAID', preimageVerified: false };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    // Handle "not found" gracefully as UNPAID rather than crashing
    if (/not found|not_found|does not exist/i.test(errorMsg)) {
      return { status: 'UNPAID', preimageVerified: false };
    }

    logger.warn('lookupInvoice error from NWC relay', {
      paymentHashPrefix: paymentHash.slice(0, 16),
      error: errorMsg,
    });
    return { status: 'UNPAID', preimageVerified: false };
  }
}
