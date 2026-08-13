const API = window.CALEDOR_CONFIG?.apiBase ?? "/api";

let cmsRevision = String(Date.now());

async function fetchJson(path) {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${API}${path}${sep}_=${Date.now()}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

let cmsState = {
  home: {},
  about: {},
  contact: {},
  blog: {},
  packagesPage: {},
  footer: {},
  packages: [],
  blogPosts: [],
};

let activePackageCategory = "all";
let packageSearchQuery = "";
let activeBlogCategory = "all";
let blogSearchQuery = "";

let testimonialTimer = null;

const WHY_CHOOSE_DEFAULTS = [
  { icon: "👤", title: "Dedicated Account Managers", description: "Personalized support and a single point of contact for every request and itinerary." },
  { icon: "⚡", title: "Fast Quotations", description: "Quick turnaround on quotes and availability checks to keep your planning moving." },
  { icon: "🏨", title: "Contracted Hotel Rates", description: "Preferred partner rates and direct access to exclusive inventory across Europe." },
  { icon: "★", title: "Luxury Experiences", description: "Curated itineraries, private tours, and exclusive access to hidden gems." },
  { icon: "📍", title: "Ground Operations Support", description: "Transfers, logistics, and on-the-ground coordination for seamless execution." },
  { icon: "💼", title: "Corporate Travel Expertise", description: "Tailored solutions for corporate groups, meetings, and executive travel." },
  { icon: "🖥", title: "MICE Solutions", description: "End-to-end management for incentives, meetings, and events." },
];

const SCOTLAND_ATTRACTIONS_DEFAULTS = [
  { label: "Loch Lomond Cruise", layout: "loch", image: "assets/scotland/loch-lomond.png", alt: "Loch Lomond Cruise", hero: false },
  { label: "The Kelpies", layout: "kelpies", image: "assets/scotland/the-kelpies.png", alt: "The Kelpies", hero: false },
  { label: "Highland Wildlife", layout: "tall", image: "assets/scotland/puffin-highlands.png", alt: "Atlantic puffin with wings spread", hero: false },
  { label: "Coastal Wildlife", layout: "wide", image: "assets/scotland/puffins-sea.png", alt: "Puffins on Scottish waters", hero: false },
  { label: "Isle of Skye", layout: "skye", image: "assets/scotland/isle-of-skye.png", alt: "Isle of Skye", hero: false },
  { label: "Whisky Distillery", layout: "whisky", image: "assets/scotland/whisky-distillery.png", alt: "Scottish Whisky Distillery", hero: false },
];

const SCOTLAND_LAYOUT_CLASSES = {
  loch: " scotland-tile-loch",
  kelpies: " scotland-tile-kelpies",
  tall: " scotland-tile-tall",
  wide: " scotland-tile-wide",
  skye: " scotland-tile-skye",
  whisky: " scotland-tile-whisky",
};

const SCOTLAND_LAYOUT_ORDER = ["loch", "kelpies", "tall", "wide", "skye", "whisky"];

const SCOTLAND_LABEL_TO_LAYOUT = {
  "Loch Lomond Cruise": "loch",
  "The Kelpies": "kelpies",
  "Highland Wildlife": "tall",
  "Coastal Wildlife": "wide",
  "Scottish Seabirds": "wide",
  "Isle of Skye": "skye",
  "Whisky Distillery": "whisky",
};

const SCOTLAND_UPLOAD_TO_ASSET = {
  "/uploads/scotland-attractions/loch-lomond-cruise.png": "assets/scotland/loch-lomond.png",
  "/uploads/scotland-attractions/the-kelpies.png": "assets/scotland/the-kelpies.png",
  "/uploads/scotland-attractions/puffin-highlands.png": "assets/scotland/puffin-highlands.png",
  "/uploads/scotland-attractions/puffin-fishing.png": "assets/scotland/puffins-sea.png",
  "/uploads/scotland-attractions/puffins-sea.png": "assets/scotland/puffins-sea.png",
  "/uploads/scotland-attractions/isle-of-skye.png": "assets/scotland/isle-of-skye.png",
  "/uploads/scotland-attractions/whisky-distillery.png": "assets/scotland/whisky-distillery.png",
};

function resolveScotlandImage(cmsImage, fallback) {
  const value = String(cmsImage || "").trim();
  if (!value || value.includes("unsplash.com")) return fallback;
  if (SCOTLAND_UPLOAD_TO_ASSET[value]) return SCOTLAND_UPLOAD_TO_ASSET[value];
  return value;
}

const TEAM_DEFAULTS = [
  {
    name: "Mr. Alok Singh",
    role: "Managing Director",
    bio: "Mr. Alok Singh comes from a strong hospitality background. His deep understanding of Indian travellers — their tastes, cultural preferences, and expectations — forms the backbone of our guest experience approach.",
    photo: "assets/team-alok-singh-portrait.jpg",
  },
  {
    name: "Ms. Neha Sawant",
    role: "Head Asia Pacific",
    bio: "Ms. Neha Sawant brings over a decade of expertise in luxury and experiential travel across the Asia Pacific region. Her nuanced knowledge of regional markets — from Southeast Asia to East Asia — enables her to craft journeys that are both culturally immersive and seamlessly executed for today's discerning traveller.",
    photo: "assets/team-neha-sawant-portrait.jpg",
  },
];

const BLOG_POST_DEFAULTS = [
  {
    slug: "scotlands-wild-highlands-beckon-travelers",
    title: "Scotland's Wild Highlands Beckon Travelers",
    excerpt: "From ancient castles to rugged coastlines, exploring the untamed beauty of the Scottish Highlands.",
    category: "Destinations",
    image_url: "/assets/scotland/isle-of-skye.png",
  },
  {
    slug: "new-wave-luxury-london",
    title: "The New Wave of Luxury in London",
    excerpt: "Discover the latest openings and hidden gems shaping the city's travel scene.",
    category: "UK Travel",
    image_url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=85",
  },
  {
    slug: "french-riviera-remains-benchmark",
    title: "Why the French Riviera Remains a Benchmark",
    excerpt: "From yachts to private villas, a guide to the Côte d'Azur's enduring appeal.",
    category: "Europe Trends",
    image_url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=85",
  },
  {
    slug: "inside-italys-hidden-heritage-sites",
    title: "Inside Italy's Hidden Heritage Sites",
    excerpt: "Expert-led tours that unlock the authentic soul of Italy's iconic cities.",
    category: "Destination Highlights",
    image_url: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=85",
  },
  {
    slug: "essential-travel-tips-europe-2026",
    title: "Essential Travel Tips for Europe 2026",
    excerpt: "Everything you need to know before planning your European adventure.",
    category: "Travel Tips",
    image_url: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=85",
  },
];

const CONTACT_CTA_DEFAULTS = {
  title: "Let's Create Exceptional UK & Europe Experiences Together",
  subtitle: "Partner with a DMC that understands luxury, reliability, and bespoke operations.",
  background_image: "assets/final-cta-castle.png",
  button_label: "Request Proposal",
};

const HERO_DEFAULTS = {
  eyebrow: "Destination Management Company",
  title: "Your Trusted DMC Partner for UK & Europe",
  subtitle: "Delivering exceptional travel experiences through bespoke hotel bookings, transfers, sightseeing, luxury transport, and curated holiday packages.",
  primary_cta_label: "Become a Partner",
  primary_cta_url: "#contact",
  secondary_cta_label: "Explore Destinations",
  secondary_cta_url: "#destinations",
  background_image: "assets/hero-background.png",
};

const TRUST_DEFAULTS = {
  point_1: "20+ European Countries",
  point_2: "Dedicated DMC Support",
  point_3: "Tailor-Made Itineraries",
  point_4: "Competitive Contracted Rates",
};

const STATS_DEFAULTS = {
  stat_1_value: "500+",
  stat_1_label: "Hotels Network",
  stat_2_value: "50+",
  stat_2_label: "Cities Covered",
  stat_3_value: "200+",
  stat_3_label: "Transfer Partners",
  stat_4_value: "15+",
  stat_4_label: "Years of Experience",
};

const PREMIUM_SERVICE_SLUGS = {
  "Hotel Bookings": "hotel-bookings",
  "Holiday Packages": "holiday-packages",
  "Sightseeing Tours": "sightseeing-tours",
  "Vehicle At Disposal": "vehicle-at-disposal",
  "Airport Transfers": "airport-transfers",
  "Restaurant Reservations": "restaurant-reservations",
};

function premiumServiceLink() {
  return "#proposal";
}

function withImageFallback(src, alt = "") {
  const safe = escapeHtml(src || "");
  const isSiteMedia = /\/assets\/|^assets\/|\/uploads\/|^uploads\//.test(String(src || ""));
  if (isSiteMedia) {
    return `src="${safe}" alt="${escapeHtml(alt)}" loading="lazy"`;
  }
  const fallback = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";
  return `src="${safe}" alt="${escapeHtml(alt)}" loading="lazy" onerror="this.onerror=null;this.src='${fallback}'"`;
}

function formatContactCtaTitle(title) {
  const safe = escapeHtml(title || "");
  if (safe.includes("Experiences Together")) {
    return safe.replace(" Experiences Together", "<br />Experiences Together");
  }
  return safe;
}

function truncateText(text, max = 120) {
  const value = String(text ?? "").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}…`;
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

function parseJson(raw, fb = []) {
  if (Array.isArray(raw)) return raw;
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return fb;
  }
}

function mediaUrl(url) {
  if (window.CALEDOR_CONFIG?.mediaUrl) return window.CALEDOR_CONFIG.mediaUrl(url);
  if (!url) return "";
  const value = String(url).trim();
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) return value;
  return `/${value.replace(/^\/+/, "")}`;
}

/** Resolved upload/API image URL with optional cache-bust (CMS save time or item updated_at). */
function assetUrl(url, version) {
  const resolved = mediaUrl(url);
  if (!resolved) return "";
  const v = version || cmsRevision;
  if (!v) return resolved;
  const join = resolved.includes("?") ? "&" : "?";
  return `${resolved}${join}v=${encodeURIComponent(String(v).replace(/\s/g, ""))}`;
}

function setImgSrc(el, url, version) {
  if (!el || !url) return;
  const next = assetUrl(url, version);
  if (!next) return;
  el.src = next;
}

function bgUrl(url, version) {
  const resolved = assetUrl(url, version);
  return resolved ? `url("${resolved.replace(/"/g, '\\"')}")` : "";
}

