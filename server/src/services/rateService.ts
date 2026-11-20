import { logger } from '../utils/logger.js';

interface CachedRate {
  rateXofPerBtc: number;
  fetchedAt: number;
  source: string;
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
let memoryCache: CachedRate | null = null;

export class RateUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateUnavailableError';
  }
}

export interface RateConversionResult {
  amountXof: number;
  amountSats: number;
  amountMsats: number;
  rateXofPerBtc: number;
  rateSource: string;
  fetchedAt: string;
  isFallback: boolean;
}

/**
 * Fetches the live BTC/XOF rate from CoinGecko with a 60s cache and 6s timeout.
 */
export async function getLiveBtcXofRate(timeoutMs = 6000): Promise<{
  rateXofPerBtc: number;
  rateSource: string;
  fetchedAt: string;
  isFallback: boolean;
}> {
  const now = Date.now();

  // Return fresh cache if within TTL
  if (memoryCache && now - memoryCache.fetchedAt < CACHE_TTL_MS) {
    return {
      rateXofPerBtc: memoryCache.rateXofPerBtc,
      rateSource: memoryCache.source,
      fetchedAt: new Date(memoryCache.fetchedAt).toISOString(),
      isFallback: false,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://api.coingecko.com/api/v3/exchange_rates', {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`CoinGecko HTTP ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as {
      rates?: { xof?: { value?: number } };
    };
    const rateXof = data.rates?.xof?.value;

    if (typeof rateXof !== 'number' || rateXof <= 0) {
      throw new Error('CoinGecko returned invalid rates.xof.value payload');
    }

    memoryCache = {
      rateXofPerBtc: rateXof,
      fetchedAt: now,
      source: 'CoinGecko Live (XOF/BTC)',
    };

    return {
      rateXofPerBtc: rateXof,
      rateSource: memoryCache.source,
      fetchedAt: new Date(now).toISOString(),
      isFallback: false,
    };
  } catch (err) {
    logger.warn('Failed to fetch live CoinGecko rate', {
      error: err instanceof Error ? err.message : String(err),
    });

    // If we have an older stale cache, we can use it with fallback warning
    if (memoryCache) {
      logger.info('Using stale in-memory cached rate as fallback');
      return {
        rateXofPerBtc: memoryCache.rateXofPerBtc,
        rateSource: 'CoinGecko (Stale Cache Fallback)',
        fetchedAt: new Date(memoryCache.fetchedAt).toISOString(),
        isFallback: true,
      };
    }

    // No cache exists: raise error so POS can switch cleanly to Sats Mode
    throw new RateUnavailableError(
      'Live XOF/BTC exchange rate is currently unavailable. Please enter amount in Sats directly (Sats Mode).'
    );
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Converts XOF to Satoshis and Millisatoshis.
 */
export async function convertXofToSats(amountXof: number): Promise<RateConversionResult> {
  if (typeof amountXof !== 'number' || isNaN(amountXof) || amountXof <= 0) {
    throw new Error('amountXof must be a positive number');
  }

  const rateInfo = await getLiveBtcXofRate();
  const amountSats = Math.max(1, Math.round((amountXof / rateInfo.rateXofPerBtc) * 100_000_000));
  const amountMsats = amountSats * 1000;

  return {
    amountXof,
    amountSats,
    amountMsats,
    rateXofPerBtc: rateInfo.rateXofPerBtc,
    rateSource: rateInfo.rateSource,
    fetchedAt: rateInfo.fetchedAt,
    isFallback: rateInfo.isFallback,
  };
}
