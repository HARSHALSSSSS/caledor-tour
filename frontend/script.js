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

function applyHeroContent(hero = {}, trust = {}, stats = {}) {
  const heroSection = document.getElementById("hero") || document.querySelector(".hero");
  setSectionVisible(heroSection, hero.enabled !== "0");

  const eyebrow = document.querySelector(".hero .eyebrow");
  const heading = document.querySelector(".hero h1");
  const copy = document.querySelector(".hero-content p:not(.eyebrow)");
  const primary = document.querySelector(".hero-actions .primary");
  const secondary = document.querySelector(".hero-actions .ghost");

  if (heroSection && hero.background_image) {
    heroSection.style.backgroundImage = [
      "linear-gradient(180deg, rgba(8, 15, 33, 0.28), rgba(8, 15, 33, 0.62) 44%, rgba(8, 15, 33, 0.94) 100%)",
      bgUrl(hero.background_image, cmsState.homeUpdatedAt),
    ].join(",");
    heroSection.style.backgroundSize = "cover";
    heroSection.style.backgroundPosition = "center";
  }

  if (eyebrow && hero.eyebrow) eyebrow.textContent = hero.eyebrow;
  if (heading && hero.title) heading.innerHTML = escapeHtml(hero.title).replace(/\n/g, "<br />");
  if (copy && hero.subtitle) copy.textContent = hero.subtitle;

  if (primary) {
    primary.textContent = hero.primary_cta_label || "Become a Partner";
    primary.href = hero.primary_cta_url || "#contact";
  }

  if (secondary) {
    secondary.textContent = hero.secondary_cta_label || "Explore Destinations";
    secondary.href = hero.secondary_cta_url || "#destinations";
  }

  const trustValues = [trust.point_1, trust.point_2, trust.point_3, trust.point_4].filter(Boolean);
  document.querySelectorAll(".hero-trust span").forEach((item, index) => {
    if (trustValues[index]) item.textContent = trustValues[index];
  });

  const statValues = [
    [stats.stat_1_value, stats.stat_1_label],
    [stats.stat_2_value, stats.stat_2_label],
    [stats.stat_3_value, stats.stat_3_label],
    [stats.stat_4_value, stats.stat_4_label],
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

  const copyright = document.getElementById("footerCopyright");
  if (copyright && general.copyright) copyright.textContent = general.copyright;

  const contactEmail = contact.contact_email || "info@caledor.com";
  const contactPhone = contact.contact_phone || "+44 20 0000 0000";
  const contactAddress = contact.address || "12 Waterfront Lane, London, United Kingdom";

  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.href = `mailto:${contactEmail}?subject=Request%20Proposal`;
  });

  const footerEmail = document.getElementById("footerEmail");
  const footerPhone = document.getElementById("footerPhone");
  const footerAddress = document.getElementById("footerAddress");
  if (footerEmail) footerEmail.textContent = contactEmail;
  if (footerPhone) footerPhone.textContent = contactPhone;
  if (footerAddress) footerAddress.textContent = contactAddress;

  document.querySelectorAll("#footerSocials a").forEach((link) => {
    const label = (link.getAttribute("aria-label") || "").toLowerCase();
    if (label === "facebook" && social.facebook_url) link.href = social.facebook_url;
    if (label === "instagram" && social.instagram_url) link.href = social.instagram_url;
    if (label === "linkedin" && social.linkedin_url) link.href = social.linkedin_url;
    if (label === "twitter" && social.twitter_url) link.href = social.twitter_url;
  });
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
  if (!features.length) return;

  grid.innerHTML = features.map((item) => `
    <article>
      <span class="fit-icon" aria-hidden="true">${escapeHtml(item.icon || "★")}</span>
      <h3>${escapeHtml(item.title || "")}</h3>
      <p>${escapeHtml(item.description || "")}</p>
    </article>`).join("");
}

