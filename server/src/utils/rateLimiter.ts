import type { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, message = 'Trop de requêtes. Veuillez patienter.' } = options;
  const clients = new Map<string, ClientRecord>();

  // Cleanup expired entries every minute
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of clients.entries()) {
      if (now > record.resetTime) {
        clients.delete(ip);
      }
    }
  }, 60 * 1000).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    // In tests or local dev behind localhost, fall back to ip or 'default'
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const record = clients.get(clientIp);

    if (!record || now > record.resetTime) {
      clients.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      });
      res.setHeader('RateLimit-Limit', maxRequests);
      res.setHeader('RateLimit-Remaining', maxRequests - 1);
      res.setHeader('RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
      next();
      return;
    }

    if (record.count >= maxRequests) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      res.setHeader('RateLimit-Limit', maxRequests);
      res.setHeader('RateLimit-Remaining', 0);
      res.setHeader('RateLimit-Reset', Math.ceil(record.resetTime / 1000));

      res.status(429).json({
        error: message,
        retryAfterSeconds: retryAfterSec,
      });
      return;
    }

    record.count++;
    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', maxRequests - record.count);
    res.setHeader('RateLimit-Reset', Math.ceil(record.resetTime / 1000));
    next();
  };
}

// 1. Wallet connect limiter: max 15 attempts per 15 minutes
export const walletConnectLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 15,
  message: 'Trop de tentatives de connexion de portefeuille. Veuillez patienter 15 minutes.',
});

// 2. Invoice generation limiter: max 60 invoices per minute
export const invoiceCreationLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'Trop de requêtes de facturation. Veuillez ralentir.',
});

