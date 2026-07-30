# Deploy Caledor DMC on Oracle Cloud (Free Forever)

One Oracle VM runs **website + admin + API + database + uploads**.

---

## Part 1 — Oracle Cloud account & VM (15–20 min)

### 1. Create account
1. Go to https://www.oracle.com/cloud/free/
2. Sign up (credit card for verification — **Always Free** resources stay $0)
3. Choose home region close to you (e.g. Mumbai)

### 2. Create a VM
1. Oracle Console → **Compute** → **Instances** → **Create instance**
2. Name: `caledor-server`
3. **Image:** Ubuntu 22.04 or 24.04
4. **Shape:** Click **Change shape**
   - **Ampere** → `VM.Standard.A1.Flex` (1 OCPU, 6 GB RAM) — Always Free
   - Or **AMD** → `VM.Standard.E2.1.Micro` — Always Free
5. **Networking:** Use default VCN
6. **Add SSH keys:** Generate or upload your public key
7. Click **Create**

### 3. Open firewall ports (IMPORTANT)
1. On the instance page → click your **Subnet** link
2. Click **Security List** → **Default Security List**
3. **Add Ingress Rules:**

| Source CIDR | Protocol | Dest Port | Description |
|-------------|----------|-----------|-------------|
| `0.0.0.0/0` | TCP | 22 | SSH |
| `0.0.0.0/0` | TCP | 80 | Website (HTTP) |
| `0.0.0.0/0` | TCP | 443 | HTTPS (later) |
| `0.0.0.0/0` | TCP | 3456 | Direct app (optional) |

4. Copy your instance **Public IP address**

---

## Part 2 — Push code to GitHub (5 min)

On your **Windows PC** in the project folder:

```powershell
cd C:\Users\Lenovo\Desktop\tour
git init
git add .
git commit -m "Deploy to Oracle Cloud"
```

Create a repo on GitHub, then:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/caledor-tour.git
git branch -M main
git push -u origin main
```

---

## Part 3 — Setup the server (10 min)

### 1. SSH into the VM

**Windows PowerShell:**
```powershell
ssh -i path\to\your-key.key ubuntu@YOUR_PUBLIC_IP
```

(Or use Oracle’s **Cloud Shell** → SSH from browser)

### 2. Clone project

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/caledor-tour.git
cd caledor-tour
```

### 3. Run auto-setup script

```bash
chmod +x deploy/oracle-setup.sh
bash deploy/oracle-setup.sh
```

This installs Node, PM2, Nginx, imports images, starts the app, and proxies port 80 → 3456.

### 4. Test in browser

| Page | URL |
|------|-----|
| Website | `http://YOUR_PUBLIC_IP/` |
| Admin | `http://YOUR_PUBLIC_IP/admin/` |
| Login | `admin@caledor.com` / `admin123` |

**Change admin password immediately** after first login.

---

## Part 4 — After deploy checklist

- [ ] Website loads with images
- [ ] Admin login works
- [ ] Edit something in CMS → save → refresh site (should update)
- [ ] Upload an image in Gallery admin
- [ ] Submit contact form
- [ ] Change admin password

---

## Useful commands (on the VM)

```bash
cd ~/caledor-tour

# View logs
pm2 logs caledor

# Restart after code update
git pull
cd server && npm install && cd ..
npm run import-media   # if images missing
pm2 restart caledor

# App status
pm2 status
```

---

## Optional — Custom domain + HTTPS (free)

1. Buy domain or use one you own
2. DNS A record → point to Oracle **Public IP**
3. On VM:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Then use:
- `https://yourdomain.com/`
- `https://yourdomain.com/admin/`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Site not loading | Check Oracle Security List ports 80, 443 |
| `502 Bad Gateway` | `pm2 status` — if stopped: `pm2 start ecosystem.config.cjs` |
| Images missing | `npm run import-media` then `pm2 restart caledor` |
| Admin login fails | Check `pm2 logs caledor` |
| npm install fails on SQLite | Script installs `build-essential`; run `cd server && npm rebuild better-sqlite3` |

---

## What runs where

```
Browser
   ↓
Nginx :80  →  Node/Express :3456
                  ├── /           website
                  ├── /admin/     admin panel
                  ├── /api/*      backend
                  ├── /uploads/*  images
                  └── Socket.IO   live CMS updates
                  data/caledor.db  SQLite database
```

Everything stays on one free Oracle VM — no compromise.
