import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { initDatabase, db } from './db/database.js';
import { apiRouter } from './routes/api.js';
import { logger } from './utils/logger.js';

const app = express();

// Initialize database schema
initDatabase();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// Strict 32kb body limit to prevent memory exhaustion / payload flooding
app.use(express.json({ limit: '32kb' }));

// API Router
app.use('/api', apiRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint Not Found' });
});

// Secure error middleware - Never leaks internal stack traces or secrets to clients
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Internal server error occurred', err);
  res.status(500).json({
    error: 'Internal Server Error',
    code: 'SERVER_ERROR',
  });
});

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(env.PORT, () => {
    logger.info(`Sovereign Soundbox Server listening on http://localhost:${env.PORT}`);
    logger.info(`Allowed CORS Origin: ${env.CLIENT_ORIGIN}`);
  });

  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      try {
        db.close();
        logger.info('Database connection closed.');
      } catch (err) {
        logger.error('Error closing database', err);
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

export default app;
