/**
 * Ensures backend has full CMS data + media on disk.
 * Run: npm run bootstrap (also runs after npm install on deploy)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from '../db.js';
import { flattenCmsDefaults } from '../cms-defaults.js';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(BACKEND_ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'caledor.db');
const UPLOADS = path.join(BACKEND_ROOT, 'uploads');

const LEGACY_DB_CANDIDATES = [
  path.join(BACKEND_ROOT, '..', 'data', 'caledor.db'),
  path.join(BACKEND_ROOT, '..', 'server', 'data', 'caledor.db'),
];

const LEGACY_UPLOAD_DIRS = [
  path.join(BACKEND_ROOT, '..', 'uploads'),
  path.join(BACKEND_ROOT, '..', 'server', 'uploads'),
];

function copyDirMerge(src, dest) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let copied = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copied += copyDirMerge(from, to);
    } else if (!fs.existsSync(to)) {
      fs.copyFileSync(from, to);
      copied += 1;
    }
  }
  return copied;
}

function restoreLegacyDatabase() {
  if (fs.existsSync(DB_PATH)) return false;
  for (const candidate of LEGACY_DB_CANDIDATES) {
    if (!fs.existsSync(candidate)) continue;
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.copyFileSync(candidate, DB_PATH);
    console.log(`✓ Restored database from ${candidate}`);
    return true;
  }
  return false;
}

function mergeUploads() {
  let total = 0;
  for (const dir of LEGACY_UPLOAD_DIRS) {
    total += copyDirMerge(dir, UPLOADS);
  }
  if (total) console.log(`✓ Merged ${total} upload file(s) into backend/uploads`);
}

async function upsertMissingCms(db) {
  const insert = db.prepare(
    `INSERT INTO cms_content (tab, section, key, value) VALUES (?, ?, ?, ?)
     ON CONFLICT(tab, section, key) DO NOTHING`
  );
  const rows = flattenCmsDefaults();
  let added = 0;
  for (const row of rows) {
    const result = await Promise.resolve(insert.run(...row));
    if (result?.changes) added += 1;
  }
  console.log(`✓ CMS defaults checked (${added} new row(s) added, existing values kept)`);
}

async function runImportMedia() {
  try {
    await import('./import-media.js');
  } catch (err) {
    console.warn('⚠ import-media skipped:', err.message);
  }
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS, { recursive: true });

  // Remote MySQL is initialized when the API starts. Doing it here makes Render
  // builds wait on cPanel and can fail the whole install step.
  if (process.env.DB_HOST) {
    console.log('MySQL: skipping postinstall bootstrap (tables are created on API start).');
    return;
  }

  restoreLegacyDatabase();
  mergeUploads();

  const db = await initDb();
  await upsertMissingCms(db);
  console.log('✓ Database ready (existing CMS content is not overwritten)');
}

main().then(() => {
  if (process.env.DB_HOST) return;
  return runImportMedia().then(() => {
    console.log('\nBootstrap complete.');
  });
}).catch((err) => {
  console.warn('⚠ bootstrap skipped:', err.message);
});