function setSectionVisible(el, enabled) {
  if (!el) return;
  if (enabled === "0" || enabled === false) el.setAttribute("hidden", "");
  else el.removeAttribute("hidden");
}

function isPackagesSectionEnabled() {
  const homeEnabled = cmsState.home?.packages_heading?.enabled;
  const listingEnabled = cmsState.packagesPage?.listing?.enabled;
  if (homeEnabled === "0" || listingEnabled === "0") return false;
  return true;
}

function applyPackagesVisibility() {
  const visible = isPackagesSectionEnabled();
  const section = document.getElementById("packages");
  document.body.classList.toggle("packages-section-hidden", !visible);
  document.body.classList.remove("packages-pending");

  if (section) {
    if (visible) section.removeAttribute("hidden");
    else section.setAttribute("hidden", "");
  }

  document.querySelectorAll('a[href="#packages"], a[href="/#packages"]').forEach((link) => {
    if (!visible) link.setAttribute("hidden", "");
    else link.removeAttribute("hidden");
  });

  const grid = document.getElementById("packageGrid");
  if (grid && !visible) grid.innerHTML = "";
}

function applyHeroContent(hero = {}, trust = {}, stats = {}) {
  const heroSection = document.getElementById("hero") || document.querySelector(".hero");
  setSectionVisible(heroSection, hero.enabled !== "0");

  const legacyHero = hero.title && String(hero.title).includes("Discover Your Next");
  const h = legacyHero ? { ...HERO_DEFAULTS, enabled: hero.enabled } : { ...HERO_DEFAULTS, ...hero };
  const t = { ...TRUST_DEFAULTS, ...trust };
  const s = { ...STATS_DEFAULTS, ...stats };

  const eyebrow = document.getElementById("heroEyebrow") || document.querySelector(".hero .eyebrow");
  const heading = document.getElementById("heroTitle") || document.querySelector(".hero h1");
  const copy = document.getElementById("heroSubtitle") || document.querySelector(".hero-content p:not(.eyebrow)");
  const primary = document.getElementById("heroPrimaryCta") || document.querySelector(".hero-actions .primary");
  const secondary = document.getElementById("heroSecondaryCta") || document.querySelector(".hero-actions .ghost");

  const bgImage = h.background_image && !String(h.background_image).includes("unsplash.com")
    ? h.background_image
    : HERO_DEFAULTS.background_image;

  if (heroSection) {
    heroSection.style.backgroundImage = [
      "linear-gradient(180deg, rgba(8, 12, 22, 0.35) 0%, rgba(8, 12, 22, 0.25) 35%, rgba(8, 12, 22, 0.72) 78%, rgba(8, 12, 22, 0.88) 100%)",
      bgUrl(bgImage, cmsState.homeUpdatedAt),
    ].join(",");
    heroSection.style.backgroundSize = "cover";
    heroSection.style.backgroundPosition = "center center";
  }

  if (eyebrow) eyebrow.textContent = h.eyebrow || HERO_DEFAULTS.eyebrow;
  if (heading) heading.textContent = h.title || HERO_DEFAULTS.title;
  if (copy) copy.textContent = h.subtitle || HERO_DEFAULTS.subtitle;

  if (primary) {
    primary.textContent = h.primary_cta_label || HERO_DEFAULTS.primary_cta_label;
    primary.href = h.primary_cta_url || HERO_DEFAULTS.primary_cta_url;
  }

  if (secondary) {
    secondary.textContent = h.secondary_cta_label || HERO_DEFAULTS.secondary_cta_label;
    secondary.href = h.secondary_cta_url || HERO_DEFAULTS.secondary_cta_url;
  }

  const trustValues = [t.point_1, t.point_2, t.point_3, t.point_4].filter(Boolean);
  document.querySelectorAll(".hero-trust span").forEach((item, index) => {
    if (trustValues[index]) item.textContent = trustValues[index];
  });

  const statValues = [
    [s.stat_1_value, s.stat_1_label],
    [s.stat_2_value, s.stat_2_label],
    [s.stat_3_value, s.stat_3_label],
    [s.stat_4_value, s.stat_4_label],
  ];
  document.querySelectorAll(".hero-stats article").forEach((card, index) => {
    const [value, label] = statValues[index] || [];
    const strong = card.querySelector("strong");
    const span = card.querySelector("span");
    if (strong && value) strong.textContent = value;
    if (span && label) span.textContent = label;
  });
}

function applySectionHeading(selector, kicker, title, subtitle) {
  const root = document.querySelector(selector);
  if (!root) return;
  const k = root.querySelector(".section-kicker");
  const h = root.querySelector("h2");
  const p = root.querySelector(".section-heading p, .blog-subtitle");
  if (k && kicker) k.textContent = kicker;
  if (h && title) h.textContent = title;
  if (p && subtitle) p.textContent = subtitle;
}

function applyBrandSettings(settings = {}) {
  const general = settings.general || {};
  const contact = settings.contact || {};
  const social = settings.social || {};
  const seo = settings.seo || {};

  const brand = general.site_name || "Caledor DMC";
  const tagline = general.site_tagline || "Your Trusted DMC Partner for UK & Europe";

  document.title = seo.meta_title || `${brand} | UK & Europe`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && seo.meta_description) metaDesc.setAttribute("content", seo.meta_description);
  else if (seo.meta_description) {
    const m = document.createElement("meta");
    m.name = "description";
    m.content = seo.meta_description;
    document.head.appendChild(m);
  }

  document.querySelectorAll(".brand-logo").forEach((logo) => {
    logo.alt = brand;
  });

  const footerDesc = document.getElementById("footerDescription");
  if (footerDesc) footerDesc.textContent = general.site_description || tagline;

  const brandTitle = document.getElementById("footerBrandName");
  if (brandTitle) brandTitle.textContent = brand;

  const copyright = document.getElementById("footerCopyright");
  if (copyright && general.copyright_short) copyright.textContent = general.copyright_short;

  const footerLegal = document.getElementById("footerLegal");
  if (footerLegal && general.copyright) footerLegal.textContent = general.copyright;
}

function applyWhyChooseSection(section = {}) {
  const root = document.getElementById("whyChooseSection");
  setSectionVisible(root, section.enabled !== "0");
  if (!root) return;

  const kicker = document.getElementById("whyChooseKicker");
  if (kicker && section.section_title) kicker.textContent = section.section_title;

  const grid = document.getElementById("whyChooseGrid");
  if (!grid) return;
  const features = parseJson(section.features_json);
  const items = (features.length ? features : WHY_CHOOSE_DEFAULTS)
    .filter((item) => String(item.title || "").trim() !== "Multilingual Assistance");
  grid.innerHTML = items.map((item) => `
    <article>
      <span class="fit-icon" aria-hidden="true">${escapeHtml(item.icon || "★")}</span>
      <h3>${escapeHtml(item.title || "")}</h3>
      <p>${escapeHtml(item.description || "")}</p>
    </article>`).join("");
}

function applyFeaturedToursSection() {
  const root = document.getElementById("featuredToursSection");
  if (root) root.setAttribute("hidden", "");
}

function applyTestimonialsSection(section = {}) {
  const root = document.getElementById("testimonialsSection");
  setSectionVisible(root, section.enabled !== "0");
  if (!root) return;

  const kicker = document.getElementById("testimonialsKicker");
  const subtitle = document.getElementById("testimonialsSubtitle");
  if (kicker && section.section_title) kicker.textContent = section.section_title;
  if (subtitle && section.section_subtitle) subtitle.textContent = section.section_subtitle;

  const grid = document.getElementById("testimonialGrid");
  if (!grid) return;

  const items = parseJson(section.items_json);
  if (items.length) {
    grid.innerHTML = items.map((item) => {
      const stars = "★".repeat(Math.min(parseInt(item.stars || "5", 10), 5));
      return `<article>
        <div class="stars" aria-hidden="true">${stars}</div>
        <p class="quote">"${escapeHtml(item.quote || "")}"</p>
        <h3>${escapeHtml(item.name || "")}</h3>
        <span>${escapeHtml(item.role || "")}</span>
      </article>`;
    }).join("");
  }

  const cards = Array.from(grid.querySelectorAll("article"));
  const count = parseInt(section.count || String(cards.length), 10);
  cards.forEach((card, index) => {
    card.hidden = index >= count;
  });

  if (testimonialTimer) clearInterval(testimonialTimer);
  testimonialTimer = null;
}

