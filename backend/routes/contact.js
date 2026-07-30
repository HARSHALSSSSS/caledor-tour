import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Submit contact form (public)
router.post('/', (req, res) => {
  const db = getDb();
  const { name, company, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  db.prepare(
    'INSERT INTO contact_submissions (name, company, email, phone, message) VALUES (?, ?, ?, ?, ?)'
  ).run(name, company || null, email, phone || null, message);

  // Notify admin
  const io = req.app.get('io');
  if (io) {
    io.emit('contact:new', { name, email, message: message.substring(0, 50) + '...' });
    db.prepare('INSERT INTO notifications (type, title, message) VALUES (?, ?, ?)').run(
      'contact', 'New Contact Submission',
      `${name} (${email}) sent a message`
    );
  }

  res.json({ success: true, message: 'Thank you for contacting us! We will get back to you within 24 hours.' });
});

// List submissions (protected)
router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const { status } = req.query;
  let sql = 'SELECT * FROM contact_submissions';
  const params = [];
  if (status) { sql += ' WHERE status = ?'; params.push(status); }
  sql += ' ORDER BY created_at DESC';
  res.json({ submissions: db.prepare(sql).all(...params) });
});

// Update submission status (protected)
router.put('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });
  db.prepare('UPDATE contact_submissions SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// Get unread count (protected)
router.get('/stats/unread', authMiddleware, (req, res) => {
  const db = getDb();
  const count = db.prepare("SELECT COUNT(*) as count FROM contact_submissions WHERE status = 'unread'").get().count;
  res.json({ unread: count });
});

export default router;
