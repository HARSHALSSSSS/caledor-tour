import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const DATA_DIR = process.env.DATABASE_DIR || join(__dirname, 'data');
export const DB_PATH = process.env.DATABASE_PATH || join(DATA_DIR, 'caledor.db');
export const UPLOADS_DIR = process.env.UPLOADS_DIR || join(__dirname, 'uploads');

export function ensureDataDirs() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });
}