function resolveTeamMembers(team = {}) {
  const cmsMembers = parseJson(team.members_json).filter((m) => (m.name || "").trim());
  const hasAlok = cmsMembers.some((m) => (m.name || "").includes("Alok Singh"));
  const hasNeha = cmsMembers.some((m) => (m.name || "").includes("Neha Sawant"));
  if (cmsMembers.length >= 2 && hasAlok && hasNeha) return cmsMembers;
  return TEAM_DEFAULTS;
}

function renderTeamGrid(team = {}) {
  const teamSection = document.getElementById("teamSection");
  setSectionVisible(teamSection, team.enabled !== "0");

  const teamEyebrow = document.getElementById("teamEyebrow");
  const teamKicker = document.getElementById("teamKicker");
  const teamSubtitle = document.getElementById("teamSubtitle");
  if (teamEyebrow) teamEyebrow.textContent = team.eyebrow || "THE TEAM BEHIND YOUR JOURNEY";
  if (teamKicker) teamKicker.textContent = team.heading || "Our Leadership Team";
  if (teamSubtitle) {
    teamSubtitle.textContent = team.description || "Meet the people who make exceptional travel possible.";
  }

  const teamGrid = document.getElementById("teamGrid");
  if (!teamGrid) return;

  const useMembers = resolveTeamMembers(team);
  teamGrid.innerHTML = useMembers.map((member) => {
    const photo = assetUrl(member.photo, cmsState.aboutUpdatedAt) || assetUrl(TEAM_DEFAULTS.find((m) => m.name === member.name)?.photo, cmsState.aboutUpdatedAt) || "/assets/team-alok-singh-portrait.jpg";
    const role = (member.role || "").toUpperCase();
    return `
      <div class="leader-row">
        <div class="leader-photo">
          <img src="${escapeHtml(photo)}" alt="${escapeHtml(member.name || "Team member")}" loading="lazy" />
        </div>
        <div class="leader-copy">
          <h3>${escapeHtml(member.name || "")}</h3>
          <p class="leader-role"><span aria-hidden="true">|</span> ${escapeHtml(role)}</p>
          <p class="leader-bio">${escapeHtml(member.bio || "")}</p>
        </div>
      </div>`;
  }).join("");
}

function resolveOwnedCards(ownedAssets = {}) {
  let cards = parseJson(ownedAssets.cards_json);
  if (!cards.length && (ownedAssets.property_name || ownedAssets.property_text)) {
    cards = [{
      property_name: ownedAssets.property_name,
      property_location: ownedAssets.property_location,
      property_text: ownedAssets.property_text,
      card_image: ownedAssets.card_image || "",
      badges_json: ownedAssets.badges_json || "[]",
    }];
  }
  return cards.filter((card) => (card.property_name || card.property_text || "").trim());
}

function renderOwnedAssetsCards(ownedAssets = {}) {
  const cardsEl = document.getElementById("ownedAssetsCards");
  if (!cardsEl) return;

  const cards = resolveOwnedCards(ownedAssets);
  if (!cards.length) return;

  cardsEl.innerHTML = cards.map((card) => {
    const badges = parseJson(card.badges_json);
    const bgUrl = card.card_image ? assetUrl(card.card_image, cmsState.aboutUpdatedAt) : "";
    const bgStyle = bgUrl
      ? ` style="background-image: linear-gradient(135deg, rgba(7,22,53,0.9) 0%, rgba(6,32,65,0.84) 55%, rgba(8,27,57,0.9) 100%), url('${escapeHtml(bgUrl)}'); background-size: cover; background-position: center;"`
      : "";
    return `<article class="owned-assets-card"${bgStyle}>
      <div class="owned-assets-copy">
        <h3>${escapeHtml(card.property_name || "")}</h3>
        ${card.property_location ? `<p class="mini-label">${escapeHtml(card.property_location)}</p>` : ""}
        ${card.property_text ? `<p>${escapeHtml(card.property_text)}</p>` : ""}
        ${badges.length ? `<div class="badge-row">${badges.map((item) => `<span>${escapeHtml(item.text || "")}</span>`).join("")}</div>` : ""}
      </div>
    </article>`;
  }).join("");
}

function applyAboutContent(sections = {}) {
  const pageHero = sections.page_hero || {};
  const story = sections.story || {};
  const missionVision = sections.mission_vision || {};
  const team = sections.team || {};

  const aboutSection = document.getElementById("aboutSection");
  const aboutEnabled = pageHero.enabled !== "0" || story.enabled !== "0";
  setSectionVisible(aboutSection, aboutEnabled);

  if (pageHero.background_image && aboutSection) {
    aboutSection.style.backgroundImage = "";
  }

  const aboutKicker = document.getElementById("aboutKicker");
  const aboutTitle = document.getElementById("aboutTitle");
  const aboutStory = document.getElementById("aboutStory");
  const aboutImage = document.getElementById("aboutImage");

  if (aboutKicker) aboutKicker.textContent = pageHero.title || "About Caledor DMC";
  if (aboutTitle) {
    const subtitle = pageHero.subtitle && pageHero.subtitle !== pageHero.title ? pageHero.subtitle : "";
    aboutTitle.textContent = subtitle;
    aboutTitle.hidden = !subtitle;
  }
  if (aboutStory && story.description) aboutStory.textContent = story.description;
  if (aboutImage) {
    if (story.image_url) {
      setImgSrc(aboutImage, story.image_url, cmsState.aboutUpdatedAt);
    } else {
      aboutImage.src = "assets/about-castle.png";
    }
    aboutImage.alt = story.heading || pageHero.title || "About Caledor DMC";
  }

  const mvSection = document.getElementById("missionVisionSection");
  const mvGrid = document.getElementById("missionVisionGrid");
  setSectionVisible(mvSection, missionVision.enabled !== "0");
  if (mvGrid && missionVision.enabled !== "0") {
    mvGrid.innerHTML = `
      <article class="mission-card">
        <span class="mission-icon">${escapeHtml(missionVision.mission_icon || "🎯")}</span>
        <h3>${escapeHtml(missionVision.mission_title || "Our Mission")}</h3>
        <p>${escapeHtml(missionVision.mission_text || "")}</p>
      </article>
      <article class="mission-card">
        <span class="mission-icon">${escapeHtml(missionVision.vision_icon || "👁")}</span>
        <h3>${escapeHtml(missionVision.vision_title || "Our Vision")}</h3>
        <p>${escapeHtml(missionVision.vision_text || "")}</p>
      </article>`;
  }

  renderTeamGrid(team);

  const awardsSection = document.getElementById("awardsSection");
  const ownedAssets = sections.owned_assets || {};
  setSectionVisible(awardsSection, ownedAssets.enabled !== "0");

  const ownedKicker = document.getElementById("ownedAssetsKicker");
  const ownedTitle = document.getElementById("ownedAssetsTitle");
  const ownedDesc = document.getElementById("ownedAssetsDescription");

  if (ownedKicker && ownedAssets.kicker) ownedKicker.textContent = ownedAssets.kicker;
  if (ownedTitle && ownedAssets.title) ownedTitle.textContent = ownedAssets.title;
  if (ownedDesc && ownedAssets.description) ownedDesc.textContent = ownedAssets.description;
  renderOwnedAssetsCards(ownedAssets);

  const aboutFeatures = sections.about_features || {};
  const featuresGrid = document.getElementById("aboutFeatures");
  if (featuresGrid && aboutFeatures.enabled !== "0") {
    const features = parseJson(aboutFeatures.features_json);
    if (features.length) {
      featuresGrid.innerHTML = features.map((item) => `
        <article>
          <span class="icon-dot ${escapeHtml(item.icon_class || "hotel")}"></span>
          <h3>${escapeHtml(item.title || "")}</h3>
          <p>${escapeHtml(item.description || "")}</p>
        </article>`).join("");
    }
  }
}

const DEFAULT_FORM_FIELDS = [
  { label: "Full Name", field: "fullName", required: true, type: "text" },
  { label: "Company Name", field: "companyName", required: false, type: "text" },
  { label: "Email Address", field: "emailAddress", required: true, type: "email" },
  { label: "Phone Number", field: "phoneNumber", required: false, type: "tel" },
  { label: "Message", field: "proposalMessage", required: true, type: "textarea" },
];

function inferFieldType(field) {
  if (field.type) return field.type;
  const name = field.field || "";
  if (name === "proposalMessage" || name === "message") return "textarea";
  if (name.toLowerCase().includes("email")) return "email";
  if (name.toLowerCase().includes("phone")) return "tel";
  return "text";
}

function renderProposalForm(form = {}) {
  const formEl = document.getElementById("proposalForm");
  if (!formEl) return;

  const fields = parseJson(form.fields_json, DEFAULT_FORM_FIELDS);
  formEl.innerHTML = fields.map((field) => {
    const req = field.required ? " required" : "";
    const inputType = inferFieldType(field);
    const full = inputType === "textarea" ? " full" : "";
    if (inputType === "textarea") {
      return `<label class="${full.trim()}">${escapeHtml(field.label)}
        <textarea name="${escapeHtml(field.field)}" rows="5"${req} placeholder="Tell us about your partnership goals..."></textarea></label>`;
    }
    return `<label class="${full.trim()}">${escapeHtml(field.label)}
      <input type="${inputType}" name="${escapeHtml(field.field)}"${req} /></label>`;
  }).join("") + `
    ${form.file_upload === "1" ? '<label class="full">Attachment<input type="file" name="attachment" /></label>' : ""}
    <button class="button proposal-button full" type="submit">${escapeHtml(form.submit_text || "Send Message")}</button>`;

  bindProposalForm(form);
}

