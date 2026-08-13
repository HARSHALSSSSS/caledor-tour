const API = window.CALEDOR_CONFIG?.apiBase ?? "/api";
const TOKEN_KEY = "caledor_token";

const loginScreen = document.getElementById("loginScreen");
const appShell = document.getElementById("appShell");
const sidebarNav = document.getElementById("sidebarNav");
const view = document.getElementById("view");
const crumbs = document.getElementById("crumbs");
const pageTitle = document.getElementById("pageTitle");
const topbarActions = document.getElementById("topbarActions");
const stickyFooter = document.getElementById("stickyFooter");
const toast = document.getElementById("toast");

let token = localStorage.getItem(TOKEN_KEY) || "";
let currentUser = null;

/** Tracks which package is selected in Package Settings after save/load. */
const packageUiState = { selectedPackageId: "" };

/** Saved HTML snapshots for Discard — restores only the current screen, not the whole admin. */
const viewSnapshots = new Map();

const routes = [
  { id: "overview", label: "Dashboard", icon: "dashboard", title: "Dashboard Overview", crumbs: ["Admin", "Overview"] },
  { id: "cms-settings/home", label: "CMS Settings", icon: "settings", title: "CMS Settings", crumbs: ["Admin", "CMS Settings"] },
  { id: "package-settings", label: "Package Settings", icon: "package", title: "Package Settings", crumbs: ["Admin", "Package Settings"] },
  { id: "user-management", label: "User Management", icon: "users", title: "User Management", crumbs: ["Admin", "User Management"] },
  { id: "gallery", label: "Gallery", icon: "gallery", title: "Gallery", crumbs: ["Admin", "Gallery"] },
  { id: "faq-management", label: "FAQ Management", icon: "faq", title: "FAQ Management", crumbs: ["Admin", "FAQ Management"] },
  { id: "notifications", label: "Notifications", icon: "bell", title: "Notifications", crumbs: ["Admin", "Notifications"] },
];

const cmsTabs = [
  { id: "home", label: "Home Page" },
  { id: "about-us", label: "About Us" },
  { id: "contact", label: "Contact" },
  { id: "blog", label: "Blog" },
  { id: "packages-page", label: "Featured Experiences" },
  { id: "footer", label: "Footer" },
];

const icons = {
  dashboard: "M4 13h6V4H4zm10 7h6V10h-6zM4 21h6v-6H4zm10-9h6V4h-6z",
  settings: "M4 7h16M4 12h16M4 17h16M7 7v10M17 12v5",
  package: "M12 2 4 6v12l8 4 8-4V6zm0 0v20M4 6l8 4 8-4",
  banner: "M4 6h16v12H4zm3 3h10M7 11h6M7 15h4",
  users: "M16 19a4 4 0 0 0-8 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7 7a3 3 0 0 0-3-3h-1M5 19a3 3 0 0 1 3-3h1",
  booking: "M7 3v4M17 3v4M4 8h16M6 12h4m-4 4h4m6-4h4m-4 4h4M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  gallery: "M4 5h16v14H4zM8 9h.01M4 15l4-4 4 4 3-3 5 5",
  faq: "M8 9h8M8 13h6M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
  bell: "M6 17h12l-1.5-2.5V11a4.5 4.5 0 0 0-9 0v3.5zM10.5 19a1.5 1.5 0 0 0 3 0",
  analytics: "M5 19V9M12 19V5M19 19v-7",
};