function applyFeaturedToursSection(section = {}) {
  const root = document.getElementById("featuredToursSection");
  setSectionVisible(root, section.enabled !== "0");
  if (!root) return;

  const kicker = document.getElementById("featuredToursKicker");
  const subtitle = document.getElementById("featuredToursSubtitle");
  if (kicker && section.section_title) kicker.textContent = section.section_title;
  if (subtitle && section.section_subtitle) subtitle.textContent = section.section_subtitle;

  const grid = document.getElementById("featuredToursGrid");
  if (!grid) return;

  const tags = parseJson(section.tour_tags_json).map((t) => t.toLowerCase());
  const limit = parseInt(section.tours_count || "6", 10);
  let packages = cmsState.packages || [];

  if (tags.length) {
    const matched = packages.filter((pkg) => tags.some((tag) => (pkg.name || "").toLowerCase().includes(tag)));
    packages = matched.length ? matched : packages;
  }

  if (!packages.length) return;
  grid.innerHTML = packages.slice(0, limit).map((pkg) => packageCard(pkg)).join("");
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
      aboutImage.alt = story.heading || pageHero.title || "About Caledor DMC";
    }
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

  const teamSection = document.getElementById("teamSection");
  setSectionVisible(teamSection, team.enabled !== "0");
  const teamKicker = document.getElementById("teamKicker");
  const teamTitle = document.getElementById("teamTitle");
  const teamSubtitle = document.getElementById("teamSubtitle");
  if (teamKicker) teamKicker.textContent = "Our Leadership Team";
  if (teamTitle && team.heading) teamTitle.textContent = team.heading;
  if (teamSubtitle) {
    teamSubtitle.textContent = team.description || "";
    teamSubtitle.hidden = !team.description;
  }

  const teamGrid = document.getElementById("teamGrid");
  if (teamGrid) {
    const members = parseJson(team.members_json);
    teamGrid.innerHTML = members.map((member, index) => `
      <div class="leader-row${index % 2 ? " reverse" : ""}">
        <img src="${escapeHtml(assetUrl(member.photo, cmsState.aboutUpdatedAt))}" alt="${escapeHtml(member.name || "Team member")}" />
        <div>
          <p class="mini-label">${escapeHtml(member.role || "")}</p>
          <h3>${escapeHtml(member.name || "")}</h3>
          <p>${escapeHtml(member.bio || "")}</p>
          ${member.linkedin || member.twitter ? `<div class="team-socials">
            ${member.linkedin ? `<a href="${escapeHtml(member.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ""}
            ${member.twitter ? `<a href="${escapeHtml(member.twitter)}" target="_blank" rel="noopener">Twitter</a>` : ""}
          </div>` : ""}
        </div>
      </div>`).join("");
  }

  const awardsSection = document.getElementById("awardsSection");
  const ownedAssets = sections.owned_assets || {};
  setSectionVisible(awardsSection, ownedAssets.enabled !== "0");

  const ownedKicker = document.getElementById("ownedAssetsKicker");
  const ownedTitle = document.getElementById("ownedAssetsTitle");
  const ownedDesc = document.getElementById("ownedAssetsDescription");
  const propertyName = document.getElementById("ownedPropertyName");
  const propertyLocation = document.getElementById("ownedPropertyLocation");
  const propertyText = document.getElementById("ownedPropertyText");
  const badgesGrid = document.getElementById("ownedAssetsBadges");

  if (ownedKicker && ownedAssets.kicker) ownedKicker.textContent = ownedAssets.kicker;
  if (ownedTitle && ownedAssets.title) ownedTitle.textContent = ownedAssets.title;
  if (ownedDesc && ownedAssets.description) ownedDesc.textContent = ownedAssets.description;
  if (propertyName && ownedAssets.property_name) propertyName.textContent = ownedAssets.property_name;
  if (propertyLocation && ownedAssets.property_location) propertyLocation.textContent = ownedAssets.property_location;
  if (propertyText && ownedAssets.property_text) propertyText.textContent = ownedAssets.property_text;

  if (badgesGrid) {
    const badges = parseJson(ownedAssets.badges_json);
    if (badges.length) {
      badgesGrid.innerHTML = badges.map((item) => `<span>${escapeHtml(item.text || "")}</span>`).join("");
    }
  }

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
  const button = document.querySelector("#contact .contact-button");
  const heroBg = document.getElementById("contactHeroBg");

  if (title && hero.title) title.textContent = hero.title;
  if (subtitle && hero.subtitle) subtitle.textContent = hero.subtitle;
  if (button) {
    if (hero.button_label) button.textContent = hero.button_label;
    const email = info.email_1 || settings.contact?.contact_email || "info@caledor.com";
    button.href = `mailto:${email}?subject=Request%20Proposal`;
  }
  if (heroBg && hero.background_image) {
    heroBg.style.backgroundImage = bgUrl(hero.background_image, cmsState.contactUpdatedAt);
    heroBg.style.backgroundSize = "cover";
    heroBg.style.backgroundPosition = "center";
  }

  const formTitle = document.querySelector(".request-proposal-title");
  const formSubtitle = document.querySelector(".request-proposal-subtitle");
  if (formTitle) formTitle.textContent = form.heading || form.title || "Request proposal";
  if (formSubtitle) formSubtitle.textContent = form.subtitle || formSubtitle?.textContent || "";

  setSectionVisible(document.getElementById("proposal"), form.enabled !== "0");
  if (form.enabled !== "0") renderProposalForm(form);

  const infoSection = document.getElementById("contactInfoSection");
  setSectionVisible(infoSection, info.enabled !== "0");
  const infoGrid = document.getElementById("contactInfoGrid");
  if (infoGrid && info.enabled !== "0") {
    infoGrid.innerHTML = [
      info.address ? `<article><h3>Address</h3><p>${escapeHtml(info.address)}</p></article>` : "",
      info.phone_1 ? `<article><h3>Phone</h3><p>${escapeHtml(info.phone_1)}${info.phone_2 ? `<br>${escapeHtml(info.phone_2)}` : ""}</p></article>` : "",
      info.email_1 ? `<article><h3>Email</h3><p>${escapeHtml(info.email_1)}${info.email_2 ? `<br>${escapeHtml(info.email_2)}` : ""}</p></article>` : "",
      info.hours_weekday ? `<article><h3>Working Hours</h3><p>${escapeHtml(info.hours_weekday)}${info.hours_weekend ? `<br>${escapeHtml(info.hours_weekend)}` : ""}</p></article>` : "",
      info.whatsapp && info.show_whatsapp === "1" ? `<article><h3>WhatsApp</h3><p><a href="https://wa.me/${escapeHtml(info.whatsapp.replace(/\D/g, ""))}" target="_blank" rel="noopener">${escapeHtml(info.whatsapp)}</a></p></article>` : "",
    ].filter(Boolean).join("");
  }

  const chatBubble = document.querySelector(".chat-bubble");
  if (chatBubble) {
    if (info.show_whatsapp === "1" && info.whatsapp) {
      chatBubble.hidden = false;
      chatBubble.onclick = () => { window.open(`https://wa.me/${info.whatsapp.replace(/\D/g, "")}`, "_blank"); };
    } else {
      chatBubble.onclick = () => { window.location.hash = "#contact"; };
    }
  }

  const mapSection = document.getElementById("contactMapSection");
  const mapFrame = document.getElementById("contactMapFrame");
  setSectionVisible(mapSection, map.enabled !== "0");
  if (mapFrame && map.embed_url) {
    mapFrame.src = map.embed_url;
    mapFrame.style.height = `${map.height || 400}px`;
    mapFrame.style.width = "100%";
    mapFrame.style.border = "0";
    mapFrame.style.borderRadius = "12px";
  }

  const contactSocials = document.getElementById("contactSocials");
  if (contactSocials) {
    if (socialCms.show_contact === "0") {
      contactSocials.innerHTML = "";
    } else {
      const links = [
        ["Facebook", social.facebook_url],
        ["Instagram", social.instagram_url],
        ["Twitter", social.twitter_url],
        ["YouTube", social.youtube_url],
        ["LinkedIn", social.linkedin_url],
      ].filter(([, url]) => url);
      contactSocials.innerHTML = links.map(([label, url]) =>
        `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`).join("");
    }
  }

  const footerSocials = document.getElementById("footerSocials");
  if (footerSocials) {
    if (socialCms.show_footer === "0") footerSocials.setAttribute("hidden", "");
    else footerSocials.removeAttribute("hidden");
  }
}

