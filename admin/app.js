const API = "/api";
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

const routes = [
  { id: "overview", label: "Dashboard", icon: "dashboard", title: "Dashboard Overview", crumbs: ["Admin", "Overview"] },
  { id: "cms-settings/home", label: "CMS Settings", icon: "settings", title: "CMS Settings", crumbs: ["Admin", "CMS Settings"] },
  { id: "package-settings", label: "Package Settings", icon: "package", title: "Package Settings", crumbs: ["Admin", "Package Settings"] },
  { id: "banner-settings", label: "Banner Settings", icon: "banner", title: "Banner Settings", crumbs: ["Admin", "Banner Settings"] },
  { id: "user-management", label: "User Management", icon: "users", title: "User Management", crumbs: ["Admin", "User Management"] },
  { id: "booking-management", label: "Booking Management", icon: "booking", title: "Booking Management", crumbs: ["Admin", "Booking Management"] },
  { id: "gallery", label: "Gallery", icon: "gallery", title: "Gallery", crumbs: ["Admin", "Gallery"] },
  { id: "faq-management", label: "FAQ Management", icon: "faq", title: "FAQ Management", crumbs: ["Admin", "FAQ Management"] },
  { id: "seo-settings", label: "SEO Settings", icon: "seo", title: "SEO Settings", crumbs: ["Admin", "SEO Settings"] },
  { id: "notifications", label: "Notifications", icon: "bell", title: "Notifications", crumbs: ["Admin", "Notifications"] },
  { id: "analytics", label: "Analytics", icon: "analytics", title: "Analytics", crumbs: ["Admin", "Analytics"] },
];

const cmsTabs = [
  { id: "home", label: "Home Page" },
  { id: "about-us", label: "About Us" },
  { id: "contact", label: "Contact" },
  { id: "blog", label: "Blog" },
  { id: "packages-page", label: "Packages Page" },
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
  seo: "M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0zm8-4v8m-4-4h8",
  bell: "M6 17h12l-1.5-2.5V11a4.5 4.5 0 0 0-9 0v3.5zM10.5 19a1.5 1.5 0 0 0 3 0",
  analytics: "M5 19V9M12 19V5M19 19v-7",
};

const sampleMonths = [
  ["Jan", 28, 14],
  ["Feb", 44, 26],
  ["Mar", 20, 11],
  ["Apr", 56, 36],
  ["May", 31, 18],
  ["Jun", 70, 48],
  ["Jul", 24, 15],
  ["Aug", 63, 40],
  ["Sep", 42, 24],
  ["Oct", 67, 44],
  ["Nov", 38, 22],
  ["Dec", 58, 37],
];

const sampleBookings = [
  ["#TRV-9042", "Sarah Jenkins", "Scottish Highlands Luxury Tour", "Oct 12, 2025", "confirmed", "$3,450"],
  ["#TRV-9041", "Michael Chen", "Swiss Alps Private Retreat", "Oct 15, 2025", "pending", "$5,200"],
  ["#TRV-9040", "Emma Thompson", "London Royal Escape", "Oct 10, 2025", "completed", "$1,890"],
  ["#TRV-9039", "David Miller", "Italian Heritage Grand Tour", "Nov 02, 2025", "cancelled", "$4,100"],
  ["#TRV-9038", "Robert Garcia", "French Riviera Villa Escape", "Oct 22, 2025", "confirmed", "$6,750"],
];

const sampleNotifs = [
  { type: "booking", title: "New booking received", message: "Swiss Alps Private Retreat was requested.", created_at: "2026-07-26T09:18:00Z" },
  { type: "contact", title: "New contact submission", message: "A new partnership enquiry came from London.", created_at: "2026-07-26T08:40:00Z" },
  { type: "info", title: "CMS saved", message: "Home page content updated successfully.", created_at: "2026-07-25T17:02:00Z" },
];

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

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, { headers: apiHeaders(), ...options });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || res.statusText || "Request failed");
  }
  return res.json();
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

function dashboardStats(stats) {
  const totalBookings = Number(stats.totalBookings || 0);
  const activePackages = Number(stats.activePackages || 0);
  const monthlyRevenue = Number(stats.monthlyRevenue || 0);
  const totalUsers = Number(stats.totalUsers || 0);
  const cards = [
    ["Total Bookings", totalBookings.toLocaleString(), "+12.5%", "up"],
    ["Active Packages", activePackages.toLocaleString(), "+3.2%", "up"],
    ["Monthly Revenue", `$${monthlyRevenue.toLocaleString()}`, "+18.7%", "up"],
    ["New Users", totalUsers.toLocaleString(), "-2.4%", "down"],
  ];
  return `<div class="stats-grid">${cards.map(([label, value, change, dir]) => `
    <article class="stat-card">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
      <div class="stat-change ${dir === "down" ? "down" : ""}">${change}</div>
    </article>`).join("")}</div>`;
}

