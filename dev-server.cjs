const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const PORT = Number(process.env.FRONTEND_PORT || 3000);
const FRONTEND_DIR = path.join(__dirname, "frontend");

const app = express();

function backendProxy(prefix) {
  return createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    ws: prefix === "/socket.io",
    pathRewrite: (reqPath) => `${prefix}${reqPath}`,
  });
}

app.use("/api", backendProxy("/api"));
app.use("/uploads", backendProxy("/uploads"));
app.use("/socket.io", backendProxy("/socket.io"));

app.use(express.static(FRONTEND_DIR));

app.get("/package/:slug", (req, res) => {
  res.redirect(`/package-detail.html?slug=${encodeURIComponent(req.params.slug)}`);
});

app.get("/premium-services", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "premium-services.html"));
});

app.listen(PORT, () => {
  console.log(`Caledor frontend dev server: http://localhost:${PORT}`);
  console.log(`Proxying API/uploads/socket.io -> ${BACKEND_URL}`);
});
