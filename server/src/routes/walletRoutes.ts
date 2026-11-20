import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { dbQueries } from '../db/database.js';
import {
  testAndSaveConnection,
  closeActiveNwcClient,
  getActiveNwcClient,
} from '../services/nwcService.js';
import { logger } from '../utils/logger.js';
import { walletConnectLimiter } from '../utils/rateLimiter.js';

export const walletRouter = Router();

// GET /api/wallet/status
walletRouter.get('/status', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const config = dbQueries.getWalletConfig();
    if (!config) {
      res.json({ connected: false });
      return;
    }

    const methods: string[] = JSON.parse(config.supported_methods);
    let balanceMsats: number | undefined;

    // Fetch balance if get_balance method is allowed
    if (methods.includes('get_balance')) {
      try {
        const client = await getActiveNwcClient();
        if (client) {
          const bal = await client.getBalance();
          balanceMsats = bal.balance;
        }
      } catch (err) {
        logger.debug('Could not fetch wallet balance', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    res.json({
      connected: true,
      relayHost: config.relay_host,
      pubkeyPrefix: config.pubkey_prefix,
      supportedMethods: methods,
      hasPayPermission: config.has_pay_permission === 1,
      balanceMsats,
      connectedAt: config.connected_at,
    });
  } catch (err) {
    next(err);
  }
});

const connectSchema = z
  .object({
    nwcUri: z.string().optional(),
    uri: z.string().optional(),
  })
  .refine((data) => Boolean(data.nwcUri || data.uri), {
    message: 'nwcUri or uri is required',
  });

// POST /api/wallet/connect
walletRouter.post('/connect', walletConnectLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = connectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
      return;
    }

    const uri = (parsed.data.nwcUri || parsed.data.uri)!.trim();
    const status = await testAndSaveConnection(uri);
    res.json(status);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to connect NWC wallet';
    logger.warn('NWC wallet connection failed', { error: message });
    res.status(400).json({ error: message });
  }
});

// DELETE /api/wallet/disconnect
walletRouter.delete('/disconnect', (_req: Request, res: Response) => {
  closeActiveNwcClient();
  dbQueries.clearWalletConfig();
  logger.info('Merchant wallet disconnected and config cleared.');
  res.json({ disconnected: true });
});
