import dotenv from 'dotenv';
dotenv.config();

interface CoinGeckoRatesResponse {
  rates?: {
    xof?: {
      name: string;
      unit: string;
      value: number;
      type: string;
    };
    [key: string]: unknown;
  };
}

export interface RateResult {
  xofPerBtc: number;
  timestamp: string;
  latencyMs: number;
}

/**
 * Fetches the live BTC/XOF exchange rate from CoinGecko with a timeout.
 */
export async function fetchBtcXofRate(
  url = 'https://api.coingecko.com/api/v3/exchange_rates',
  timeoutMs = 6000
): Promise<RateResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = performance.now();
  const apiKey = process.env.COINGECKO_DEMO_API_KEY;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (apiKey) {
    headers['x-cg-demo-api-key'] = apiKey;
  }

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers,
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as CoinGeckoRatesResponse;
    const xofRate = data.rates?.xof?.value;

    if (typeof xofRate !== 'number' || xofRate <= 0) {
      throw new Error('Invalid or missing rates.xof.value in API response');
    }

    return {
      xofPerBtc: xofRate,
      timestamp: new Date().toISOString(),
      latencyMs,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Calculates satoshis required for a given XOF amount.
 * Formula: Math.round((xofAmount / xofPerBtc) * 100_000_000)
 */
export function calculateSatsForXof(xofAmount: number, xofPerBtc: number): number {
  return Math.round((xofAmount / xofPerBtc) * 100_000_000);
}

/**
 * Offline Sats-Mode Fallback Handler.
 * When exchange rate fetch fails (offline, rate limited, DNS failure),
 * merchant POS switches to offline sats-only mode or cached reference rate.
 */
export function handleOfflineFallback(error: unknown, fallbackAmountXof = 5000): {
  offlineMode: boolean;
  reason: string;
  recommendedAction: string;
} {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return {
    offlineMode: true,
    reason: errorMessage,
    recommendedAction: `Switching to direct satoshi pricing mode. Prompt merchant to enter price in sats directly or use last known cached rate for ${fallbackAmountXof} XOF.`,
  };
}

async function main() {
  console.log('='.repeat(65));
  console.log('  SOVEREIGN SOUNDBOX — Phase 0 Rate Validation (XOF / BTC)');
  console.log('='.repeat(65));

  // 1. Live Exchange Rate Test
  console.log('\n[1/2] Fetching live BTC/XOF exchange rate from CoinGecko...');
  try {
    const rateData = await fetchBtcXofRate();
    const targetXof = 5000;
    const sats = calculateSatsForXof(targetXof, rateData.xofPerBtc);

    console.log('✓ Successfully retrieved live rate:');
    console.log(`  • 1 BTC = ${rateData.xofPerBtc.toLocaleString('fr-SN', { maximumFractionDigits: 2 })} XOF`);
    console.log(`  • Timestamp: ${rateData.timestamp}`);
    console.log(`  • API Latency: ${rateData.latencyMs} ms (timeout threshold: 6000 ms)`);
    console.log(`  • ${targetXof.toLocaleString()} XOF = ${sats.toLocaleString()} satoshis`);
  } catch (err) {
    console.error('✗ Live rate fetch failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // 2. Offline / Invalid Endpoint Fallback Verification
  console.log('\n[2/2] Verifying graceful fallback on network / invalid endpoint failure...');
  const invalidUrl = 'https://api.coingecko.invalid/api/v3/exchange_rates_fail_test';
  try {
    console.log(`  Testing call to simulated invalid URL: ${invalidUrl}`);
    await fetchBtcXofRate(invalidUrl, 2000);
    console.error('✗ Error: Expected invalid URL call to fail, but it succeeded.');
    process.exit(1);
  } catch (err) {
    const fallback = handleOfflineFallback(err, 5000);
    console.log('✓ Fallback intercepted error gracefully:');
    console.log(`  • Caught: ${fallback.reason}`);
    console.log(`  • POS State: Offline Sats Mode = ${fallback.offlineMode}`);
    console.log(`  • Action: ${fallback.recommendedAction}`);
  }

  console.log('\n' + '='.repeat(65));
  console.log('  Rate Validation Test Completed Successfully');
  console.log('='.repeat(65));
}

main().catch((err) => {
  console.error('Fatal error in rate validation:', err);
  process.exit(1);
});
