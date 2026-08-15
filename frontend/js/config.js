/**
 * Frontend runtime config.
 *
 * Local dev (with npm run dev): leave API_ORIGIN empty — dev-server proxies /api, /uploads, /socket.io.
 * Split deploy (cPanel + Render): production hostnames point API_ORIGIN at Render.
 */
(function () {
  const PROD_API_ORIGIN = "https://caledor-tour.onrender.com";
  const host = String(window.location?.hostname || "").toLowerCase();
  const isLocalDev = !host || host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  // Any live site (cPanel, custom domain, staging) talks to Render; only local dev uses /api proxy.
  const API_ORIGIN = isLocalDev ? "" : PROD_API_ORIGIN;
  // Public Web3Forms access key — used by the homepage proposal form for email delivery.
  const WEB3FORMS_ACCESS_KEY = "68e8d577-8008-4446-abef-7fa45d2a3608";

  function trimOrigin(origin) {
    return String(origin || "").replace(/\/+$/, "");
  }

  function isUploadPath(value) {
    const path = String(value || "").trim();
    return path.startsWith("/uploads/") || path.startsWith("uploads/");
  }

  function maybeMediaUrl(url) {
    if (!url) return "";
    const value = String(url).trim();
    if (/^https?:\/\//i.test(value)) return value;
    const path = value.startsWith("/") ? value : `/${value}`;

    // Backend media only — frontend static files stay on the current domain (cPanel).
    if (path.startsWith("/uploads/")) {
      const origin = trimOrigin(API_ORIGIN);
      return origin ? `${origin}${path}` : path;
    }

    return path;
  }

  function applyDeferredMedia(el) {
    if (!el || !el.getAttribute) return;

    const deferredSrc = el.getAttribute("data-caledor-media");
    if (deferredSrc) {
      el.removeAttribute("data-caledor-media");
      el.src = maybeMediaUrl(deferredSrc);
    }

    const deferredBg = el.getAttribute("data-caledor-bg");
    if (deferredBg) {
      el.removeAttribute("data-caledor-bg");
      const fixed = maybeMediaUrl(deferredBg);
      if (fixed) el.style.backgroundImage = `url("${fixed.replace(/"/g, '\\"')}")`;
    }
  }

  function rewriteOne(el) {
    if (!el || !el.getAttribute) return;

    applyDeferredMedia(el);

    if (el.tagName === "IMG" || el.tagName === "VIDEO" || el.tagName === "SOURCE") {
      const src = el.getAttribute("src");
      if (src && isUploadPath(src)) {
        el.src = maybeMediaUrl(src);
      }
      if (el.tagName === "VIDEO") {
        const poster = el.getAttribute("poster");
        if (poster && isUploadPath(poster)) el.setAttribute("poster", maybeMediaUrl(poster));
      }
      return;
    }

    if (el.hasAttribute && el.hasAttribute("style")) {
      const style = el.getAttribute("style");
      if (style && style.includes("/uploads/")) {
        const next = style.replace(/url\((['"]?)(\/uploads\/[^'")]+)\1\)/g, (_m, q, uploadsPath) => {
          const fixed = maybeMediaUrl(uploadsPath);
          return `url(${q}${fixed}${q})`;
        });
        if (next && next !== style) el.setAttribute("style", next);
      }
    }
  }

  window.CALEDOR_CONFIG = {
    API_ORIGIN,
    WEB3FORMS_ACCESS_KEY,
    isLocalDev,
    isProdHost: !isLocalDev && Boolean(host),

    get apiBase() {
      const origin = trimOrigin(API_ORIGIN);
      return origin ? `${origin}/api` : "/api";
    },

    get web3formsKey() {
      return WEB3FORMS_ACCESS_KEY;
    },

    get uploadsBase() {
      const origin = trimOrigin(API_ORIGIN);
      return origin ? `${origin}/uploads` : "/uploads";
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
      return maybeMediaUrl(url);
    },

    uploadUrl() {
      return `${this.apiBase}/upload`;
    },

    ensureSocketIoClient() {
      if (typeof window.io !== "undefined") return Promise.resolve(window.io);
      if (window.__calediorSocketIoPromise) return window.__calediorSocketIoPromise;

      const socketSrc = this.socketOrigin
        ? `${this.socketOrigin}/socket.io/socket.io.js`
        : "/socket.io/socket.io.js";

      window.__calediorSocketIoPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-socket-io="caleriodmc"]');
        if (existing) {
          existing.addEventListener("load", () => resolve(window.io));
          existing.addEventListener("error", reject);
          return;
        }

        const s = document.createElement("script");
        s.async = true;
        s.defer = true;
        s.dataset.socketIo = "caleriodmc";
        s.src = socketSrc;
        s.onload = () => resolve(window.io);
        s.onerror = () => reject(new Error(`Failed to load socket.io client: ${socketSrc}`));
        document.head.appendChild(s);
      });

      return window.__calediorSocketIoPromise;
    },

    rewriteMediaUrls(root = document) {
      if (!root) return;

      root.querySelectorAll("img[data-caledor-media], [data-caledor-bg]").forEach((el) => {
        applyDeferredMedia(el);
      });

      root.querySelectorAll("img, video, source").forEach((el) => {
        rewriteOne(el);
      });

      root.querySelectorAll("[style]").forEach((el) => {
        rewriteOne(el);
      });

      if (root === document && !window.__calediorMediaObserver) {
        window.__calediorMediaObserver = new MutationObserver((mutations) => {
          try {
            for (const m of mutations) {
              if (m.type === "childList") {
                m.addedNodes.forEach((n) => {
                  if (!(n instanceof Element)) return;
                  n.querySelectorAll?.("img[data-caledor-media], [data-caledor-bg]").forEach((el) => applyDeferredMedia(el));
                  n.querySelectorAll?.("img, video, source").forEach((el) => rewriteOne(el));
                  n.querySelectorAll?.("[style]").forEach((el) => rewriteOne(el));
                  rewriteOne(n);
                });
              }
              if (m.type === "attributes") {
                const el = m.target instanceof Element ? m.target : null;
                if (!el) continue;
                const name = m.attributeName;
                if (name === "data-caledor-media" || name === "data-caledor-bg") applyDeferredMedia(el);
                if (name === "src" || name === "poster") rewriteOne(el);
                if (name === "style") rewriteOne(el);
              }
            }
          } catch {
            // keep page usable if rewrite fails
          }
        });
        window.__calediorMediaObserver.observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["src", "style", "data-caledor-media", "data-caledor-bg"],
        });
      }
    },
  };

  const runRewrite = () => {
    try {
      window.CALEDOR_CONFIG?.rewriteMediaUrls?.(document);
    } catch {
      // keep page functional even if rewrite fails
    }
  };

  runRewrite();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runRewrite, { once: true });
  }
})();
