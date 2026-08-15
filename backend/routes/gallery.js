import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const db = getDb();
  const { album } = req.query;
  let sql = 'SELECT * FROM gallery_items WHERE active = 1';
  const params = [];
  if (album) { sql += ' AND album = ?'; params.push(album); }
  sql += ' ORDER BY sort_order ASC, created_at DESC';
  res.json({ items: await db.prepare(sql).all(...params) });
});

router.get('/albums/list', async (req, res) => {
  const db = getDb();
  const albums = await db.prepare('SELECT DISTINCT album FROM gallery_items WHERE active = 1 ORDER BY album').all();
  res.json({ albums: albums.map((a) => a.album) });
});

router.post('/', authMiddleware, async (req, res) => {
  const db = getDb();
  const { title, alt_text, image_url, video_url, poster_url, album, sort_order, media_type } = req.body;
  const type = String(media_type || 'image').toLowerCase() === 'video' ? 'video' : 'image';
  const mediaUrl = (type === 'video' ? (video_url || image_url) : image_url)?.trim();
  if (!mediaUrl) return res.status(400).json({ error: 'Media URL is required' });

  const result = await db.prepare(
    'INSERT INTO gallery_items (title, alt_text, image_url, video_url, poster_url, media_type, album, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    title,
    alt_text,
    mediaUrl,
    type === 'video' ? mediaUrl : (video_url || null),
    poster_url || null,
    type,
    album || 'General',
    sort_order ?? 0
  );

  const item = await db.prepare('SELECT * FROM gallery_items WHERE id = ?').get(result.lastInsertRowid);
  const io = req.app.get('io');
  if (io) io.emit('gallery:updated', item);
  res.status(201).json({ item });
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const db = getDb();
  const existing = await db.prepare('SELECT id FROM gallery_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Item not found' });
  await db.prepare('DELETE FROM gallery_items WHERE id = ?').run(req.params.id);
  const io = req.app.get('io');
  if (io) io.emit('gallery:deleted', { id: Number(req.params.id) });
  res.json({ success: true });
});

export default router;
