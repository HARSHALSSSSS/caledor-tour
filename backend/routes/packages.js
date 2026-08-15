import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

const PACKAGE_FIELDS = [
  'name', 'slug', 'category', 'duration', 'price_from', 'currency', 'description',
  'highlights', 'inclusions', 'exclusions', 'itinerary', 'image_url', 'rating',
  'difficulty', 'featured', 'active', 'tagline', 'badge', 'group_size', 'season',
  'gallery_json', 'related_slugs_json', 'about_label', 'itinerary_heading', 'gallery_heading',
];

function pickPackageFields(body) {
  const out = {};
  for (const key of PACKAGE_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

function parseRelatedSlugs(raw) {
  try {
    const value = JSON.parse(raw || '[]');
    if (!Array.isArray(value)) return [];
    return value.map((s) => String(s || '').trim()).filter(Boolean);
  } catch {
    return [];
  }
}

/** Only packages that currently exist and are active. Deleted/old slugs are skipped. */
async function getLiveRelatedPackages(db, pkg, limit = 3) {
  const related = [];
  const seen = new Set([String(pkg.id), String(pkg.slug || '')]);
  const slugs = parseRelatedSlugs(pkg.related_slugs_json);

  if (slugs.length) {
    const placeholders = slugs.map(() => '?').join(',');
    const rows = await db.prepare(
      `SELECT * FROM packages WHERE slug IN (${placeholders}) AND active = 1 AND id != ?`
    ).all(...slugs, pkg.id);
    for (const row of rows) {
      if (seen.has(String(row.id)) || seen.has(String(row.slug))) continue;
      seen.add(String(row.id));
      seen.add(String(row.slug));
      related.push(row);
      if (related.length >= limit) return related;
    }
  }

  const fillers = await db.prepare(
    'SELECT * FROM packages WHERE active = 1 AND id != ? ORDER BY featured DESC, created_at DESC'
  ).all(pkg.id);
  for (const row of fillers) {
    if (seen.has(String(row.id)) || seen.has(String(row.slug))) continue;
    related.push(row);
    if (related.length >= limit) break;
  }
  return related;
}

router.get('/categories/all', async (req, res) => {
  const db = getDb();
  const categories = await db.prepare('SELECT * FROM package_categories WHERE active = 1 ORDER BY sort_order').all();
  res.json({ categories });
});

router.get('/', async (req, res) => {
  const db = getDb();
  const { category, featured, active } = req.query;

  let sql = 'SELECT * FROM packages WHERE 1=1';
  const params = [];

  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (featured === 'true') { sql += ' AND featured = 1'; }
  if (active === 'true' || active === undefined || active === '') { sql += ' AND active = 1'; }

  sql += ' ORDER BY created_at DESC';

  const packages = await db.prepare(sql).all(...params);
  res.json({ packages });
});

router.get('/:id', async (req, res) => {
  const db = getDb();
  const pkg = await db.prepare('SELECT * FROM packages WHERE id = ? OR slug = ?').get(req.params.id, req.params.id);
  if (!pkg) return res.status(404).json({ error: 'Package not found' });
  const related = await getLiveRelatedPackages(db, pkg);
  res.json({ package: pkg, related });
});

router.post('/', authMiddleware, async (req, res) => {
  const db = getDb();
  const body = pickPackageFields(req.body);
  if (!body.name) return res.status(400).json({ error: 'Name is required' });

  body.slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  body.difficulty = body.difficulty || 'Moderate';
  body.active = body.active ?? 1;
  body.featured = body.featured ?? 0;

  const keys = Object.keys(body);
  const vals = keys.map((k) => body[k]);
  const placeholders = keys.map(() => '?').join(', ');

  try {
    const result = await db.prepare(`INSERT INTO packages (${keys.join(', ')}) VALUES (${placeholders})`).run(...vals);
    const pkg = await db.prepare('SELECT * FROM packages WHERE id = ?').get(result.lastInsertRowid);
    const io = req.app.get('io');
    if (io) io.emit('package:created', pkg);
    res.status(201).json({ package: pkg });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const db = getDb();
  const existing = await db.prepare('SELECT id FROM packages WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Package not found' });

  const body = pickPackageFields(req.body);
  if (!Object.keys(body).length) return res.status(400).json({ error: 'No fields to update' });

  const sets = Object.keys(body).map((k) => `${k}=?`).join(', ');
  const vals = [...Object.values(body), req.params.id];

  await db.prepare(`UPDATE packages SET ${sets}, updated_at=datetime('now') WHERE id=?`).run(...vals);
  const pkg = await db.prepare('SELECT * FROM packages WHERE id = ?').get(req.params.id);
  const io = req.app.get('io');
  if (io) io.emit('package:updated', pkg);
  res.json({ package: pkg });
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const db = getDb();
  const existing = await db.prepare('SELECT id FROM packages WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Package not found' });
  await db.prepare('DELETE FROM packages WHERE id = ?').run(req.params.id);
  const io = req.app.get('io');
  if (io) io.emit('package:deleted', { id: Number(req.params.id) });
  res.json({ success: true });
});

export default router;