async function overviewView() {
  let stats = {
    activePackages: 0,
    totalUsers: 0,
    unreadContacts: 0,
    unreadNotifications: 0,
  };

  let contacts = [];
  try {
    const [live, contactData] = await Promise.all([
      api("/dashboard/stats"),
      api("/contact").catch(() => ({ submissions: [] })),
    ]);
    stats = { ...stats, ...live };
    contacts = contactData.submissions || [];
  } catch {
    // show empty state
  }

  const quickLinks = [
    ["CMS Settings", "#cms-settings/home", "Edit homepage hero, about, footer, and more"],
    ["Package Settings", "#package-settings", "Manage featured experiences and detail pages"],
    ["Gallery", "#gallery", "Upload photos for the homepage gallery"],
    ["FAQ Management", "#faq-management", "Update questions shown on the website"],
  ];

  return `
    <section class="content-grid">
      <div class="stats-grid">
        <article class="stat-card">
          <div class="stat-label">Active Packages</div>
          <div class="stat-value">${Number(stats.activePackages || 0).toLocaleString()}</div>
        </article>
        <article class="stat-card">
          <div class="stat-label">Admin Users</div>
          <div class="stat-value">${Number(stats.totalUsers || 0).toLocaleString()}</div>
        </article>
        <article class="stat-card">
          <div class="stat-label">Unread Enquiries</div>
          <div class="stat-value">${Number(stats.newSubmissions || stats.unreadContacts || 0).toLocaleString()}</div>
        </article>
      </div>

      <div class="section-card-grid">
        ${quickLinks.map(([title, href, copy]) => `
          <a class="section-card" href="${href}" style="text-decoration:none;color:inherit">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(copy)}</p>
          </a>`).join("")}
      </div>

      <article class="table-panel">
        <div class="table-head">
          <div>
            <h2 class="panel-title">Recent Enquiries</h2>
            <p class="panel-subtitle">Latest messages from the website contact form</p>
          </div>
          <a class="table-link" href="#notifications">View All -></a>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${contacts.length ? contacts.slice(0, 5).map((s) => `
            <tr>
              <td>${escapeHtml(s.name)}</td>
              <td>${escapeHtml(s.email)}</td>
              <td>${escapeHtml((s.message || "").slice(0, 72))}${(s.message || "").length > 72 ? "…" : ""}</td>
              <td><span class="status ${escapeHtml(s.status || "unread")}">${escapeHtml(s.status || "unread")}</span></td>
            </tr>`).join("") : '<tr><td colspan="4">No enquiries yet</td></tr>'}
          </tbody>
        </table>
      </article>
    </section>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function apiHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

const apiCache = new Map();
const API_CACHE_TTL_MS = 60000;
let renderGeneration = 0;

function invalidateApiCache(match = "") {
  if (!match) {
    apiCache.clear();
    return;
  }
  for (const key of [...apiCache.keys()]) {
    if (key.includes(match)) apiCache.delete(key);
  }
}

async function api(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const bust = Boolean(options.bust);
  const canCache = method === "GET" && !bust;
  delete options.bust;

  if (canCache) {
    const hit = apiCache.get(path);
    if (hit && Date.now() - hit.at < API_CACHE_TTL_MS) {
      return hit.data;
    }
  }

  const res = await fetch(`${API}${path}`, { headers: apiHeaders(), ...options });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || res.statusText || "Request failed");
  }
  const data = await res.json();

  if (canCache) {
    apiCache.set(path, { at: Date.now(), data });
  } else if (method !== "GET") {
    apiCache.clear();
  }

  return data;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
}

function icon(name) {
  return `<span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${icons[name] || icons.dashboard}"></path></svg></span>`;
}

function crumbsHtml(parts) {
  return parts.map((part, index) => (index === 0 ? `<span>${part}</span>` : escapeHtml(part))).join(" > ");
}

function switchHtml(on = true) {
  return `<span class="switch ${on ? "on" : ""}" role="switch" aria-checked="${on}" tabindex="0"></span>`;
}

function actionButton(label, kind = "secondary", action = "") {
  const dataAction = action || label.toLowerCase().replace(/\s+/g, "-");
  return `<button class="btn ${kind}" type="button" data-action="${dataAction}">${escapeHtml(label)}</button>`;
}

function field(label, value = "", placeholder = "") {
  return `<div class="field"><label>${escapeHtml(label)}</label><input value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" /></div>`;
}

function textareaField(label, value = "", placeholder = "") {
  return `<div class="field-full"><label>${escapeHtml(label)}</label><textarea placeholder="${escapeHtml(placeholder)}">${escapeHtml(value)}</textarea></div>`;
}

