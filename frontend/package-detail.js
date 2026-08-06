const API = window.CALEDOR_CONFIG?.apiBase ?? "/api";

const SLUG_ALIASES = {
  "scottish-highlands-luxury-tour": "scottish-highlands-journey",
  "french-riviera-villa-escape": "french-riviera-retreat",
  "italian-heritage-grand-tour": "italian-heritage-tour",
  "swiss-alps-private-retreat": "swiss-alps-experience",
};

const IMAGE_FALLBACK = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}

function parseJson(raw, fb = []) {
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw || "[]"); } catch { return fb; }
}

function mediaUrl(url) {
  if (window.CALEDOR_CONFIG?.mediaUrl) return window.CALEDOR_CONFIG.mediaUrl(url);
  if (!url) return "";
  const value = String(url).trim();
  if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
  return `/${value.replace(/^\/+/, "")}`;
}

function assetUrl(url, version) {
  const resolved = mediaUrl(url);
  if (!resolved) return "";
  if (!version) return resolved;
  const join = resolved.includes("?") ? "&" : "?";
  return `${resolved}${join}v=${encodeURIComponent(String(version).replace(/\s/g, ""))}`;
}

function withImageFallback(src, alt = "") {
  const safe = escapeHtml(src || IMAGE_FALLBACK);
  return `src="${safe}" alt="${escapeHtml(alt)}" loading="lazy" onerror="this.onerror=null;this.src='${IMAGE_FALLBACK}'"`;
}

function packageCountryLabel(pkg) {
  const badge = (pkg.badge || "").trim().toUpperCase();
  const countries = ["ITALY", "FRANCE", "SCOTLAND", "ENGLAND", "SWITZERLAND"];
  if (countries.includes(badge)) return badge;
  const text = `${pkg.name} ${pkg.tagline || ""}`.toLowerCase();
  if (text.includes("italian") || text.includes("italy")) return "ITALY";
  if (text.includes("french") || text.includes("riviera")) return "FRANCE";
  if (text.includes("scottish") || text.includes("highlands")) return "SCOTLAND";
  if (text.includes("london") || text.includes("royal")) return "ENGLAND";
  if (text.includes("swiss") || text.includes("alps")) return "SWITZERLAND";
  return badge || "EUROPE";
}

