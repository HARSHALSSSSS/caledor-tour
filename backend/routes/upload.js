import { Router } from 'express';
import multer from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { authMiddleware } from '../middleware/auth.js';
import { UPLOADS_DIR } from '../paths.js';

const uploadsDir = UPLOADS_DIR;

if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 80 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const name = String(file.originalname || "").toLowerCase();
    const isImage = /^image\//.test(file.mimetype);
    const isVideo = /^video\//.test(file.mimetype)
      || /\.(mp4|webm|ogg|ogv|mov|m4v)$/i.test(name);
    if (isImage || isVideo) {
      cb(null, true);
    } else {
      cb(new Error('Only image or video files are allowed'));
    }
  },
});

const router = Router();

router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

export default router;