function applyContactContent(sections = {}, settings = {}) {
  const hero = sections.hero || {};
  const info = sections.info || {};
  const form = sections.form || {};
  const map = sections.map || {};
  const socialCms = sections.social || {};
  const social = settings.social || {};

  setSectionVisible(document.getElementById("contact"), hero.enabled !== "0");

  const title = document.getElementById("contactHeroTitle");
  const subtitle = document.getElementById("contactHeroSubtitle");
  const button = document.getElementById("contactHeroButton") || document.querySelector("#contact .contact-button");
  const heroBg = document.getElementById("contactHeroBg");

  const useCtaDefaults = !hero.title || hero.title === "Get In Touch";
  const ctaTitle = useCtaDefaults ? CONTACT_CTA_DEFAULTS.title : hero.title;
  const ctaSubtitle = useCtaDefaults ? CONTACT_CTA_DEFAULTS.subtitle : (hero.subtitle || CONTACT_CTA_DEFAULTS.subtitle);
  const ctaButton = hero.button_label || CONTACT_CTA_DEFAULTS.button_label;
  const ctaBg = hero.background_image
    && !String(hero.background_image).includes("unsplash.com")
    && !String(hero.background_image).endsWith("final-cta-bg.png")
    && !String(hero.background_image).endsWith("final-cta-bg.jpg")
    && !String(hero.background_image).includes("final-cta-hero")
    ? hero.background_image
    : CONTACT_CTA_DEFAULTS.background_image;

  if (title) title.innerHTML = formatContactCtaTitle(ctaTitle);
  if (subtitle) subtitle.textContent = ctaSubtitle;
  if (button) {
    button.textContent = ctaButton;
    button.href = "#proposal";
  }
  if (heroBg) {
    const overlay = "linear-gradient(180deg, rgba(5, 10, 20, 0.42) 0%, rgba(5, 10, 20, 0.68) 100%)";
    heroBg.style.backgroundImage = `${overlay}, ${bgUrl(ctaBg, cmsState.contactUpdatedAt)}`;
    heroBg.style.backgroundSize = "cover";
    heroBg.style.backgroundPosition = "center center";
    heroBg.style.opacity = "1";
  }

  cmsState.contactInfo = info;

  const formTitle = document.querySelector(".request-proposal-title");
  const formSubtitle = document.querySelector(".request-proposal-subtitle");
  if (formTitle) formTitle.textContent = form.title || form.heading || "Request proposal";
  if (formSubtitle) formSubtitle.textContent = form.subtitle || formSubtitle?.textContent || "";

  setSectionVisible(document.getElementById("proposal"), form.enabled !== "0");
  if (form.enabled !== "0") renderProposalForm(form);

  const chatBubble = document.querySelector(".chat-bubble");
  if (chatBubble) {
    if (info.show_whatsapp === "1" && info.whatsapp) {
      chatBubble.hidden = false;
      chatBubble.onclick = () => { window.open(`https://wa.me/${info.whatsapp.replace(/\D/g, "")}`, "_blank"); };
    } else {
      chatBubble.onclick = () => { window.location.hash = "#proposal"; };
    }
  }

  if (window.SiteChrome?.applyFooter) {
    SiteChrome.applyFooter(cmsState.footer || {}, settings, info);
  }
}

function applyFooterCms(sections = {}, settings = {}) {
  cmsState.footer = sections;
  applyBrandSettings(settings);
  setSectionVisible(document.getElementById("siteFooter"), sections.brand?.enabled !== "0");
  if (window.SiteChrome?.applyFooter) {
    SiteChrome.applyFooter(sections, settings, cmsState.contactInfo || {});
  }
}

function applyBlogCms(sections = {}) {
  cmsState.blog = sections;
  const page = sections.page || {};
  const listing = sections.listing || {};
  const categories = sections.categories || {};
  const featured = sections.homepage_featured || {};

  setSectionVisible(document.getElementById("blogSection"), page.enabled !== "0");

  const kicker = document.getElementById("blogKicker");
  const pageTitle = document.getElementById("blogPageTitle");
  const subtitle = document.getElementById("blogSubtitle");
  const description = document.getElementById("blogDescription");

  if (kicker) kicker.textContent = featured.section_title || page.title || "Travel Insights";
  if (pageTitle) {
    pageTitle.textContent = page.title || "";
    pageTitle.hidden = !page.title;
  }
  if (subtitle && page.subtitle) subtitle.textContent = page.subtitle;
  if (description) {
    description.textContent = page.description || "";
    description.hidden = !page.description;
  }

  const blogSection = document.getElementById("blogSection");
  if (blogSection && page.background_image) {
    blogSection.style.backgroundImage = `linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.98)), ${bgUrl(page.background_image, cmsState.blogUpdatedAt)}`;
    blogSection.style.backgroundSize = "cover";
    blogSection.style.backgroundPosition = "center top";
  }

  const searchWrap = document.getElementById("blogSearchWrap");
  setSectionVisible(searchWrap, listing.show_search === "1");

  const tabsEl = document.getElementById("blogCategoryTabs");
  if (tabsEl && categories.show_filter !== "0") {
    const cats = parseJson(categories.items_json).filter((c) => c.visible !== false);
    tabsEl.innerHTML = `<button class="blog-tab active" type="button" data-category="all">All</button>${cats.map((cat) =>
      `<button class="blog-tab" type="button" data-category="${escapeHtml(cat.name)}">${escapeHtml(cat.name)}</button>`).join("")}`;
    bindBlogTabs();
  } else if (tabsEl) {
    tabsEl.innerHTML = "";
  }

  renderBlogGrid();
}

function applyPackagesPageCms(sections = {}) {
  cmsState.packagesPage = sections;
  const listing = sections.listing || {};
  const categories = sections.categories || {};
  const cta = sections.cta || {};

  applyPackagesVisibility();

  if (!isPackagesSectionEnabled()) {
    return;
  }

  const heroEl = document.getElementById("packagesHero");
  setSectionVisible(heroEl, false);

  const headingEl = document.getElementById("packagesHeading");
  if (headingEl) headingEl.removeAttribute("hidden");

  const tabsEl = document.getElementById("packageCategoryTabs");
  if (tabsEl && categories.show_tabs !== "0") {
    const cats = parseJson(categories.items_json).filter((c) => c.visible !== false);
    const allTab = categories.show_all_tab !== "0"
      ? `<button class="package-tab active" type="button" data-category="all">All Packages</button>` : "";
    tabsEl.innerHTML = `${allTab}${cats.map((cat) =>
      `<button class="package-tab" type="button" data-category="${escapeHtml(cat.slug || cat.name)}">${escapeHtml(cat.name)}</button>`).join("")}`;
    tabsEl.hidden = false;
    bindPackageTabs();
  } else if (tabsEl) {
    tabsEl.hidden = true;
  }

  const resultsCount = document.getElementById("packagesResultsCount");
  if (resultsCount) {
    resultsCount.hidden = sections.filters?.show_results_count !== "1";
  }

  const ctaEl = document.getElementById("packagesCta");
  setSectionVisible(ctaEl, cta.enabled === "1" && cta.show_at_bottom === "1");
  if (ctaEl && cta.enabled === "1") {
    const ctaTitle = document.getElementById("packagesCtaTitle");
    const ctaSubtitle = document.getElementById("packagesCtaSubtitle");
    const ctaButton = document.getElementById("packagesCtaButton");
    if (ctaTitle && cta.title) ctaTitle.textContent = cta.title;
    if (ctaSubtitle && cta.subtitle) ctaSubtitle.textContent = cta.subtitle;
    if (ctaButton) {
      if (cta.button_text) ctaButton.textContent = cta.button_text;
      if (cta.button_link) ctaButton.href = cta.button_link;
    }
    if (cta.background_style === "gradient-dark") ctaEl.className = "packages-cta gradient-dark";
    else if (cta.background_style === "Gold Accent") ctaEl.className = "packages-cta gold-accent";
    else ctaEl.className = "packages-cta";
  }

  const grid = document.getElementById("packageGrid");
  if (grid) {
    grid.style.removeProperty("grid-template-columns");
  }

  renderPackageGrid();
}

function packageCountryLabel(pkg) {
  const badge = (pkg.badge || "").trim();
  const countryNames = ["ITALY", "FRANCE", "SCOTLAND", "ENGLAND", "SWITZERLAND", "SPAIN", "GERMANY", "IRELAND", "AUSTRIA", "BELGIUM", "NETHERLANDS", "PORTUGAL"];
  if (countryNames.includes(badge.toUpperCase())) return badge.toUpperCase();

  const text = `${pkg.name} ${pkg.tagline || ""} ${pkg.description || ""}`.toLowerCase();
  const map = [
    ["italian", "ITALY"], ["italy", "ITALY"],
    ["french", "FRANCE"], ["france", "FRANCE"], ["riviera", "FRANCE"], ["côte", "FRANCE"],
    ["scottish", "SCOTLAND"], ["scotland", "SCOTLAND"], ["highlands", "SCOTLAND"],
    ["london", "ENGLAND"], ["england", "ENGLAND"],
    ["swiss", "SWITZERLAND"], ["switzerland", "SWITZERLAND"], ["alps", "SWITZERLAND"],
    ["dublin", "IRELAND"], ["irish", "IRELAND"],
    ["amsterdam", "NETHERLANDS"], ["nordic", "NORDIC"],
  ];
  for (const [key, label] of map) {
    if (text.includes(key)) return label;
  }
  return badge && badge.length <= 14 ? badge.toUpperCase() : "EUROPE";
}