function applyFooterCms(sections = {}, settings = {}) {
  cmsState.footer = sections;
  applyBrandSettings(settings);

  setSectionVisible(document.getElementById("siteFooter"), sections.brand?.enabled !== "0");

  const navCols = document.getElementById("footerNavCols");
  if (navCols && sections.navigation?.enabled !== "0") {
    const columns = parseJson(sections.navigation?.columns_json);
    navCols.innerHTML = columns.map((col) => `
      <div>
        <h3>${escapeHtml(col.title || "")}</h3>
        ${(col.links || []).map((link) => `<a href="${escapeHtml(link.url || "#")}">${escapeHtml(link.label || "")}</a>`).join("")}
      </div>`).join("");
  } else if (navCols) {
    navCols.innerHTML = "";
  }

  const newsletter = sections.newsletter || {};
  const newsletterEl = document.getElementById("footerNewsletter");
  setSectionVisible(newsletterEl, newsletter.enabled === "1");
  if (newsletterEl && newsletter.enabled === "1") {
    const title = document.getElementById("footerNewsletterTitle");
    const subtitle = document.getElementById("footerNewsletterSubtitle");
    const input = document.getElementById("footerNewsletterInput");
    const button = document.getElementById("footerNewsletterButton");
    if (title && newsletter.title) title.textContent = newsletter.title;
    if (subtitle) {
      subtitle.textContent = newsletter.subtitle || "";
      subtitle.hidden = !newsletter.subtitle;
    }
    if (input && newsletter.placeholder) input.placeholder = newsletter.placeholder;
    if (button && newsletter.button_text) button.textContent = newsletter.button_text;
  }

  const bottom = sections.bottom_bar || {};
  const policyLinks = document.getElementById("footerPolicyLinks");
  if (policyLinks && bottom.enabled !== "0") {
    policyLinks.innerHTML = [
      bottom.privacy_url ? `<a href="${escapeHtml(bottom.privacy_url)}">Privacy Policy</a>` : "",
      bottom.terms_url ? `<a href="${escapeHtml(bottom.terms_url)}">Terms</a>` : "",
      bottom.cookie_url ? `<a href="${escapeHtml(bottom.cookie_url)}">Cookies</a>` : "",
    ].filter(Boolean).join("");
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
  const hero = sections.hero || {};
  const listing = sections.listing || {};
  const categories = sections.categories || {};
  const cta = sections.cta || {};

  const heroEl = document.getElementById("packagesHero");
  setSectionVisible(heroEl, hero.enabled !== "0");
  if (heroEl && hero.enabled !== "0") {
    const bg = document.getElementById("packagesHeroBg");
    const title = document.getElementById("packagesHeroTitle");
    const subtitle = document.getElementById("packagesHeroSubtitle");
    const searchWrap = document.getElementById("packagesSearchWrap");
    const search = document.getElementById("packagesSearch");
    if (bg && hero.background_image) bg.style.backgroundImage = bgUrl(hero.background_image, cmsState.packagesPageUpdatedAt);
    if (title && hero.title) title.textContent = hero.title;
    if (subtitle && hero.subtitle) subtitle.textContent = hero.subtitle;
    setSectionVisible(searchWrap, hero.show_search !== "0");
    if (search && hero.search_placeholder) search.placeholder = hero.search_placeholder;
  }

  const heading = document.getElementById("packagesHeading");
  if (heading && hero.enabled !== "0") heading.setAttribute("hidden", "");
  else heading?.removeAttribute("hidden");

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
    if (window.innerWidth > 900 && listing.grid_columns) {
      grid.style.gridTemplateColumns = `repeat(${Math.min(parseInt(listing.grid_columns, 10) || 3, 4)}, minmax(0, 1fr))`;
    } else {
      grid.style.gridTemplateColumns = "";
    }
  }

  renderPackageGrid();
}

function packageCard(pkg, listing = {}) {
  const image = assetUrl(pkg.image_url, pkg.updated_at) || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85";
  const price = pkg.price_from != null ? `${pkg.currency || "$"}${Number(pkg.price_from).toLocaleString()}` : "On request";
  const duration = pkg.duration || "Custom itinerary";
  const showPrice = listing.show_price !== "0";
  const showDuration = listing.show_duration !== "0";
  const detailUrl = `package-detail.html?slug=${encodeURIComponent(pkg.slug || pkg.id)}`;
  return `
    <a class="featured-card package-card-link" href="${escapeHtml(detailUrl)}">
      <img class="media-cover" src="${escapeHtml(image)}" alt="${escapeHtml(pkg.name)}" loading="lazy" />
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
  const grid = document.getElementById("packageGrid");
  if (!grid) return;
  const listing = cmsState.packagesPage?.listing || {};
  const limit = parseInt(listing.packages_per_page || "12", 10);
  let packages = cmsState.packages || [];

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
    grid.innerHTML = `<p class="packages-empty">No packages published yet. Add packages in the admin panel.</p>`;
    return;
  }
  grid.innerHTML = packages.slice(0, limit).map((pkg) => packageCard(pkg, listing)).join("");
}

function blogCard(post, listing = {}) {
  const image = assetUrl(post.image_url, post.updated_at) || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=85";
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

async function loadPackages() {
  try {
    const data = await fetchJson("/packages?active=true");
    cmsState.packages = data.packages || [];
    renderPackageGrid();
    applyFeaturedToursSection(cmsState.home?.featured_tours || {});
  } catch (err) {
    console.error("loadPackages:", err);
  }
}

async function loadBlogPosts() {
  try {
    const data = await fetchJson("/blog?published=true");
    cmsState.blogPosts = data.posts || [];
    renderBlogGrid();
  } catch (err) {
    console.error("loadBlogPosts:", err);
  }
}

async function loadFaqs() {
  const accordion = document.getElementById("faqAccordion");
  if (!accordion) return;
  try {
    const data = await fetchJson("/faqs?active=true");
    const faqs = data.faqs || [];
    if (!faqs.length) return;
    accordion.innerHTML = faqs
      .map((faq, index) => `
        <details${index === 0 ? " open" : ""}>
          <summary>${escapeHtml(faq.question)}</summary>
          <p>${escapeHtml(faq.answer)}</p>
        </details>`)
      .join("");
    bindAccordion();
  } catch {
    // keep fallback content
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
  const grid = document.getElementById("destinationGrid");
  if (kicker && section.kicker) kicker.textContent = section.kicker;
  if (title && section.title) title.textContent = section.title;
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
      <img src="${escapeHtml(assetUrl(item.image, cmsState.homeUpdatedAt))}" alt="${escapeHtml(item.name)}" loading="lazy" />
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

async function loadGallery() {
  const grid = document.getElementById("galleryGrid") || document.querySelector(".gallery-grid");
  if (!grid) return;
  try {
    const data = await fetchJson("/gallery");
    const items = data.items || [];
    if (!items.length) return;
    grid.innerHTML = items.map((item, index) => `
      <figure class="gallery-cell${index === 0 ? " gallery-cell-hero" : ""}">
        <img src="${escapeHtml(assetUrl(item.image_url, item.updated_at || cmsRevision))}" alt="${escapeHtml(item.alt_text || item.title || "Gallery image")}" loading="lazy" />
      </figure>
    `).join("");
  } catch {
    // keep static fallback images in HTML
  }
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
  const items = parseJson(section.items_json);
  if (!items.length) return;

  grid.innerHTML = items.map((item) => `
    <article class="scotland-tile${item.hero ? " scotland-tile-hero" : ""}">
      <img src="${escapeHtml(assetUrl(item.image, cmsState.homeUpdatedAt))}" alt="${escapeHtml(item.alt || item.label || "Scotland attraction")}" loading="lazy" />
      <span class="scotland-label">${escapeHtml(item.label || "")}</span>
    </article>`).join("");
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
      <img src="${escapeHtml(assetUrl(item.image, cmsState.homeUpdatedAt))}" alt="${escapeHtml(item.alt || item.title || "Premium service")}" loading="lazy" />
      <div>
        <h3>${escapeHtml(item.title || "")}</h3>
        <p>${escapeHtml(item.description || "")}</p>
        <a href="${escapeHtml(item.link || "#contact")}">Learn more</a>
      </div>
    </article>`).join("");
}

function applyMiceSection(section = {}) {
  const root = document.getElementById("mice");
  setSectionVisible(root, section.enabled !== "0");
  if (!root) return;

  const kicker = root.querySelector("#miceKicker");
  const subtitle = root.querySelector("#miceSubtitle");
  if (kicker && section.kicker) kicker.textContent = section.kicker;
  if (subtitle && section.subtitle) subtitle.textContent = section.subtitle;

  const list = document.getElementById("miceList");
  if (list) {
    const items = parseJson(section.items_json);
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
  if (image && section.image_url) {
    setImgSrc(image, section.image_url, cmsState.homeUpdatedAt);
    image.alt = section.kicker || "Corporate event venue";
  }

  const statsGrid = document.getElementById("miceStats");
  if (statsGrid) {
    const stats = parseJson(section.stats_json);
    if (stats.length) {
      statsGrid.innerHTML = stats.map((item) => `
        <article><strong>${escapeHtml(item.value || "")}</strong><span>${escapeHtml(item.label || "")}</span></article>`).join("");
    }
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
  applyMiceSection(sections.mice || {});
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
    applyDestinationsSection(sections.destinations || {});
    applyGallerySection(sections.gallery_section || {});
    applyHomeSections(sections);
    const packagesKicker = document.getElementById("packagesKicker");
    const packagesTitle = document.getElementById("packagesTitle");
    const packagesSubtitle = document.getElementById("packagesSubtitle");
    if (packagesKicker && sections.packages_heading?.kicker) packagesKicker.textContent = sections.packages_heading.kicker;
    if (packagesTitle && sections.packages_heading?.title) packagesTitle.textContent = sections.packages_heading.title;
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
    applyAboutContent(data.sections || {});
  } catch {
    // keep static
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
    window.location.hash = "#contact";
  });
}

function observeSections() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".section-light, .section-dark").forEach((section) => {
    observer.observe(section);
  });

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

function connectLiveUpdates() {
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

async function init() {
  try {
    bindAccordion();
    bindChatBubble();
    bindPackageSearch();
    bindBlogSearch();
    bindNewsletterForm();
    observeSections();
    connectLiveUpdates();
    wireMobileNav();

    await loadSettings();
    await loadPackages();
    await Promise.all([
      loadCmsHome(),
      loadCmsAbout(),
      loadCmsContact(),
      loadCmsBlog(),
      loadCmsPackagesPage(),
      loadCmsFooter(),
      loadCmsFaq(),
      loadBlogPosts(),
      loadFaqs(),
      loadGallery(),
    ]);
  } finally {
    document.body.classList.remove("is-loading");
    document.body.classList.add("cms-ready");
  }
}

document.addEventListener("DOMContentLoaded", init);
