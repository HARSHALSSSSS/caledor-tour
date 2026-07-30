#!/bin/bash
# Oracle Cloud Ubuntu setup for Caledor DMC
# Run on the VM as your ubuntu user: bash deploy/oracle-setup.sh
set -e

APP_DIR="${APP_DIR:-$HOME/caledor-tour}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"

echo "==> Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx ufw build-essential

echo "==> Installing PM2..."
sudo npm install -g pm2

echo "==> Firewall (SSH + HTTP + app port)..."
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3456/tcp
sudo ufw --force enable

if [ ! -d "$APP_DIR" ]; then
  echo "!! Clone your repo first, e.g.:"
  echo "   git clone https://github.com/YOUR_USER/caledor-tour.git $APP_DIR"
  exit 1
fi

cd "$APP_DIR"

echo "==> Installing dependencies..."
cd server && npm install && cd ..

echo "==> Importing media (images)..."
npm run import-media || true

echo "==> Writing .env..."
cat > .env <<EOF
NODE_ENV=production
PORT=3456
JWT_SECRET=$JWT_SECRET
EOF
chmod 600 .env

echo "==> Starting app with PM2..."
export $(grep -v '^#' .env | xargs)
pm2 delete caledor 2>/dev/null || true
pm2 start ecosystem.config.cjs --update-env
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | bash || true

echo "==> Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/caledor >/dev/null <<'NGINX'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3456;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/caledor /etc/nginx/sites-enabled/caledor
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "YOUR_VM_IP")

echo ""
echo "============================================"
echo "  Caledor is LIVE"
echo "  Website:  http://$PUBLIC_IP/"
echo "  Admin:    http://$PUBLIC_IP/admin/"
echo "  Login:    admin@caledor.com / admin123"
echo "  CHANGE PASSWORD IMMEDIATELY IN ADMIN!"
echo "============================================"
echo "JWT_SECRET saved in $APP_DIR/.env"
