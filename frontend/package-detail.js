const API = window.CALEDOR_CONFIG?.apiBase ?? "/api";

const SLUG_ALIASES = {
  "scottish-highlands-luxury-tour": "scottish-highlands-journey",
  "french-riviera-villa-escape": "french-riviera-retreat",
  "italian-heritage-grand-tour": "italian-heritage-tour",
  "swiss-alps-private-retreat": "swiss-alps-experience",
};

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
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) return value;
  return `/${value.replace(/^\/+/, "")}`;
}

function assetUrl(url, version) {
  const resolved = mediaUrl(url);
  if (!resolved) return "";
  if (!version) return resolved;
  const join = resolved.includes("?") ? "&" : "?";
  return `${resolved}${join}v=${encodeURIComponent(String(version).replace(/\s/g, ""))}`;
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
  const raw = params.get("slug") || params.get("id") || "scottish-highlands-journey";
  return SLUG_ALIASES[raw] || raw;
}

function getDefaultPackage(slug) {
  return window.CALEDOR_PACKAGE_DEFAULTS?.getBySlug?.(slug) || null;
}

function mergePackage(apiPkg = {}, defaults = {}) {
  const merged = { ...defaults, ...apiPkg };
  ["highlights", "inclusions", "exclusions", "itinerary"].forEach((key) => {
    const apiVal = parseJson(apiPkg[key]);
    const defVal = parseJson(defaults[key]);
    merged[key] = apiVal.length ? apiVal : defVal;
  });
  const apiGallery = parseJson(apiPkg.gallery_json);
  const defGallery = parseJson(defaults.gallery_json);
  merged.gallery_json = JSON.stringify(apiGallery.length ? apiGallery : defGallery);
  if (!merged.image_url) merged.image_url = defaults.image_url;
  if (!merged.description) merged.description = defaults.description;
  if (!merged.tagline) merged.tagline = defaults.tagline;
  return merged;
}

function renderList(el, items, cls) {
  if (!el) return;
  const list = items.length ? items : ["Curated luxury experience with expert local guides."];
  el.innerHTML = list.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  if (cls) el.className = cls;
}

function renderPackage(pkg, related = []) {
  document.title = `${pkg.name} | Caledor DMC`;

  const heroBg = document.getElementById("pkgHeroBg");
  const gallery = parseJson(pkg.gallery_json);
  const heroImage = pkg.image_url || gallery[0]?.url || gallery[0]?.image_url || gallery[0];
  if (heroBg && heroImage) {
    const url = assetUrl(typeof heroImage === "string" ? heroImage : heroImage.url, pkg.updated_at);
    if (url) heroBg.style.backgroundImage = `url("${url.replace(/"/g, "%22")}")`;
  }

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el && val) el.textContent = val;
  };

  setText("pkgBadge", packageCountryLabel(pkg));
  setText("pkgTitle", pkg.name);
  setText("pkgTagline", pkg.tagline || pkg.description?.slice(0, 140));
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
    itineraryEl.innerHTML = days.map((day) => `
      <article class="itinerary-day">
        <div class="day-badge">${escapeHtml(String(day.day || ""))}</div>
        <div>
          <h3>${escapeHtml(day.title || `Day ${day.day}`)}</h3>
          <p>${escapeHtml(day.description || "")}</p>
        </div>
      </article>`).join("");
  }

  const galleryEl = document.getElementById("pkgGallery");
  if (galleryEl) {
    galleryEl.innerHTML = gallery.map((item) => {
      const src = assetUrl(item.url || item.image_url || item, pkg.updated_at);
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(item.alt || pkg.name)}" loading="lazy" />`;
    }).join("");
  }

  const relatedEl = document.getElementById("pkgRelated");
  if (relatedEl) {
    const items = related.length ? related : (window.CALEDOR_PACKAGE_DEFAULTS?.getRelated?.(pkg.slug) || []);
    relatedEl.innerHTML = items.slice(0, 3).map((item) => {
      const img = assetUrl(item.image_url, item.updated_at)
        || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85";
      const country = packageCountryLabel(item);
      return `
      <article class="related-card">
        <a class="related-card-link featured-experience-card" href="/package/${encodeURIComponent(item.slug)}">
          <div class="related-card-media featured-card-media">
            <img src="${escapeHtml(img)}" alt="${escapeHtml(item.name)}" loading="lazy" />
            <span class="featured-country-tag">${escapeHtml(country)}</span>
          </div>
          <div class="related-card-body featured-card-body">
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.tagline || item.description?.slice(0, 100) || "")}</p>
          </div>
        </a>
      </article>`;
    }).join("");
  }

  const ctaCopy = document.getElementById("pkgCtaCopy");
  if (ctaCopy) {
    ctaCopy.textContent = `Speak with our travel specialists to tailor ${pkg.name} for your clients.`;
  }
}

async function loadPackage() {
  const slug = getSlug();
  const defaults = getDefaultPackage(slug);

  try {
    const data = await fetchJson(`/packages/${encodeURIComponent(slug)}`);
    const pkg = mergePackage(data.package || {}, defaults || {});
    const related = (data.related || []).length
      ? data.related.map((r) => mergePackage(r, getDefaultPackage(r.slug) || {}))
      : window.CALEDOR_PACKAGE_DEFAULTS?.getRelated?.(slug) || [];
    renderPackage(pkg, related);
  } catch {
    if (defaults) {
      renderPackage(defaults, window.CALEDOR_PACKAGE_DEFAULTS?.getRelated?.(slug) || []);
      return;
    }
    document.getElementById("packageDetailRoot").innerHTML = `
      <section class="section-block"><div class="container">
        <h2>Package not found</h2>
        <p style="color:var(--muted)">This experience may have been removed or the link is incorrect.</p>
        <a class="button primary" href="/#packages">View Packages</a>
      </div></section>`;
  }
}

function connectLiveUpdates() {
  if (typeof io === "undefined") return;
  const socket = window.CALEDOR_CONFIG?.connectSocket?.() ?? io();
  socket.on("package:updated", () => loadPackage());
  socket.on("package:deleted", () => loadPackage());
}

document.addEventListener("DOMContentLoaded", () => {
  loadPackage();
  connectLiveUpdates();
  if (window.SiteChrome) SiteChrome.init({ scroll: true });
});
