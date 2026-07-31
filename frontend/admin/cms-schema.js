/* Figma-accurate CMS admin forms — keys sync with server/cms-defaults.js and public script.js */
window.CmsSchema = (() => {
  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function val(s, sec, key, fb = "") {
    return s?.[sec]?.[key] ?? fb;
  }

  function isOn(s, sec) {
    return val(s, sec, "enabled", "1") === "1";
  }

  function parseJson(raw, fb = []) {
    try {
      return JSON.parse(raw || "[]");
    } catch {
      return fb;
    }
  }

  function cmsInput(sec, key, label, value, full = false) {
    const cls = full ? "field-full" : "field";
    return `<div class="${cls}"><label>${esc(label)}</label>
      <input data-cms-section="${esc(sec)}" data-cms-key="${esc(key)}" value="${esc(value)}" /></div>`;
  }

  function cmsTextarea(sec, key, label, value) {
    return `<div class="field-full"><label>${esc(label)}</label>
      <textarea data-cms-section="${esc(sec)}" data-cms-key="${esc(key)}">${esc(value)}</textarea></div>`;
  }

  function cmsSelect(sec, key, label, options, value) {
    return `<div class="field"><label>${esc(label)}</label><select data-cms-section="${esc(sec)}" data-cms-key="${esc(key)}">
      ${options.map((o) => `<option value="${esc(o)}"${String(o) === String(value) ? " selected" : ""}>${esc(o)}</option>`).join("")}
    </select></div>`;
  }

  function cmsImage(sec, key, label, value, hint = "Recommended size: 1920×1080px. Max file size: 5MB.") {
    return imageField(`${sec}-${key}`, label, value, { cmsSection: sec, cmsKey: key, hint });
  }

  /** Reusable image field with upload + paste URL — works in CMS, packages, blog, gallery */
  function mediaUrl(url) {
    if (window.CALEDOR_CONFIG?.mediaUrl) return window.CALEDOR_CONFIG.mediaUrl(url);
    return url ?? "";
  }

  function imageField(target, label, value = "", options = {}) {
    const hint = options.hint ?? "Recommended size: 1920×1080px. Max file size: 5MB.";
    const inputName = options.name ? `name="${esc(options.name)}"` : "";
    const cmsAttrs = options.cmsSection
      ? `data-cms-section="${esc(options.cmsSection)}" data-cms-key="${esc(options.cmsKey || "")}"`
      : "";
    const extraClass = options.inputClass ? esc(options.inputClass) : "";
    const compact = options.compact ? " compact" : "";
    const full = options.full === false ? "field" : "field-full";
    const bg = value ? `background-image:url('${esc(mediaUrl(value))}')` : "";
    const safeTarget = esc(target);
    const removable = options.removable !== false;

    return `<div class="${full}"><label>${esc(label)}</label>
      <div class="image-uploader${compact}">
        <div class="thumb cms-thumb${compact ? " sm" : ""}" data-for="${safeTarget}" style="${bg};background-size:cover;background-position:center"></div>
        <div class="image-copy">
          <div class="actions-row">
            <button class="btn outline sm cms-upload-image" type="button" data-target="${safeTarget}">Upload Image</button>
            <button class="btn outline sm cms-change-image" type="button" data-target="${safeTarget}">Paste URL</button>
            ${removable ? `<button class="link-danger cms-remove-image" type="button" data-target="${safeTarget}">Remove</button>` : ""}
          </div>
          <input type="file" accept="image/*" class="cms-file-input" data-target="${safeTarget}" hidden />
          <input ${inputName} ${cmsAttrs} class="cms-image-url ${extraClass}" id="img-${safeTarget}" value="${esc(value)}" placeholder="Image URL or upload a file" />
          ${compact ? "" : `<span class="settings-copy">${esc(hint)}</span>`}
        </div>
      </div></div>`;
  }

  function radioGroup(sec, key, label, options, value) {
    return `<div class="field-full"><label>${esc(label)}</label>
      <div class="radio-row">${options.map((opt) => `
        <label class="radio-pill">
          <input type="radio" name="cms-${esc(sec)}-${esc(key)}" value="${esc(opt.value)}"
            data-cms-section="${esc(sec)}" data-cms-key="${esc(key)}" data-radio-value="${esc(opt.value)}"
            ${String(value) === String(opt.value) ? "checked" : ""} />
          <span>${esc(opt.label)}</span>
        </label>`).join("")}
      </div></div>`;
  }

  function categoryRow(item = {}) {
    return `<div class="category-row" data-list="blog-categories">
      <span class="drag-handle" aria-hidden="true">☰</span>
      <div class="field"><label>Category Name</label><input name="name" value="${esc(item.name || "")}" /></div>
      <div class="field"><label>Slug</label><input name="slug" value="${esc(item.slug || "")}" /></div>
      <div class="field"><label>Post Count</label><input name="count" value="${esc(item.count || "0")}" /></div>
      <div class="field"><label>Order</label><input name="order" value="${esc(item.order || "1")}" /></div>
      <div class="toggle-row compact"><span>Visible</span>
        <span class="switch sm ${item.visible !== false ? "on" : ""}" data-field-visible data-switch-value="${item.visible !== false ? "1" : "0"}"></span>
      </div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function pkgCategoryRow(item = {}) {
    return `<div class="category-row" data-list="pkg-categories">
      <span class="drag-handle" aria-hidden="true">☰</span>
      <div class="field"><label>Category</label><input name="name" value="${esc(item.name || "")}" /></div>
      <div class="field"><label>Slug</label><input name="slug" value="${esc(item.slug || "")}" /></div>
      <div class="field"><label>Packages</label><input name="count" value="${esc(item.count || "0")}" /></div>
      <div class="toggle-row compact"><span>Visible</span>
        <span class="switch sm ${item.visible !== false ? "on" : ""}" data-field-visible data-switch-value="${item.visible !== false ? "1" : "0"}"></span>
      </div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function footerColumnRow(item = {}) {
    const links = (item.links || []).map((l) => `${l.label}|${l.url}`).join("\n");
    return `<div class="footer-column-row" data-list="footer-columns">
      <div class="field"><label>Column Title</label><input name="title" value="${esc(item.title || "")}" /></div>
      <div class="field-full"><label>Links (one per line: Label|URL)</label><textarea name="links">${esc(links)}</textarea></div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function postTagRow(tags = []) {
    return `<div class="tag-input-area" data-list="post-tags">
      ${tags.map((t) => `<span class="tag-pill">${esc(t)} <button class="remove cms-remove-tag" type="button">×</button></span>`).join("")}
      <button class="btn outline sm cms-add-post-tag" type="button">+ Add Post</button>
    </div>`;
  }

  function toggleGrid(items) {
    return `<div class="toggle-grid">${items.map(([label, sec, key, on]) => toggleRow(label, sec, key, on)).join("")}</div>`;
  }

  function settingInput(group, key, label, value, full = false) {
    const cls = full ? "field-full" : "field";
    return `<div class="${cls}"><label>${esc(label)}</label>
      <input data-setting-group="${esc(group)}" data-setting-key="${esc(key)}" value="${esc(value)}" /></div>`;
  }

  function settingTextarea(group, key, label, value) {
    return `<div class="field-full"><label>${esc(label)}</label>
      <textarea data-setting-group="${esc(group)}" data-setting-key="${esc(key)}">${esc(value)}</textarea></div>`;
  }

  function section(title, body, secKey, on = true) {
    return `<article class="settings-panel" data-panel-section="${esc(secKey)}">
      <div class="settings-head">
        <div><h2 class="settings-title">${esc(title)}</h2></div>
        <div class="display-toggle"><span class="settings-copy">Display Section</span>
          <span class="switch section-switch ${on ? "on" : ""}" data-cms-section="${esc(secKey)}" data-cms-key="enabled" data-switch-value="${on ? "1" : "0"}"></span>
        </div>
      </div>
      <div class="settings-body">${body}</div>
    </article>`;
  }

  function toggleRow(label, sec, key, on) {
    return `<div class="toggle-row"><span>${esc(label)}</span>
      <span class="switch ${on ? "on" : ""}" data-cms-section="${esc(sec)}" data-cms-key="${esc(key)}" data-switch-value="${on ? "1" : "0"}"></span></div>`;
  }

  function featureRow(item = {}, index = 0) {
    return `<div class="feature-row" data-list="features">
      <div class="field"><label>Icon</label><input name="icon" value="${esc(item.icon || "🧭")}" placeholder="Emoji or icon" /></div>
      <div class="field"><label>Feature Title</label><input name="title" value="${esc(item.title || "")}" /></div>
      <div class="field"><label>Description</label><textarea name="description">${esc(item.description || "")}</textarea></div>
      <button class="action-icon danger cms-remove-row" type="button" title="Delete">✕</button>
    </div>`;
  }

  function teamRow(item = {}) {
    const target = `team-photo-${Math.random().toString(36).slice(2, 9)}`;
    return `<div class="team-card" data-list="team">
      <div class="team-avatar cms-thumb" data-for="${target}" style="background-image:url('${esc(item.photo || "")}');background-size:cover;background-position:center"></div>
      <div class="team-fields">
        <div class="form-grid">
          ${imageField(target, "Photo", item.photo || "", { name: "photo", compact: true, full: false, inputClass: "cms-team-photo" })}
          <div class="field"><label>Name</label><input name="name" value="${esc(item.name || "")}" /></div>
          <div class="field"><label>Designation</label><input name="role" value="${esc(item.role || "")}" /></div>
          <div class="field-full"><label>Bio</label><textarea name="bio">${esc(item.bio || "")}</textarea></div>
          <div class="field"><label>LinkedIn URL</label><input name="linkedin" value="${esc(item.linkedin || "")}" /></div>
          <div class="field"><label>Twitter URL</label><input name="twitter" value="${esc(item.twitter || "")}" /></div>
        </div>
      </div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function awardRow(item = {}) {
    return `<div class="award-row" data-list="awards">
      <div class="icon-preview">${esc(item.icon || "🏆")}</div>
      <div class="field"><label>Award Name</label><input name="name" value="${esc(item.name || "")}" /></div>
      <div class="field"><label>Organization</label><input name="org" value="${esc(item.org || "")}" /></div>
      <div class="field"><label>Year</label><input name="year" value="${esc(item.year || "")}" /></div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function aboutFeatureRow(item = {}) {
    const icons = ["hotel", "map", "coach", "support", "diamond", "mice-icon"];
    const options = icons.map((icon) => `<option value="${icon}"${item.icon_class === icon ? " selected" : ""}>${icon}</option>`).join("");
    return `<div class="feature-row" data-list="about-features">
      <div class="field"><label>Icon Style</label><select name="icon_class">${options}</select></div>
      <div class="field"><label>Title</label><input name="title" value="${esc(item.title || "")}" /></div>
      <div class="field"><label>Description</label><textarea name="description">${esc(item.description || "")}</textarea></div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function scotlandTileRow(item = {}) {
    const target = `scotland-img-${Math.random().toString(36).slice(2, 9)}`;
    return `<div class="destination-row" data-list="scotland-tiles">
      <div class="form-grid">
        ${imageField(target, "Image", item.image || "", { name: "image", compact: true })}
        <div class="field"><label>Label</label><input name="label" value="${esc(item.label || "")}" /></div>
        <div class="field"><label>Alt Text</label><input name="alt" value="${esc(item.alt || "")}" /></div>
        <div class="field"><label>Hero Tile</label>
          <span class="switch sm ${item.hero ? "on" : ""}" data-field-hero data-switch-value="${item.hero ? "1" : "0"}"></span>
        </div>
      </div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function premiumServiceRow(item = {}) {
    const target = `premium-img-${Math.random().toString(36).slice(2, 9)}`;
    return `<div class="destination-row" data-list="premium-services">
      <div class="form-grid">
        ${imageField(target, "Image", item.image || "", { name: "image", compact: true })}
        <div class="field"><label>Title</label><input name="title" value="${esc(item.title || "")}" /></div>
        <div class="field"><label>Alt Text</label><input name="alt" value="${esc(item.alt || "")}" /></div>
        <div class="field-full"><label>Description</label><textarea name="description">${esc(item.description || "")}</textarea></div>
        <div class="field"><label>Link URL</label><input name="link" value="${esc(item.link || "/premium-services")}" /></div>
      </div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function miceItemRow(item = {}) {
    return `<div class="feature-row" data-list="mice-items">
      <div class="field"><label>Icon</label><input name="icon" value="${esc(item.icon || "✦")}" /></div>
      <div class="field"><label>Title</label><input name="title" value="${esc(item.title || "")}" /></div>
      <div class="field"><label>Description</label><textarea name="description">${esc(item.description || "")}</textarea></div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function statRow(item = {}, listName = "stats") {
    return `<div class="feature-row" data-list="${listName}">
      <div class="field"><label>Value</label><input name="value" value="${esc(item.value || "")}" /></div>
      <div class="field"><label>Label</label><input name="label" value="${esc(item.label || "")}" /></div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function processStepRow(item = {}) {
    return `<div class="feature-row" data-list="process-steps">
      <div class="field"><label>Step Title</label><input name="title" value="${esc(item.title || "")}" /></div>
      <div class="field"><label>Description</label><textarea name="description">${esc(item.description || "")}</textarea></div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function testimonialItemRow(item = {}) {
    return `<div class="testimonial-row" data-list="testimonial-items">
      <div class="form-grid">
        <div class="field-full testimonial-quote-field">
          <label>Quote</label>
          <textarea name="quote" rows="5" placeholder="What the traveler said…">${esc(item.quote || "")}</textarea>
        </div>
        <div class="field"><label>Name</label><input name="name" value="${esc(item.name || "")}" placeholder="Client or agent name" /></div>
        <div class="field"><label>Role / Company</label><input name="role" value="${esc(item.role || "")}" placeholder="Travel Agent · London" /></div>
        <div class="field"><label>Stars (1-5)</label><input name="stars" value="${esc(item.stars || "5")}" /></div>
      </div>
      <button class="action-icon danger cms-remove-row" type="button" title="Remove testimonial">✕</button>
    </div>`;
  }

  function successStoryRow(item = {}) {
    const target = `success-img-${Math.random().toString(36).slice(2, 9)}`;
    return `<div class="destination-row" data-list="success-stories">
      <div class="form-grid">
        ${imageField(target, "Image", item.image || "", { name: "image", compact: true })}
        <div class="field"><label>Title</label><input name="title" value="${esc(item.title || "")}" /></div>
        <div class="field"><label>Alt Text</label><input name="alt" value="${esc(item.alt || "")}" /></div>
        <div class="field-full"><label>Challenge</label><textarea name="challenge">${esc(item.challenge || "")}</textarea></div>
        <div class="field-full"><label>Solution</label><textarea name="solution">${esc(item.solution || "")}</textarea></div>
        <div class="field-full"><label>Outcome</label><textarea name="outcome">${esc(item.outcome || "")}</textarea></div>
      </div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function badgeRow(item = {}) {
    return `<div class="feature-row" data-list="owned-badges">
      <div class="field-full"><label>Badge Text</label><input name="text" value="${esc(item.text || "")}" /></div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function destinationRow(item = {}) {
    const target = `dest-img-${Math.random().toString(36).slice(2, 9)}`;
    return `<div class="destination-row" data-list="destinations">
      <div class="form-grid">
        ${imageField(target, "Destination Image", item.image || "", { name: "image", compact: true })}
        <div class="field"><label>Country / Region</label><input name="name" value="${esc(item.name || "")}" /></div>
        <div class="field"><label>Places / Subtitle</label><input name="places" value="${esc(item.places || "")}" /></div>
        <div class="field"><label>Sort Order</label><input name="sort_order" value="${esc(item.sort_order || "1")}" /></div>
        <div class="field"><label>Visible</label>
          <span class="switch sm ${item.visible !== false ? "on" : ""}" data-field-visible data-switch-value="${item.visible !== false ? "1" : "0"}"></span>
        </div>
      </div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function tagRow(tags = []) {
    return `<div class="tag-input-area" data-list="tags">
      ${tags.map((t) => `<span class="tag-pill">${esc(t)} <button class="remove cms-remove-tag" type="button">×</button></span>`).join("")}
      <button class="btn outline sm cms-add-tag" type="button">+ Add Tour</button>
    </div>`;
  }

  function formFieldRow(item = {}) {
    return `<div class="field-list-item" data-list="form-fields">
      <span>${esc(item.label || "Field")}</span>
      <span class="required-label">Required
        <span class="switch sm ${item.required ? "on" : ""}" data-field-required="${esc(item.field)}" data-switch-value="${item.required ? "1" : "0"}"></span>
      </span>
      <input type="hidden" name="field" value="${esc(item.field)}" />
      <input type="hidden" name="label" value="${esc(item.label)}" />
    </div>`;
  }

  /* ── HOME PAGE (Figma) ── */
  function renderHome(s) {
    const features = parseJson(val(s, "why_choose", "features_json"));
    const tags = parseJson(val(s, "featured_tours", "tour_tags_json"));
    const destinations = parseJson(val(s, "destinations", "items_json"));
    const scotlandTiles = parseJson(val(s, "scotland_attractions", "items_json"));
    const premiumServices = parseJson(val(s, "premium_services", "items_json"));
    const miceItems = parseJson(val(s, "mice", "items_json"));
    const miceStats = parseJson(val(s, "mice", "stats_json"));
    const processSteps = parseJson(val(s, "process", "steps_json"));
    const testimonials = parseJson(val(s, "testimonials", "items_json"));
    const successStories = parseJson(val(s, "success_stories", "items_json"));
    const numbersStats = parseJson(val(s, "numbers", "stats_json"));

    return [
      section("Hero Section", `<div class="form-grid">
        ${cmsInput("hero", "eyebrow", "Eyebrow Label", val(s, "hero", "eyebrow", "Destination Management Company"))}
        ${cmsInput("hero", "title", "Hero Title", val(s, "hero", "title", "Discover Your Next Adventure"))}
        ${cmsTextarea("hero", "subtitle", "Hero Subtitle", val(s, "hero", "subtitle"))}
        ${cmsInput("hero", "primary_cta_label", "CTA Button Text", val(s, "hero", "primary_cta_label", "Explore Packages"))}
        ${cmsInput("hero", "primary_cta_url", "CTA Button URL", val(s, "hero", "primary_cta_url", "/packages"))}
        ${cmsInput("hero", "secondary_cta_label", "Secondary CTA Text", val(s, "hero", "secondary_cta_label", "Explore Destinations"))}
        ${cmsInput("hero", "secondary_cta_url", "Secondary CTA URL", val(s, "hero", "secondary_cta_url", "#destinations"))}
        ${cmsImage("hero", "background_image", "Hero Background Image", val(s, "hero", "background_image"))}
      </div>
      <div class="form-grid" style="margin-top:14px">
        ${cmsInput("trust", "point_1", "Trust Point 1", val(s, "trust", "point_1"))}
        ${cmsInput("trust", "point_2", "Trust Point 2", val(s, "trust", "point_2"))}
        ${cmsInput("trust", "point_3", "Trust Point 3", val(s, "trust", "point_3"))}
        ${cmsInput("trust", "point_4", "Trust Point 4", val(s, "trust", "point_4"))}
        ${cmsInput("stats", "stat_1_value", "Stat 1 Value", val(s, "stats", "stat_1_value"))}
        ${cmsInput("stats", "stat_1_label", "Stat 1 Label", val(s, "stats", "stat_1_label"))}
        ${cmsInput("stats", "stat_2_value", "Stat 2 Value", val(s, "stats", "stat_2_value"))}
        ${cmsInput("stats", "stat_2_label", "Stat 2 Label", val(s, "stats", "stat_2_label"))}
        ${cmsInput("stats", "stat_3_value", "Stat 3 Value", val(s, "stats", "stat_3_value"))}
        ${cmsInput("stats", "stat_3_label", "Stat 3 Label", val(s, "stats", "stat_3_label"))}
        ${cmsInput("stats", "stat_4_value", "Stat 4 Value", val(s, "stats", "stat_4_value"))}
        ${cmsInput("stats", "stat_4_label", "Stat 4 Label", val(s, "stats", "stat_4_label"))}
      </div>`, "hero", isOn(s, "hero")),

      section("Featured Tours", `<div class="form-grid">
        ${cmsInput("featured_tours", "section_title", "Section Title", val(s, "featured_tours", "section_title", "Our Popular Tours"))}
        ${cmsInput("featured_tours", "section_subtitle", "Section Subtitle", val(s, "featured_tours", "section_subtitle"))}
        ${cmsSelect("featured_tours", "tours_count", "Tours Count", ["3", "4", "6", "8"], val(s, "featured_tours", "tours_count", "6"))}
        <div class="field-full"><label>Select Featured Tours</label>${tagRow(tags)}</div>
      </div>`, "featured_tours", isOn(s, "featured_tours")),

      section("Why Choose Us", `<div class="form-grid">${cmsInput("why_choose", "section_title", "Section Title", val(s, "why_choose", "section_title", "Why Choose Caledor"), true)}</div>
        <div class="cms-list" data-json-section="why_choose" data-json-key="features_json">${features.map(featureRow).join("")}</div>
        <button class="add-row-btn cms-add-feature" type="button">+ Add Feature</button>`, "why_choose", isOn(s, "why_choose")),

      section("Testimonials", `<div class="form-grid">
        ${cmsInput("testimonials", "section_title", "Section Title", val(s, "testimonials", "section_title", "What Our Travelers Say"))}
        ${cmsInput("testimonials", "section_subtitle", "Section Subtitle", val(s, "testimonials", "section_subtitle"))}
        ${cmsSelect("testimonials", "count", "Number to Display", ["2", "3", "4", "6"], val(s, "testimonials", "count", "3"))}
        <div class="field-full"><span class="settings-copy">All testimonials display side-by-side in a grid (up to the count above).</span></div>
      </div>
      <div class="cms-list" data-json-section="testimonials">${testimonials.map(testimonialItemRow).join("")}</div>
      <button class="add-row-btn cms-add-testimonial" type="button">+ Add Testimonial</button>`, "testimonials", isOn(s, "testimonials")),

      section("Packages Section Heading", `<div class="form-grid">
        ${cmsInput("packages_heading", "kicker", "Section Kicker", val(s, "packages_heading", "kicker", "Our Packages"))}
        ${cmsInput("packages_heading", "title", "Section Title", val(s, "packages_heading", "title"))}
        ${cmsTextarea("packages_heading", "subtitle", "Section Subtitle", val(s, "packages_heading", "subtitle"))}
        <div class="field-full"><span class="settings-copy">Package cards are managed under Admin → Packages.</span></div>
      </div>`, "packages_heading", true),

      section("Destinations", `<div class="form-grid">
        ${cmsInput("destinations", "kicker", "Section Kicker", val(s, "destinations", "kicker", "Explore Our Destinations"))}
        ${cmsInput("destinations", "title", "Section Title", val(s, "destinations", "title", "Europe made easy for every traveler."))}
      </div>
      <div class="cms-list" data-json-section="destinations" data-json-key="items_json">${destinations.map(destinationRow).join("")}</div>
      <button class="add-row-btn cms-add-destination" type="button">+ Add Destination</button>`, "destinations", isOn(s, "destinations")),

      section("Photo Gallery Heading", `<div class="form-grid">
        ${cmsInput("gallery_section", "kicker", "Section Kicker", val(s, "gallery_section", "kicker", "Our Gallery"))}
        ${cmsInput("gallery_section", "title", "Section Title", val(s, "gallery_section", "title", "Photo Gallery"))}
        <div class="field-full"><span class="settings-copy">Gallery photos are managed under Admin → Gallery. Upload or replace images there.</span></div>
      </div>`, "gallery_section", isOn(s, "gallery_section")),

      section("Scotland Attractions", `<div class="form-grid">
        ${cmsInput("scotland_attractions", "kicker", "Section Kicker", val(s, "scotland_attractions", "kicker", "Top Scotland Attractions"))}
        ${cmsInput("scotland_attractions", "title", "Section Title", val(s, "scotland_attractions", "title"))}
      </div>
      <div class="cms-list" data-json-section="scotland_attractions">${scotlandTiles.map(scotlandTileRow).join("")}</div>
      <button class="add-row-btn cms-add-scotland" type="button">+ Add Attraction</button>`, "scotland_attractions", isOn(s, "scotland_attractions")),

      section("Premium Services", `<div class="form-grid">
        ${cmsInput("premium_services", "kicker", "Section Kicker", val(s, "premium_services", "kicker", "Our Premium Services"))}
        ${cmsInput("premium_services", "title", "Section Title", val(s, "premium_services", "title"))}
        ${cmsTextarea("premium_services", "subtitle", "Section Subtitle", val(s, "premium_services", "subtitle"))}
      </div>
      <div class="cms-list" data-json-section="premium_services">${premiumServices.map(premiumServiceRow).join("")}</div>
      <button class="add-row-btn cms-add-premium" type="button">+ Add Service</button>`, "premium_services", isOn(s, "premium_services")),

      section("MICE & Corporate", `<div class="form-grid">
        ${cmsInput("mice", "kicker", "Section Kicker", val(s, "mice", "kicker", "MICE & Corporate Travel"))}
        ${cmsTextarea("mice", "subtitle", "Section Subtitle", val(s, "mice", "subtitle"))}
        ${cmsImage("mice", "image_url", "Side Image", val(s, "mice", "image_url"))}
      </div>
      <div class="cms-list" data-json-section="mice">${miceItems.map(miceItemRow).join("")}</div>
      <button class="add-row-btn cms-add-mice" type="button">+ Add Service Item</button>
      <div class="cms-list" data-json-section="mice_stats" style="margin-top:14px">${miceStats.map((item) => statRow(item, "mice-stats")).join("")}</div>
      <button class="add-row-btn cms-add-mice-stat" type="button">+ Add Stat</button>`, "mice", isOn(s, "mice")),

      section("Our Process", `<div class="form-grid">
        ${cmsInput("process", "kicker", "Section Kicker", val(s, "process", "kicker", "Our Process"))}
        ${cmsInput("process", "subtitle", "Intro Subtitle", val(s, "process", "subtitle"))}
        ${cmsInput("process", "eyebrow", "Body Eyebrow", val(s, "process", "eyebrow"))}
        ${cmsInput("process", "title", "Body Title", val(s, "process", "title"))}
        ${cmsTextarea("process", "description", "Body Description", val(s, "process", "description"))}
      </div>
      <div class="cms-list" data-json-section="process">${processSteps.map(processStepRow).join("")}</div>
      <button class="add-row-btn cms-add-process" type="button">+ Add Step</button>`, "process", isOn(s, "process")),

      section("Success Stories", `<div class="form-grid">
        ${cmsInput("success_stories", "kicker", "Section Kicker", val(s, "success_stories", "kicker", "Success Stories"))}
        ${cmsInput("success_stories", "subtitle", "Section Subtitle", val(s, "success_stories", "subtitle"))}
      </div>
      <div class="cms-list" data-json-section="success_stories">${successStories.map(successStoryRow).join("")}</div>
      <button class="add-row-btn cms-add-success" type="button">+ Add Story</button>`, "success_stories", isOn(s, "success_stories")),

      section("By The Numbers", `<div class="form-grid">
        ${cmsInput("numbers", "kicker", "Section Kicker", val(s, "numbers", "kicker", "By The Numbers"))}
        ${cmsInput("numbers", "subtitle", "Section Subtitle", val(s, "numbers", "subtitle"))}
      </div>
      <div class="cms-list" data-json-section="numbers">${numbersStats.map((item) => statRow(item, "numbers-stats")).join("")}</div>
      <button class="add-row-btn cms-add-number" type="button">+ Add Stat</button>`, "numbers", isOn(s, "numbers")),
    ].join("");
  }

  /* ── ABOUT US (Figma) ── */
  function renderAbout(s) {
    const team = parseJson(val(s, "team", "members_json"));
    const awards = parseJson(val(s, "awards", "items_json"));
    const aboutFeatures = parseJson(val(s, "about_features", "features_json"));
    const ownedBadges = parseJson(val(s, "owned_assets", "badges_json"));

    return [
      section("Page Hero", `<div class="form-grid">
        ${cmsInput("page_hero", "title", "Main Heading", val(s, "page_hero", "title"))}
        ${cmsInput("page_hero", "subtitle", "Sub Heading", val(s, "page_hero", "subtitle"))}
        ${cmsImage("page_hero", "background_image", "Hero Background Image", val(s, "page_hero", "background_image"))}
      </div>`, "page_hero", isOn(s, "page_hero")),

      section("Our Story", `<div class="form-grid">
        ${cmsInput("story", "heading", "Section Heading", val(s, "story", "heading", "Our Story"))}
        ${cmsTextarea("story", "description", "Story Description", val(s, "story", "description"))}
        ${cmsImage("story", "image_url", "Left Column Image", val(s, "story", "image_url"))}
      </div>`, "story", isOn(s, "story")),

      section("About Feature Cards", `<div class="cms-list" data-json-section="about_features">${aboutFeatures.map(aboutFeatureRow).join("")}</div>
        <button class="add-row-btn cms-add-about-feature" type="button">+ Add Feature</button>`, "about_features", isOn(s, "about_features")),

      section("Our Mission & Vision", `<div class="mission-grid">
        <div class="mission-card"><div class="form-grid">
          ${cmsInput("mission_vision", "mission_title", "Mission Title", val(s, "mission_vision", "mission_title", "Our Mission"), true)}
          ${cmsTextarea("mission_vision", "mission_text", "Mission Description", val(s, "mission_vision", "mission_text"))}
          ${cmsInput("mission_vision", "mission_icon", "Mission Icon", val(s, "mission_vision", "mission_icon", "🎯"), true)}
        </div></div>
        <div class="mission-card"><div class="form-grid">
          ${cmsInput("mission_vision", "vision_title", "Vision Title", val(s, "mission_vision", "vision_title", "Our Vision"), true)}
          ${cmsTextarea("mission_vision", "vision_text", "Vision Description", val(s, "mission_vision", "vision_text"))}
          ${cmsInput("mission_vision", "vision_icon", "Vision Icon", val(s, "mission_vision", "vision_icon", "👁"), true)}
        </div></div>
      </div>`, "mission_vision", isOn(s, "mission_vision")),

      section("Meet The Team", `<div class="form-grid">
        ${cmsInput("team", "heading", "Section Heading", val(s, "team", "heading"))}
        ${cmsInput("team", "description", "Section Subtitle", val(s, "team", "description"))}
      </div>
      <div class="cms-list" data-json-section="team" data-json-key="members_json">${team.map(teamRow).join("")}</div>
      <button class="add-row-btn cms-add-team" type="button">+ Add Team Member</button>
      <div style="margin-top:12px">${toggleRow("Show More Button", "team", "show_more", val(s, "team", "show_more", "0") === "1")}</div>`, "team", isOn(s, "team")),

      section("Owned Assets", `<div class="form-grid">
        ${cmsInput("owned_assets", "kicker", "Section Kicker", val(s, "owned_assets", "kicker", "Owned Assets"))}
        ${cmsInput("owned_assets", "title", "Section Title", val(s, "owned_assets", "title"))}
        ${cmsTextarea("owned_assets", "description", "Section Description", val(s, "owned_assets", "description"))}
        ${cmsInput("owned_assets", "property_name", "Property Name", val(s, "owned_assets", "property_name", "Firangi"))}
        ${cmsInput("owned_assets", "property_location", "Property Location", val(s, "owned_assets", "property_location"))}
        ${cmsTextarea("owned_assets", "property_text", "Property Description", val(s, "owned_assets", "property_text"))}
      </div>
      <div class="cms-list" data-json-section="owned_assets">${ownedBadges.map(badgeRow).join("")}</div>
      <button class="add-row-btn cms-add-badge" type="button">+ Add Badge</button>`, "owned_assets", isOn(s, "owned_assets")),

      section("Awards & Certifications", `<div class="form-grid">${cmsInput("awards", "heading", "Section Heading", val(s, "awards", "heading", "Our Achievements"), true)}</div>
        <div class="cms-list" data-json-section="awards" data-json-key="items_json">${awards.map(awardRow).join("")}</div>
        <button class="add-row-btn cms-add-award" type="button">+ Add Award</button>`, "awards", isOn(s, "awards")),
    ].join("");
  }

  /* ── CONTACT (Figma) ── */
  function renderContact(s, settings) {
    const contact = settings.contact || {};
    const social = settings.social || {};
    const formFields = parseJson(val(s, "form", "fields_json"), [
      { label: "Name", field: "fullName", required: true },
      { label: "Email", field: "emailAddress", required: true },
      { label: "Phone", field: "phoneNumber", required: false },
      { label: "Company", field: "companyName", required: false },
      { label: "Message", field: "proposalMessage", required: true },
    ]);

    return [
      section("Contact Hero", `<div class="form-grid">
        ${cmsInput("hero", "title", "Page Title", val(s, "hero", "title", "Get In Touch"))}
        ${cmsInput("hero", "subtitle", "Page Subtitle", val(s, "hero", "subtitle"))}
        ${cmsImage("hero", "background_image", "Background Banner Image", val(s, "hero", "background_image"))}
        ${cmsInput("hero", "button_label", "CTA Button Label", val(s, "hero", "button_label", "Request Proposal"), true)}
      </div>`, "hero", isOn(s, "hero")),

      section("Contact Information", `<div class="form-grid">
        ${cmsTextarea("info", "address", "Company Address", val(s, "info", "address", contact.address || ""))}
        ${cmsInput("info", "phone_1", "Primary Phone Number", val(s, "info", "phone_1", contact.contact_phone || ""))}
        ${cmsInput("info", "phone_2", "Phone Number 2", val(s, "info", "phone_2"))}
        ${cmsInput("info", "email_1", "Primary Email", val(s, "info", "email_1", contact.contact_email || ""))}
        ${cmsInput("info", "email_2", "Secondary Email", val(s, "info", "email_2"))}
        ${cmsInput("info", "hours_weekday", "Working Hours (Mon–Fri)", val(s, "info", "hours_weekday"))}
        ${cmsInput("info", "hours_weekend", "Working Hours (Sat–Sun)", val(s, "info", "hours_weekend"))}
        ${cmsInput("info", "whatsapp", "WhatsApp Number", val(s, "info", "whatsapp"))}
        <div class="field-full">${toggleRow("Show WhatsApp Chat Button", "info", "show_whatsapp", val(s, "info", "show_whatsapp", "1") === "1")}</div>
      </div>`, "info", isOn(s, "info")),

      section("Contact Form Settings", `<div class="form-grid">
        ${cmsInput("form", "heading", "Form Heading Title", val(s, "form", "heading", "Send Us a Message"), true)}
      </div>
      <div class="field-list cms-form-fields">${formFields.map(formFieldRow).join("")}</div>
      <div class="form-grid" style="margin-top:14px">
        ${cmsInput("form", "submit_text", "Submit Button Text", val(s, "form", "submit_text", "Send Message"))}
        ${cmsInput("form", "receiver_email", "Receiver Email Address", val(s, "form", "receiver_email", "leads@caledor.com"))}
        ${cmsTextarea("form", "success_message", "Success Message", val(s, "form", "success_message"))}
        ${cmsInput("form", "title", "Form Section Title", val(s, "form", "title", "Request proposal"))}
        ${cmsTextarea("form", "subtitle", "Form Section Subtitle", val(s, "form", "subtitle"))}
        <div class="field-full">${toggleRow("Enable CAPTCHA", "form", "captcha", val(s, "form", "captcha", "1") === "1")}</div>
        <div class="field-full">${toggleRow("Enable File Upload", "form", "file_upload", val(s, "form", "file_upload", "0") === "1")}</div>
      </div>`, "form", isOn(s, "form")),

      section("Map Settings", `<div class="form-grid">
        ${cmsTextarea("map", "embed_url", "Google Map Embed Link", val(s, "map", "embed_url"))}
        ${cmsInput("map", "height", "Map Height (px)", val(s, "map", "height", "400"))}
        ${cmsSelect("map", "zoom", "Map Zoom Level", ["10", "12", "14", "16", "18"], val(s, "map", "zoom", "14"))}
      </div>`, "map", isOn(s, "map")),

      section("Social Media Links", `<div class="form-grid">
        ${settingInput("social", "facebook_url", "Facebook", social.facebook_url || "")}
        ${settingInput("social", "instagram_url", "Instagram", social.instagram_url || "")}
        ${settingInput("social", "twitter_url", "Twitter / X", social.twitter_url || "")}
        ${settingInput("social", "youtube_url", "YouTube", social.youtube_url || "")}
        ${settingInput("social", "linkedin_url", "LinkedIn", social.linkedin_url || "", true)}
        <div class="field-full">${toggleRow("Show Icons in Footer", "social", "show_footer", val(s, "social", "show_footer", "1") === "1")}</div>
        <div class="field-full">${toggleRow("Show Icons on Contact Page", "social", "show_contact", val(s, "social", "show_contact", "1") === "1")}</div>
      </div>`, "social", isOn(s, "social")),
    ].join("");
  }

  function renderBlog(s) {
    const categories = parseJson(val(s, "categories", "items_json"));
    const featuredPosts = parseJson(val(s, "homepage_featured", "post_tags_json"));

    return [
      section("Blog Page Settings", `<div class="form-grid">
        ${cmsInput("page", "title", "Page Title", val(s, "page", "title", "Travel Blog"))}
        ${cmsInput("page", "subtitle", "Page Subtitle", val(s, "page", "subtitle", "Your Daily Adventures"))}
        ${cmsImage("page", "background_image", "Hero Background Image", val(s, "page", "background_image"), "Recommended size: 1920×480px. Max file size: 5MB.")}
        ${cmsTextarea("page", "description", "Page Description", val(s, "page", "description"))}
      </div>`, "page", isOn(s, "page")),

      section("Blog Listing", `<div class="form-grid">
        ${cmsInput("listing", "posts_per_page", "Posts Per Page", val(s, "listing", "posts_per_page", "6"))}
        ${cmsSelect("listing", "grid_columns", "Grid Columns", ["2", "3", "4"], val(s, "listing", "grid_columns", "3"))}
        ${cmsInput("listing", "excerpt_length", "Excerpt Length (characters)", val(s, "listing", "excerpt_length", "150"))}
        ${cmsInput("listing", "read_more_text", "Read More Text", val(s, "listing", "read_more_text", "Read More"))}
      </div>
      ${toggleGrid([
        ["Show Featured Post", "listing", "show_featured", val(s, "listing", "show_featured", "1") === "1"],
        ["Show Author", "listing", "show_author", val(s, "listing", "show_author", "1") === "1"],
        ["Show Date", "listing", "show_date", val(s, "listing", "show_date", "1") === "1"],
        ["Show Read Time", "listing", "show_read_time", val(s, "listing", "show_read_time", "1") === "1"],
        ["Show Category Tags", "listing", "show_category_tags", val(s, "listing", "show_category_tags", "1") === "1"],
        ["Show Read More Button", "listing", "show_read_more", val(s, "listing", "show_read_more", "1") === "1"],
        ["Show Pagination", "listing", "show_pagination", val(s, "listing", "show_pagination", "1") === "1"],
        ["Show Search", "listing", "show_search", val(s, "listing", "show_search", "0") === "1"],
        ["Enable Infinite Scroll", "listing", "infinite_scroll", val(s, "listing", "infinite_scroll", "0") === "1"],
      ])}`, "listing", isOn(s, "listing")),

      section("Categories Management", `<div class="cms-list" data-json-section="blog_categories" data-json-key="items_json">${categories.map(categoryRow).join("")}</div>
        <button class="add-row-btn cms-add-category" type="button">+ Add Category</button>
        <div style="margin-top:12px">${toggleRow("Show Category Filter Menu on Blog Page", "categories", "show_filter", val(s, "categories", "show_filter", "1") === "1")}</div>`, "categories", isOn(s, "categories")),

      section("Featured Posts on Homepage", `<div class="form-grid">
        ${cmsInput("homepage_featured", "section_title", "Section Title", val(s, "homepage_featured", "section_title", "Latest from the Blog"))}
        ${cmsSelect("homepage_featured", "posts_count", "Number of Posts", ["2", "3", "4", "6"], val(s, "homepage_featured", "posts_count", "4"))}
        <div class="field-full"><label>Select Posts to Feature</label>${postTagRow(featuredPosts)}</div>
        <div class="field-full">${toggleRow("Show on Homepage", "homepage_featured", "show_on_homepage", val(s, "homepage_featured", "show_on_homepage", "1") === "1")}</div>
      </div>`, "homepage_featured", isOn(s, "homepage_featured")),

      section("Comments", `<div class="form-grid">
        ${toggleRow("Enable Comments", "comments", "enabled", val(s, "comments", "enabled", "0") === "1")}
        ${toggleRow("Manual Approval Required", "comments", "manual_approval", val(s, "comments", "manual_approval", "1") === "1")}
      </div>`, "comments", isOn(s, "comments")),

      section("Author Settings", `<div class="form-grid">
        ${cmsSelect("author", "bio_position", "Author Bio Position", ["Below Post", "Above Post", "Sidebar"], val(s, "author", "bio_position", "Below Post"))}
      </div>
      ${toggleGrid([
        ["Show Author Bio", "author", "show_bio", val(s, "author", "show_bio", "1") === "1"],
        ["Show Author Photo", "author", "show_photo", val(s, "author", "show_photo", "1") === "1"],
        ["Show Social Media Icons", "author", "show_social", val(s, "author", "show_social", "1") === "1"],
      ])}`, "author", isOn(s, "author")),
    ].join("");
  }

  function renderPackagesPage(s, packages = []) {
    const categories = parseJson(val(s, "categories", "items_json"));
    const pkgOptions = packages.map((p) => `<option value="${esc(p.slug)}">${esc(p.name)}</option>`).join("");

    return [
      section("Manage Package Detail Pages", `<div class="form-grid">
        <div class="field-full">
          <label>Select Package to Preview / Edit Detail Page</label>
          <select id="cmsPackagePreviewSelect">
            <option value="">Choose a package...</option>
            ${pkgOptions}
          </select>
        </div>
        <div class="field-full actions-row">
          <a class="btn outline sm" id="cmsPackagePreviewLink" href="#" target="_blank" rel="noopener">Open Detail Page</a>
          <a class="btn outline sm" href="#package-settings">Edit in Package Settings</a>
        </div>
        <p class="settings-copy">Add new packages in <strong>Package Settings</strong>. All detail content (itinerary, gallery, inclusions) is managed there and shown on the public detail page.</p>
      </div>`, "detail_pages", true),

      section("Packages Page Hero", `<div class="form-grid">
        ${cmsInput("hero", "title", "Page Title", val(s, "hero", "title", "Explore Our Packages"))}
        ${cmsInput("hero", "subtitle", "Page Subtitle", val(s, "hero", "subtitle", "Find the perfect adventure tailored for you"))}
        ${cmsImage("hero", "background_image", "Hero Background Image", val(s, "hero", "background_image"))}
        <div class="field-full">${toggleRow("Show Search Bar on Hero", "hero", "show_search", val(s, "hero", "show_search", "1") === "1")}</div>
        ${cmsInput("hero", "search_placeholder", "Search Placeholder Text", val(s, "hero", "search_placeholder", "Search destinations, activities..."), true)}
      </div>`, "hero", isOn(s, "hero")),

      section("Filter & Search Settings", `<div class="form-grid">
        ${radioGroup("filters", "filter_position", "Filter Position", [
          { label: "Top Bar", value: "top" },
          { label: "Left Sidebar", value: "sidebar" },
        ], val(s, "filters", "filter_position", "top"))}
        ${cmsSelect("filters", "default_sort", "Default Sort Order", ["Most Popular", "Price: Low to High", "Price: High to Low", "Newest"], val(s, "filters", "default_sort", "Most Popular"))}
        <div class="field-full">${toggleRow("Show Results Count", "filters", "show_results_count", val(s, "filters", "show_results_count", "1") === "1")}</div>
      </div>`, "filters", isOn(s, "filters")),

      section("Listing Display", `<div class="form-grid">
        ${radioGroup("listing", "default_view", "Default View", [
          { label: "Grid", value: "grid" },
          { label: "List", value: "list" },
        ], val(s, "listing", "default_view", "grid"))}
        ${cmsSelect("listing", "grid_columns", "Grid Columns", ["2", "3", "4"], val(s, "listing", "grid_columns", "3"))}
        ${cmsInput("listing", "packages_per_page", "Packages Per Page", val(s, "listing", "packages_per_page", "12"))}
        ${cmsSelect("listing", "card_style", "Card Style", ["Image Top with Details", "Overlay Card", "Compact List"], val(s, "listing", "card_style", "Image Top with Details"))}
      </div>
      ${toggleGrid([
        ["Show Package Rating", "listing", "show_rating", val(s, "listing", "show_rating", "1") === "1"],
        ["Show Package Price", "listing", "show_price", val(s, "listing", "show_price", "1") === "1"],
        ["Show Duration Badge", "listing", "show_duration", val(s, "listing", "show_duration", "1") === "1"],
        ["Show Difficulty Badge", "listing", "show_difficulty", val(s, "listing", "show_difficulty", "1") === "1"],
      ])}`, "listing", isOn(s, "listing")),

      section("Category Tabs", `<div class="form-grid">
        ${toggleRow("Show Category Tabs", "categories", "show_tabs", val(s, "categories", "show_tabs", "1") === "1")}
        ${toggleRow("Show 'All Packages' Tab", "categories", "show_all_tab", val(s, "categories", "show_all_tab", "1") === "1")}
      </div>
      <div class="cms-list" data-json-section="pkg_categories" data-json-key="items_json">${categories.map(pkgCategoryRow).join("")}</div>
      <button class="add-row-btn cms-add-pkg-category" type="button">+ Add Category</button>`, "categories", isOn(s, "categories")),

      section("Booking Call-to-Action", `<div class="form-grid">
        ${toggleRow("Show Custom Inquiry Form", "cta", "show_inquiry_form", val(s, "cta", "show_inquiry_form", "1") === "1")}
        ${cmsInput("cta", "title", "CTA Banner Title", val(s, "cta", "title", "Not Sure Which Package?"))}
        ${cmsInput("cta", "subtitle", "CTA Banner Subtitle", val(s, "cta", "subtitle", "Our travel experts will help you plan the perfect trip"))}
        ${cmsInput("cta", "button_text", "CTA Button Text", val(s, "cta", "button_text", "Get Free Consultation"))}
        ${cmsInput("cta", "button_link", "CTA Button Link", val(s, "cta", "button_link", "#contact"))}
        ${cmsSelect("cta", "background_style", "Background Style", ["Gradient Dark", "Solid Dark", "Gold Accent"], val(s, "cta", "background_style", "gradient-dark"))}
        <div class="field-full">${toggleRow("Show at Bottom of Listing Page", "cta", "show_at_bottom", val(s, "cta", "show_at_bottom", "1") === "1")}</div>
      </div>`, "cta", isOn(s, "cta")),
    ].join("");
  }

  function renderFooter(s, settings) {
    const general = settings.general || {};
    const contact = settings.contact || {};
    const social = settings.social || {};
    const navColumns = parseJson(val(s, "navigation", "columns_json"));

    return [
      section("Brand Details", `<div class="form-grid">
        ${settingInput("general", "site_name", "Brand Name", general.site_name || "Caledor DMC")}
        ${settingTextarea("general", "site_tagline", "Tagline", general.site_tagline || "")}
        ${settingTextarea("general", "site_description", "Footer Description", general.site_description || general.site_tagline || "")}
        ${settingInput("general", "copyright", "Copyright Text", general.copyright || "", true)}
      </div>`, "brand", isOn(s, "brand")),

      section("Footer Navigation", `<div class="cms-list" data-json-section="navigation" data-json-key="columns_json">${navColumns.map(footerColumnRow).join("")}</div>
        <button class="add-row-btn cms-add-footer-column" type="button">+ Add Column</button>`, "navigation", isOn(s, "navigation")),

      section("Footer Contact", `<div class="form-grid">
        ${settingInput("contact", "contact_email", "Email", contact.contact_email || "")}
        ${settingInput("contact", "contact_phone", "Phone", contact.contact_phone || "")}
        ${settingTextarea("contact", "address", "Address", contact.address || "")}
      </div>`, "footer_contact", true),

      section("Social Media Links", `<div class="form-grid">
        ${settingInput("social", "facebook_url", "Facebook", social.facebook_url || "")}
        ${settingInput("social", "instagram_url", "Instagram", social.instagram_url || "")}
        ${settingInput("social", "twitter_url", "Twitter / X", social.twitter_url || "")}
        ${settingInput("social", "youtube_url", "YouTube", social.youtube_url || "")}
        ${settingInput("social", "linkedin_url", "LinkedIn", social.linkedin_url || "", true)}
      </div>`, "footer_social", true),

      section("Newsletter Signup", `<div class="form-grid">
        ${cmsInput("newsletter", "title", "Newsletter Title", val(s, "newsletter", "title", "Stay inspired"))}
        ${cmsInput("newsletter", "subtitle", "Newsletter Subtitle", val(s, "newsletter", "subtitle"))}
        ${cmsInput("newsletter", "placeholder", "Email Placeholder", val(s, "newsletter", "placeholder", "Your email address"))}
        ${cmsInput("newsletter", "button_text", "Subscribe Button Text", val(s, "newsletter", "button_text", "Subscribe"), true)}
      </div>`, "newsletter", isOn(s, "newsletter")),

      section("Bottom Bar", `<div class="form-grid">
        ${cmsInput("bottom_bar", "privacy_url", "Privacy Policy Link", val(s, "bottom_bar", "privacy_url", "#"))}
        ${cmsInput("bottom_bar", "terms_url", "Terms Link", val(s, "bottom_bar", "terms_url", "#"))}
        ${cmsInput("bottom_bar", "cookie_url", "Cookie Policy Link", val(s, "bottom_bar", "cookie_url", "#"), true)}
      </div>`, "bottom_bar", isOn(s, "bottom_bar")),
    ].join("");
  }

  function renderSeo(settings) {
    const seo = settings.seo || {};
    return section("SEO Controls", `<div class="form-grid">
      ${settingInput("seo", "meta_title", "Meta Title", seo.meta_title || "")}
      ${settingTextarea("seo", "meta_description", "Meta Description", seo.meta_description || "")}
      ${settingInput("seo", "focus_keywords", "Focus Keywords", seo.focus_keywords || "", true)}
    </div>`, "seo", true);
  }

  function collectCms(container) {
    const sections = {};
    container.querySelectorAll("[data-cms-section][data-cms-key]").forEach((el) => {
      if (el.type === "range" || el.type === "radio" || el.type === "file") return;
      if (el.classList.contains("switch")) return;
      const sec = el.dataset.cmsSection;
      const key = el.dataset.cmsKey;
      if (!sections[sec]) sections[sec] = {};
      sections[sec][key] = el.value;
    });

    container.querySelectorAll(".switch[data-cms-section][data-cms-key]").forEach((sw) => {
      const sec = sw.dataset.cmsSection;
      const key = sw.dataset.cmsKey;
      if (!sections[sec]) sections[sec] = {};
      sections[sec][key] = sw.classList.contains("on") ? "1" : "0";
    });

    container.querySelectorAll(".cms-slider").forEach((slider) => {
      const sec = slider.dataset.cmsSection;
      const key = slider.dataset.cmsKey;
      if (!sections[sec]) sections[sec] = {};
      sections[sec][key] = slider.value;
    });

    container.querySelectorAll('input[type="radio"][data-cms-section][data-cms-key]:checked').forEach((radio) => {
      const sec = radio.dataset.cmsSection;
      const key = radio.dataset.cmsKey;
      if (!sections[sec]) sections[sec] = {};
      sections[sec][key] = radio.value;
    });

    const blogCategories = [];
    container.querySelectorAll('[data-list="blog-categories"]').forEach((row) => {
      blogCategories.push({
        name: row.querySelector('[name="name"]')?.value || "",
        slug: row.querySelector('[name="slug"]')?.value || "",
        count: row.querySelector('[name="count"]')?.value || "0",
        order: row.querySelector('[name="order"]')?.value || "1",
        visible: row.querySelector("[data-field-visible]")?.classList.contains("on") !== false,
      });
    });
    if (blogCategories.length || container.querySelector('[data-json-section="blog_categories"]')) {
      sections.categories = sections.categories || {};
      sections.categories.items_json = JSON.stringify(blogCategories);
    }

    const pkgCategories = [];
    container.querySelectorAll('[data-list="pkg-categories"]').forEach((row) => {
      pkgCategories.push({
        name: row.querySelector('[name="name"]')?.value || "",
        slug: row.querySelector('[name="slug"]')?.value || "",
        count: row.querySelector('[name="count"]')?.value || "0",
        visible: row.querySelector("[data-field-visible]")?.classList.contains("on") !== false,
      });
    });
    if (pkgCategories.length || container.querySelector('[data-json-section="pkg_categories"]')) {
      sections.categories = sections.categories || {};
      sections.categories.items_json = JSON.stringify(pkgCategories);
    }

    const postTags = [];
    container.querySelectorAll('[data-list="post-tags"] .tag-pill').forEach((pill) => {
      const text = pill.childNodes[0]?.textContent?.trim();
      if (text) postTags.push(text);
    });
    if (postTags.length || container.querySelector('[data-list="post-tags"]')) {
      sections.homepage_featured = sections.homepage_featured || {};
      sections.homepage_featured.post_tags_json = JSON.stringify(postTags);
    }

    const footerColumns = [];
    container.querySelectorAll('[data-list="footer-columns"]').forEach((row) => {
      const linksRaw = row.querySelector('[name="links"]')?.value || "";
      const links = linksRaw.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
        const [label, url] = line.split("|").map((p) => p.trim());
        return { label: label || "", url: url || "#" };
      });
      footerColumns.push({
        title: row.querySelector('[name="title"]')?.value || "",
        links,
      });
    });
    if (footerColumns.length || container.querySelector('[data-json-section="navigation"]')) {
      sections.navigation = sections.navigation || {};
      sections.navigation.columns_json = JSON.stringify(footerColumns);
    }

    const features = [];
    container.querySelectorAll('[data-list="features"]').forEach((row) => {
      features.push({
        icon: row.querySelector('[name="icon"]')?.value || "",
        title: row.querySelector('[name="title"]')?.value || "",
        description: row.querySelector('[name="description"]')?.value || "",
      });
    });
    if (features.length || container.querySelector('[data-json-section="why_choose"]')) {
      sections.why_choose = sections.why_choose || {};
      sections.why_choose.features_json = JSON.stringify(features);
    }

    const tags = [];
    container.querySelectorAll('[data-list="tags"] .tag-pill').forEach((pill) => {
      const text = pill.childNodes[0]?.textContent?.trim();
      if (text) tags.push(text);
    });
    if (tags.length || container.querySelector('[data-list="tags"]')) {
      sections.featured_tours = sections.featured_tours || {};
      sections.featured_tours.tour_tags_json = JSON.stringify(tags);
    }

    const destinations = [];
    container.querySelectorAll('[data-list="destinations"]').forEach((row) => {
      destinations.push({
        name: row.querySelector('[name="name"]')?.value || "",
        places: row.querySelector('[name="places"]')?.value || "",
        image: row.querySelector('[name="image"]')?.value || "",
        slug: (row.querySelector('[name="name"]')?.value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        sort_order: row.querySelector('[name="sort_order"]')?.value || "1",
        visible: row.querySelector("[data-field-visible]")?.classList.contains("on") !== false,
      });
    });
    if (destinations.length || container.querySelector('[data-json-section="destinations"]')) {
      sections.destinations = sections.destinations || {};
      sections.destinations.items_json = JSON.stringify(destinations);
    }

    const team = [];
    container.querySelectorAll('[data-list="team"]').forEach((row) => {
      team.push({
        photo: row.querySelector('[name="photo"]')?.value || "",
        name: row.querySelector('[name="name"]')?.value || "",
        role: row.querySelector('[name="role"]')?.value || "",
        bio: row.querySelector('[name="bio"]')?.value || "",
        linkedin: row.querySelector('[name="linkedin"]')?.value || "",
        twitter: row.querySelector('[name="twitter"]')?.value || "",
      });
    });
    if (team.length || container.querySelector('[data-json-section="team"]')) {
      sections.team = sections.team || {};
      sections.team.members_json = JSON.stringify(team);
    }

    const awards = [];
    container.querySelectorAll('[data-list="awards"]').forEach((row) => {
      awards.push({
        icon: row.querySelector(".icon-preview")?.textContent?.trim() || "🏆",
        name: row.querySelector('[name="name"]')?.value || "",
        org: row.querySelector('[name="org"]')?.value || "",
        year: row.querySelector('[name="year"]')?.value || "",
      });
    });
    if (awards.length || container.querySelector('[data-json-section="awards"]')) {
      sections.awards = sections.awards || {};
      sections.awards.items_json = JSON.stringify(awards);
    }

    const formFields = [];
    container.querySelectorAll('[data-list="form-fields"]').forEach((row) => {
      formFields.push({
        label: row.querySelector('[name="label"]')?.value || "",
        field: row.querySelector('[name="field"]')?.value || "",
        required: row.querySelector(".switch")?.classList.contains("on") || false,
      });
    });
    if (formFields.length || container.querySelector(".cms-form-fields")) {
      sections.form = sections.form || {};
      sections.form.fields_json = JSON.stringify(formFields);
    }

    const aboutFeatures = [];
    container.querySelectorAll('[data-list="about-features"]').forEach((row) => {
      aboutFeatures.push({
        icon_class: row.querySelector('[name="icon_class"]')?.value || "hotel",
        title: row.querySelector('[name="title"]')?.value || "",
        description: row.querySelector('[name="description"]')?.value || "",
      });
    });
    if (aboutFeatures.length || container.querySelector('[data-json-section="about_features"]')) {
      sections.about_features = sections.about_features || {};
      sections.about_features.features_json = JSON.stringify(aboutFeatures);
    }

    const ownedBadges = [];
    container.querySelectorAll('[data-list="owned-badges"]').forEach((row) => {
      ownedBadges.push({ text: row.querySelector('[name="text"]')?.value || "" });
    });
    if (ownedBadges.length || container.querySelector('[data-json-section="owned_assets"]')) {
      sections.owned_assets = sections.owned_assets || {};
      sections.owned_assets.badges_json = JSON.stringify(ownedBadges);
    }

    const scotlandTiles = [];
    container.querySelectorAll('[data-list="scotland-tiles"]').forEach((row) => {
      scotlandTiles.push({
        image: row.querySelector('[name="image"]')?.value || "",
        label: row.querySelector('[name="label"]')?.value || "",
        alt: row.querySelector('[name="alt"]')?.value || "",
        hero: row.querySelector("[data-field-hero]")?.classList.contains("on") || false,
      });
    });
    if (scotlandTiles.length || container.querySelector('[data-json-section="scotland_attractions"]')) {
      sections.scotland_attractions = sections.scotland_attractions || {};
      sections.scotland_attractions.items_json = JSON.stringify(scotlandTiles);
    }

    const premiumServices = [];
    container.querySelectorAll('[data-list="premium-services"]').forEach((row) => {
      premiumServices.push({
        image: row.querySelector('[name="image"]')?.value || "",
        title: row.querySelector('[name="title"]')?.value || "",
        alt: row.querySelector('[name="alt"]')?.value || "",
        description: row.querySelector('[name="description"]')?.value || "",
        link: row.querySelector('[name="link"]')?.value || "#contact",
      });
    });
    if (premiumServices.length || container.querySelector('[data-json-section="premium_services"]')) {
      sections.premium_services = sections.premium_services || {};
      sections.premium_services.items_json = JSON.stringify(premiumServices);
    }

    const miceItems = [];
    container.querySelectorAll('[data-list="mice-items"]').forEach((row) => {
      miceItems.push({
        icon: row.querySelector('[name="icon"]')?.value || "✦",
        title: row.querySelector('[name="title"]')?.value || "",
        description: row.querySelector('[name="description"]')?.value || "",
      });
    });
    if (miceItems.length || container.querySelector('[data-json-section="mice"]')) {
      sections.mice = sections.mice || {};
      sections.mice.items_json = JSON.stringify(miceItems);
    }

    const miceStats = [];
    container.querySelectorAll('[data-list="mice-stats"]').forEach((row) => {
      miceStats.push({
        value: row.querySelector('[name="value"]')?.value || "",
        label: row.querySelector('[name="label"]')?.value || "",
      });
    });
    if (miceStats.length || container.querySelector('[data-json-section="mice_stats"]')) {
      sections.mice = sections.mice || {};
      sections.mice.stats_json = JSON.stringify(miceStats);
    }

    const processSteps = [];
    container.querySelectorAll('[data-list="process-steps"]').forEach((row) => {
      processSteps.push({
        title: row.querySelector('[name="title"]')?.value || "",
        description: row.querySelector('[name="description"]')?.value || "",
      });
    });
    if (processSteps.length || container.querySelector('[data-json-section="process"]')) {
      sections.process = sections.process || {};
      sections.process.steps_json = JSON.stringify(processSteps);
    }

    const testimonialItems = [];
    container.querySelectorAll('[data-list="testimonial-items"]').forEach((row) => {
      testimonialItems.push({
        quote: row.querySelector('[name="quote"]')?.value || "",
        name: row.querySelector('[name="name"]')?.value || "",
        role: row.querySelector('[name="role"]')?.value || "",
        stars: row.querySelector('[name="stars"]')?.value || "5",
      });
    });
    if (testimonialItems.length || container.querySelector('[data-json-section="testimonials"]')) {
      sections.testimonials = sections.testimonials || {};
      sections.testimonials.items_json = JSON.stringify(testimonialItems);
    }

    const successStories = [];
    container.querySelectorAll('[data-list="success-stories"]').forEach((row) => {
      successStories.push({
        image: row.querySelector('[name="image"]')?.value || "",
        title: row.querySelector('[name="title"]')?.value || "",
        alt: row.querySelector('[name="alt"]')?.value || "",
        challenge: row.querySelector('[name="challenge"]')?.value || "",
        solution: row.querySelector('[name="solution"]')?.value || "",
        outcome: row.querySelector('[name="outcome"]')?.value || "",
      });
    });
    if (successStories.length || container.querySelector('[data-json-section="success_stories"]')) {
      sections.success_stories = sections.success_stories || {};
      sections.success_stories.items_json = JSON.stringify(successStories);
    }

    const numbersStats = [];
    container.querySelectorAll('[data-list="numbers-stats"]').forEach((row) => {
      numbersStats.push({
        value: row.querySelector('[name="value"]')?.value || "",
        label: row.querySelector('[name="label"]')?.value || "",
      });
    });
    if (numbersStats.length || container.querySelector('[data-json-section="numbers"]')) {
      sections.numbers = sections.numbers || {};
      sections.numbers.stats_json = JSON.stringify(numbersStats);
    }

    return sections;
  }

  function collectSettings(container) {
    const settings = {};
    container.querySelectorAll("[data-setting-group][data-setting-key]").forEach((el) => {
      const group = el.dataset.settingGroup;
      const key = el.dataset.settingKey;
      if (!settings[group]) settings[group] = {};
      settings[group][key] = el.value;
    });
    return settings;
  }

  const TAB_RENDERERS = {
    home: (s) => renderHome(s),
    "about-us": (s) => renderAbout(s),
    contact: (s, st) => renderContact(s, st),
    blog: (s) => renderBlog(s),
    "packages-page": (s, st, pkgs) => renderPackagesPage(s, pkgs),
    footer: (s, st) => renderFooter(s, st),
  };

  const TAB_USES_SETTINGS = new Set(["contact", "footer"]);

  return {
    esc, val, section, collectCms, collectSettings, TAB_RENDERERS, TAB_USES_SETTINGS, renderSeo,
    featureRow, teamRow, awardRow, destinationRow, tagRow, formFieldRow, parseJson,
    categoryRow, pkgCategoryRow, footerColumnRow, postTagRow, cmsImage, imageField,
    aboutFeatureRow, scotlandTileRow, premiumServiceRow, miceItemRow, statRow,
    processStepRow, testimonialItemRow, successStoryRow, badgeRow,
  };
})();