function chartView() {
  const max = Math.max(...sampleMonths.map(([, bookings, views]) => bookings + views));
  return `
    <div class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Booking Trends</h2>
          <p class="panel-subtitle">Bookings vs views over the last 12 months</p>
        </div>
        <div class="chip-row">
          <span class="chip gold">Bookings</span>
          <span class="chip">Views</span>
        </div>
      </div>
      <div class="chart">
        ${sampleMonths.map(([month, bookings, views]) => {
          const total = bookings + views;
          const height = Math.max(44, Math.round((total / max) * 156));
          const bookingHeight = Math.round((bookings / total) * 100);
          const viewsHeight = Math.round((views / total) * 100);
          return `
            <div class="month">
              <div class="bar-stack" style="height:${height}px">
                <div class="bar views" style="height:${viewsHeight}%"></div>
                <div class="bar bookings" style="height:${bookingHeight}%"></div>
              </div>
              <div class="month-label">${month}</div>
            </div>`;
        }).join("")}
      </div>
    </div>`;
}

function distributionView() {
  const rows = [
    ["Luxury Adventure", 45, "#f1c61e"],
    ["Nature & Wilderness", 25, "#4e89f7"],
    ["Cultural Heritage", 20, "#18c58f"],
    ["Beach & Coastline", 10, "#ef5b59"],
  ];
  return `
    <div class="panel">
      <div class="panel-head">
        <div>
          <h2 class="panel-title">Distribution by Category</h2>
          <p class="panel-subtitle">Booking split for the active period</p>
        </div>
      </div>
      <div class="distribution">
        ${rows.map(([label, value, color]) => `
          <div class="dist-row">
            <div class="dist-label"><span>${label}</span><strong>${value}%</strong></div>
            <div class="track"><span style="width:${value}%; background:${color};"></span></div>
          </div>`).join("")}
      </div>
    </div>`;
}

function tableRows() {
  return sampleBookings.map(([id, customer, pkg, date, status, amount]) => `
    <tr>
      <td>${id}</td>
      <td><div class="customer-cell"><div class="customer-avatar">${customer.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>${escapeHtml(customer)}</div></td>
      <td>${escapeHtml(pkg)}</td>
      <td>${escapeHtml(date)}</td>
      <td><span class="status ${status}">${status}</span></td>
      <td class="amount">${amount}</td>
    </tr>`).join("");
}

async function bookingTableRows() {
  try {
    const data = await api("/bookings?limit=5");
    const bookings = data.bookings || [];
    if (!bookings.length) return tableRows();
    return bookings.map((b) => `
      <tr>
        <td>${escapeHtml(b.booking_id)}</td>
        <td><div class="customer-cell"><div class="customer-avatar">${escapeHtml(b.customer_name.split(" ").map((p) => p[0]).join("").slice(0, 2))}</div>${escapeHtml(b.customer_name)}</div></td>
        <td>${escapeHtml(b.package_name)}</td>
        <td>${escapeHtml(b.travel_date || "—")}</td>
        <td><span class="status ${escapeHtml(b.status)}">${escapeHtml(b.status)}</span></td>
        <td class="amount">${b.amount != null ? `$${Number(b.amount).toLocaleString()}` : "—"}</td>
      </tr>`).join("");
  } catch {
    return tableRows();
  }
}

async function overviewView() {
  let stats = {
    totalBookings: 1248,
    activePackages: 42,
    monthlyRevenue: 142500,
    totalUsers: 256,
  };

  try {
    const live = await api("/dashboard/stats");
    stats = { ...stats, ...live };
  } catch {
    // fallback to visual sample data
  }

  return `
    <section class="content-grid">
      ${dashboardStats(stats)}
      <div class="overview-grid">
        ${chartView()}
        ${distributionView()}
      </div>
      <article class="table-panel">
        <div class="table-head">
          <div>
            <h2 class="panel-title">Recent Bookings</h2>
            <p class="panel-subtitle">Latest confirmed and pending reservation activity</p>
          </div>
          <a class="table-link" href="#booking-management">View All Bookings -></a>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Package</th>
              <th>Date</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>${await bookingTableRows()}</tbody>
        </table>
      </article>
    </section>`;
}

