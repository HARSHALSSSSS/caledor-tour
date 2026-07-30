/**
 * Frontend runtime config.
 *
 * Local dev (with npm run dev): leave API_ORIGIN empty — dev-server proxies /api, /uploads, /socket.io.
 * Split deploy (Vercel + Render): either keep empty and use vercel.json rewrites, OR set API_ORIGIN to your Render URL.
 */
(function () {
  const API_ORIGIN = "";

  function trimOrigin(origin) {
    return String(origin || "").replace(/\/+$/, "");
  }

  window.CALEDOR_CONFIG = {
    API_ORIGIN,

    get apiBase() {
      const origin = trimOrigin(API_ORIGIN);
      return origin ? `${origin}/api` : "/api";
    },

    get socketOrigin() {
      const origin = trimOrigin(API_ORIGIN);
      return origin || undefined;
    },

    connectSocket() {
      if (typeof io === "undefined") return null;
      const origin = this.socketOrigin;
      return origin ? io(origin, { path: "/socket.io" }) : io();
    },

    mediaUrl(url) {
      if (!url) return "";
      const value = String(url).trim();
      if (/^https?:\/\//i.test(value)) return value;
      const path = value.startsWith("/") ? value : `/${value}`;
      const origin = trimOrigin(API_ORIGIN);
      return origin ? `${origin}${path}` : path;
    },

    uploadUrl() {
      return `${this.apiBase}/upload`;
    },
  };
})();