const PACKAGE_DISPLAY_ORDER = [
  "italian-heritage-tour",
  "french-riviera-retreat",
  "scottish-highlands-journey",
  "london-royal-escape",
  "swiss-alps-experience",
];

function sortPackagesForDisplay(packages) {
  return [...packages].sort((a, b) => {
    const ai = PACKAGE_DISPLAY_ORDER.indexOf(a.slug);
    const bi = PACKAGE_DISPLAY_ORDER.indexOf(b.slug);
    const ar = ai === -1 ? 999 : ai;
    const br = bi === -1 ? 999 : bi;
    if (ar !== br) return ar - br;
    return Number(b.featured || 0) - Number(a.featured || 0);
  });
}

function packageCardImage(pkg) {
  const gallery = parseJson(pkg.gallery_json);
  const raw = pkg.image_url || gallery[0]?.url || gallery[0]?.image_url || "";
  const version = pkg.updated_at || cmsRevision || Date.now();
  return assetUrl(raw, version)
    || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85";
}

function featuredExperienceCard(pkg) {
  const image = packageCardImage(pkg);
  const detailUrl = `/package/${encodeURIComponent(pkg.slug || pkg.id)}`;
  const country = packageCountryLabel(pkg);
  const description = truncateText(pkg.tagline || pkg.description, 130);
  return `
    <a class="featured-card featured-experience-card package-card-link" href="${escapeHtml(detailUrl)}">
      <div class="featured-card-media">
        <img class="media-cover" ${withImageFallback(image, pkg.name)} />
      </div>
      <div class="featured-card-body">
        <span class="featured-country-tag">${escapeHtml(country)}</span>
        <h3>${escapeHtml(pkg.name)}</h3>
        <p>${escapeHtml(description)}</p>
      </div>
    </a>`;
}

function packageCard(pkg, listing = {}) {
  const image = packageCardImage(pkg);
  const price = pkg.price_from != null ? `${pkg.currency || "$"}${Number(pkg.price_from).toLocaleString()}` : "On request";
  const duration = pkg.duration || "Custom itinerary";
  const showPrice = listing.show_price !== "0";
  const showDuration = listing.show_duration !== "0";
  const detailUrl = `/package/${encodeURIComponent(pkg.slug || pkg.id)}`;
  return `
    <a class="featured-card package-card-link" href="${escapeHtml(detailUrl)}">
      <img class="media-cover" ${withImageFallback(image, pkg.name)} />
      <div class="featured-card-body">
        <span>${escapeHtml(pkg.badge || pkg.category || "Package")}</span>
        <h3>${escapeHtml(pkg.name)}</h3>
        <p>${escapeHtml(truncateText(pkg.tagline || pkg.description, 110))}</p>
        ${showDuration ? `<small class="pkg-duration">${escapeHtml(duration)}</small>` : ""}
        ${showPrice ? `<strong class="pkg-price">${escapeHtml(price)}</strong>` : ""}
        <span class="pkg-explore">Explore Journey →</span>
      </div>
    </a>`;
}

function renderPackageGrid() {
  applyPackagesVisibility();
  const grid = document.getElementById("packageGrid");
  if (!grid) return;
  if (!isPackagesSectionEnabled()) {
    grid.innerHTML = "";
    return;
  }
  const listing = cmsState.packagesPage?.listing || {};
  const configuredLimit = parseInt(listing.packages_per_page || "0", 10);
  const limit = configuredLimit > 0 ? configuredLimit : 50;
  let packages = Array.isArray(cmsState.packages) ? [...cmsState.packages] : [];

  if (activePackageCategory !== "all") {
    packages = packages.filter((pkg) => {
      const cat = (pkg.category || "").toLowerCase();
      return cat.includes(activePackageCategory.toLowerCase()) || cat.includes(activePackageCategory.replace(/-/g, " "));
    });
  }
  if (packageSearchQuery) {
    const q = packageSearchQuery.toLowerCase();
    packages = packages.filter((pkg) => `${pkg.name} ${pkg.description} ${pkg.category}`.toLowerCase().includes(q));
  }

  const resultsCount = document.getElementById("packagesResultsCount");
  if (resultsCount && !resultsCount.hidden) {
    resultsCount.textContent = `${packages.length} package${packages.length === 1 ? "" : "s"} found`;
  }

  if (!packages.length) {
    grid.innerHTML = `<p class="packages-empty">No packages yet. Add them from the admin Package Settings.</p>`;
    return;
  }

  packages = sortPackagesForDisplay(packages);
  grid.style.removeProperty("grid-template-columns");
  grid.innerHTML = packages.slice(0, limit).map((pkg) => featuredExperienceCard(pkg)).join("");
}

function defaultBlogImage(post = {}) {
  const match = BLOG_POST_DEFAULTS.find((item) => item.slug === post.slug || item.title === post.title);
  return match?.image_url || "";
}

function mergeBlogList(apiPosts = []) {
  if (!apiPosts.length) return BLOG_POST_DEFAULTS.map((post) => ({ ...post, published: 1 }));
  return apiPosts.map((api) => {
    const image_url = api.image_url || defaultBlogImage(api) || "";
    return { ...api, image_url };
  });
}

function blogCard(post, listing = {}) {
  const image = assetUrl(post.image_url || defaultBlogImage(post), post.updated_at) || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=85";
  const excerptLen = parseInt(listing.excerpt_length || "150", 10);
  let excerpt = post.excerpt || "";
  if (excerpt.length > excerptLen) excerpt = `${excerpt.slice(0, excerptLen).trim()}…`;
  const readMore = listing.read_more_text || "Read More";
  const showTag = listing.show_category_tags !== "0";
  const showReadMore = listing.show_read_more !== "0";
  const showAuthor = listing.show_author === "1" && post.author;
  const showDate = listing.show_date === "1" && post.created_at;

  return `
    <article>
      <img src="${escapeHtml(image)}" alt="${escapeHtml(post.title)}" />
      <div>
        ${showTag ? `<span class="blog-tag">${escapeHtml(post.category || "Travel Insights")}</span>` : ""}
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(excerpt)}</p>
        ${showAuthor || showDate ? `<p class="blog-meta">${showAuthor ? escapeHtml(post.author) : ""}${showAuthor && showDate ? " · " : ""}${showDate ? escapeHtml(new Date(post.created_at).toLocaleDateString()) : ""}</p>` : ""}
        ${showReadMore ? `<a href="#contact">${escapeHtml(readMore)} →</a>` : ""}
      </div>
    </article>`;
}

