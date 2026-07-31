(function () {
  const API = window.CALEDOR_CONFIG?.apiBase ?? "/api";

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[ch]));
  }

  function parseJson(raw, fb = []) {
    try { return JSON.parse(raw || "[]"); } catch { return fb; }
  }

  async function fetchJson(path) {
    const sep = path.includes("?") ? "&" : "?";
    const res = await fetch(`${API}${path}${sep}_=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.json();
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

  function applyFooter(sections = {}, settings = {}, contactInfo = {}) {
    const general = settings.general || {};
    const contact = settings.contact || {};
    const social = settings.social || {};

    const brandName = general.site_name || "Caledor DMC";
    const brandTitle = document.getElementById("footerBrandName");
    const footerDesc = document.getElementById("footerDescription");
    const footerLegal = document.getElementById("footerLegal");
    const copyright = document.getElementById("footerCopyright");

    if (brandTitle) brandTitle.textContent = brandName;
    if (footerDesc) footerDesc.textContent = general.site_description || general.site_tagline || "Your trusted partner for luxury destination management across the UK and Europe.";
    if (footerLegal) footerLegal.textContent = general.copyright || `© ${new Date().getFullYear()} ${brandName} Ltd. All rights reserved.`;
    if (copyright) copyright.textContent = general.copyright_short || `© ${new Date().getFullYear()} ${brandName}`;

    const address = contactInfo.address || contact.address || "";
    const phone1 = contactInfo.phone_1 || contact.contact_phone || "";
    const phone2 = contactInfo.phone_2 || "";
    const email1 = contactInfo.email_1 || contact.contact_email || "";
    const email2 = contactInfo.email_2 || "";

    const setText = (id, val, hideIfEmpty = true) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (val) {
        el.textContent = val;
        el.hidden = false;
      } else if (hideIfEmpty) {
        el.hidden = true;
      }
    };

    setText("footerAddress", address);
    setText("footerPhonePrimary", phone1);
    setText("footerPhoneSecondary", phone2);
    setText("footerEmailPrimary", email1);
    setText("footerEmailSecondary", email2);

    const navCols = document.getElementById("footerNavCols");
    if (navCols && sections.navigation?.enabled !== "0") {
      const columns = parseJson(sections.navigation?.columns_json);
      const fallbackColumns = [
        {
          title: "Services",
          links: [
            { label: "Hotel Bookings", url: "/premium-services#hotel-bookings" },
            { label: "Sightseeing Tours", url: "/premium-services#sightseeing-tours" },
            { label: "Transfers", url: "/premium-services#airport-transfers" },
            { label: "MICE", url: "/#mice" },
          ],
        },
        {
          title: "Destinations",
          links: [
            { label: "UK", url: "/#destinations" },
            { label: "France", url: "/#destinations" },
            { label: "Italy", url: "/#destinations" },
            { label: "Switzerland", url: "/#destinations" },
          ],
        },
        {
          title: "Resources",
          links: [
            { label: "FAQ", url: "/#faq" },
            { label: "Travel Insights", url: "/#blogSection" },
            { label: "Case Studies", url: "/#successStories" },
          ],
        },
      ];
      const useColumns = columns.length ? columns : fallbackColumns;
      navCols.innerHTML = useColumns.map((col) => `
        <div class="footer-col">
          <h3>${escapeHtml((col.title || "").toUpperCase())}</h3>
          ${(col.links || []).map((link) => {
            const raw = String(link.url || "#");
            const href = raw.startsWith("#") ? `/${raw}` : raw;
            return `<a href="${escapeHtml(href)}">${escapeHtml(link.label || "")}</a>`;
          }).join("")}
        </div>`).join("");
    }

    const newsletter = sections.newsletter || {};
    const newsletterEl = document.getElementById("footerNewsletter");
    if (newsletterEl) {
      const show = newsletter.enabled === "1";
      newsletterEl.hidden = !show;
      if (show) {
        const title = document.getElementById("footerNewsletterTitle");
        const input = document.getElementById("footerNewsletterInput");
        const button = document.getElementById("footerNewsletterButton");
        if (title) title.textContent = (newsletter.title || "Newsletter").toUpperCase();
        if (input) input.placeholder = newsletter.placeholder || "Email address";
        if (button) button.textContent = newsletter.button_text || "Subscribe";
      }
    }

    const bottom = sections.bottom_bar || {};
    const policyLinks = document.getElementById("footerPolicyLinks");
    if (policyLinks && bottom.enabled !== "0") {
      policyLinks.innerHTML = [
        bottom.privacy_url ? `<a href="${escapeHtml(bottom.privacy_url)}">Privacy Policy</a>` : "",
        bottom.terms_url ? `<a href="${escapeHtml(bottom.terms_url)}">Terms &amp; Conditions</a>` : "",
      ].filter(Boolean).join("");
    }

    const footerSocials = document.getElementById("footerSocials");
    if (footerSocials) {
      const socialIcon = (label) => {
        if (label === "Instagram") {
          return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>`;
        }
        if (label === "LinkedIn") {
          return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 8.75h4v12.25H3V8.75zm7 0h3.84v1.68h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.14v6.49H15.6v-5.75c0-1.37-.03-3.13-1.9-3.13-1.92 0-2.21 1.5-2.21 3.05v5.83H10V8.75z"/></svg>`;
        }
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2H21.5l-7.5 8.573L22.5 22h-6.43l-5.03-6.573L5.2 22H1.94l8.04-9.188L1.5 2h6.59l4.55 6.02L18.244 2zm-1.13 18h1.77L7.01 3.93H5.11L17.114 20z"/></svg>`;
      };
      const links = [
        ["Instagram", social.instagram_url],
        ["LinkedIn", social.linkedin_url],
        ["Twitter", social.twitter_url],
      ].filter(([, url]) => url);
      footerSocials.innerHTML = links.map(([label, url]) =>
        `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(label)}">${socialIcon(label)}</a>`).join("");
    }
  }

  function initScrollReveal() {
    const markVisible = (el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        el.classList.add("is-visible");
      }
    };

    const targets = document.querySelectorAll(
      ".section-light, .section-dark, .section-block, .footer"
    );

    targets.forEach((el, index) => {
      if (!el.classList.contains("reveal-on-scroll")) {
        el.classList.add("reveal-on-scroll");
        if (index % 3 === 1) el.classList.add("reveal-delay-1");
        if (index % 3 === 2) el.classList.add("reveal-delay-2");
      }
      markVisible(el);
    });

    document.querySelectorAll(
      ".featured-experience-card, .premium-service-grid article, .scotland-tile, .related-card, .ps-pillar-card, .ps-stats-grid article, .ps-steps li"
    ).forEach((el, index) => {
      if (!el.classList.contains("reveal-on-scroll")) {
        el.classList.add("reveal-on-scroll");
        if (index % 4 > 0) el.classList.add(`reveal-delay-${index % 4}`);
      }
      markVisible(el);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });

    document.querySelectorAll(".reveal-on-scroll:not(.is-visible)").forEach((el) => observer.observe(el));
  }

  async function loadFooter() {
    try {
      const [cmsData, settingsData, contactData] = await Promise.all([
        fetchJson("/cms/footer"),
        fetchJson("/settings"),
        fetchJson("/cms/contact").catch(() => ({ sections: {} })),
      ]);
      applyFooter(
        cmsData.sections || {},
        settingsData.settings || {},
        contactData.sections?.info || {}
      );
    } catch {
      // static footer fallback
    }
  }

  async function init(options = {}) {
    wireMobileNav();
    await loadFooter();
    if (options.scroll !== false) initScrollReveal();
  }

  window.SiteChrome = { init, applyFooter, initScrollReveal, wireMobileNav };
})();
