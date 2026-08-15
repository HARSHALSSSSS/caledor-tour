import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/categories/list', async (req, res) => {
  const db = getDb();
  const cats = await db.prepare('SELECT DISTINCT category, COUNT(*) as count FROM blog_posts GROUP BY category ORDER BY category').all();
  res.json({ categories: cats });
});

router.get('/', async (req, res) => {
  const db = getDb();
  const { category, featured, published } = req.query;
  let sql = 'SELECT * FROM blog_posts WHERE 1=1';
  const params = [];
  if (published === 'all') {
    // admin: no filter
  } else if (published === 'false') {
    sql += ' AND published = 0';
  } else {
    sql += ' AND published = 1';
  }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (featured === 'true') { sql += ' AND featured = 1'; }
  sql += ' ORDER BY created_at DESC';
  const posts = await db.prepare(sql).all(...params);
  res.json({ posts });
});

router.get('/:id', async (req, res) => {
  const db = getDb();
  const post = await db.prepare('SELECT * FROM blog_posts WHERE id = ? OR slug = ?').get(req.params.id, req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ post });
});

router.post('/', authMiddleware, async (req, res) => {
  const db = getDb();
  const { title, slug, excerpt, content, author, category, tags, image_url, featured, published } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const postSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

  const result = await db.prepare(
    'INSERT INTO blog_posts (title, slug, excerpt, content, author, category, tags, image_url, featured, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(title, postSlug, excerpt, content, author || 'Caledor Team', category || 'Uncategorized', tags || null, image_url, featured ? 1 : 0, published ? 1 : 0);

  const post = await db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(result.lastInsertRowid);
  const io = req.app.get('io');
  if (io) io.emit('blog:created', post);
  res.status(201).json({ post });
});

router.put('/:id', authMiddleware, async (req, res) => {
  const db = getDb();
  const existing = await db.prepare('SELECT id FROM blog_posts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Post not found' });

  const { title, slug, excerpt, content, author, category, tags, image_url, featured, published } = req.body;
  await db.prepare(
    "UPDATE blog_posts SET title=COALESCE(?,title), slug=COALESCE(?,slug), excerpt=COALESCE(?,excerpt), content=COALESCE(?,content), author=COALESCE(?,author), category=COALESCE(?,category), tags=COALESCE(?,tags), image_url=COALESCE(?,image_url), featured=COALESCE(?,featured), published=COALESCE(?,published), updated_at=datetime('now') WHERE id=?"
  ).run(title, slug, excerpt, content, author, category, tags, image_url, featured != null ? (featured ? 1 : 0) : null, published != null ? (published ? 1 : 0) : null, req.params.id);

  const post = await db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
  const io = req.app.get('io');
  if (io) io.emit('blog:updated', post);
  res.json({ post });
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const db = getDb();
  const existing = await db.prepare('SELECT id FROM blog_posts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Post not found' });
  await db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
  const io = req.app.get('io');
  if (io) io.emit('blog:deleted', { id: Number(req.params.id) });
  res.json({ success: true });
});

export default router;
