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

  async function packagesView(api, selectedId = "") {
    const [pkgData, cmsData] = await Promise.all([
      api("/packages?active=false").catch(() => ({ packages: [] })),
      api("/cms/packages-page").catch(() => ({ sections: {} })),
    ]);
    const packages = pkgData.packages || [];
    const hasSelected = selectedId && packages.some((p) => String(p.id) === String(selectedId));
    const pick = hasSelected ? selectedId : (packages[0]?.id || "");
    const listingEnabled = cmsData.sections?.listing?.enabled !== "0";
    return window.PackageEditor.renderForm(packages, pick, { listingEnabled });
  }

  async function galleryView(api) {
    const data = await api("/gallery").catch(() => ({ items: [] }));
    let items = data.items || [];

    // Fallback mirror of website Photo Gallery if API is empty (same paths as index.html)
    if (!items.length) {
      items = [
        { id: "web-1", title: "British Curry Championship Winner", image_url: "/uploads/gallery/gallery-01-winner-certificate.png", sort_order: 1, album: "Events" },
        { id: "web-2", title: "On the Road", image_url: "/uploads/gallery/gallery-02-team-vehicle.png", sort_order: 2, album: "Events" },
        { id: "web-3", title: "Scotland Community Event", image_url: "/uploads/gallery/gallery-03-scotland-event.png", sort_order: 3, album: "Events" },
        { id: "web-4", title: "Award Presentation", image_url: "/uploads/gallery/gallery-04-award-presentation.png", sort_order: 4, album: "Events" },
        { id: "web-5", title: "Team Portrait", image_url: "/uploads/gallery/gallery-05-team-portrait.png", sort_order: 5, album: "Events" },
        { id: "web-6", title: "Partners and Team", image_url: "/uploads/gallery/gallery-06-partners.png", sort_order: 6, album: "Events" },
        { id: "web-7", title: "Certifications", image_url: "/uploads/gallery/gallery-07-certificates.png", sort_order: 7, album: "Events" },
        { id: "web-8", title: "Group Experience", image_url: "/uploads/gallery/gallery-08-group-walk.png", sort_order: 8, album: "Events" },
        { id: "web-9", title: "Celebrity Guest Experience", image_url: "/uploads/gallery/gallery-09-outdoor-guest.png", sort_order: 9, album: "Events" },
      ];
    }

    const imageField = window.CmsSchema?.imageField
      ? window.CmsSchema.imageField("gallery-new-image", "Image / Video Poster", "", { name: "image_url" })
      : field("Image URL", "https://images.unsplash.com/...", "image_url", true);
    const videoField = window.CmsSchema?.imageField
      ? window.CmsSchema.imageField("gallery-new-video", "Video File", "", { name: "video_url" })
      : field("Video URL", "https://.../video.mp4", "video_url");

    return `<section class="content-grid">
      ${panel("Add Gallery Media", "Upload photos or videos for the homepage Photo Gallery. Videos play in the grid when visible.", `
        <form id="galleryForm" class="form-grid">
          ${field("Title", "Event or photo title", "title")}
          <div class="field">
            <label>Media Type</label>
            <select name="media_type" id="galleryMediaType">
              <option value="image" selected>Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div id="galleryImageFields">${imageField}</div>
          <div id="galleryVideoFields" hidden>${videoField}
            <div class="field-full"><span class="settings-copy">Optional poster/thumbnail image shown before the video loads.</span></div>
            ${window.CmsSchema?.imageField("gallery-new-poster", "Poster Image (optional)", "", { name: "poster_url" }) || field("Poster URL", "", "poster_url")}
          </div>
          ${field("Alt Text", "Describe the media for accessibility", "alt_text")}
          ${field("Sort Order", "10", "sort_order")}
          <div class="field"><label>Album</label><input name="album" value="Events" placeholder="Events" /></div>
          <div class="field-full"><button class="btn primary" type="submit" data-action="save-gallery">Add to Gallery</button></div>
        </form>`)}
      <div class="table-panel">
        <div class="table-head">
          <div>
            <h2 class="panel-title">Website Photo Gallery</h2>
            <p class="panel-subtitle">${items.length} photo${items.length === 1 ? "" : "s"} — same images shown on the homepage gallery</p>
          </div>
        </div>
        <div class="gallery-admin-grid">${items.map((item) => {
          const src = esc(window.CALEDOR_CONFIG?.mediaUrl?.(item.image_url) ?? item.image_url);
          const isVideo = String(item.media_type || "").toLowerCase() === "video"
            || /\.(mp4|webm|ogg|mov)(\?|$)/i.test(String(item.image_url || item.video_url || ""));
          const canDelete = item.id && !String(item.id).startsWith("web-");
          return `
          <div class="gallery-admin-item">
            <div class="gallery-admin-thumb" style="background-image:url('${src}');background-size:cover;background-position:center">${isVideo ? '<span class="gallery-admin-video-badge">Video</span>' : ""}</div>
            <div class="gallery-admin-meta">
              <strong>${esc(item.title || "Untitled")}</strong>
              <span>Order ${esc(String(item.sort_order ?? 0))}</span>
            </div>
            ${canDelete
              ? `<button class="btn secondary sm" type="button" data-action="delete-gallery" data-id="${item.id}">Delete</button>`
              : `<span class="settings-copy">Syncing…</span>`}
          </div>`;
        }).join("")}
        </div>
      </div>
    </section>`;
  }

  const WEB_BLOG_IMAGES = {
    "scotlands-wild-highlands-beckon-travelers": "/assets/scotland/isle-of-skye.png",
    "new-wave-luxury-london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=85",
    "french-riviera-remains-benchmark": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=85",
    "inside-italys-hidden-heritage-sites": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=85",
    "essential-travel-tips-europe-2026": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=85",
  };

  function blogDisplayImage(post = {}) {
    return post.image_url
      || WEB_BLOG_IMAGES[post.slug]
      || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=85";
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
      ${panel("Add / Edit Blog Post", "These cards are the Travel Insights section on the homepage. Upload an image, then Save Post or Save Changes — it goes live immediately.", `
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
        <div class="table-head">
          <div>
            <h2 class="panel-title">Homepage Travel Insights</h2>
            <p class="panel-subtitle">${posts.length} post${posts.length === 1 ? "" : "s"} — same images shown on the website blog section</p>
          </div>
        </div>
        <div class="blog-admin-grid">${posts.length ? posts.map((p) => {
          const src = esc(window.CALEDOR_CONFIG?.mediaUrl?.(blogDisplayImage(p)) ?? blogDisplayImage(p));
          return `
          <div class="blog-admin-item">
            <div class="blog-admin-thumb" style="background-image:url('${src}');background-size:cover;background-position:center"></div>
            <div class="blog-admin-meta">
              <strong>${esc(p.title || "Untitled")}</strong>
              <span>${esc(p.category || "Travel Insights")} · ${p.published ? "Published" : "Draft"}</span>
            </div>
            <div class="actions-row">
              <button class="btn secondary sm" type="button" data-action="change-blog-image" data-id="${p.id}">Change Image</button>
              <input class="blog-row-file" type="file" accept="image/*" hidden data-id="${p.id}" />
              <button class="btn secondary sm" type="button" data-action="edit-blog" data-id="${p.id}">Edit</button>
              <button class="btn secondary sm" type="button" data-action="delete-blog" data-id="${p.id}">Delete</button>
            </div>
          </div>`;
        }).join("") : '<p class="settings-copy" style="padding:16px">No posts yet</p>'}
        </div>
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
          <div><h2 class="settings-title">Notifications</h2><p class="panel-subtitle">Live from contact form submissions</p></div>
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

  function sitePublicUrl(hash = "") {
    return window.AdminNav?.siteUrl(hash) || `${window.location.origin}/`;
  }

  function packagePublicUrl(slug) {
    return window.AdminNav?.packageUrl(slug) || "";
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
    blogDisplayImage,
  };
})();
