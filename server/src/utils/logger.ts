export function sanitizeForLogging(input: unknown): unknown {
  if (typeof input === 'string') {
    return input
      .replace(/nostr\+walletconnect:\/\/[^\s"'<>]+/gi, 'nostr+walletconnect://[REDACTED]')
      .replace(/[?&]secret=([a-fA-F0-9]+)/gi, '?secret=[REDACTED]')
      .replace(/key=([a-fA-F0-9]{32,64})/gi, 'key=[REDACTED]');
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeForLogging);
  }
  if (input !== null && typeof input === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(input)) {
      if (
        /secret|privkey|private_key|token|encryption_key|nwc_uri/i.test(key) &&
        typeof val === 'string'
      ) {
        sanitizedObj[key] = '[REDACTED]';
      } else {
        sanitizedObj[key] = sanitizeForLogging(val);
      }
    }
    return sanitizedObj;
  }
  return input;
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    const cleanMeta = meta ? sanitizeForLogging(meta) : undefined;
    console.log(
      `[INFO] [${new Date().toISOString()}] ${sanitizeForLogging(message)}`,
      cleanMeta ? JSON.stringify(cleanMeta) : ''
    );
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    const cleanMeta = meta ? sanitizeForLogging(meta) : undefined;
    console.warn(
      `[WARN] [${new Date().toISOString()}] ${sanitizeForLogging(message)}`,
      cleanMeta ? JSON.stringify(cleanMeta) : ''
    );
  },
  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    const errString = error instanceof Error ? error.message : String(error || '');
    const cleanError = sanitizeForLogging(errString);
    const cleanMeta = meta ? sanitizeForLogging(meta) : undefined;
    console.error(
      `[ERROR] [${new Date().toISOString()}] ${sanitizeForLogging(message)}: ${cleanError}`,
      cleanMeta ? JSON.stringify(cleanMeta) : ''
    );
  },
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.DEBUG) {
      const cleanMeta = meta ? sanitizeForLogging(meta) : undefined;
      console.debug(
        `[DEBUG] [${new Date().toISOString()}] ${sanitizeForLogging(message)}`,
        cleanMeta ? JSON.stringify(cleanMeta) : ''
      );
    }
  },
};
