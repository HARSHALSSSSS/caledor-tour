# Deploy Caledor DMC

Modern split layout:

```
backend/   → API only (Render, Railway, etc.)
frontend/  → Website + Admin (Vercel, Netlify, etc.)
```

---

## Local development

```powershell
cd C:\Users\Lenovo\Desktop\tour
npm run install:all
npm run dev
```

| Service | URL |
|---------|-----|
| Website | http://localhost:3000/ |
| Admin | http://localhost:3000/admin/ |
| API (direct) | http://localhost:4000/health |

Login: `admin@caledor.com` / `admin123`

---

## Deploy backend → Render (free tier)

1. Push repo to GitHub
2. [render.com](https://render.com) → **New Web Service**
3. Connect repo → set **Root Directory** = `backend`
4. Build: `npm install` | Start: `npm start`
5. Add env vars:
   - `JWT_SECRET` = long random string
   - `FRONTEND_URL` = your Vercel/Netlify URL (or `*` for testing)
6. Copy your Render URL, e.g. `https://caledor-api.onrender.com`

---

## Deploy frontend → Vercel (free)

1. [vercel.com](https://vercel.com) → Import repo
2. Set **Root Directory** = `frontend`
3. Edit `frontend/vercel.json` — replace `YOUR-RENDER-APP.onrender.com` with your Render URL
4. Deploy

Live:
- Website: `https://your-app.vercel.app/`
- Admin: `https://your-app.vercel.app/admin/`

`vercel.json` rewrites `/api`, `/uploads`, and `/socket.io` to your backend so everything works like one site.

**Alternative (Netlify):** use `frontend/netlify.toml` with the same backend URL.

**Alternative (no rewrites):** set `API_ORIGIN` in `frontend/js/config.js` to your Render URL.

---

## Deploy everything on one Oracle VM (free)

See original Oracle steps — run `bash deploy/oracle-setup.sh` on Ubuntu.

Nginx serves `frontend/` static files and proxies `/api`, `/uploads`, `/socket.io` to the backend API.

---

## Project layout

```
tour/
├── backend/
│   ├── index.js          # Express API + Socket.IO
│   ├── routes/           # /api/* endpoints
│   ├── data/             # SQLite database
│   ├── uploads/          # uploaded images
│   └── render.yaml       # Render deploy config
├── frontend/
│   ├── index.html        # main website
│   ├── script.js
│   ├── admin/            # admin panel
│   ├── js/config.js      # API URL config
│   └── vercel.json       # Vercel rewrites
├── dev-server.cjs        # local dev proxy
└── package.json          # npm run dev
```

---

## Notes

- **SQLite + uploads** on Render free tier may reset on redeploy. Fine for demos; use Oracle VM for permanent free hosting.
- Change admin password after first login.
- `npm run import-media` restores bundled images into `backend/uploads/`.