async function cmsView(tab) {
  const { TAB_RENDERERS, TAB_USES_SETTINGS, collectCms, collectSettings, renderSeo } = window.CmsSchema;
  const tabs = cmsTabs
    .map((item) => `<button class="tab ${item.id === tab ? "active" : ""}" data-tab="${item.id}" type="button">${item.label}</button>`)
    .join("");

  let sections = {};
  let settings = {};
  let packages = [];
  try {
    const cmsData = await api(`/cms/${tab}`);
    sections = cmsData.sections || {};
  } catch {
    // use empty defaults from schema
  }

  if (tab === "packages-page") {
    try {
      const pkgData = await api("/packages?active=false");
      packages = pkgData.packages || [];
    } catch {
      packages = [];
    }
  }

  if (TAB_USES_SETTINGS.has(tab) || tab === "footer") {
    try {
      const s = await api("/settings");
      settings = s.settings || {};
    } catch {
      settings = {};
    }
  }

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
}

async function saveSeoSettings() {
  const viewEl = document.getElementById("view");
  const settings = window.CmsSchema.collectSettings(viewEl);
  await api("/settings", { method: "PUT", body: JSON.stringify({ settings }) });
}

async function saveBanner() {
  const input = document.getElementById("img-hero-background_image")
    || document.querySelector('[data-cms-section="hero"][data-cms-key="background_image"]');
  if (!input) return;
  const sections = { hero: { background_image: input.value } };
  await api("/cms/home", { method: "PUT", body: JSON.stringify({ sections }) });
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
  return window.AdminEntities.packagesView(api);
}

function bannerView() {
  return window.AdminEntities.bannerView(api);
}

function userView() {
  return window.AdminEntities.usersView(api);
}

function bookingsView() {
  return window.AdminEntities.bookingsView(api);
}

function galleryView() {
  return window.AdminEntities.galleryView(api);
}

async function seoView() {
  let settings = {};
  try {
    const s = await api("/settings");
    settings = s.settings || {};
  } catch {
    settings = {};
  }
  return `<section class="content-grid">${window.CmsSchema.renderSeo(settings)}</section>`;
}

function faqManagementView() {
  return window.AdminEntities.faqView(api);
}

function notificationsView() {
  return window.AdminEntities.notificationsView(api);
}

function analyticsView() {
  return `
    <section class="content-grid">
      <div class="stats-grid">
        <article class="stat-card"><div class="stat-label">Sessions</div><div class="stat-value">12.8k</div><div class="stat-change">+9.2%</div></article>
        <article class="stat-card"><div class="stat-label">Leads</div><div class="stat-value">426</div><div class="stat-change">+16.5%</div></article>
        <article class="stat-card"><div class="stat-label">Conversion</div><div class="stat-value">4.8%</div><div class="stat-change">+1.4%</div></article>
        <article class="stat-card"><div class="stat-label">Bounce Rate</div><div class="stat-value">28%</div><div class="stat-change down">-3.1%</div></article>
      </div>
      <div class="overview-grid">
        ${chartView()}
        <div class="panel">
          <div class="panel-head">
            <div>
              <h2 class="panel-title">Channel Mix</h2>
              <p class="panel-subtitle">Traffic by source</p>
            </div>
          </div>
          <div class="distribution">
            <div class="dist-row"><div class="dist-label"><span>Organic</span><strong>48%</strong></div><div class="track"><span style="width:48%; background:#f1c61e"></span></div></div>
            <div class="dist-row"><div class="dist-label"><span>Paid</span><strong>28%</strong></div><div class="track"><span style="width:28%; background:#4e89f7"></span></div></div>
            <div class="dist-row"><div class="dist-label"><span>Direct</span><strong>16%</strong></div><div class="track"><span style="width:16%; background:#18c58f"></span></div></div>
            <div class="dist-row"><div class="dist-label"><span>Referral</span><strong>8%</strong></div><div class="track"><span style="width:8%; background:#ef5b59"></span></div></div>
          </div>
        </div>
      </div>
    </section>`;
}

