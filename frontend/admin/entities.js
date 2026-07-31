/* Admin entity management views — packages, blog, gallery, bookings, FAQs, notifications, users */
window.AdminEntities = (() => {
  const { esc } = window.CmsSchema;

  function statusBadge(status) {
    const s = (status || "pending").toLowerCase();
    return `<span class="status ${esc(s)}">${esc(status)}</span>`;
  }

  function panel(title, subtitle, body, actions = "") {
    return `<div class="panel">
      <div class="settings-head">
        <div><h2 class="settings-title">${esc(title)}</h2>${subtitle ? `<p class="panel-subtitle">${esc(subtitle)}</p>` : ""}</div>
        ${actions}
      </div>
      <div class="settings-body">${body}</div>
    </div>`;
  }

  async function packagesView(api) {
    const data = await api("/packages?active=false").catch(() => ({ packages: [] }));
    const packages = data.packages || [];
    return window.PackageEditor.renderForm(packages, packages[0]?.id || "");
  }

  async function galleryView(api) {
    const data = await api("/gallery").catch(() => ({ items: [] }));
    const items = data.items || [];
    const imageField = window.CmsSchema?.imageField
      ? window.CmsSchema.imageField("gallery-new-image", "Image", "", { name: "image_url" })
      : field("Image URL", "https://images.unsplash.com/...", "image_url", true);
    return `<section class="content-grid">
      ${panel("Add Gallery Image", "Upload photos shown in the homepage Photo Gallery section", `
        <form id="galleryForm" class="form-grid">
          ${field("Title", "Event or photo title", "title")}
          ${imageField}
          ${field("Alt Text", "Describe the image for accessibility", "alt_text")}
          ${field("Sort Order", "1", "sort_order")}
          <div class="field"><label>Album</label><input name="album" value="Events" placeholder="Events" /></div>
          <div class="field-full"><button class="btn primary" type="submit" data-action="save-gallery">Add Image</button></div>
        </form>`)}
      <div class="table-panel">
        <div class="table-head">
          <div><h2 class="panel-title">Gallery Images</h2><p class="panel-subtitle">${items.length} photo${items.length === 1 ? "" : "s"} on the website</p></div>
        </div>
        <div class="gallery-admin-grid">${items.map((item) => `
          <div class="gallery-admin-item">
            <div class="gallery-admin-thumb" style="background-image:url('${esc(window.CALEDOR_CONFIG?.mediaUrl?.(item.image_url) ?? item.image_url)}')"></div>
            <div class="gallery-admin-meta">
              <strong>${esc(item.title || "Untitled")}</strong>
              <span>Order ${esc(String(item.sort_order ?? 0))}</span>
            </div>
            <button class="btn secondary sm" type="button" data-action="delete-gallery" data-id="${item.id}">Delete</button>
          </div>`).join("") || '<p class="panel-subtitle">No gallery images yet. Upload your first photo above.</p>'}
      </div>
    </section>`;
  }

  async function blogView(api, embedded = false) {
    const data = await api("/blog?published=all").catch(() => ({ posts: [] }));
    const posts = data.posts || [];
    const imageField = window.CmsSchema?.imageField
      ? window.CmsSchema.imageField("blog-post-image", "Featured Image", "", { name: "image_url" })
      : field("Image URL", "", "image_url");
    const wrap = embedded ? "" : '<section class="content-grid">';
    const wrapEnd = embedded ? "" : "</section>";
    return `${wrap}
      ${panel("Add / Edit Blog Post", "Published posts appear in Travel Insights on the homepage", `
        <form id="blogForm" class="form-grid">
          <input type="hidden" name="id" value="" />
          ${field("Title", "", "title")}
          ${field("Category", "Travel Insights", "category")}
          ${imageField}
          ${textarea("Excerpt", "", "excerpt")}
          ${textarea("Content", "", "content")}
          <div class="field"><label>Published</label><select name="published"><option value="1">Yes</option><option value="0">Draft</option></select></div>
          <div class="field-full" style="display:flex;gap:10px">
            <button class="btn primary" type="submit" data-action="save-blog">Save Post</button>
            <button class="btn secondary" type="button" data-action="reset-blog-form">Clear</button>
          </div>
        </form>`)}
      <div class="table-panel">
        <div class="table-head"><div><h2 class="panel-title">Blog Posts</h2><p class="panel-subtitle">${posts.length} posts</p></div></div>
        <table><thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${posts.map((p) => `
          <tr><td>${esc(p.title)}</td><td>${esc(p.category)}</td>
          <td>${p.published ? statusBadge("confirmed") : statusBadge("pending")}</td>
          <td>
            <button class="btn secondary sm" type="button" data-action="edit-blog" data-id="${p.id}">Edit</button>
            <button class="btn secondary sm" type="button" data-action="delete-blog" data-id="${p.id}">Delete</button>
          </td></tr>`).join("") || '<tr><td colspan="4">No posts yet</td></tr>'}
        </tbody></table>
      </div>
    ${wrapEnd}`;
  }

  async function bookingsView(api) {
    const data = await api("/bookings").catch(() => ({ bookings: [] }));
    const bookings = data.bookings || [];
    return `<section class="content-grid">
      <div class="table-panel">
        <div class="table-head">
          <div><h2 class="panel-title">All Bookings</h2><p class="panel-subtitle">${bookings.length} reservations</p></div>
        </div>
        <table><thead><tr><th>ID</th><th>Guest</th><th>Package</th><th>Date</th><th>Status</th><th>Amount</th><th>Update</th></tr></thead>
        <tbody>${bookings.map((b) => `
          <tr>
            <td>${esc(b.booking_id)}</td>
            <td>${esc(b.customer_name)}</td>
            <td>${esc(b.package_name)}</td>
            <td>${esc(b.travel_date || "—")}</td>
            <td>${statusBadge(b.status)}</td>
            <td class="amount">${b.amount != null ? `$${Number(b.amount).toLocaleString()}` : "—"}</td>
            <td>
              <select data-action="update-booking-status" data-id="${b.id}">
                ${["pending", "confirmed", "completed", "cancelled"].map((s) =>
                  `<option value="${s}"${b.status === s ? " selected" : ""}>${s}</option>`).join("")}
              </select>
            </td>
          </tr>`).join("") || '<tr><td colspan="7">No bookings yet</td></tr>'}
        </tbody></table>
      </div>
    </section>`;
  }

  async function faqView(api) {
    const [faqData, cmsData] = await Promise.all([
      api("/faqs").catch(() => ({ faqs: [] })),
      api("/cms/faq").catch(() => ({ sections: {} })),
    ]);
    const faqs = faqData.faqs || [];
    const s = cmsData.sections || {};
    const sec = s.section || {};
    const enabled = sec.enabled !== "0";

    return `<section class="content-grid">
      ${panel("FAQ Section on Website", "Controls the heading and visibility of the FAQ block on the homepage", `
        <div class="form-grid">
          <div class="field-full">
            <div class="display-toggle">
              <span class="settings-copy">Show FAQ section on website</span>
              <span class="switch section-switch ${enabled ? "on" : ""}" data-cms-section="section" data-cms-key="enabled"></span>
            </div>
          </div>
          <div class="field-full">
            <label>Section Kicker / Title</label>
            <input data-cms-section="section" data-cms-key="kicker" value="${esc(sec.kicker || "Frequently Asked Questions")}" />
          </div>
          <div class="field-full">
            <label>Section Subtitle</label>
            <textarea data-cms-section="section" data-cms-key="subtitle">${esc(sec.subtitle || "Answers to common questions about partnerships, operations, and bespoke travel.")}</textarea>
          </div>
          <div class="field-full actions-row">
            <button class="btn primary" type="button" data-action="save-faq-section">Save Section Settings</button>
            <a class="btn outline sm" href="${esc(sitePublicUrl("faq"))}" target="_blank" rel="noopener">Preview on Website</a>
          </div>
        </div>`)}

      ${panel("Add / Edit FAQ", "Questions and answers shown in the accordion on the homepage FAQ section", `
        <form id="faqForm" class="form-grid">
          <input type="hidden" name="id" value="" />
          ${field("Question", "What is your typical response time?", "question", true)}
          ${textarea("Answer", "We typically respond within 24 hours.", "answer")}
          ${field("Category", "General", "category")}
          ${field("Sort Order", "0", "sort_order")}
          <div class="field">
            <label>Status</label>
            <select name="active">
              <option value="1" selected>Published (visible on website)</option>
              <option value="0">Draft (hidden)</option>
            </select>
          </div>
          <div class="field-full actions-row">
            <button class="btn primary" type="submit">Save FAQ</button>
            <button class="btn secondary" type="button" data-action="reset-faq-form">Clear Form</button>
          </div>
        </form>`)}

      <div class="table-panel">
        <div class="table-head">
          <div>
            <h2 class="panel-title">All FAQs</h2>
            <p class="panel-subtitle">${faqs.length} question${faqs.length === 1 ? "" : "s"} · sorted by order</p>
          </div>
        </div>
        <table>
          <thead>
            <tr><th>Order</th><th>Question</th><th>Category</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>${faqs.map((f) => `
            <tr>
              <td>${esc(String(f.sort_order ?? 0))}</td>
              <td>${esc(f.question)}</td>
              <td>${esc(f.category || "General")}</td>
              <td>${f.active ? statusBadge("confirmed") : statusBadge("pending")}</td>
              <td>
                <button class="btn secondary sm" type="button" data-action="edit-faq" data-id="${f.id}">Edit</button>
                <button class="btn secondary sm" type="button" data-action="delete-faq" data-id="${f.id}">Delete</button>
              </td>
            </tr>`).join("") || '<tr><td colspan="5">No FAQs yet. Add your first question above.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>`;
  }

  async function notificationsView(api) {
    const data = await api("/notifications").catch(() => ({ notifications: [] }));
    const notifications = data.notifications || [];
    return `<section class="content-grid">
      <div class="panel">
        <div class="settings-head">
          <div><h2 class="settings-title">Notifications</h2><p class="panel-subtitle">Live from contact forms and bookings</p></div>
          <button class="btn secondary" type="button" data-action="mark-all-read">Mark All Read</button>
        </div>
        <div class="settings-body mini-list">
          ${notifications.map((n) => `
            <div class="mini-card${n.read ? "" : " unread"}" data-notif-id="${n.id}">
              <strong>${esc(n.title)}</strong>
              <span>${esc(n.message)}</span>
              ${n.read ? "" : `<button class="btn secondary sm" type="button" data-action="mark-read" data-id="${n.id}">Mark Read</button>`}
            </div>`).join("") || '<p class="panel-subtitle">No notifications yet.</p>'}
        </div>
      </div>
      ${panel("Contact Submissions", "Messages from the proposal form", await contactSubmissionsTable(api))}
    </section>`;
  }

  async function contactSubmissionsTable(api) {
    const data = await api("/contact").catch(() => ({ submissions: [] }));
    const subs = data.submissions || [];
    return `<table><thead><tr><th>Name</th><th>Email</th><th>Message</th><th>Status</th></tr></thead>
      <tbody>${subs.map((s) => `
        <tr><td>${esc(s.name)}</td><td>${esc(s.email)}</td><td>${esc((s.message || "").slice(0, 60))}…</td>
        <td><select data-action="update-contact-status" data-id="${s.id}">
          ${["unread", "read", "replied"].map((st) => `<option value="${st}"${s.status === st ? " selected" : ""}>${st}</option>`).join("")}
        </select></td></tr>`).join("") || '<tr><td colspan="4">No submissions yet</td></tr>'}
      </tbody></table>`;
  }

  async function usersView(api) {
    const data = await api("/users").catch(() => ({ users: [] }));
    const users = data.users || [];
    return `<section class="content-grid">
      <div class="table-panel">
        <div class="table-head"><div><h2 class="panel-title">User Directory</h2></div></div>
        <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
        <tbody>${users.map((u) => `
          <tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.role)}</td><td>${statusBadge(u.status === "active" ? "confirmed" : "pending")}</td></tr>`).join("")}
        </tbody></table>
      </div>
    </section>`;
  }

  function packagePublicUrl(slug) {
    const root = window.location.pathname.replace(/\/admin(?:\/index\.html)?$/i, "") || "";
    return `${window.location.origin}${root}/package/${encodeURIComponent(slug)}`;
  }

  function sitePublicUrl(hash = "") {
    const root = window.location.pathname.replace(/\/admin(?:\/index\.html)?$/i, "") || "";
    if (!hash) return `${window.location.origin}${root}/`;
    const clean = String(hash).replace(/^#/, "");
    return `${window.location.origin}${root}/#${clean}`;
  }

  function field(label, placeholder, name, full = false) {
    const cls = full ? "field-full" : "field";
    return `<div class="${cls}"><label>${esc(label)}</label><input name="${esc(name)}" placeholder="${esc(placeholder)}" /></div>`;
  }

  function textarea(label, placeholder, name) {
    return `<div class="field-full"><label>${esc(label)}</label><textarea name="${esc(name)}" placeholder="${esc(placeholder)}"></textarea></div>`;
  }

  return {
    packagesView, galleryView, blogView, bookingsView, faqView, notificationsView, usersView, panel, packagePublicUrl, sitePublicUrl,
  };
})();
