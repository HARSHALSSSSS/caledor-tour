/** Package detail editor — itinerary, highlights, gallery, admin form helpers */
window.PackageEditor = (() => {
  function parseJson(raw, fb = []) {
    try { return JSON.parse(raw || "[]"); } catch { return fb; }
  }

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function textRow(name, label, value = "", full = false) {
    const cls = full ? "field-full" : "field";
    return `<div class="${cls}"><label>${esc(label)}</label><input name="${esc(name)}" value="${esc(value)}" /></div>`;
  }

  function textareaRow(name, label, value = "") {
    return `<div class="field-full"><label>${esc(label)}</label><textarea name="${esc(name)}">${esc(value)}</textarea></div>`;
  }

  function itineraryRow(item = {}) {
    return `<div class="itinerary-row" data-list="itinerary">
      <div class="field"><label>Day</label><input name="day" value="${esc(item.day || "")}" /></div>
      <div class="field"><label>Title</label><input name="title" value="${esc(item.title || "")}" /></div>
      <div class="field-full"><label>Description</label><textarea name="description">${esc(item.description || "")}</textarea></div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function listItemRow(value = "") {
    return `<div class="list-item-row" data-list="simple-list">
      <input name="value" value="${esc(value)}" placeholder="List item" />
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function galleryRow(item = {}, idx = 0) {
    const target = `gallery-${idx}-${Math.random().toString(36).slice(2, 6)}`;
    const imgField = window.CmsSchema?.imageField
      ? window.CmsSchema.imageField(target, "Gallery Image", item.url || "", { name: "url", compact: true })
      : `<div class="field"><label>Image URL</label><input name="url" class="cms-image-url" value="${esc(item.url || "")}" /></div>`;
    return `<div class="gallery-row-editor" data-list="gallery">
      ${imgField}
      <div class="field"><label>Alt Text</label><input name="alt" value="${esc(item.alt || "")}" /></div>
      <button class="action-icon danger cms-remove-row" type="button">✕</button>
    </div>`;
  }

  function renderForm(packages = [], selectedId = "") {
    const options = packages.map((p) =>
      `<option value="${p.id}"${String(p.id) === String(selectedId) ? " selected" : ""}>${esc(p.name)}</option>`).join("");

    return `<section class="content-grid">
      <article class="settings-panel">
        <div class="settings-head">
          <div>
            <h2 class="settings-title">Select Package to Edit</h2>
            <p class="panel-subtitle">Packages added here appear in CMS Packages Page and on the website detail page.</p>
          </div>
        </div>
        <div class="settings-body">
          <div class="form-grid">
            <div class="field-full">
              <label>Package</label>
              <select id="packageSelect">${options || '<option value="">No packages yet</option>'}</select>
            </div>
            <div class="field-full actions-row">
              <a class="btn outline sm" id="previewPackageLink" href="#" target="_blank" rel="noopener">Preview Detail Page</a>
              <button class="btn secondary sm" type="button" data-action="reset-package-form">New Package</button>
            </div>
          </div>
        </div>
      </article>

      <form id="packageForm" class="settings-panel">
        <div class="settings-head"><div><h2 class="settings-title">Package Detail Content</h2></div></div>
        <div class="settings-body">
          <input type="hidden" name="id" value="" />
          <div class="form-grid">
            ${textRow("name", "Package Name")}
            ${textRow("slug", "URL Slug")}
            ${textRow("badge", "Badge Label", "MULTI-DAY")}
            ${textRow("category", "Category", "Luxury Escapes")}
            ${textRow("duration", "Duration", "7 Days")}
            ${textRow("group_size", "Group Size", "2–8 Guests")}
            ${textRow("season", "Season", "Year-Round")}
            ${textRow("difficulty", "Difficulty", "Moderate")}
            ${textRow("price_from", "Price From")}
            ${textRow("about_label", "About Section Label", "The Expedition")}
            ${textRow("itinerary_heading", "Itinerary Heading", "A Curated Day-by-Day Path")}
            ${textRow("gallery_heading", "Gallery Heading", "Capturing the Highland Soul")}
          </div>
          ${textareaRow("tagline", "Tagline / Hero Subtitle")}
          ${textareaRow("description", "About Description")}
          ${window.CmsSchema?.imageField("pkg-hero-image", "Hero Image", "", { name: "image_url" }) || textareaRow("image_url", "Hero Image URL")}

          <h3 class="settings-title" style="margin-top:18px">Experience Highlights</h3>
          <div class="cms-list" id="highlightsList" data-json-key="highlights"></div>
          <button class="add-row-btn cms-add-highlight" type="button">+ Add Highlight</button>

          <h3 class="settings-title" style="margin-top:18px">Day-by-Day Itinerary</h3>
          <div class="cms-list" id="itineraryList" data-json-key="itinerary"></div>
          <button class="add-row-btn cms-add-itinerary" type="button">+ Add Day</button>

          <h3 class="settings-title" style="margin-top:18px">Gallery Images</h3>
          <div class="cms-list" id="galleryList" data-json-key="gallery_json"></div>
          <button class="add-row-btn cms-add-gallery" type="button">+ Add Gallery Image</button>

          <div class="form-grid" style="margin-top:18px">
            <div>
              <h3 class="settings-title">Included</h3>
              <div class="cms-list" id="inclusionsList"></div>
              <button class="add-row-btn cms-add-inclusion" type="button">+ Add Included Item</button>
            </div>
            <div>
              <h3 class="settings-title">Not Included</h3>
              <div class="cms-list" id="exclusionsList"></div>
              <button class="add-row-btn cms-add-exclusion" type="button">+ Add Excluded Item</button>
            </div>
          </div>

          ${textareaRow("related_slugs_json", "Related Package Slugs (comma-separated)")}

          <div class="field-full actions-row" style="margin-top:18px">
            <button class="btn primary" type="submit">Save Package</button>
            <label class="toggle-row"><span>Featured</span>
              <input type="checkbox" name="featured" value="1" /></label>
            <label class="toggle-row"><span>Active</span>
              <input type="checkbox" name="active" value="1" checked /></label>
          </div>
        </div>
      </form>

      <div class="table-panel">
        <div class="table-head"><div><h2 class="panel-title">All Packages</h2></div></div>
        <table><thead><tr><th>Name</th><th>Slug</th><th>Category</th><th>Actions</th></tr></thead>
        <tbody>${packages.map((p) => `
          <tr><td>${esc(p.name)}</td><td>${esc(p.slug)}</td><td>${esc(p.category)}</td>
          <td>
            <button class="btn secondary sm" type="button" data-action="edit-package" data-id="${p.id}">Edit</button>
            <button class="btn secondary sm" type="button" data-action="delete-package" data-id="${p.id}">Delete</button>
            <a class="btn outline sm" href="../package-detail.html?slug=${encodeURIComponent(p.slug)}" target="_blank">View</a>
          </td></tr>`).join("") || '<tr><td colspan="4">No packages yet</td></tr>'}
        </tbody></table>
      </div>
    </section>`;
  }

  function fillList(container, items, rowFn) {
    if (!container) return;
    container.innerHTML = items.map((item, i) => rowFn(item, i)).join("");
  }

  function loadIntoForm(pkg) {
    const form = document.getElementById("packageForm");
    if (!form || !pkg) return;

    const set = (name, val) => {
      const el = form.querySelector(`[name="${name}"]`);
      if (el) el.value = val ?? "";
    };

    set("id", pkg.id || "");
    set("name", pkg.name);
    set("slug", pkg.slug);
    set("badge", pkg.badge);
    set("category", pkg.category);
    set("duration", pkg.duration);
    set("group_size", pkg.group_size);
    set("season", pkg.season);
    set("difficulty", pkg.difficulty);
    set("price_from", pkg.price_from ?? "");
    set("about_label", pkg.about_label);
    set("itinerary_heading", pkg.itinerary_heading);
    set("gallery_heading", pkg.gallery_heading);
    set("tagline", pkg.tagline);
    set("description", pkg.description);
    set("image_url", pkg.image_url);
    const heroInput = form.querySelector('[name="image_url"]');
    if (heroInput) heroInput.dispatchEvent(new Event("input"));
    form.querySelector('[name="featured"]').checked = !!pkg.featured;
    form.querySelector('[name="active"]').checked = pkg.active !== 0;

    let related = "";
    try {
      related = JSON.parse(pkg.related_slugs_json || "[]").join(", ");
    } catch { related = ""; }
    set("related_slugs_json", related);

    fillList(document.getElementById("highlightsList"), parseJson(pkg.highlights), listItemRow);
    fillList(document.getElementById("itineraryList"), parseJson(pkg.itinerary), itineraryRow);
    fillList(document.getElementById("galleryList"), parseJson(pkg.gallery_json), galleryRow);
    fillList(document.getElementById("inclusionsList"), parseJson(pkg.inclusions), listItemRow);
    fillList(document.getElementById("exclusionsList"), parseJson(pkg.exclusions), listItemRow);
    if (window.CmsUI) window.CmsUI.wire(form);

    const preview = document.getElementById("previewPackageLink");
    if (preview && pkg.slug) preview.href = `../package-detail.html?slug=${encodeURIComponent(pkg.slug)}`;

    const select = document.getElementById("packageSelect");
    if (select) select.value = String(pkg.id);
  }

  function fieldValue(form, name) {
    return form.querySelector(`[name="${name}"]`)?.value ?? "";
  }

  function collectSimpleList(container) {
    if (!container) return [];
    return [...container.querySelectorAll('input[name="value"]')]
      .map((el) => el.value.trim()).filter(Boolean);
  }

  function collectFromForm(form) {
    const highlights = collectSimpleList(document.getElementById("highlightsList"));
    const inclusions = collectSimpleList(document.getElementById("inclusionsList"));
    const exclusions = collectSimpleList(document.getElementById("exclusionsList"));

    const itinerary = [];
    form.querySelectorAll('[data-list="itinerary"]').forEach((row) => {
      itinerary.push({
        day: row.querySelector('[name="day"]')?.value || "",
        title: row.querySelector('[name="title"]')?.value || "",
        description: row.querySelector('[name="description"]')?.value || "",
      });
    });

    const gallery = [];
    form.querySelectorAll('[data-list="gallery"]').forEach((row) => {
      gallery.push({
        url: row.querySelector('[name="url"]')?.value || "",
        alt: row.querySelector('[name="alt"]')?.value || "",
      });
    });

    const relatedRaw = fieldValue(form, "related_slugs_json");
    const related_slugs_json = JSON.stringify(
      relatedRaw.split(",").map((s) => s.trim()).filter(Boolean)
    );

    const featuredEl = form.querySelector('[name="featured"]');
    const activeEl = form.querySelector('[name="active"]');

    return {
      id: form.querySelector('[name="id"]')?.value || "",
      name: fieldValue(form, "name"),
      slug: fieldValue(form, "slug"),
      badge: fieldValue(form, "badge"),
      category: fieldValue(form, "category"),
      duration: fieldValue(form, "duration"),
      group_size: fieldValue(form, "group_size"),
      season: fieldValue(form, "season"),
      difficulty: fieldValue(form, "difficulty"),
      price_from: Number(fieldValue(form, "price_from")) || null,
      currency: fieldValue(form, "currency") || "USD",
      about_label: fieldValue(form, "about_label"),
      itinerary_heading: fieldValue(form, "itinerary_heading"),
      gallery_heading: fieldValue(form, "gallery_heading"),
      tagline: fieldValue(form, "tagline"),
      description: fieldValue(form, "description"),
      image_url: fieldValue(form, "image_url"),
      highlights: JSON.stringify(highlights),
      inclusions: JSON.stringify(inclusions),
      exclusions: JSON.stringify(exclusions),
      itinerary: JSON.stringify(itinerary.filter((d) => d.title || d.description || d.day)),
      gallery_json: JSON.stringify(gallery.filter((g) => g.url)),
      related_slugs_json,
      featured: featuredEl?.checked ? 1 : 0,
      active: activeEl?.checked ? 1 : 0,
    };
  }

  function wire(api, reload) {
    const select = document.getElementById("packageSelect");
    if (select && !select._pkgWired) {
      select._pkgWired = true;
      select.addEventListener("change", async () => {
        if (!select.value) return;
        const { package: pkg } = await api(`/packages/${select.value}`);
        loadIntoForm(pkg);
        if (window.CmsUI) window.CmsUI.wire(document.getElementById("view"));
      });
    }

    const wireBtn = (selector, handler) => {
      const btn = document.querySelector(selector);
      if (btn && !btn._pkgWired) {
        btn._pkgWired = true;
        btn.addEventListener("click", handler);
      }
    };

    wireBtn(".cms-add-itinerary", () => {
      const list = document.getElementById("itineraryList");
      const dayNum = list?.querySelectorAll('[data-list="itinerary"]').length + 1 || 1;
      list?.insertAdjacentHTML("beforeend", itineraryRow({ day: dayNum }));
      if (window.CmsUI) window.CmsUI.wire(list);
    });
    wireBtn(".cms-add-highlight", () => {
      document.getElementById("highlightsList")?.insertAdjacentHTML("beforeend", listItemRow());
    });
    wireBtn(".cms-add-gallery", () => {
      const list = document.getElementById("galleryList");
      const idx = list?.querySelectorAll('[data-list="gallery"]').length || 0;
      list?.insertAdjacentHTML("beforeend", galleryRow({}, idx));
      if (window.CmsUI) window.CmsUI.wire(list);
    });
    wireBtn(".cms-add-inclusion", () => {
      document.getElementById("inclusionsList")?.insertAdjacentHTML("beforeend", listItemRow());
    });
    wireBtn(".cms-add-exclusion", () => {
      document.getElementById("exclusionsList")?.insertAdjacentHTML("beforeend", listItemRow());
    });
  }

  return { renderForm, loadIntoForm, collectFromForm, wire, itineraryRow, listItemRow, galleryRow };
})();