function selectField(label, options, value) {
  return `<div class="field"><label>${escapeHtml(label)}</label><select>${options.map((item) => `<option${item === value ? " selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select></div>`;
}

function imageUploader(label, hint) {
  return `
    <div class="field-full">
      <label>${escapeHtml(label)}</label>
      <div class="image-uploader">
        <div class="thumb"></div>
        <div class="image-copy">
          <button class="btn secondary" type="button" data-action="change-image">Change Image</button>
          <span class="settings-copy">${escapeHtml(hint)}</span>
        </div>
      </div>
    </div>`;
}

function tagRow(items = []) {
  return `<div class="tag-row">${items.map((item) => `<span class="tag-pill">${escapeHtml(item)} <span class="remove">x</span></span>`).join("")}</div>`;
}

function featureRow(title, description, color = "gold") {
  return `
    <div class="feature-row">
      <span class="dot" style="background:${color};"></span>
      <div class="field"><label>Feature Title</label><input value="${escapeHtml(title)}" /></div>
      <div class="field"><label>Description</label><input value="${escapeHtml(description)}" /></div>
      <button class="action-icon danger" type="button" data-action="delete-row">x</button>
    </div>`;
}

function section(title, subtitle, body, toggleOn = true) {
  return `
    <article class="settings-panel">
      <div class="settings-head">
        <div>
          <h2 class="settings-title">${escapeHtml(title)}</h2>
          ${subtitle ? `<p class="panel-subtitle">${escapeHtml(subtitle)}</p>` : ""}
        </div>
        <div class="toggle-row" style="min-height:32px; padding-inline:10px;">
          <span class="settings-copy">Display Section</span>
          ${switchHtml(toggleOn)}
        </div>
      </div>
      <div class="settings-body">${body}</div>
    </article>`;
}

async function cmsView(tab) {
  const { TAB_RENDERERS, TAB_USES_SETTINGS, collectCms, collectSettings } = window.CmsSchema;
  const tabs = cmsTabs
    .map((item) => `<button class="tab ${item.id === tab ? "active" : ""}" data-tab="${item.id}" type="button">${item.label}</button>`)
    .join("");

  const needsSettings = TAB_USES_SETTINGS.has(tab) || tab === "footer";
  const needsPackages = tab === "packages-page";

  const [cmsResult, pkgResult, settingsResult] = await Promise.all([
    api(`/cms/${tab}`).catch(() => ({ sections: {} })),
    needsPackages ? api("/packages?active=false").catch(() => ({ packages: [] })) : Promise.resolve({ packages: [] }),
    needsSettings ? api("/settings").catch(() => ({ settings: {} })) : Promise.resolve({ settings: {} }),
  ]);

  const sections = cmsResult.sections || {};
  const packages = pkgResult.packages || [];
  const settings = settingsResult.settings || {};

  const renderer = TAB_RENDERERS[tab];
  let content = renderer ? renderer(sections, settings, packages) : "";

  if (tab === "blog") {
    content += await window.AdminEntities.blogView(api, true);
  }

  return `
    <section class="content-grid" data-cms-tab="${tab}">
      <div class="tabs" role="tablist" aria-label="CMS sections">${tabs}</div>
      ${content}
    </section>`;
}

async function saveCmsTab(tab) {
  const viewEl = document.getElementById("view");
  const { collectCms, collectSettings, TAB_USES_SETTINGS } = window.CmsSchema;
  const sections = collectCms(viewEl);
  await api(`/cms/${tab}`, { method: "PUT", body: JSON.stringify({ sections }) });

  if (TAB_USES_SETTINGS.has(tab) || tab === "footer") {
    const settings = collectSettings(viewEl);
    if (tab === "contact" && sections.info) {
      settings.contact = settings.contact || {};
      if (sections.info.email_1) settings.contact.contact_email = sections.info.email_1;
      if (sections.info.phone_1) settings.contact.contact_phone = sections.info.phone_1;
      if (sections.info.address) settings.contact.address = sections.info.address;
    }
    if (Object.keys(settings).length) {
      await api("/settings", { method: "PUT", body: JSON.stringify({ settings }) });
    }
  }

  if (tab === "blog") {
    await saveBlogForm();
  }

  captureViewSnapshot(getRoute().raw);
}

async function saveBlogForm() {
  const form = document.getElementById("blogForm");
  if (!form) return null;
  const data = formData(form);
  if (!String(data.title || "").trim()) return null;
  const payload = {
    title: data.title,
    category: data.category,
    image_url: data.image_url,
    excerpt: data.excerpt,
    content: data.content,
    published: data.published !== "0",
    featured: true,
  };
  if (data.id) {
    return api(`/blog/${data.id}`, { method: "PUT", body: JSON.stringify(payload) });
  }
  return api("/blog", { method: "POST", body: JSON.stringify(payload) });
}

async function saveFaqSection() {
  const viewEl = document.getElementById("view");
  const sections = window.CmsSchema.collectCms(viewEl);
  await api("/cms/faq", { method: "PUT", body: JSON.stringify({ sections }) });
}

function simpleSection(title, subtitle, cards = [], body = "") {
  return `
    <section class="content-grid">
      <div class="section-card-grid">
        ${cards.map(([head, copy]) => `<article class="section-card"><h3>${escapeHtml(head)}</h3><p>${escapeHtml(copy)}</p></article>`).join("")}
      </div>
      ${body}
    </section>`;
}

function packageView() {
  return window.AdminEntities.packagesView(api, packageUiState.selectedPackageId);
}

function captureViewSnapshot(routeKey) {
  const viewEl = document.getElementById("view");
  if (!viewEl || !routeKey) return;
  viewSnapshots.set(routeKey, viewEl.innerHTML);
}

function rehydrateView(routeInfo) {
  document.querySelectorAll(".tab").forEach((tab) => {
    if (tab._tabWired) return;
    tab._tabWired = true;
    tab.addEventListener("click", () => {
      if (!tab.dataset.tab) return;
      window.location.hash = `cms-settings/${tab.dataset.tab}`;
    });
  });

  wireDynamicHandlers();
  if (window.CmsUI) window.CmsUI.wire(document.getElementById("view"));

  if (routeInfo.section === "package-settings" && window.PackageEditor) {
    window.PackageEditor.wire(api, render, {
      onFormLoaded: () => captureViewSnapshot(routeInfo.raw),
    });
  }
  if (routeInfo.section === "cms-settings" && routeInfo.tab === "packages-page") {
    wireCmsPackagePreview();
  }
}

function discardCurrentViewChanges() {
  const routeInfo = getRoute();
  const snap = viewSnapshots.get(routeInfo.raw);
  const viewEl = document.getElementById("view");
  if (!snap || !viewEl) {
    render();
    showToast("Changes discarded");
    return;
  }
  viewEl.innerHTML = snap;
  rehydrateView(routeInfo);
  if (routeInfo.section === "package-settings" && window.PackageEditor) {
    window.PackageEditor.wire(api, render, {
      onFormLoaded: () => captureViewSnapshot(routeInfo.raw),
    });
  }
  showToast("Unsaved changes discarded");
}

function userView() {
  return window.AdminEntities.usersView(api);
}

function galleryView() {
  return window.AdminEntities.galleryView(api);
}

function faqManagementView() {
  return window.AdminEntities.faqView(api);
}

function notificationsView() {
  return window.AdminEntities.notificationsView(api);
}

function renderSidebar(active) {
  sidebarNav.innerHTML = routes
    .map((route) => `
      <a class="nav-item ${active.startsWith(route.id.split("/")[0]) ? "active" : ""}" href="#${route.id}" data-route="${route.id}">
        ${icon(route.icon)}
        <span>${escapeHtml(route.label)}</span>
      </a>`)
    .join("");
}

function getRoute() {
  const raw = window.location.hash.replace(/^#/, "") || "overview";
  if (raw === "banner-settings" || raw === "seo-settings") {
    window.location.replace("#cms-settings/home");
    return { section: "cms-settings", tab: "home", raw: "cms-settings/home" };
  }
  if (raw === "booking-management") {
    window.location.replace("#overview");
    return { section: "overview", tab: "home", raw: "overview" };
  }
  const [section, tab] = raw.split("/");
  return { section, tab: tab || "home", raw };
}

function sitePublicUrl(hash = "") {
  return window.AdminNav?.siteUrl(hash) || `${window.location.origin}/`;
}

function packagePublicUrl(slug) {
  return window.AdminNav?.packageUrl(slug) || "";
}

function wireCmsPackagePreview() {
  const select = document.getElementById("cmsPackagePreviewSelect");
  const link = document.getElementById("cmsPackagePreviewLink");
  if (!select || !link) return;

  const sync = () => window.AdminNav?.syncPackagePreviewLink("cmsPackagePreviewLink", select.value.trim());

  if (!select._cmsPreviewWired) {
    select._cmsPreviewWired = true;
    select.addEventListener("change", sync);
  }
  sync();

  if (!link._cmsPreviewWired) {
    link._cmsPreviewWired = true;
    link.addEventListener("click", (e) => {
      if (!select.value.trim()) {
        e.preventDefault();
        showToast("Choose a package first");
      }
    });
  }
}

function prefetchAdminData() {
  const paths = [
    "/dashboard/stats",
    "/contact",
    "/cms/home",
    "/cms/about-us",
    "/packages?active=false",
    "/gallery",
    "/faqs",
    "/settings",
    "/notifications",
  ];
  paths.forEach((path) => {
    api(path).catch(() => {});
  });
}

function setLoggedIn(isLoggedIn) {
  document.body.classList.toggle("login-mode", !isLoggedIn);
  appShell.hidden = !isLoggedIn;
}

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Login failed");

  token = data.token;
  currentUser = data.user;
  localStorage.setItem(TOKEN_KEY, token);
  updateProfile();
  setLoggedIn(true);
  prefetchAdminData();
  render();
}

function logout() {
  token = "";
  currentUser = null;
  localStorage.removeItem(TOKEN_KEY);
  setLoggedIn(false);
}

async function checkAuth() {
  if (!token) {
    setLoggedIn(false);
    return;
  }

  try {
    const data = await api("/auth/me");
    currentUser = data.user;
    updateProfile();
    setLoggedIn(true);
    connectAdminSocket();
    prefetchAdminData();
    render();
  } catch {
    logout();
  }
}

function updateProfile() {
  if (!currentUser) return;
  document.getElementById("avatarInitials").textContent = "AD";
  document.getElementById("profileName").textContent = "Admin";
  document.getElementById("profileRole").textContent = "Administrator";
}

function setTopbar(route) {
  pageTitle.textContent = route.title;
  crumbs.innerHTML = crumbsHtml(route.crumbs);

  const actionMap = {
    overview: actionButton("Refresh", "secondary", "refresh-dashboard"),
    "cms-settings": `${actionButton("Preview Site", "secondary", "preview")}${actionButton("Save Changes", "primary", "save-changes")}`,
    "package-settings": `${actionButton("Preview Site", "secondary", "preview")}${actionButton("Save Changes", "primary", "save-changes")}`,
    "user-management": "",
    gallery: actionButton("Add Image", "primary", "scroll-gallery-form"),
    "faq-management": `${actionButton("Preview FAQ", "secondary", "preview-faq")}${actionButton("Save Section Settings", "primary", "save-faq-section")}`,
    notifications: "",
  };

  topbarActions.innerHTML = actionMap[route.section] || actionButton("Save Changes", "primary", "save-changes");
}

function markSaved() {
  const el = document.getElementById("savedText");
  if (el) el.textContent = `Last saved: ${new Date().toLocaleTimeString()}`;
}

async function handleSaveAction() {
  const routeInfo = getRoute();
  try {
    if (routeInfo.section === "cms-settings") {
      await saveCmsTab(routeInfo.tab);
      showToast("Saved — changes are live on the website");
      markSaved();
      if (routeInfo.tab === "blog") render();
      return;
    }
    if (routeInfo.section === "package-settings") {
      await savePackageForm();
      showToast("Package saved — live on the website");
      markSaved();
      await refreshPackageSettingsView();
      return;
    }
    if (routeInfo.section === "faq-management") {
      await saveFaqSection();
      showToast("FAQ section settings saved — live on website");
      markSaved();
      return;
    }
    showToast("Saved successfully");
  } catch (err) {
    showToast(err.message || "Save failed");
  }
}

async function savePackageForm() {
  const form = document.getElementById("packageForm");
  if (!form || !window.PackageEditor) throw new Error("Open Package Settings first");
  const payload = window.PackageEditor.collectFromForm(form);
  const hiddenId = String(form.querySelector('[name="id"]')?.value || "").trim();
  const isCreate = form.dataset.mode === "create" || !hiddenId;
  delete payload.id;

  if (!payload.name?.trim()) throw new Error("Package name is required");
  if (!payload.slug?.trim()) payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!payload.image_url) {
    throw new Error("Please upload or paste a Hero Image before saving");
  }

  let saved;
  if (isCreate) {
    saved = await api("/packages", { method: "POST", body: JSON.stringify(payload) });
  } else {
    saved = await api(`/packages/${hiddenId}`, { method: "PUT", body: JSON.stringify(payload) });
  }

  if (saved?.package) {
    packageUiState.selectedPackageId = String(saved.package.id || "");
    if (window.PackageEditor?.loadIntoForm) {
      window.PackageEditor.loadIntoForm(saved.package);
    }
    captureViewSnapshot(getRoute().raw);
  }
  return saved;
}