function renderBlogGrid() {
  const grid = document.getElementById("travelInsightsGrid");
  if (!grid) return;
  const blogCms = cmsState.blog || {};
  const listing = blogCms.listing || {};
  const featured = blogCms.homepage_featured || {};
  const limit = parseInt(featured.posts_count || listing.posts_per_page || "4", 10);
  let posts = cmsState.blogPosts || [];

  const featuredTags = parseJson(featured.post_tags_json);
  if (featuredTags.length) {
    const matched = posts.filter((p) => featuredTags.some((t) => (p.title || "").toLowerCase().includes(t.toLowerCase())));
    if (matched.length) posts = matched;
  }

  if (activeBlogCategory !== "all") {
    posts = posts.filter((p) => (p.category || "").toLowerCase().includes(activeBlogCategory.toLowerCase()));
  }
  if (blogSearchQuery) {
    const q = blogSearchQuery.toLowerCase();
    posts = posts.filter((p) => `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(q));
  }

  if (!posts.length) return;
  grid.innerHTML = posts.slice(0, limit).map((post) => blogCard(post, listing)).join("");

  if (listing.grid_columns) {
    grid.style.gridTemplateColumns = `repeat(${Math.min(parseInt(listing.grid_columns, 10) || 3, 4)}, minmax(0, 1fr))`;
  }
}

function mergePackageList(apiPackages = []) {
  if (!Array.isArray(apiPackages) || !apiPackages.length) return [];
  return sortPackagesForDisplay(apiPackages.map((api) => ({ ...api })));
}

async function loadPackages() {
  if (!isPackagesSectionEnabled()) {
    applyPackagesVisibility();
    return;
  }
  try {
    const data = await fetchJson("/packages?active=true");
    cmsState.packages = mergePackageList(data.packages || []);
  } catch (err) {
    console.error("loadPackages:", err);
    cmsState.packages = [];
  }
  renderPackageGrid();
  applyFeaturedToursSection(cmsState.home?.featured_tours || {});
}

async function loadBlogPosts() {
  try {
    const data = await fetchJson("/blog?published=true");
    cmsState.blogPosts = mergeBlogList(data.posts || []);
    renderBlogGrid();
  } catch (err) {
    console.error("loadBlogPosts:", err);
    cmsState.blogPosts = mergeBlogList([]);
    renderBlogGrid();
  }
}

async function loadFaqs() {
  const accordion = document.getElementById("faqAccordion");
  if (!accordion) return;
  accordion.innerHTML = `<p class="faq-loading">Loading FAQs…</p>`;
  try {
    const data = await fetchJson("/faqs?active=true");
    const faqs = (data.faqs || [])
      .slice()
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) || Number(a.id ?? 0) - Number(b.id ?? 0));
    if (!faqs.length) {
      accordion.innerHTML = `<p class="faq-empty">No FAQs published yet. Add questions in Admin → FAQ Management.</p>`;
      return;
    }
    accordion.innerHTML = faqs
      .map((faq, index) => `
        <details${index === 0 ? " open" : ""}>
          <summary>${escapeHtml(faq.question)}</summary>
          <p>${escapeHtml(faq.answer).replace(/\n/g, "<br />")}</p>
        </details>`)
      .join("");
    bindAccordion();
  } catch (err) {
    console.warn("loadFaqs:", err);
    accordion.innerHTML = `<p class="faq-empty">Could not load FAQs. Check that the website is connected to the API, then refresh.</p>`;
  }
}

function applyFaqSection(sections = {}) {
  const section = sections.section || {};
  const root = document.getElementById("faq");
  setSectionVisible(root, section.enabled !== "0");

  const kicker = document.querySelector(".faq-kicker");
  const subtitle = document.querySelector(".faq-subtitle");
  if (kicker && section.kicker) kicker.textContent = section.kicker;
  if (subtitle && section.subtitle) subtitle.textContent = section.subtitle;
}

async function loadCmsFaq() {
  try {
    const data = await fetchJson("/cms/faq");
    applyFaqSection(data.sections || {});
  } catch {
    // keep static
  }
}

function applyDestinationsSection(section = {}) {
  const root = document.getElementById("destinations");
  setSectionVisible(root, section.enabled !== "0");

  const kicker = document.getElementById("destinationsKicker");
  const title = document.getElementById("destinationsTitle");
  const mapPanel = document.querySelector("#destinations .map-panel");
  const grid = document.getElementById("destinationGrid");
  if (kicker && section.kicker) kicker.textContent = section.kicker;
  if (title && section.title) title.textContent = section.title;

  if (mapPanel) {
    const mapImage = section.map_image || "/assets/destinations/europe-coverage-map.png";
    const mapUrl = assetUrl(mapImage, cmsState.homeUpdatedAt);
    if (mapUrl) {
      mapPanel.style.backgroundImage = `linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08)), url("${mapUrl.replace(/"/g, '\\"')}")`;
      mapPanel.style.backgroundSize = "cover";
      mapPanel.style.backgroundPosition = "center";
    }
  }

  if (!grid) return;

  let items = [];
  try {
    items = typeof section.items_json === "string" ? JSON.parse(section.items_json) : (section.items_json || []);
  } catch {
    items = [];
  }

  items = items
    .filter((item) => item.visible !== false && item.name)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

  if (!items.length) return;

  grid.innerHTML = items.map((item) => `
    <article>
      <img ${withImageFallback(assetUrl(item.image, cmsState.homeUpdatedAt), item.name)} />
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.places || "")}</p>
    </article>
  `).join("");
}

function applyGallerySection(section = {}) {
  const root = document.getElementById("gallery");
  setSectionVisible(root, section.enabled !== "0");

  const kicker = document.querySelector(".gallery-kicker");
  const title = document.getElementById("galleryTitle");
  if (kicker && section.kicker) kicker.textContent = section.kicker;
  if (title && section.title) title.textContent = section.title;
}

function isVideoMedia(item = {}) {
  const type = String(item.media_type || "").toLowerCase();
  if (type === "video") return true;
  const url = String(item.video_url || item.image_url || "");
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function isVideoUrl(url = "") {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(String(url));
}

function wireLazyVideos(root) {
  if (!root || !("IntersectionObserver" in window)) return;
  const videos = root.querySelectorAll("video.gallery-video, video.scotland-video");
  if (!videos.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.35, rootMargin: "80px 0px" });

  videos.forEach((video) => {
    video.addEventListener("mouseenter", () => video.play().catch(() => {}));
    observer.observe(video);
  });
}

function renderGalleryCell(item, index) {
  const revision = item.updated_at || cmsRevision;
  const isVideo = isVideoMedia(item);
  const mediaUrl = assetUrl(item.video_url || item.image_url, revision);
  const heroClass = index === 0 ? " gallery-cell-hero" : "";

  if (isVideo && mediaUrl) {
    const poster = item.poster_url ? assetUrl(item.poster_url, revision) : "";
    return `<figure class="gallery-cell gallery-cell-video${heroClass}">
      <video class="media-cover gallery-video" src="${escapeHtml(mediaUrl)}"${poster ? ` poster="${escapeHtml(poster)}"` : ""} muted loop playsinline preload="metadata" aria-label="${escapeHtml(item.alt_text || item.title || "Gallery video")}"></video>
    </figure>`;
  }

  return `<figure class="gallery-cell${heroClass}">
    <img class="media-cover" ${withImageFallback(mediaUrl, item.alt_text || item.title || "Gallery image")} />
  </figure>`;
}

async function loadGallery() {
  const grid = document.getElementById("galleryGrid") || document.querySelector(".gallery-grid");
  if (!grid) return;
  try {
    const data = await fetchJson("/gallery");
    const items = (data.items || [])
      .slice()
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
    if (!items.length) return;

    grid.classList.add("gallery-grid--flex");
    grid.dataset.count = String(items.length);
    grid.innerHTML = items.map((item, index) => renderGalleryCell(item, index)).join("");
    wireLazyVideos(grid);
  } catch (err) {
    console.warn("loadGallery:", err);
  }
}

function isScotlandVideo(item = {}) {
  const type = String(item.media_type || "").toLowerCase();
  if (type === "video") return true;
  if (type === "image") return false;
  return Boolean(item.video_url) && isVideoUrl(item.video_url);
}

function resolveScotlandItems(section = {}) {
  const byLayout = new Map(SCOTLAND_ATTRACTIONS_DEFAULTS.map((item) => [item.layout, { ...item }]));
  parseJson(section.items_json).forEach((item) => {
    if (!item?.label && !item?.image && !item?.video_url) return;
    const layout = item.layout && item.layout !== "auto"
      ? item.layout
      : (SCOTLAND_LABEL_TO_LAYOUT[item.label] || item.layout);
    if (!layout || !SCOTLAND_LAYOUT_CLASSES[layout]) return;
    const defaultItem = byLayout.get(layout) || SCOTLAND_ATTRACTIONS_DEFAULTS.find((d) => d.layout === layout);
    const mediaType = isScotlandVideo(item) ? "video" : "image";
    const image = resolveScotlandImage(item.image, defaultItem?.image);
    byLayout.set(layout, {
      ...defaultItem,
      ...item,
      layout,
      image,
      media_type: mediaType,
      video_url: item.video_url || "",
    });
  });
  return SCOTLAND_LAYOUT_ORDER.map((layout) => byLayout.get(layout)).filter(Boolean);
}

function renderScotlandTileMedia(item) {
  const revision = cmsState.homeUpdatedAt;
  const alt = escapeHtml(item.alt || item.label || "Scotland attraction");
  if (isScotlandVideo(item)) {
    const videoUrl = assetUrl(item.video_url, revision);
    if (!videoUrl) return `<img ${withImageFallback(assetUrl(item.image, revision), alt)} />`;
    const poster = item.image ? assetUrl(item.image, revision) : "";
    return `<video class="scotland-video" src="${escapeHtml(videoUrl)}"${poster ? ` poster="${escapeHtml(poster)}"` : ""} muted loop playsinline preload="metadata" aria-label="${alt}"></video>`;
  }
  return `<img ${withImageFallback(assetUrl(item.image, revision), alt)} />`;
}

function updateScotlandTileMedia(tile, item) {
  if (!tile) return;
  const mediaHtml = renderScotlandTileMedia(item);
  const mediaWrap = tile.querySelector("img, video.scotland-video");
  if (mediaWrap) {
    const temp = document.createElement("div");
    temp.innerHTML = mediaHtml.trim();
    mediaWrap.replaceWith(temp.firstElementChild);
  } else {
    tile.insertAdjacentHTML("afterbegin", mediaHtml);
  }
  const label = tile.querySelector(".scotland-label");
  if (label && item.label) label.textContent = item.label;
}

function applyScotlandAttractionsSection(section = {}) {
  const root = document.getElementById("scotlandAttractionsSection") || document.getElementById("services");
  setSectionVisible(root, section.enabled !== "0");
  if (!root) return;

  const kicker = document.getElementById("scotlandAttractionsKicker");
  const title = document.getElementById("scotlandAttractionsTitle");
  if (kicker && section.kicker) kicker.textContent = section.kicker;
  if (title && section.title) title.textContent = section.title;

  const grid = document.getElementById("scotlandAttractionsGrid");
  if (!grid) return;
  const useItems = resolveScotlandItems(section);
  if (!useItems.length) return;

  grid.classList.remove("is-flexible");
  grid.dataset.count = "6";

  const layoutToClass = {
    loch: "scotland-tile-loch",
    kelpies: "scotland-tile-kelpies",
    tall: "scotland-tile-tall",
    wide: "scotland-tile-wide",
    skye: "scotland-tile-skye",
    whisky: "scotland-tile-whisky",
  };

  const existingTiles = grid.querySelector(".scotland-tile");
  if (existingTiles) {
    useItems.forEach((item) => {
      const tileClass = layoutToClass[item.layout];
      if (!tileClass) return;
      const tile = grid.querySelector(`.${tileClass}`);
      updateScotlandTileMedia(tile, item);
    });
    wireLazyVideos(grid);
    return;
  }

  grid.innerHTML = useItems.map((item) => {
    const layoutClass = SCOTLAND_LAYOUT_CLASSES[item.layout] || "";
    return `
    <article class="scotland-tile${layoutClass}">
      ${renderScotlandTileMedia(item)}
      <span class="scotland-label">${escapeHtml(item.label || "")}</span>
    </article>`;
  }).join("");
  wireLazyVideos(grid);
}

