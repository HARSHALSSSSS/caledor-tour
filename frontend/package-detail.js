const API = window.CALEDOR_CONFIG?.apiBase ?? "/api";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}

function parseJson(raw, fb = []) {
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

async function fetchJson(path) {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${API}${path}${sep}_=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug") || params.get("id") || "scottish-highlands-journey";
}

function renderList(el, items, cls) {
  if (!el) return;
  el.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  if (cls) el.className = cls;
}

function renderPackage(pkg, related = []) {
  document.title = `${pkg.name} | Caledor DMC`;

  const heroBg = document.getElementById("pkgHeroBg");
  if (heroBg && pkg.image_url) heroBg.style.backgroundImage = `url("${assetUrl(pkg.image_url, pkg.updated_at)}")`;

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el && val) el.textContent = val;
  };

  setText("pkgBadge", pkg.badge || pkg.category || "EXPERIENCE");
  setText("pkgTitle", pkg.name);
  setText("pkgTagline", pkg.tagline || pkg.description?.slice(0, 120));
  setText("pkgDuration", pkg.duration || "Custom");
  setText("pkgGroupSize", pkg.group_size || "Private");
  setText("pkgDifficulty", pkg.difficulty || "Moderate");
  setText("pkgSeason", pkg.season || "Year-Round");
  setText("pkgAboutLabel", pkg.about_label || "The Expedition");
  setText("pkgItineraryHeading", pkg.itinerary_heading || "A Curated Day-by-Day Path");
  setText("pkgGalleryHeading", pkg.gallery_heading || "Gallery");

  const desc = document.getElementById("pkgDescription");
  if (desc) {
    const paragraphs = String(pkg.description || "").split(/\n\n+/).filter(Boolean);
    desc.innerHTML = paragraphs.length
      ? paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")
      : `<p>${escapeHtml(pkg.description || "")}</p>`;
  }

  renderList(document.getElementById("pkgHighlights"), parseJson(pkg.highlights));
  renderList(document.getElementById("pkgInclusions"), parseJson(pkg.inclusions), "included-list");
  renderList(document.getElementById("pkgExclusions"), parseJson(pkg.exclusions), "excluded-list");

  const itineraryEl = document.getElementById("pkgItinerary");
  const days = parseJson(pkg.itinerary);
  if (itineraryEl) {
    itineraryEl.innerHTML = days.map((day) => `
      <article class="itinerary-day">
        <div class="day-badge">${escapeHtml(day.day || "")}</div>
        <div>
          <h3>${escapeHtml(day.title || `Day ${day.day}`)}</h3>
          <p>${escapeHtml(day.description || "")}</p>
        </div>
      </article>`).join("");
  }

  const galleryEl = document.getElementById("pkgGallery");
  const gallery = parseJson(pkg.gallery_json);
  if (galleryEl) {
    galleryEl.innerHTML = gallery.map((item) =>
      `<img src="${escapeHtml(assetUrl(item.url, pkg.updated_at))}" alt="${escapeHtml(item.alt || pkg.name)}" />`).join("");
  }

  const relatedEl = document.getElementById("pkgRelated");
  if (relatedEl) {
    relatedEl.innerHTML = related.map((item) => `
      <article class="related-card">
        <img src="${escapeHtml(assetUrl(item.image_url, item.updated_at) || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85")}" alt="${escapeHtml(item.name)}" />
        <div class="related-card-body">
          <span class="badge">${escapeHtml(item.badge || item.category || "TOUR")}</span>
          <h3>${escapeHtml(item.name)}</h3>
          <a href="package-detail.html?slug=${encodeURIComponent(item.slug)}">Explore Journey →</a>
        </div>
      </article>`).join("");
  }
}

async function loadPackage() {
  const slug = getSlug();
  try {
    const data = await fetchJson(`/packages/${encodeURIComponent(slug)}`);
    renderPackage(data.package, data.related || []);
  } catch {
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
});