async function refreshPackageSettingsView() {
  packageUiState.selectedPackageId = packageUiState.selectedPackageId || "";
  invalidateApiCache("/packages");
  await render();
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

let entityHandlersWired = false;

function wireEntityHandlers() {
  if (entityHandlersWired) return;
  entityHandlersWired = true;

  document.addEventListener("submit", async (e) => {
    const form = e.target;
    if (!form || form.tagName !== "FORM") return;
    if (form.id === "packageForm") {
      e.preventDefault();
      try {
        await savePackageForm();
        showToast("Package saved — live on the website");
        markSaved();
        await refreshPackageSettingsView();
      } catch (err) {
        showToast(err.message || "Save failed");
      }
      return;
    }
    if (form.id === "galleryForm") {
      e.preventDefault();
      const data = formData(e.target);
      const mediaType = data.media_type === "video" ? "video" : "image";
      const mediaUrl = mediaType === "video"
        ? (data.video_url || data.image_url)
        : data.image_url;
      if (!mediaUrl) {
        showToast(mediaType === "video" ? "Upload or paste a video URL" : "Upload or paste an image URL");
        return;
      }
      try {
        await api("/gallery", { method: "POST", body: JSON.stringify({
          title: data.title,
          image_url: mediaUrl,
          video_url: mediaType === "video" ? mediaUrl : "",
          poster_url: data.poster_url || "",
          media_type: mediaType,
          alt_text: data.alt_text || data.title,
          album: data.album || "General",
          sort_order: Number(data.sort_order) || 0,
        }) });
        showToast(`${mediaType === "video" ? "Video" : "Image"} added — live on website`);
        render();
      } catch (err) {
        showToast(err.message);
      }
      return;
    }
    if (form.id === "blogForm") {
      e.preventDefault();
      try {
        const saved = await saveBlogForm();
        if (!saved) {
          showToast("Enter a post title first");
          return;
        }
        showToast("Post saved — live on the website");
        render();
      } catch (err) {
        showToast(err.message);
      }
      return;
    }
    if (form.id === "faqForm") {
      e.preventDefault();
      const data = formData(e.target);
      const payload = {
        question: data.question,
        answer: data.answer,
        category: data.category || "General",
        sort_order: Number(data.sort_order) || 0,
        active: data.active === "1",
      };
      try {
        if (data.id) {
          await api(`/faqs/${data.id}`, { method: "PUT", body: JSON.stringify(payload) });
          showToast("FAQ updated");
        } else {
          await api("/faqs", { method: "POST", body: JSON.stringify(payload) });
          showToast("FAQ created");
        }
        render();
      } catch (err) {
        showToast(err.message);
      }
    }
  });

  document.addEventListener("change", async (e) => {
    const fileInput = e.target?.classList?.contains("blog-row-file") ? e.target : null;
    if (!fileInput) return;
    const file = fileInput.files?.[0];
    const id = fileInput.dataset.id;
    if (!file || !id) return;
    try {
      if (!window.CmsUI?.uploadImage) throw new Error("Upload is not available");
      const url = await window.CmsUI.uploadImage(file);
      await api(`/blog/${id}`, { method: "PUT", body: JSON.stringify({ image_url: url }) });
      showToast("Image updated — live on the website");
      render();
    } catch (err) {
      showToast(err.message || "Upload failed");
    } finally {
      fileInput.value = "";
    }
  });

  document.addEventListener("click", async (e) => {
    if (!token) return;
    const button = e.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;

    if (action === "save-changes" || action === "publish") {
      e.preventDefault();
      await handleSaveAction();
      return;
    }
      if (action === "preview") {
        window.open(sitePublicUrl(), "_blank", "noopener");
        return;
      }
      if (action === "preview-faq") {
        window.open(sitePublicUrl("faq"), "_blank", "noopener");
        return;
      }
      if (action === "preview-package-detail") {
        e.preventDefault();
        try {
          window.AdminNav.openPackagePreview();
        } catch (err) {
          showToast(err.message || "Select a package first");
        }
        return;
      }
      if (action === "discard-changes") {
        e.preventDefault();
        discardCurrentViewChanges();
        return;
      }
      if (action === "refresh-dashboard") {
        render();
        showToast("Dashboard refreshed");
        return;
      }
      if (action === "scroll-gallery-form") {
        document.getElementById("galleryForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
        document.querySelector('#galleryForm input[name="title"]')?.focus();
        return;
      }
      if (action === "change-image") {
        const uploader = button.closest(".image-uploader");
        const input = uploader?.querySelector("input.cms-image-url, input[data-cms-key]");
        const url = prompt("Enter image URL:", input?.value || "");
        if (url == null || !input) return;
        input.value = url;
        input.dispatchEvent(new Event("input"));
        return;
      }
      if (action === "delete-row") {
        button.closest(".feature-row, [data-list], .itinerary-row, .list-item-row, .gallery-row-editor")?.remove();
        return;
      }
      if (action === "delete-package") {
        const pkgId = button.dataset.id || document.getElementById("packageForm")?.querySelector('[name="id"]')?.value;
        if (!pkgId) {
          showToast("Select a package to delete");
          return;
        }
        if (!confirm("Delete this package permanently? It will be removed from the website.")) return;
        try {
          await api(`/packages/${pkgId}`, { method: "DELETE" });
          showToast("Package deleted — removed from website");
          if (String(packageUiState.selectedPackageId) === String(pkgId)) {
            packageUiState.selectedPackageId = "";
          }
          await refreshPackageSettingsView();
        } catch (err) {
          showToast(err.message);
        }
        return;
      }
      if (action === "edit-package") {
        api(`/packages/${button.dataset.id}`).then(({ package: pkg }) => {
          packageUiState.selectedPackageId = String(pkg.id || "");
          window.PackageEditor.loadIntoForm(pkg);
          if (window.CmsUI) window.CmsUI.wire(document.getElementById("view"));
          captureViewSnapshot(getRoute().raw);
          document.getElementById("packageForm")?.scrollIntoView({ behavior: "smooth" });
        }).catch((err) => showToast(err.message));
        return;
      }
      if (action === "reset-package-form") {
        window.PackageEditor?.resetFormForCreate?.();
        return;
      }
      if (action === "delete-gallery") {
        if (!confirm("Remove this image?")) return;
        try {
          await api(`/gallery/${button.dataset.id}`, { method: "DELETE" });
          showToast("Image removed");
          render();
        } catch (err) {
          showToast(err.message);
        }
        return;
      }
      if (action === "delete-blog") {
        if (!confirm("Delete this post?")) return;
        try {
          await api(`/blog/${button.dataset.id}`, { method: "DELETE" });
          showToast("Post deleted");
          render();
        } catch (err) {
          showToast(err.message);
        }
        return;
      }
      if (action === "change-blog-image") {
        document.querySelector(`.blog-row-file[data-id="${button.dataset.id}"]`)?.click();
        return;
      }
      if (action === "edit-blog") {
        api(`/blog/${button.dataset.id}`).then(({ post }) => {
          const form = document.getElementById("blogForm");
          if (!form) return;
          const imageUrl = window.AdminEntities?.blogDisplayImage?.(post) || post.image_url || "";
          form.querySelector('[name="id"]').value = post.id;
          form.title.value = post.title || "";
          form.category.value = post.category || "";
          const imageInput = form.querySelector('[name="image_url"]') || document.getElementById("img-blog-post-image");
          if (imageInput) imageInput.value = imageUrl;
          if (window.CmsUI) window.CmsUI.wire(document.getElementById("view"));
          imageInput?.dispatchEvent(new Event("input"));
          form.excerpt.value = post.excerpt || "";
          form.content.value = post.content || "";
          form.published.value = post.published ? "1" : "0";
          form.scrollIntoView({ behavior: "smooth", block: "start" });
        }).catch((err) => showToast(err.message));
        return;
      }
      if (action === "reset-blog-form") {
        const form = document.getElementById("blogForm");
        form?.reset();
        const imageInput = form?.querySelector('[name="image_url"]') || document.getElementById("img-blog-post-image");
        if (imageInput) {
          imageInput.value = "";
          imageInput.dispatchEvent(new Event("input"));
        }
        return;
      }
      if (action === "save-packages-visibility") {
        try {
          if (!window.PackageEditor?.savePackagesSectionVisibility) throw new Error("Package Settings not loaded");
          const visible = await window.PackageEditor.savePackagesSectionVisibility(api);
          showToast(visible ? "Packages section is visible on the website" : "Packages section hidden on the website");
          markSaved();
        } catch (err) {
          showToast(err.message);
        }
        return;
      }
      if (action === "save-faq-section") {
        try {
          await saveFaqSection();
          showToast("FAQ section settings saved — live on website");
          markSaved();
        } catch (err) {
          showToast(err.message);
        }
        return;
      }
      if (action === "delete-faq") {
        if (!confirm("Delete this FAQ?")) return;
        try {
          await api(`/faqs/${button.dataset.id}`, { method: "DELETE" });
          showToast("FAQ deleted");
          render();
        } catch (err) {
          showToast(err.message);
        }
        return;
      }
      if (action === "edit-faq") {
        api(`/faqs/${button.dataset.id}`).then(({ faq }) => {
          const form = document.getElementById("faqForm");
          if (!form) return;
          form.querySelector('[name="id"]').value = faq.id;
          form.querySelector('[name="question"]').value = faq.question || "";
          form.querySelector('[name="answer"]').value = faq.answer || "";
          form.querySelector('[name="category"]').value = faq.category || "General";
          form.querySelector('[name="sort_order"]').value = String(faq.sort_order ?? 0);
          const activeSelect = form.querySelector('[name="active"]');
          if (activeSelect) activeSelect.value = faq.active ? "1" : "0";
          form.scrollIntoView({ behavior: "smooth", block: "start" });
        }).catch((err) => showToast(err.message));
        return;
      }
      if (action === "reset-faq-form") {
        const form = document.getElementById("faqForm");
        if (!form) return;
        form.reset();
        form.querySelector('[name="id"]').value = "";
        form.querySelector('[name="active"]').value = "1";
        return;
      }
      if (action === "mark-read") {
        try {
          await api(`/notifications/${button.dataset.id}/read`, { method: "PUT" });
          render();
        } catch (err) {
          showToast(err.message);
        }
        return;
      }
      if (action === "mark-all-read") {
        try {
          await api("/notifications/read-all", { method: "PUT" });
          render();
          showToast("All marked read");
        } catch (err) {
          showToast(err.message);
        }
        return;
      }
    });
}

function wireDynamicHandlers() {
  document.querySelectorAll("[data-action='update-contact-status']").forEach((select) => {
    if (select._wired) return;
    select._wired = true;
    select.addEventListener("change", async () => {
      try {
        await api(`/contact/${select.dataset.id}`, {
          method: "PUT",
          body: JSON.stringify({ status: select.value }),
        });
        showToast("Submission updated");
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  document.querySelectorAll("[data-cms-section][data-cms-key]").forEach((input) => {
    if (input._thumbWired || !input.closest(".image-uploader")) return;
    input._thumbWired = true;
    input.addEventListener("input", () => {
      const thumb = input.closest(".image-uploader")?.querySelector(".thumb");
      if (thumb && input.value) {
        thumb.style.backgroundImage = `url('${input.value}')`;
        thumb.style.backgroundSize = "cover";
      }
    });
  });

  const galleryMediaType = document.getElementById("galleryMediaType");
  if (galleryMediaType && !galleryMediaType._wired) {
    galleryMediaType._wired = true;
    const syncGalleryFields = () => {
      const isVideo = galleryMediaType.value === "video";
      const imageFields = document.getElementById("galleryImageFields");
      const videoFields = document.getElementById("galleryVideoFields");
      if (imageFields) imageFields.hidden = isVideo;
      if (videoFields) videoFields.hidden = !isVideo;
    };
    galleryMediaType.addEventListener("change", syncGalleryFields);
    syncGalleryFields();
  }
}

async function connectAdminSocket() {
  if (typeof io === "undefined") {
    try {
      await window.CALEDOR_CONFIG?.ensureSocketIoClient?.();
    } catch (err) {
      console.warn("Admin Socket.IO client load failed:", err?.message || err);
    }
  }
  if (typeof io === "undefined") return;

  const socket = window.CALEDOR_CONFIG?.connectSocket?.() ?? io();
  socket.emit("join:admin");
  socket.on("contact:new", () => {
    if (getRoute().section === "notifications" || getRoute().section === "overview") render();
  });
}

async function render() {
  if (!token) return;

  const myGen = ++renderGeneration;
  const routeInfo = getRoute();
  const section = routeInfo.section === "cms-settings" ? "cms-settings/home" : routeInfo.section;
  renderSidebar(section);

  const route = routeInfo.section === "cms-settings"
    ? { section: "cms-settings", title: "CMS Settings", crumbs: ["Admin", "CMS Settings"] }
    : { ...(routes.find((item) => item.id === routeInfo.section) || routes[0]), section: routeInfo.section };
  setTopbar(route);
  stickyFooter.hidden = !["cms-settings", "package-settings"].includes(routeInfo.section);

  const views = {
    overview: overviewView,
    "cms-settings": () => cmsView(routeInfo.tab),
    "package-settings": packageView,
    "user-management": userView,
    gallery: galleryView,
    "faq-management": faqManagementView,
    notifications: notificationsView,
  };

  const viewRenderer = views[routeInfo.section] || overviewView;

  // Keep previous section visible with a light loading state instead of blanking the screen.
  view.classList.add("is-switching");
  if (!view.innerHTML.trim()) {
    view.innerHTML = `<div class="view-loading" role="status">Loading…</div>`;
  }

  try {
    const html = await viewRenderer();
    if (myGen !== renderGeneration) return;
    view.innerHTML = html;
  } catch (err) {
    if (myGen !== renderGeneration) return;
    view.innerHTML = `<div class="view-loading" role="alert">Could not load this section. ${escapeHtml(err.message || "")}</div>`;
  } finally {
    if (myGen === renderGeneration) view.classList.remove("is-switching");
  }

  if (myGen !== renderGeneration) return;

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (!tab.dataset.tab) return;
      window.location.hash = `cms-settings/${tab.dataset.tab}`;
    });
  });

  renderActionHooks();
  wireEntityHandlers();
  wireDynamicHandlers();
  if (window.CmsUI) window.CmsUI.wire(view);
  if (routeInfo.section === "package-settings" && window.PackageEditor) {
    window.PackageEditor.wire(api, render, {
      onFormLoaded: () => captureViewSnapshot(routeInfo.raw),
    });
    const select = document.getElementById("packageSelect");
    const finishPackageLoad = () => {
      if (myGen !== renderGeneration) return;
      captureViewSnapshot(routeInfo.raw);
    };
    if (select?.value) {
      packageUiState.selectedPackageId = String(select.value);
      api(`/packages/${select.value}`)
        .then(({ package: pkg }) => {
          if (myGen !== renderGeneration) return;
          window.PackageEditor.loadIntoForm(pkg);
          window.AdminNav?.syncPackagePreviewLink("previewPackageLink", pkg.slug || "");
        })
        .catch(() => {})
        .finally(finishPackageLoad);
    } else {
      window.AdminNav?.syncPackagePreviewLink("previewPackageLink", select?.selectedOptions?.[0]?.dataset?.slug || "");
      finishPackageLoad();
    }
  } else {
    captureViewSnapshot(routeInfo.raw);
  }
  if (routeInfo.section === "cms-settings" && routeInfo.tab === "packages-page") {
    wireCmsPackagePreview();
  }
}

function renderActionHooks() {
  // legacy alias — handlers wired in wireEntityHandlers
}

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");
  const btn = document.getElementById("loginBtn");

  if (!email || !password) {
    errorEl.textContent = "Please enter email and password";
    return;
  }

  errorEl.textContent = "";
  btn.disabled = true;
  btn.textContent = "Signing in...";

  try {
    await login(email, password);
    connectAdminSocket();
    if (!window.location.hash) window.location.hash = "overview";
  } catch (err) {
    errorEl.textContent = err.message || "Login failed";
  } finally {
    btn.disabled = false;
    btn.textContent = "Sign In";
  }
});

document.getElementById("loginPassword").addEventListener("keydown", (event) => {
  if (event.key === "Enter") document.getElementById("loginBtn").click();
});

document.getElementById("logoutBtn").addEventListener("click", logout);

window.addEventListener("hashchange", () => {
  if (token) render();
});

if (!window.location.hash) window.location.hash = "overview";
checkAuth();
