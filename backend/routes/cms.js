import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { mergeCmsSections } from '../cms-defaults.js';

const router = Router();

router.get('/:tab', async (req, res) => {
  const db = getDb();
  const tab = req.params.tab;
  const rows = await db.prepare('SELECT section, `key`, value, type, enabled FROM cms_content WHERE tab = ? ORDER BY section, `key`').all(tab);

  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.section]) grouped[row.section] = {};
    grouped[row.section][row.key] = row.value;
  }

  const updated = await db.prepare('SELECT MAX(updated_at) AS updated_at FROM cms_content WHERE tab = ?').get(tab);

  res.json({
    tab,
    sections: mergeCmsSections(tab, grouped),
    raw: rows,
    updated_at: updated?.updated_at || null,
  });
});

router.get('/', async (req, res) => {
  const db = getDb();
  const tabs = await db.prepare('SELECT DISTINCT tab FROM cms_content ORDER BY tab').all();
  res.json({ tabs: tabs.map((t) => t.tab) });
});

router.put('/:tab', authMiddleware, async (req, res) => {
  const db = getDb();
  const tab = req.params.tab;
  const { sections } = req.body;

  const upsert = db.prepare(
    "INSERT INTO cms_content (tab, section, `key`, value, type, enabled, updated_at) VALUES (?, ?, ?, ?, ?, 1, datetime('now')) ON CONFLICT(tab, section, key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')"
  );

  for (const [section, fields] of Object.entries(sections || {})) {
    for (const [key, value] of Object.entries(fields)) {
      await upsert.run(tab, section, key, String(value), 'text');
    }
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('cms:updated', { tab, timestamp: new Date().toISOString() });
  }

  res.json({ success: true, tab });
});

export default router;
