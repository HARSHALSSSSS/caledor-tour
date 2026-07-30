import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { mergeCmsSections } from '../cms-defaults.js';

const router = Router();

// Get all CMS content for a tab
router.get('/:tab', (req, res) => {
  const db = getDb();
  const tab = req.params.tab;
  const rows = db.prepare('SELECT section, key, value, type, enabled FROM cms_content WHERE tab = ? ORDER BY section, key').all(tab);

  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.section]) grouped[row.section] = {};
    grouped[row.section][row.key] = row.value;
  }

  res.json({ tab, sections: mergeCmsSections(tab, grouped), raw: rows });
});

// Get all tabs (list)
router.get('/', (req, res) => {
  const db = getDb();
  const tabs = db.prepare('SELECT DISTINCT tab FROM cms_content ORDER BY tab').all();
  res.json({ tabs: tabs.map(t => t.tab) });
});

// Update CMS content (protected)
router.put('/:tab', authMiddleware, (req, res) => {
  const db = getDb();
  const tab = req.params.tab;
  const { sections } = req.body;

  const upsert = db.prepare(
    'INSERT INTO cms_content (tab, section, key, value, type, enabled, updated_at) VALUES (?, ?, ?, ?, ?, 1, datetime(\'now\')) ON CONFLICT(tab, section, key) DO UPDATE SET value = excluded.value, updated_at = datetime(\'now\')'
  );

  const transaction = db.transaction(() => {
    for (const [section, fields] of Object.entries(sections)) {
      for (const [key, value] of Object.entries(fields)) {
        upsert.run(tab, section, key, String(value), 'text');
      }
    }
  });

  transaction();

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.emit('cms:updated', { tab, timestamp: new Date().toISOString() });
  }

  res.json({ success: true, tab });
});

export default router;
