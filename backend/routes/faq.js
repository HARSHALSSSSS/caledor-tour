import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// List FAQs (public)
router.get('/', (req, res) => {
  const db = getDb();
  const { active } = req.query;
  let sql = 'SELECT * FROM faqs WHERE 1=1';
  const params = [];
  if (active === 'true') { sql += ' AND active = 1'; }
  sql += ' ORDER BY sort_order ASC, created_at DESC';
  const faqs = db.prepare(sql).all(...params);
  res.json({ faqs });
});

function faqActiveValue(value) {
  return value === true || value === 1 || value === "1" ? 1 : 0;
}

// Get single FAQ (protected — admin edit)
router.get('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const faq = db.prepare('SELECT * FROM faqs WHERE id = ?').get(req.params.id);
  if (!faq) return res.status(404).json({ error: 'FAQ not found' });
  res.json({ faq });
});

// Create FAQ (protected)
router.post('/', authMiddleware, (req, res) => {
  const db = getDb();
  const { question, answer, category, sort_order, active } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'Question and answer are required' });

  const result = db.prepare(
    'INSERT INTO faqs (question, answer, category, sort_order, active) VALUES (?, ?, ?, ?, ?)'
  ).run(question, answer, category || 'General', sort_order ?? 0, active != null ? faqActiveValue(active) : 1);

  const faq = db.prepare('SELECT * FROM faqs WHERE id = ?').get(result.lastInsertRowid);
  const io = req.app.get('io');
  if (io) {
    io.emit('faq:updated', { action: 'created' });
    io.emit('faq:created', { id: faq.id });
  }
  res.status(201).json({ faq });
});

// Update FAQ (protected)
router.put('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM faqs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'FAQ not found' });

  const { question, answer, category, sort_order, active } = req.body;
  db.prepare(
    "UPDATE faqs SET question=COALESCE(?,question), answer=COALESCE(?,answer), category=COALESCE(?,category), sort_order=COALESCE(?,sort_order), active=COALESCE(?,active), updated_at=datetime('now') WHERE id=?"
  ).run(question, answer, category, sort_order, active != null ? faqActiveValue(active) : null, req.params.id);

  const faq = db.prepare('SELECT * FROM faqs WHERE id = ?').get(req.params.id);
  const io = req.app.get('io');
  if (io) io.emit('faq:updated', { action: 'updated', id: faq.id });
  res.json({ faq });
});

// Delete FAQ (protected)
router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM faqs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'FAQ not found' });
  db.prepare('DELETE FROM faqs WHERE id = ?').run(req.params.id);
  const io = req.app.get('io');
  if (io) io.emit('faq:updated', { action: 'deleted' });
  if (io) io.emit('faq:deleted', { id: Number(req.params.id) });
  res.json({ success: true });
});

export default router;