async function fetchJson(path) {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${API}${path}${sep}_=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("slug") || params.get("id");
  const pathMatch = window.location.pathname.match(/\/package\/([^/?#]+)/i);
  const fromPath = pathMatch ? decodeURIComponent(pathMatch[1]) : "";
  const raw = (fromQuery || fromPath || "").trim();
  if (!raw) return "scottish-highlands-journey";
  return SLUG_ALIASES[raw] || raw;
}

function getDefaultPackage(slug) {
  return window.CALEDOR_PACKAGE_DEFAULTS?.getBySlug?.(slug) || null;
}

/** Prefer live admin/API values; fill gaps from local defaults only. */
function mergePackage(apiPkg = {}, defaults = {}) {
  const hasApi = Boolean(apiPkg && (apiPkg.id || apiPkg.slug || apiPkg.name));
  if (!hasApi) return { ...defaults };

  const base = { ...defaults, ...apiPkg };

  ["highlights", "inclusions", "exclusions", "itinerary"].forEach((key) => {
    const apiVal = parseJson(apiPkg[key]);
    const defVal = parseJson(defaults[key]);
    base[key] = apiVal.length ? apiVal : defVal;
  });

  const apiGallery = parseJson(apiPkg.gallery_json);
  const defGallery = parseJson(defaults.gallery_json);
  // Prefer admin gallery whenever API sent one (including replacing defaults)
  if (Object.prototype.hasOwnProperty.call(apiPkg, "gallery_json") && apiGallery.length) {
    base.gallery_json = JSON.stringify(apiGallery);
  } else if (apiGallery.length) {
    base.gallery_json = JSON.stringify(apiGallery);
  } else {
    base.gallery_json = JSON.stringify(defGallery);
  }

  // Admin hero image always wins when set
  if (apiPkg.image_url) {
    base.image_url = apiPkg.image_url;
  } else if (apiGallery[0]?.url || apiGallery[0]?.image_url) {
    base.image_url = apiGallery[0].url || apiGallery[0].image_url;
  } else if (!base.image_url) {
    base.image_url = defaults.image_url || "";
  }

  if (!base.description) base.description = defaults.description || "";
  if (!base.tagline) base.tagline = defaults.tagline || "";
  if (!base.badge) base.badge = defaults.badge || "";
  if (!base.duration) base.duration = defaults.duration || "";
  if (!base.group_size) base.group_size = defaults.group_size || "";
  if (!base.difficulty) base.difficulty = defaults.difficulty || "";
  if (!base.season) base.season = defaults.season || "";
  if (!base.about_label) base.about_label = defaults.about_label || "The Expedition";
  if (!base.itinerary_heading) base.itinerary_heading = defaults.itinerary_heading || "A Curated Day-by-Day Path";
  if (!base.gallery_heading) base.gallery_heading = defaults.gallery_heading || "Gallery";

  return base;
}

function renderList(el, items, cls) {
  if (!el) return;
  const list = items.length ? items : ["Curated luxury experience with expert local guides."];
  el.innerHTML = list.map((item) => `<li>${escapeHtml(typeof item === "string" ? item : item.title || item.text || "")}</li>`).join("");
  if (cls) el.className = cls;
}

function renderPackage(pkg, related = []) {
  document.title = `${pkg.name || "Package"} | Caledor DMC`;

  const heroBg = document.getElementById("pkgHeroBg");
  const gallery = parseJson(pkg.gallery_json);
  const heroImage = pkg.image_url || gallery[0]?.url || gallery[0]?.image_url || gallery[0];
  if (heroBg) {
    const url = heroImage
      ? assetUrl(typeof heroImage === "string" ? heroImage : heroImage.url, pkg.updated_at || Date.now())
      : IMAGE_FALLBACK;
    heroBg.style.backgroundImage = `url("${String(url || IMAGE_FALLBACK).replace(/"/g, "%22")}")`;
    heroBg.style.backgroundSize = "cover";
    heroBg.style.backgroundPosition = "center";
  }

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || "";
  };

  setText("pkgBadge", packageCountryLabel(pkg));
  setText("pkgTitle", pkg.name || "Experience");
  setText("pkgTagline", pkg.tagline || (pkg.description || "").slice(0, 160));
  setText("pkgDuration", pkg.duration || "Custom itinerary");
  setText("pkgGroupSize", pkg.group_size || "Private");
  setText("pkgDifficulty", pkg.difficulty || "Moderate");
  setText("pkgSeason", pkg.season || "Year-Round");
  setText("pkgAboutLabel", pkg.about_label || "The Expedition");
  setText("pkgItineraryHeading", pkg.itinerary_heading || "A Curated Day-by-Day Path");
  setText("pkgGalleryHeading", pkg.gallery_heading || "Gallery");

  const desc = document.getElementById("pkgDescription");
  if (desc) {
    const text = String(pkg.description || "").trim();
    const paragraphs = text.split(/\n\n+/).filter(Boolean);
    desc.innerHTML = paragraphs.length
      ? paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")
      : `<p>${escapeHtml(text || "A refined journey crafted by Caledor DMC specialists.")}</p>`;
  }

  renderList(document.getElementById("pkgHighlights"), parseJson(pkg.highlights));
  renderList(document.getElementById("pkgInclusions"), parseJson(pkg.inclusions), "included-list");
  renderList(document.getElementById("pkgExclusions"), parseJson(pkg.exclusions), "excluded-list");

  const itineraryEl = document.getElementById("pkgItinerary");
  const days = parseJson(pkg.itinerary);
  if (itineraryEl) {
    itineraryEl.innerHTML = days.length
      ? days.map((day) => `
      <article class="itinerary-day">
        <div class="day-badge">${escapeHtml(String(day.day || ""))}</div>
        <div>
          <h3>${escapeHtml(day.title || `Day ${day.day}`)}</h3>
          <p>${escapeHtml(day.description || "")}</p>
        </div>
      </article>`).join("")
      : `<p style="color:rgba(255,255,255,0.7)">Itinerary details coming soon.</p>`;
  }

  const galleryEl = document.getElementById("pkgGallery");
  if (galleryEl) {
    const images = gallery.length
      ? gallery
      : (pkg.image_url ? [{ url: pkg.image_url, alt: pkg.name }] : []);
    galleryEl.innerHTML = images.length
      ? images.map((item) => {
          const src = assetUrl(item.url || item.image_url || item, pkg.updated_at) || IMAGE_FALLBACK;
          return `<img ${withImageFallback(src, item.alt || pkg.name)} />`;
        }).join("")
      : `<img ${withImageFallback(IMAGE_FALLBACK, pkg.name || "Experience")} />`;
  }

  const relatedEl = document.getElementById("pkgRelated");
  if (relatedEl) {
    const items = related.length ? related : (window.CALEDOR_PACKAGE_DEFAULTS?.getRelated?.(pkg.slug) || []);
    relatedEl.innerHTML = items.slice(0, 3).map((item) => {
      const img = assetUrl(item.image_url, item.updated_at) || IMAGE_FALLBACK;
      const country = packageCountryLabel(item);
      return `
      <article class="related-card">
        <a class="related-card-link featured-experience-card" href="/package/${encodeURIComponent(item.slug)}">
          <div class="related-card-media featured-card-media">
            <img ${withImageFallback(img, item.name)} />
            <span class="featured-country-tag">${escapeHtml(country)}</span>
          </div>
          <div class="related-card-body featured-card-body">
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.tagline || item.description?.slice(0, 100) || "")}</p>
          </div>
        </a>
      </article>`;
    }).join("") || `<p>More experiences coming soon.</p>`;
  }

  const ctaCopy = document.getElementById("pkgCtaCopy");
  if (ctaCopy) {
    ctaCopy.textContent = `Speak with our travel specialists to tailor ${pkg.name || "this experience"} for your clients.`;
  }
}

async function loadPackage() {
  const slug = getSlug();
  const defaults = getDefaultPackage(slug);

  try {
    const data = await fetchJson(`/packages/${encodeURIComponent(slug)}`);
    const apiPkg = data.package || {};
    const pkg = mergePackage(apiPkg, defaults || {});
    const related = (data.related || []).length
      ? data.related.map((r) => mergePackage(r, getDefaultPackage(r.slug) || {}))
      : window.CALEDOR_PACKAGE_DEFAULTS?.getRelated?.(slug) || [];
    renderPackage(pkg, related);
  } catch (err) {
    console.warn("Package API load failed, using defaults:", err?.message || err);
    if (defaults) {
      renderPackage(defaults, window.CALEDOR_PACKAGE_DEFAULTS?.getRelated?.(slug) || []);
      return;
    }
    const root = document.getElementById("packageDetailRoot");
    if (root) {
      root.innerHTML = `
      <section class="section-block"><div class="container">
        <h2>Package not found</h2>
        <p style="color:var(--muted)">This experience may have been removed or the link is incorrect.</p>
        <a class="button primary" href="/#packages">View Packages</a>
      </div></section>`;
    }
  }
}

function connectLiveUpdates() {
  if (typeof io === "undefined") return;
  try {
    const socket = window.CALEDOR_CONFIG?.connectSocket?.() ?? io();
    socket.on("package:updated", () => loadPackage());
    socket.on("package:deleted", () => loadPackage());
    socket.on("package:created", () => loadPackage());
  } catch {
    // socket optional
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadPackage();
  connectLiveUpdates();
  if (window.SiteChrome) SiteChrome.init({ scroll: true });
});
