import dotenv from 'dotenv';
import { z } from 'zod';
import crypto from 'node:crypto';

dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .optional()
    .default('4000')
    .transform((val) => parseInt(val, 10))
    .refine((port) => !isNaN(port) && port > 0 && port <= 65535, {
      message: 'PORT must be a valid port number (1-65535)',
    }),
  CLIENT_ORIGIN: z.string().optional().default('http://localhost:5173'),
  SERVER_ENCRYPTION_KEY: z
    .string()
    .optional()
    .transform((key) => {
      if (!key || key.trim() === '') {
        const ephemeral = crypto.randomBytes(32).toString('hex');
        console.warn(
          '[CONFIG NOTICE] SERVER_ENCRYPTION_KEY was not configured in .env. Auto-generated ephemeral in-memory 32-byte key for local development. (Stored credentials will not persist across restarts without setting SERVER_ENCRYPTION_KEY).'
        );
        return ephemeral;
      }
      const trimmed = key.trim();
      if (!/^[0-9a-fA-F]{64}$/.test(trimmed)) {
        throw new Error(
          'SERVER_ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes for AES-256-GCM).'
        );
      }
      return trimmed;
    }),
  SQLITE_DB_PATH: z.string().optional().default('./data/soundbox.db'),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional().default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