function packagesPageView() {
  return `
    <section class="content-grid">
      <div class="tabs">
        <span class="tab active" style="cursor:default;">Packages Page</span>
      </div>
      ${section(
        "Packages Page Hero",
        "Top banner for the packages listing",
        `
          <div class="form-grid">
            ${field("Hero Title", "Packages")}
            ${field("Hero Subtitle", "Curated journeys across the UK and Europe")}
            ${imageUploader("Hero Image", "Recommended size: 1440 x 1024 px")}
          </div>
        `
      )}
      ${section(
        "Filter & Search Settings",
        "Controls for the packages listing page",
        `
          <div class="form-grid">
            ${selectField("Primary Filter", ["Type", "Left Column"], "Type")}
            ${field("Search Placeholder", "Search by destination")}
            ${selectField("Show Result Count", ["Yes", "No"], "Yes")}
            ${field("Default Sort", "Most Popular")}
          </div>
        `
      )}
      ${section(
        "Listing Display",
        "Grid and card presentation controls",
        `
          <div class="form-grid">
            ${selectField("Layout", ["Grid", "List"], "Grid")}
            ${selectField("Cards per Row", ["2", "3", "4"], "3")}
            ${field("Show Package Badge", "Yes")}
            ${field("Show Booking Button", "Yes")}
          </div>
        `
      )}
      ${section(
        "Category Tabs",
        "Destination tabs shown at the top of the listing",
        `
          <div class="mini-list">
            <div class="mini-card"><strong>Adventure & Trekking</strong><span>18 packages</span></div>
            <div class="mini-card"><strong>Luxury Escapes</strong><span>7 packages</span></div>
            <div class="mini-card"><strong>Cultural Heritage</strong><span>9 packages</span></div>
          </div>
        `
      )}
      ${section(
        "Sticky Call to Action",
        "Bottom CTA card for the listing page",
        `
          <div class="form-grid">
            ${field("CTA Title", "Not sure what fits your brief?")}
            ${field("CTA Button", "Speak to Us")}
            ${field("CTA Link", "/contact")}
          </div>
        `
      )}
    </section>`;
}

function footerView() {
  return `
    <section class="content-grid">
      ${section(
        "Brand Details",
        "Footer brand block and short description",
        `
          <div class="form-grid">
            ${field("Brand Name", "Caledor DMC")}
            ${field("Tagline", "Trusted DMC partner for UK & Europe")}
            ${textareaField("Description", "Premium destination management for the UK and Europe.")}
          </div>
        `
      )}
      ${section(
        "Footer Links",
        "Main footer navigation columns",
        `
          <div class="mini-list">
            <div class="mini-card"><strong>Company</strong><span>About, Team, Careers</span></div>
            <div class="mini-card"><strong>Explore</strong><span>Destinations, Packages, Blog</span></div>
            <div class="mini-card"><strong>Support</strong><span>FAQ, Contact, Terms</span></div>
          </div>
        `
      )}
      ${section(
        "Footer Contact Details",
        "Address, email, and hotline settings",
        `
          <div class="form-grid">
            ${field("Email", "info@caledor.com")}
            ${field("Phone", "+44 20 0000 0000")}
            ${field("Address", "12 Waterfront Lane, London")}
            ${field("Show Map Link", "Yes")}
          </div>
        `
      )}
      ${section(
        "Newsletter Signup",
        "Footer newsletter call to action",
        `
          <div class="form-grid">
            ${field("Newsletter Title", "Stay inspired")}
            ${field("Newsletter Button", "Subscribe")}
          </div>
        `
      )}
      ${section(
        "Bottom Bar",
        "Copyright and policy links",
        `
          <div class="form-grid">
            ${field("Copyright Text", "All rights reserved.")}
            ${field("Privacy Policy Link", "/privacy")}
            ${field("Terms Link", "/terms")}
            ${field("Cookie Link", "/cookie")}
          </div>
        `
      )}
    </section>`;
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
  const [section, tab] = raw.split("/");
  return { section, tab: tab || "home", raw };
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
    render();
  } catch {
    logout();
  }
}

