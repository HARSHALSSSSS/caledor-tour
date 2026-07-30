#!/bin/bash
# Oracle Cloud Ubuntu setup for Caledor DMC (backend API + frontend static)
# Run on the VM as your ubuntu user: bash deploy/oracle-setup.sh
set -e

APP_DIR="${APP_DIR:-$HOME/caledor-tour}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
API_PORT="${API_PORT:-4000}"

echo "==> Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx ufw build-essential

echo "==> Installing PM2..."
sudo npm install -g pm2

echo "==> Firewall (SSH + HTTP)..."
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

if [ ! -d "$APP_DIR" ]; then
  echo "!! Clone your repo first, e.g.:"
  echo "   git clone https://github.com/YOUR_USER/caledor-tour.git $APP_DIR"
  exit 1
fi

cd "$APP_DIR"

echo "==> Installing backend dependencies..."
cd backend && npm install && cd ..

echo "==> Importing media (images)..."
npm run import-media || true

echo "==> Writing backend/.env..."
cat > backend/.env <<EOF
NODE_ENV=production
PORT=$API_PORT
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=*
EOF
chmod 600 backend/.env

echo "==> Starting API with PM2..."
pm2 delete caledor-api 2>/dev/null || true
pm2 start ecosystem.config.cjs --update-env
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | bash || true

echo "==> Nginx (frontend static + API proxy)..."
sudo tee /etc/nginx/sites-available/caledor >/dev/null <<NGINX
server {
    listen 80;
    server_name _;
    client_max_body_size 10M;

    root $APP_DIR/frontend;

    location /api/ {
        proxy_pass http://127.0.0.1:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:$API_PORT;
        proxy_set_header Host \$host;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }

    location /package/ {
        rewrite ^/package/(.*)$ /package-detail.html?slug=\$1 last;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
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
echo "JWT_SECRET saved in $APP_DIR/backend/.env"
