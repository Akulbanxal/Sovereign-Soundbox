import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { dbQueries } from '../db/database.js';
import { convertXofToSats } from '../services/rateService.js';
import {
  createLightningInvoice,
  verifyLightningInvoice,
} from '../services/nwcService.js';
import { logger } from '../utils/logger.js';
import { invoiceCreationLimiter } from '../utils/rateLimiter.js';

export const invoiceRouter = Router();

// GET /api/invoices - Recent invoices + today's verified totals
invoiceRouter.get('/', (_req: Request, res: Response) => {
  const invoices = dbQueries.getRecentInvoices(50);
  const todayTotals = dbQueries.getTodayVerifiedTotals();
  res.json({
    invoices,
    todayTotals,
  });
});

const createInvoiceSchema = z
  .object({
    amountXof: z
      .number({ invalid_type_error: 'Le montant XOF doit être un nombre' })
      .int({ message: 'Le montant XOF doit être un entier' })
      .min(1, { message: 'Le montant minimum est de 1 XOF' })
      .max(10_000_000, { message: 'Le montant maximum est de 10 000 000 XOF' })
      .optional(),
    amountSats: z
      .number({ invalid_type_error: 'Le montant en sats doit être un nombre' })
      .int({ message: 'Le montant en sats doit être un entier' })
      .min(1, { message: 'Le montant minimum est de 1 sat' })
      .max(100_000_000, { message: 'Le montant maximum est de 100 000 000 sats' })
      .optional(),
    language: z.enum(['fr', 'wo', 'en']).optional().default('fr'),
    note: z.string().max(120).optional(),
  })
  .refine((data) => data.amountXof !== undefined || data.amountSats !== undefined, {
    message: 'Either amountXof or amountSats must be provided',
  });

// POST /api/invoices - Generate new Lightning invoice
invoiceRouter.post('/', invoiceCreationLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid invoice payload', details: parsed.error.issues });
      return;
    }

    const { amountXof, amountSats: manualSats, language, note } = parsed.data;

    let computedSats: number;
    let computedMsats: number;
    let rateXofPerBtc: number | null = null;
    let rateSource: string;

    if (amountXof) {
      const conversion = await convertXofToSats(amountXof);
      computedSats = conversion.amountSats;
      computedMsats = conversion.amountMsats;
      rateXofPerBtc = conversion.rateXofPerBtc;
      rateSource = conversion.rateSource;
    } else {
      computedSats = manualSats!;
      computedMsats = manualSats! * 1000;
      rateSource = 'Direct Sats Mode';
    }

    const memo = note || `Sovereign Soundbox - ${amountXof ? `${amountXof} XOF` : `${computedSats} sats`}`;

    // Call NIP-47 wallet make_invoice
    const lightning = await createLightningInvoice(computedMsats, memo);

    const id = `inv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    dbQueries.insertInvoice({
      id,
      amount_xof: amountXof || null,
      amount_sats: computedSats,
      amount_msats: computedMsats,
      rate_xof_per_btc: rateXofPerBtc,
      rate_source: rateSource,
      bolt11: lightning.bolt11,
      payment_hash: lightning.paymentHash,
      status: 'UNPAID',
      language,
      expires_at: lightning.expiresAt,
    });

    const created = dbQueries.getInvoiceById(id);
    res.status(201).json(created);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create invoice';
    logger.error('Failed to create invoice', err);
    res.status(400).json({ error: msg });
  }
});

// GET /api/invoices/:id/status - Verify settlement status (cached in DB if already settled)
invoiceRouter.get('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const invoice = dbQueries.getInvoiceById(id);

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    // 1. If already PAID in SQLite, return immediately without hammering the relay
    if (invoice.status === 'PAID') {
      res.json({
        invoice,
        newlySettled: false,
      });
      return;
    }

    // 2. Check if expired by timestamp (ensuring proper UTC parsing)
    if (invoice.expires_at) {
      const normalizedExpires = invoice.expires_at.includes('T')
        ? invoice.expires_at.endsWith('Z')
          ? invoice.expires_at
          : invoice.expires_at + 'Z'
        : invoice.expires_at.replace(' ', 'T') + 'Z';
      const expiresMs = new Date(normalizedExpires).getTime();

      if (!isNaN(expiresMs) && expiresMs < Date.now()) {
        dbQueries.updateInvoiceExpired(id);
        const expiredInvoice = dbQueries.getInvoiceById(id);
        res.json({
          invoice: expiredInvoice ?? { ...invoice, status: 'EXPIRED' },
          newlySettled: false,
        });
        return;
      }
    }

    // 3. Query wallet via NIP-47 lookup_invoice if wallet is available
    let newlySettled = false;
    let preimageVerified = invoice.preimage_verified === 1;

    try {
      const verification = await verifyLightningInvoice(invoice.payment_hash, invoice.amount_msats);
      preimageVerified = verification.preimageVerified;

      if (verification.status === 'PAID') {
        newlySettled = dbQueries.updateInvoiceSettled(id, verification.settledAt);
        logger.info(`Invoice ${id} verified and settled! (${invoice.amount_sats} sats)`, {
          paymentHashPrefix: invoice.payment_hash.slice(0, 16),
          preimageVerified: verification.preimageVerified,
        });
      }
    } catch (err) {
      // If wallet is not connected or offline, gracefully return current persisted state
      logger.debug('Could not query NWC wallet for settlement verification', {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    const updated = dbQueries.getInvoiceById(id);
    res.json({
      invoice: updated,
      newlySettled,
      preimageVerified,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/invoices/:id/ack-audio - Idempotently acknowledge audio announcement
invoiceRouter.post('/:id/ack-audio', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const invoice = dbQueries.getInvoiceById(id);

  if (!invoice) {
    res.status(404).json({ error: 'Invoice not found' });
    return;
  }

  dbQueries.ackInvoiceAudio(id);

  res.json({
    success: true,
    id,
    announcementPlayed: true,
  });
});