function updateProfile() {
  if (!currentUser) return;
  const initials = currentUser.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  document.getElementById("avatarInitials").textContent = initials;
  document.getElementById("profileName").textContent = currentUser.name;
  document.getElementById("profileRole").textContent = currentUser.role === "super_admin"
    ? "Super Admin"
    : currentUser.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function setTopbar(route) {
  pageTitle.textContent = route.title;
  crumbs.innerHTML = crumbsHtml(route.crumbs);

  const actionMap = {
    overview: `${actionButton("Last 30 Days", "secondary", "last-30-days")}${actionButton("Export Report", "primary", "export-report")}`,
    "cms-settings": `${actionButton("Preview", "secondary", "preview")}${actionButton("Save Changes", "primary", "save-changes")}`,
    "package-settings": `${actionButton("Preview", "secondary", "preview")}${actionButton("Save Changes", "primary", "save-changes")}`,
    "banner-settings": `${actionButton("Preview", "secondary", "preview")}${actionButton("Save Changes", "primary", "save-changes")}`,
    "user-management": `${actionButton("Invite User", "secondary", "invite-user")}${actionButton("Save Changes", "primary", "save-changes")}`,
    "booking-management": `${actionButton("Filter", "secondary", "filter")}${actionButton("Export", "primary", "export")}`,
    gallery: `${actionButton("Upload", "secondary", "upload")}${actionButton("Save Changes", "primary", "save-changes")}`,
    "faq-management": `${actionButton("Preview", "secondary", "preview")}${actionButton("Save Section Settings", "primary", "save-faq-section")}`,
    "seo-settings": `${actionButton("Preview", "secondary", "preview")}${actionButton("Save Changes", "primary", "save-changes")}`,
    notifications: `${actionButton("Preview", "secondary", "preview")}${actionButton("Save Changes", "primary", "save-changes")}`,
    analytics: `${actionButton("Last 30 Days", "secondary", "last-30-days")}${actionButton("Export Report", "primary", "export-report")}`,
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
      return;
    }
    if (routeInfo.section === "package-settings") {
      await savePackageForm();
      showToast("Package saved — live on the website");
      markSaved();
      return;
    }
    if (routeInfo.section === "seo-settings") {
      await saveSeoSettings();
      showToast("SEO settings saved");
      return;
    }
    if (routeInfo.section === "banner-settings") {
      await saveBanner();
      showToast("Banner saved — homepage hero updated");
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
  if (!form || !window.PackageEditor) throw new Error("Open Package Settings and select a package first");
  const payload = window.PackageEditor.collectFromForm(form);
  let id = form.querySelector('[name="id"]')?.value;
  if (!id) id = document.getElementById("packageSelect")?.value || "";
  delete payload.id;
  if (!payload.name?.trim()) throw new Error("Package name is required");
  if (!payload.slug?.trim()) payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (id) {
    await api(`/packages/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  } else {
    await api("/packages", { method: "POST", body: JSON.stringify(payload) });
  }
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

let entityHandlersWired = false;

function wireEntityHandlers() {
  document.querySelectorAll(".switch").forEach((sw) => {
    if (sw._wired) return;
    sw._wired = true;
    sw.addEventListener("click", () => sw.classList.toggle("on"));
  });

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
        render();
      } catch (err) {
        showToast(err.message || "Save failed");
      }
      return;
    }
    if (form.id === "galleryForm") {
      e.preventDefault();
      const data = formData(e.target);
      try {
        await api("/gallery", { method: "POST", body: JSON.stringify({
          title: data.title,
          image_url: data.image_url,
          alt_text: data.alt_text || data.title,
          album: data.album || "General",
          sort_order: Number(data.sort_order) || 0,
        }) });
        showToast("Image added — live on website");
        render();
      } catch (err) {
        showToast(err.message);
      }
      return;
    }
    if (form.id === "blogForm") {
      e.preventDefault();
      const data = formData(e.target);
      const payload = {
        title: data.title,
        category: data.category,
        image_url: data.image_url,
        excerpt: data.excerpt,
        content: data.content,
        published: data.published === "1",
      };
      try {
        if (data.id) {
          await api(`/blog/${data.id}`, { method: "PUT", body: JSON.stringify(payload) });
          showToast("Post updated");
        } else {
          await api("/blog", { method: "POST", body: JSON.stringify(payload) });
          showToast("Post created");
        }
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
        window.open("/", "_blank");
        return;
      }
      if (action === "discard-changes") {
        render();
        showToast("Changes discarded");
        return;
      }
      if (action === "save-banner") {
        try {
          await saveBanner();
          showToast("Banner saved");
        } catch (err) {
          showToast(err.message);
        }
        return;
      }
      if (action === "delete-package") {
        if (!confirm("Delete this package?")) return;
        try {
          await api(`/packages/${button.dataset.id}`, { method: "DELETE" });
          showToast("Package deleted");
          render();
        } catch (err) {
          showToast(err.message);
        }
        return;
      }
      if (action === "edit-package") {
        api(`/packages/${button.dataset.id}`).then(({ package: pkg }) => {
          window.PackageEditor.loadIntoForm(pkg);
          if (window.CmsUI) window.CmsUI.wire(document.getElementById("view"));
          document.getElementById("packageForm")?.scrollIntoView({ behavior: "smooth" });
        }).catch((err) => showToast(err.message));
        return;
      }
      if (action === "reset-package-form") {
        document.getElementById("packageForm")?.reset();
        document.getElementById("packageSelect").value = "";
        ["highlightsList", "itineraryList", "galleryList", "inclusionsList", "exclusionsList"].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.innerHTML = "";
        });
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
      if (action === "edit-blog") {
        api(`/blog/${button.dataset.id}`).then(({ post }) => {
          const form = document.getElementById("blogForm");
          if (!form) return;
          form.querySelector('[name="id"]').value = post.id;
          form.title.value = post.title || "";
          form.category.value = post.category || "";
          form.image_url.value = post.image_url || "";
          const imgInput = document.getElementById("img-blog-post-image");
          if (imgInput) imgInput.dispatchEvent(new Event("input"));
          if (window.CmsUI) window.CmsUI.wire(document.getElementById("view"));
          form.excerpt.value = post.excerpt || "";
          form.content.value = post.content || "";
          form.published.value = post.published ? "1" : "0";
        }).catch((err) => showToast(err.message));
        return;
      }
      if (action === "reset-blog-form") {
        document.getElementById("blogForm")?.reset();
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
      }
    });

  document.querySelectorAll("[data-action='update-booking-status']").forEach((select) => {
    select.addEventListener("change", async () => {
      try {
        await api(`/bookings/${select.dataset.id}`, {
          method: "PUT",
          body: JSON.stringify({ status: select.value }),
        });
        showToast("Booking status updated");
      } catch (err) {
        showToast(err.message);
      }
    });
  });

  document.querySelectorAll("[data-action='update-contact-status']").forEach((select) => {
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
    if (input.closest(".image-uploader")) {
      input.addEventListener("input", () => {
        const thumb = input.closest(".image-uploader")?.querySelector(".thumb");
        if (thumb && input.value) {
          thumb.style.backgroundImage = `url('${input.value}')`;
          thumb.style.backgroundSize = "cover";
        }
      });
    }
  });
}

function connectAdminSocket() {
  if (typeof io === "undefined") return;
  const socket = io();
  socket.emit("join:admin");
  socket.on("booking:new", () => {
    if (getRoute().section === "notifications" || getRoute().section === "overview") render();
  });
  socket.on("contact:new", () => {
    if (getRoute().section === "notifications") render();
  });
}

async function render() {
  if (!token) return;

  const routeInfo = getRoute();
  const section = routeInfo.section === "cms-settings" ? "cms-settings/home" : routeInfo.section;
  renderSidebar(section);

  const route = routeInfo.section === "cms-settings"
    ? { section: "cms-settings", title: "CMS Settings", crumbs: ["Admin", "CMS Settings"] }
    : { ...(routes.find((item) => item.id === routeInfo.section) || routes[0]), section: routeInfo.section };
  setTopbar(route);
  stickyFooter.hidden = !["cms-settings", "package-settings", "banner-settings"].includes(routeInfo.section);

  const views = {
    overview: overviewView,
    "cms-settings": () => cmsView(routeInfo.tab),
    "package-settings": packageView,
    "banner-settings": bannerView,
    "user-management": userView,
    "booking-management": bookingsView,
    gallery: galleryView,
    "faq-management": faqManagementView,
    "seo-settings": seoView,
    notifications: notificationsView,
    analytics: analyticsView,
  };

  const viewRenderer = views[routeInfo.section] || overviewView;
  view.innerHTML = await viewRenderer();

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (!tab.dataset.tab) return;
      window.location.hash = `cms-settings/${tab.dataset.tab}`;
    });
  });

  renderActionHooks();
  wireEntityHandlers();
  if (window.CmsUI) window.CmsUI.wire(view);
  if (routeInfo.section === "package-settings" && window.PackageEditor) {
    window.PackageEditor.wire(api, render);
    const select = document.getElementById("packageSelect");
    if (select?.value) {
      api(`/packages/${select.value}`).then(({ package: pkg }) => window.PackageEditor.loadIntoForm(pkg)).catch(() => {});
    }
  }
  if (routeInfo.section === "cms-settings" && routeInfo.tab === "packages-page") {
    document.getElementById("cmsPackagePreviewSelect")?.addEventListener("change", (e) => {
      const link = document.getElementById("cmsPackagePreviewLink");
      if (link && e.target.value) link.href = `../package-detail.html?slug=${encodeURIComponent(e.target.value)}`;
    });
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
