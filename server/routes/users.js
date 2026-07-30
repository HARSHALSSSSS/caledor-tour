import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, adminOnly, (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users });
});

export default router;
