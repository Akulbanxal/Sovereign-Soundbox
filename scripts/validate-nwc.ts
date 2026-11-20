import dotenv from 'dotenv';
import { NWCClient } from '@getalby/sdk/nwc';

dotenv.config();

/**
 * Timeout helper for NWC async operations.
 */
async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Timeout: ${label} did not respond within ${ms / 1000} seconds.`));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Redacts any accidental leakage of NWC credentials or full URIs in strings.
 */
function redactCredentials(str: string): string {
  return str.replace(/nostr\+walletconnect:\/\/[^\s"'<>]+/gi, 'nostr+walletconnect://[REDACTED]');
}

async function main() {
  console.log('='.repeat(65));
  console.log('  SOVEREIGN SOUNDBOX — Phase 0 NWC Connection Validation');
  console.log('='.repeat(65));

  const nwcUri = process.env.NWC_TEST_URI?.trim();

  // Graceful exit if NWC_TEST_URI is missing or unset
  if (!nwcUri) {
    console.log('\n[INFO] NWC_TEST_URI is not configured in .env');
    console.log('\nTo validate live NWC Lightning connectivity:');
    console.log('  1. Copy the template:');
    console.log('     cp .env.example .env');
    console.log('  2. Generate a receive-only NIP-47 NWC URI from your node or wallet');
    console.log('     (Alby Hub, Mutiny, Umbrel, etc.) with permissions:');
    console.log('       - make_invoice');
    console.log('       - lookup_invoice');
    console.log('     (Ensure "pay_invoice" is NOT granted)');
    console.log('  3. Paste into .env:');
    console.log('     NWC_TEST_URI=nostr+walletconnect://<pubkey>?relay=<relay>&secret=<secret>');
    console.log('  4. Re-run validation:');
    console.log('     npm run validate:nwc');
    console.log('\nExiting gracefully (code 0).\n');
    process.exit(0);
  }

  // Parse only safe metadata for logging (NEVER log the secret or full URI)
  let walletPubkeyPrefix = 'unknown';
  let relayHosts: string[] = [];

  try {
    const parsed = NWCClient.parseWalletConnectUrl(nwcUri);
    walletPubkeyPrefix = parsed.walletPubkey.slice(0, 8);
    relayHosts = parsed.relayUrls.map((u) => {
      try {
        return new URL(u).host;
      } catch {
        return 'invalid-relay-url';
      }
    });
  } catch {
    // Fallback safe extraction if standard parsing fails
    const pubkeyMatch = nwcUri.match(/nostr\+walletconnect:\/\/([0-9a-fA-F]{8})/i);
    if (pubkeyMatch) {
      walletPubkeyPrefix = pubkeyMatch[1];
    }
    const relayMatch = nwcUri.match(/[?&]relay=([^&]+)/i);
    if (relayMatch) {
      try {
        const decoded = decodeURIComponent(relayMatch[1]);
        relayHosts = [new URL(decoded).host];
      } catch {
        relayHosts = ['custom-relay'];
      }
    }
  }

  console.log('\n[1/4] Safe Connection Configuration:');
  console.log(`  • Wallet Pubkey Prefix: ${walletPubkeyPrefix}... (first 8 characters)`);
  console.log(`  • Relay Host(s): ${relayHosts.join(', ') || 'default'}`);
  console.log('  • Credential Status: Secret redacted (never logged)');

  let client: NWCClient | null = null;
  let hasError = false;

  try {
    client = new NWCClient({
      nostrWalletConnectUrl: nwcUri,
    });

    // 2. getInfo() check
    console.log('\n[2/4] Testing getInfo()...');
    const info = await withTimeout(client.getInfo(), 10000, 'getInfo()');
    const methods = info.methods || [];
    console.log(`✓ Wallet info retrieved successfully:`);
    console.log(`  • Alias: ${info.alias || 'N/A'}`);
    console.log(`  • Network: ${info.network || 'bitcoin'}`);
    console.log(`  • Supported Methods: [${methods.join(', ')}]`);

    const hasPayInvoice = methods.includes('pay_invoice');
    if (hasPayInvoice) {
      console.warn('\n' + '!'.repeat(65));
      console.warn('  ⚠️  SECURITY WARNING: "pay_invoice" method is ENABLED!');
      console.warn('  For a merchant POS Soundbox, you should use RECEIVE-ONLY permissions.');
      console.warn('  Re-generate this NWC connection string without "pay_invoice"');
      console.warn('  to protect funds from unauthorized outgoing payments.');
      console.warn('!'.repeat(65) + '\n');
    } else {
      console.log('✓ Security Check: Receive-only verified ("pay_invoice" method is absent).');
    }

    // 3. makeInvoice() check
    console.log('\n[3/4] Testing makeInvoice (10 sats = 10,000 msats)...');
    const testAmountMsats = 10000;
    const testDescription = 'Sovereign Soundbox Phase 0 Test';
    const invoiceResult = await withTimeout(
      client.makeInvoice({
        amount: testAmountMsats,
        description: testDescription,
      }),
      10000,
      'makeInvoice()'
    );

    const paymentHashPrefix = invoiceResult.payment_hash
      ? `${invoiceResult.payment_hash.slice(0, 12)}...`
      : 'N/A';
    const invoicePrefix = invoiceResult.invoice
      ? `${invoiceResult.invoice.slice(0, 14)}...`
      : 'N/A';
    const expiryIso = invoiceResult.expires_at
      ? new Date(invoiceResult.expires_at * 1000).toISOString()
      : 'N/A';

    console.log('✓ Invoice created successfully:');
    console.log(`  • Payment Hash Prefix: ${paymentHashPrefix}`);
    console.log(`  • Invoice Prefix: ${invoicePrefix}`);
    console.log(`  • Expiry Timestamp: ${expiryIso}`);

    // 4. lookupInvoice() check
    console.log('\n[4/4] Testing lookupInvoice for created invoice...');
    const lookupResult = await withTimeout(
      client.lookupInvoice({ payment_hash: invoiceResult.payment_hash }),
      10000,
      'lookupInvoice()'
    );

    console.log('✓ Invoice lookup succeeded. Normalized wallet response:');
    console.log(`  • Exact Response Keys: [${Object.keys(lookupResult).join(', ')}]`);
    console.log(`  • State / Settled: ${lookupResult.state ?? (lookupResult as Record<string, unknown>).settled ?? 'pending'}`);
    console.log(`  • Type: ${lookupResult.type ?? 'incoming'}`);
    console.log(`  • Amount (msats): ${lookupResult.amount}`);
    console.log(`  • Preimage Present on Unpaid Invoice: ${Boolean(lookupResult.preimage)}`);

    console.log('\n' + '='.repeat(65));
    console.log('  NWC Connection Validation Completed Successfully');
    console.log('='.repeat(65));
  } catch (err) {
    hasError = true;
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('\n✗ NWC validation failed:', redactCredentials(errorMsg));
  } finally {
    if (client) {
      // Cleanly close relay pool WebSockets so Node does not hang
      client.close();
      console.log('✓ NWC client connections closed cleanly.');
    }
  }

  if (hasError) {
    process.exit(1);
  }
}

main().catch((err) => {
  const errorMsg = err instanceof Error ? err.message : String(err);
  console.error('Fatal error in NWC validation:', redactCredentials(errorMsg));
  process.exit(1);
});
