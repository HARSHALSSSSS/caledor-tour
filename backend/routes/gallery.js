import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// List gallery items (public)
router.get('/', (req, res) => {
  const db = getDb();
  const { album } = req.query;
  let sql = 'SELECT * FROM gallery_items WHERE active = 1';
  const params = [];
  if (album) { sql += ' AND album = ?'; params.push(album); }
  sql += ' ORDER BY sort_order ASC, created_at DESC';
  res.json({ items: db.prepare(sql).all(...params) });
});

// List albums (public)
router.get('/albums/list', (req, res) => {
  const db = getDb();
  const albums = db.prepare('SELECT DISTINCT album FROM gallery_items WHERE active = 1 ORDER BY album').all();
  res.json({ albums: albums.map(a => a.album) });
});

// Create gallery item (protected)
router.post('/', authMiddleware, (req, res) => {
  const db = getDb();
  const { title, alt_text, image_url, album, sort_order } = req.body;
  if (!image_url) return res.status(400).json({ error: 'Image URL is required' });

  const result = db.prepare(
    'INSERT INTO gallery_items (title, alt_text, image_url, album, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).run(title, alt_text, image_url, album || 'General', sort_order ?? 0);

  const item = db.prepare('SELECT * FROM gallery_items WHERE id = ?').get(result.lastInsertRowid);

  const io = req.app.get('io');
  if (io) io.emit('gallery:updated', item);

  res.status(201).json({ item });
});

// Delete gallery item (protected)
router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM gallery_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Item not found' });
  db.prepare('DELETE FROM gallery_items WHERE id = ?').run(req.params.id);

  const io = req.app.get('io');
  if (io) io.emit('gallery:deleted', { id: Number(req.params.id) });

  res.json({ success: true });
});

export default router;
