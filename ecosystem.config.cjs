/** PM2 process config — run: pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "caledor-api",
      script: "backend/index.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