function applyPremiumServicesSection(section = {}) {
  const root = document.getElementById("premiumServicesSection");
  setSectionVisible(root, section.enabled !== "0");
  if (!root) return;

  const kicker = document.getElementById("premiumServicesKicker");
  const title = document.getElementById("premiumServicesTitle");
  const subtitle = document.getElementById("premiumServicesSubtitle");
  if (kicker && section.kicker) kicker.textContent = section.kicker;
  if (title && section.title) title.textContent = section.title;
  if (subtitle && section.subtitle) subtitle.textContent = section.subtitle;

  const grid = document.getElementById("premiumServiceGrid");
  if (!grid) return;
  const items = parseJson(section.items_json);
  if (!items.length) return;

  grid.innerHTML = items.map((item) => `
    <article>
      <img ${withImageFallback(assetUrl(item.image, cmsState.homeUpdatedAt), item.alt || item.title || "Premium service")} />
      <div>
        <h3>${escapeHtml(item.title || "")}</h3>
        <p>${escapeHtml(item.description || "")}</p>
        <a class="learn-more-link" href="${escapeHtml(premiumServiceLink())}">Learn more</a>
      </div>
    </article>`).join("");
  if (window.SiteChrome?.initScrollReveal) window.SiteChrome.initScrollReveal();
}

function applyMiceSection(section = {}, extra = {}) {
  const merged = { ...extra, ...section };
  const root = document.getElementById("mice");
  setSectionVisible(root, merged.enabled !== "0");
  if (!root) return;

  const kicker = root.querySelector("#miceKicker");
  const subtitle = root.querySelector("#miceSubtitle");
  if (kicker && merged.kicker) kicker.textContent = merged.kicker;
  if (subtitle && merged.subtitle) subtitle.textContent = merged.subtitle;

  const list = document.getElementById("miceList");
  if (list) {
    const items = parseJson(merged.items_json);
    if (items.length) {
      list.innerHTML = items.map((item) => `
        <article>
          <span class="mice-icon" aria-hidden="true">${escapeHtml(item.icon || "✦")}</span>
          <div>
            <h3>${escapeHtml(item.title || "")}</h3>
            <p>${escapeHtml(item.description || "")}</p>
          </div>
        </article>`).join("");
    }
  }

  const image = document.getElementById("miceImage");
  if (image && merged.image_url) {
    setImgSrc(image, merged.image_url, cmsState.homeUpdatedAt);
    image.alt = merged.kicker || "Corporate event venue";
  }

  const statsGrid = document.getElementById("miceStats");
  if (statsGrid && merged.stats_json != null) {
    const stats = parseJson(merged.stats_json);
    statsGrid.innerHTML = stats.length
      ? stats.map((item) => `
        <article><strong>${escapeHtml(item.value || "")}</strong><span>${escapeHtml(item.label || "")}</span></article>`).join("")
      : "";
  }
}

function applyProcessSection(section = {}) {
  const root = document.getElementById("processSection");
  setSectionVisible(root, section.enabled !== "0");
  if (!root) return;

  const kicker = document.getElementById("processKicker");
  const subtitle = document.getElementById("processSubtitle");
  const eyebrow = document.getElementById("processEyebrow");
  const title = document.getElementById("processTitle");
  const description = document.getElementById("processDescription");
  if (kicker && section.kicker) kicker.textContent = section.kicker;
  if (subtitle && section.subtitle) subtitle.textContent = section.subtitle;
  if (eyebrow && section.eyebrow) eyebrow.textContent = section.eyebrow;
  if (title && section.title) title.textContent = section.title;
  if (description && section.description) description.textContent = section.description;

  const grid = document.getElementById("processGrid");
  if (!grid) return;
  const steps = parseJson(section.steps_json);
  if (!steps.length) return;

  grid.innerHTML = steps.map((step, index) => `
    <article><span>${index + 1}</span><h3>${escapeHtml(step.title || "")}</h3><p>${escapeHtml(step.description || "")}</p></article>`).join("");
}

function applySuccessStoriesSection(section = {}) {
  const root = document.getElementById("successStories");
  setSectionVisible(root, section.enabled !== "0");
  if (!root) return;

  const kicker = root.querySelector("#successStoriesKicker");
  const subtitle = root.querySelector("#successStoriesSubtitle");
  if (kicker && section.kicker) kicker.textContent = section.kicker;
  if (subtitle && section.subtitle) subtitle.textContent = section.subtitle;

  const grid = document.getElementById("successStoriesGrid");
  if (!grid) return;
  const items = parseJson(section.items_json);
  if (!items.length) return;

  grid.innerHTML = items.map((item) => `
    <article>
      <img src="${escapeHtml(assetUrl(item.image, cmsState.homeUpdatedAt))}" alt="${escapeHtml(item.alt || item.title || "Success story")}" loading="lazy" />
      <div class="success-body">
        <h3>${escapeHtml(item.title || "")}</h3>
        <p class="success-label">Challenge</p>
        <p>${escapeHtml(item.challenge || "")}</p>
        <p class="success-label">Solution</p>
        <p>${escapeHtml(item.solution || "")}</p>
        <p class="success-label">Outcome</p>
        <p>${escapeHtml(item.outcome || "")}</p>
      </div>
    </article>`).join("");
}

function applyNumbersSection(section = {}) {
  const root = document.getElementById("numbersSection");
  setSectionVisible(root, section.enabled !== "0");
  if (!root) return;

  const kicker = document.getElementById("numbersKicker");
  const subtitle = document.getElementById("numbersSubtitle");
  if (kicker && section.kicker) kicker.textContent = section.kicker;
  if (subtitle && section.subtitle) subtitle.textContent = section.subtitle;

  const grid = document.getElementById("numbersGrid");
  if (!grid) return;
  const stats = parseJson(section.stats_json);
  if (!stats.length) return;

  grid.innerHTML = stats.map((item) => `
    <article><strong>${escapeHtml(item.value || "")}</strong><span>${escapeHtml(item.label || "")}</span></article>`).join("");
}

function applyHomeSections(sections = {}) {
  applyScotlandAttractionsSection(sections.scotland_attractions || {});
  applyPremiumServicesSection(sections.premium_services || {});
  const miceSection = sections.mice || {};
  const miceStatsFallback = sections.mice_stats?.stats_json;
  applyMiceSection(miceSection, miceStatsFallback ? { stats_json: miceStatsFallback } : {});
  applyProcessSection(sections.process || {});
  applySuccessStoriesSection(sections.success_stories || {});
  applyNumbersSection(sections.numbers || {});
}

async function loadCmsHome() {
  try {
    const data = await fetchJson("/cms/home");
    const sections = data.sections || {};
    cmsState.home = sections;
    cmsState.homeUpdatedAt = data.updated_at || Date.now();
    if (data.updated_at) cmsRevision = String(data.updated_at);
    applyHeroContent(sections.hero || {}, sections.trust || {}, sections.stats || {});
    applyWhyChooseSection(sections.why_choose || {});
    applyFeaturedToursSection(sections.featured_tours || {});
    applyTestimonialsSection(sections.testimonials || {});
    applySectionHeading(
      "#packagesHeading",
      sections.packages_heading?.kicker,
      sections.packages_heading?.title,
      sections.packages_heading?.subtitle
    );
    applyPackagesVisibility();
    applyDestinationsSection(sections.destinations || {});
    applyGallerySection(sections.gallery_section || {});
    applyHomeSections(sections);
    const packagesKicker = document.getElementById("packagesKicker");
    const packagesSubtitle = document.getElementById("packagesSubtitle");
    if (packagesKicker && sections.packages_heading?.kicker) packagesKicker.textContent = sections.packages_heading.kicker;
    if (packagesSubtitle && sections.packages_heading?.subtitle) packagesSubtitle.textContent = sections.packages_heading.subtitle;
  } catch {
    // fallback to static hero
  }
}

async function loadCmsAbout() {
  try {
    const data = await fetchJson("/cms/about-us");
    cmsState.about = data.sections || {};
    cmsState.aboutUpdatedAt = data.updated_at || Date.now();
    if (data.updated_at) cmsRevision = String(data.updated_at);
    applyAboutContent(cmsState.about);
  } catch (err) {
    console.warn("loadCmsAbout:", err);
    if (cmsState.about?.team) renderTeamGrid(cmsState.about.team);
  }
}

async function loadCmsContact() {
  try {
    const [cmsData, settingsData] = await Promise.all([
      fetchJson("/cms/contact"),
      fetchJson("/settings"),
    ]);
    const sections = cmsData.sections || {};
    cmsState.contact = sections;
    cmsState.contactUpdatedAt = cmsData.updated_at || Date.now();
    if (cmsData.updated_at) cmsRevision = String(cmsData.updated_at);
    applyContactContent(sections, settingsData.settings || {});
    applyBrandSettings(settingsData.settings || {});
  } catch {
    renderProposalForm({});
  }
}

async function loadCmsBlog() {
  try {
    const data = await fetchJson("/cms/blog");
    cmsState.blogUpdatedAt = data.updated_at || Date.now();
    if (data.updated_at) cmsRevision = String(data.updated_at);
    applyBlogCms(data.sections || {});
  } catch {
    // keep static
  }
}

