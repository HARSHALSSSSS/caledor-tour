import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { getDb } from './db.js';
import authRoutes from './routes/auth.js';
import cmsRoutes from './routes/cms.js';
import packageRoutes from './routes/packages.js';
import bookingRoutes from './routes/bookings.js';
import contactRoutes from './routes/contact.js';
import galleryRoutes from './routes/gallery.js';
import blogRoutes from './routes/blog.js';
import faqRoutes from './routes/faq.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/upload.js';
import { authMiddleware } from './middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile() {
  const envPath = join(__dirname, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

getDb();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: FRONTEND_URL === '*' ? '*' : FRONTEND_URL.split(',').map((s) => s.trim()), methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }
});

app.set('io', io);

app.use(cors({ origin: FRONTEND_URL === '*' ? true : FRONTEND_URL.split(',').map((s) => s.trim()) }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'caledor-api' });
});

app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/settings', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT key, value, group_name FROM settings ORDER BY group_name, key').all();
  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.group_name]) grouped[row.group_name] = {};
    grouped[row.group_name][row.key] = row.value;
  }
  res.json({ settings: grouped, raw: rows });
});

app.put('/api/settings', authMiddleware, (req, res) => {
  const db = getDb();
  const { settings } = req.body;
  const upsert = db.prepare(
    "INSERT INTO settings (key, value, group_name, updated_at) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')"
  );
  const transaction = db.transaction(() => {
    for (const [groupOrKey, value] of Object.entries(settings || {})) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [key, nestedValue] of Object.entries(value)) {
          upsert.run(key, String(nestedValue ?? ''), groupOrKey);
        }
      } else {
        upsert.run(groupOrKey, String(value ?? ''), 'custom');
      }
    }
  });
  transaction();

  const socket = req.app.get('io');
  if (socket) socket.emit('settings:updated', { timestamp: new Date().toISOString() });

  res.json({ success: true });
});

app.get('/api/dashboard/stats', (req, res) => {
  const db = getDb();
  const stats = {
    totalBookings: db.prepare('SELECT COUNT(*) as count FROM bookings').get().count,
    activePackages: db.prepare('SELECT COUNT(*) as count FROM packages WHERE active = 1').get().count,
    monthlyRevenue: db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM bookings WHERE status != 'cancelled' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')").get().total,
    newSubmissions: db.prepare("SELECT COUNT(*) as count FROM contact_submissions WHERE status = 'unread'").get().count,
    pendingBookings: db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'").get().count,
    totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
    totalBlogPosts: db.prepare('SELECT COUNT(*) as count FROM blog_posts WHERE published = 1').get().count,
    unreadNotifications: db.prepare('SELECT COUNT(*) as count FROM notifications WHERE read = 0').get().count,
  };
  res.json(stats);
});

app.get('/api/notifications', (req, res) => {
  const db = getDb();
  const notifications = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all();
  res.json({ notifications });
});

app.put('/api/notifications/:id/read', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.put('/api/notifications/read-all', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE notifications SET read = 1').run();
  res.json({ success: true });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join:admin', () => {
    socket.join('admin-room');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Caledor API running on http://0.0.0.0:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
