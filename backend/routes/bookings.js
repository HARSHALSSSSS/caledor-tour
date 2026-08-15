import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  const db = getDb();
  const { status, limit } = req.query;
  let sql = 'SELECT * FROM bookings';
  const params = [];
  if (status) { sql += ' WHERE status = ?'; params.push(status); }
  sql += ' ORDER BY created_at DESC';
  if (limit) { sql += ' LIMIT ?'; params.push(Number(limit)); }
  const bookings = await db.prepare(sql).all(...params);
  res.json({ bookings });
});

router.post('/', async (req, res) => {
  const db = getDb();
  const { customer_name, customer_email, customer_phone, package_name, travel_date, guests, amount, notes } = req.body;
  if (!customer_name || !package_name) {
    return res.status(400).json({ error: 'Customer name and package are required' });
  }

  const bookingId = 'TRV-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
  const result = await db.prepare(
    'INSERT INTO bookings (booking_id, customer_name, customer_email, customer_phone, package_name, travel_date, guests, amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(bookingId, customer_name, customer_email, customer_phone, package_name, travel_date, guests || 1, amount, notes);

  const booking = await db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
  const io = req.app.get('io');
  if (io) {
    io.emit('booking:new', booking);
    await db.prepare('INSERT INTO notifications (type, title, message) VALUES (?, ?, ?)').run(
      'booking', 'New Booking Received',
      `Booking ${bookingId} from ${customer_name} for ${package_name}`
    );
  }
  res.status(201).json({ booking });
});

router.put('/:id', authMiddleware, async (req, res) => {
  const db = getDb();
  const { status, payment_status } = req.body;
  const existing = await db.prepare('SELECT id FROM bookings WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Booking not found' });

  const updates = [];
  const params = [];
  if (status) { updates.push('status = ?'); params.push(status); }
  if (payment_status) { updates.push('payment_status = ?'); params.push(payment_status); }
  if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });
  updates.push("updated_at = datetime('now')");
  params.push(req.params.id);

  await db.prepare(`UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  const booking = await db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  const io = req.app.get('io');
  if (io) io.emit('booking:updated', booking);
  res.json({ booking });
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const db = getDb();
  const existing = await db.prepare('SELECT id FROM bookings WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Booking not found' });
  await db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.get('/stats/summary', authMiddleware, async (req, res) => {
  const db = getDb();
  const stats = {
    total: (await db.prepare('SELECT COUNT(*) as count FROM bookings').get()).count,
    confirmed: (await db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'").get()).count,
    pending: (await db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'").get()).count,
    completed: (await db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'").get()).count,
    cancelled: (await db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'cancelled'").get()).count,
    totalRevenue: (await db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM bookings WHERE status != ?').get('cancelled')).total,
  };
  res.json(stats);
});

export default router;