async function loadCmsPackagesPage() {
  try {
    const data = await fetchJson("/cms/packages-page");
    cmsState.packagesPageUpdatedAt = data.updated_at || Date.now();
    if (data.updated_at) cmsRevision = String(data.updated_at);
    applyPackagesPageCms(data.sections || {});
  } catch {
    // keep static
  }
}

async function loadCmsFooter() {
  try {
    const [cmsData, settingsData] = await Promise.all([
      fetchJson("/cms/footer"),
      fetchJson("/settings"),
    ]);
    applyFooterCms(cmsData.sections || {}, settingsData.settings || {});
  } catch {
    // keep static
  }
}

async function loadSettings() {
  try {
    const data = await fetchJson("/settings");
    applyBrandSettings(data.settings || {});
  } catch {
    // keep defaults
  }
}

function animateCounters() {
  const statValues = document.querySelectorAll(".hero-stats strong, .numbers-grid strong");
  statValues.forEach((el) => {
    const text = el.textContent || "";
    const numMatch = text.match(/([\d.]+)/);
    if (!numMatch) return;
    const target = parseFloat(numMatch[0]);
    const suffix = text.replace(numMatch[0], "");
    const duration = 1200;
    const start = performance.now();

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const current = Math.floor(target * easeOut(progress));
      el.textContent = `${current}${suffix}`;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  });
}

function bindBlogTabs() {
  document.querySelectorAll("#blogCategoryTabs .blog-tab").forEach((tab) => {
    if (tab._bound) return;
    tab._bound = true;
    tab.addEventListener("click", () => {
      document.querySelectorAll("#blogCategoryTabs .blog-tab").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      activeBlogCategory = tab.dataset.category || "all";
      renderBlogGrid();
    });
  });
}

function bindPackageTabs() {
  document.querySelectorAll("#packageCategoryTabs .package-tab").forEach((tab) => {
    if (tab._bound) return;
    tab._bound = true;
    tab.addEventListener("click", () => {
      document.querySelectorAll("#packageCategoryTabs .package-tab").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      activePackageCategory = tab.dataset.category || "all";
      renderPackageGrid();
    });
  });
}

function bindPackageSearch() {
  const search = document.getElementById("packagesSearch");
  if (!search || search._bound) return;
  search._bound = true;
  search.addEventListener("input", () => {
    packageSearchQuery = search.value.trim();
    renderPackageGrid();
  });
}

function bindBlogSearch() {
  const search = document.getElementById("blogSearch");
  if (!search || search._bound) return;
  search._bound = true;
  search.addEventListener("input", () => {
    blogSearchQuery = search.value.trim();
    renderBlogGrid();
  });
}

function bindNewsletterForm() {
  document.getElementById("footerNewsletterForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("footerNewsletterInput");
    const button = document.getElementById("footerNewsletterButton");
    if (button) button.textContent = "Subscribed!";
    if (input) input.value = "";
    setTimeout(() => {
      if (button) button.textContent = cmsState.footer?.newsletter?.button_text || "Subscribe";
    }, 2000);
  });
}

function bindAccordion() {
  document.querySelectorAll(".accordion details").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) return;
      document.querySelectorAll(".accordion details").forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });
}

function bindProposalForm(formConfig = {}) {
  const form = document.getElementById("proposalForm");
  if (!form || form._bound) return;
  form._bound = true;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = {
      name: data.get("fullName") || data.get("name"),
      company: data.get("companyName") || data.get("company"),
      email: data.get("emailAddress") || data.get("email"),
      phone: data.get("phoneNumber") || data.get("phone"),
      message: data.get("proposalMessage") || data.get("message") || "Partnership request",
    };

    const button = form.querySelector(".proposal-button");
    const original = button?.textContent || "Send Message";
    if (button) {
      button.textContent = "Sending...";
      button.disabled = true;
    }

    try {
      const res = await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Request failed");

      if (button) button.textContent = formConfig.success_message || "Message Sent";
      form.reset();
    } catch {
      if (button) button.textContent = "Failed";
    } finally {
      setTimeout(() => {
        if (button) {
          button.textContent = original;
          button.disabled = false;
        }
      }, 1800);
    }
  });
}

function bindChatBubble() {
  document.querySelector(".chat-bubble")?.addEventListener("click", () => {
    window.location.hash = "#proposal";
  });
}

function wireImageFallbacks() {
  const fallback = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";
  document.querySelectorAll("img").forEach((img) => {
    if (img._fallbackWired) return;
    img._fallbackWired = true;
    img.addEventListener("error", () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = "1";
      img.src = fallback;
    });
  });
}

function observeSections() {
  if (window.SiteChrome?.initScrollReveal) {
    SiteChrome.initScrollReveal();
  }

  const hero = document.querySelector(".hero");
  if (hero) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          heroObserver.unobserve(entry.target);
        }
      });
    });
    heroObserver.observe(hero);
  }
}

async function connectLiveUpdates() {
  if (typeof io === "undefined") {
    try {
      await window.CALEDOR_CONFIG?.ensureSocketIoClient?.();
    } catch (err) {
      // Socket.IO is optional; the site still works without it.
      console.warn("Socket.IO client load failed:", err?.message || err);
    }
  }
  if (typeof io === "undefined") return;

  const socket = window.CALEDOR_CONFIG?.connectSocket?.() ?? io();

  const reloaders = {
    "cms:updated": (payload) => {
      if (payload?.timestamp) cmsRevision = String(payload.timestamp);
      const tab = payload?.tab;
      if (tab === "home") return Promise.all([loadCmsHome(), loadPackages()]);
      if (tab === "about-us") return loadCmsAbout();
      if (tab === "contact") return loadCmsContact();
      if (tab === "blog") return Promise.all([loadCmsBlog(), loadBlogPosts()]);
      if (tab === "packages-page") return Promise.all([loadCmsPackagesPage(), loadPackages()]);
      if (tab === "footer") return loadCmsFooter();
      if (tab === "faq") return Promise.all([loadCmsFaq(), loadFaqs()]);
      return Promise.all([
        loadCmsHome(), loadCmsAbout(), loadCmsContact(), loadCmsBlog(),
        loadCmsPackagesPage(), loadCmsFooter(), loadCmsFaq(), loadPackages(), loadBlogPosts(),
      ]);
    },
    "settings:updated": () => Promise.all([loadSettings(), loadCmsContact(), loadCmsFooter()]),
    "package:created": loadPackages,
    "package:updated": loadPackages,
    "package:deleted": loadPackages,
    "blog:created": loadBlogPosts,
    "blog:updated": loadBlogPosts,
    "blog:deleted": loadBlogPosts,
    "gallery:updated": loadGallery,
    "gallery:created": loadGallery,
    "gallery:deleted": loadGallery,
    "faq:updated": loadFaqs,
    "faq:created": loadFaqs,
    "faq:deleted": loadFaqs,
  };

  Object.entries(reloaders).forEach(([event, fn]) => {
    socket.on(event, (data) => fn(data));
  });
}

function wireMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const panel = document.getElementById("mobileNav");
  if (!toggle || !panel) return;

  const close = () => {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  };

  toggle.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-open", open);
  });

  panel.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) close();
  });
}

function wireNavHighlight() {
  const links = [
    ...document.querySelectorAll(".desktop-nav a[href^='#']"),
    ...document.querySelectorAll("#mobileNav a[href^='#']"),
  ];
  if (!links.length) return;

  const sections = links
    .map((link) => {
      const id = link.getAttribute("href")?.replace(/^#/, "");
      const el = id ? document.getElementById(id) : null;
      return el ? { link, el, id } : null;
    })
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach((link) => {
      const match = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", match);
      if (match) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("href")?.replace(/^#/, "");
      if (id) setActive(id);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible[0]?.target?.id) setActive(visible[0].target.id);
  }, { rootMargin: "-28% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] });

  sections.forEach(({ el }) => observer.observe(el));

  const hash = window.location.hash.replace(/^#/, "");
  if (hash) setActive(hash);
}

async function init() {
  // Paint static HTML immediately — never hide the page while APIs load.
  document.body.classList.remove("is-loading");
  document.body.classList.add("cms-ready");

  bindAccordion();
  bindChatBubble();
  bindPackageSearch();
  bindBlogSearch();
  bindNewsletterForm();
  observeSections();
  connectLiveUpdates();
  wireMobileNav();
  wireNavHighlight();
  wireImageFallbacks();

  if (window.SiteChrome?.initScrollReveal) {
    window.SiteChrome.initScrollReveal();
  }

  // Apply CMS/API data in the background; page stays visible the whole time.
  // Load CMS visibility flags before packages so hidden section never flashes old cards.
  try {
    await Promise.all([
      loadSettings(),
      loadCmsHome(),
      loadCmsPackagesPage(),
      loadCmsAbout(),
      loadCmsContact(),
      loadCmsBlog(),
      loadCmsFooter(),
      loadCmsFaq(),
    ]);
    applyPackagesVisibility();
    await Promise.all([
      loadPackages(),
      loadBlogPosts(),
      loadFaqs(),
      loadGallery(),
    ]);
  } catch (err) {
    console.warn("CMS/API load issue:", err);
  } finally {
    applyPackagesVisibility();
    wireImageFallbacks();
    if (window.SiteChrome?.initScrollReveal) {
      window.SiteChrome.initScrollReveal();
    }
  }
}

document.addEventListener("DOMContentLoaded", init);
