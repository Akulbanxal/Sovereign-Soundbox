import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { dbQueries } from '../db/database.js';
import { convertXofToSats, RateUnavailableError } from '../services/rateService.js';
import { walletRouter } from './walletRoutes.js';
import { invoiceRouter } from './invoiceRoutes.js';
import { logger } from '../utils/logger.js';

export const apiRouter = Router();

// Sub-routers
apiRouter.use('/wallet', walletRouter);
apiRouter.use('/invoices', invoiceRouter);

// 1. Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  const wallet = dbQueries.getWalletConfig();
  res.json({
    status: 'ok',
    service: 'sovereign-soundbox-server',
    timestamp: new Date().toISOString(),
    db: 'connected',
    walletConnected: Boolean(wallet),
  });
});

// 2. Live XOF -> Satoshis conversion endpoint
const rateQuerySchema = z.object({
  amount: z
    .string()
    .optional()
    .default('5000')
    .transform((val) => parseFloat(val))
    .refine((num) => !isNaN(num) && num > 0, {
      message: 'amount must be a positive number',
    }),
});

apiRouter.get('/rates/xof', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = rateQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid amount parameter', details: parsed.error.issues });
      return;
    }

    const conversion = await convertXofToSats(parsed.data.amount);
    res.json(conversion);
  } catch (err) {
    if (err instanceof RateUnavailableError) {
      res.status(503).json({
        error: err.message,
        code: 'RATE_UNAVAILABLE',
        hint: 'Please use manual Sats Mode',
      });
      return;
    }
    next(err);
  }
});

// 3. Security audit logging endpoint (records adversarial/spoof attempts with zero PII)
const auditBodySchema = z.object({
  eventType: z.enum([
    'SPOOF_REJECTED',
    'UNSETTLED_HOLD',
    'DUPLICATE_REPLAY',
    'RATE_FALLBACK',
    'PERMISSIONS_AUDIT',
  ]),
  invoiceId: z.string().optional(),
  paymentHashPrefix: z.string().max(16).optional(),
  reason: z.string().min(1).max(500),
});

apiRouter.post('/security/audit', (req: Request, res: Response) => {
  const parsed = auditBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid security audit payload', details: parsed.error.issues });
    return;
  }

  const data = parsed.data;
  dbQueries.insertSecurityAuditLog({
    event_type: data.eventType,
    invoice_id: data.invoiceId,
    payment_hash_prefix: data.paymentHashPrefix,
    reason: data.reason,
  });

  logger.warn(`Security event logged: ${data.eventType}`, {
    eventType: data.eventType,
    reason: data.reason,
  });

  res.json({ recorded: true });
});
