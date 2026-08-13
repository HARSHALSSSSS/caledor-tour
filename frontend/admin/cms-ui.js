/** CMS admin UI interactions — dynamic lists, image preview, toggles, uploads */
window.CmsUI = (() => {
  const MAX_EDGE = 1600;
  const JPEG_QUALITY = 0.82;

  function setUploadBusy(target, busy, label) {
    const btn = document.querySelector(`.cms-upload-image[data-target="${target}"]`);
    if (!btn) return;
    if (busy) {
      if (!btn.dataset.originalLabel) btn.dataset.originalLabel = btn.textContent;
      btn.textContent = label || "Uploading…";
      btn.disabled = true;
    } else {
      btn.textContent = btn.dataset.originalLabel || "Upload Image";
      btn.disabled = false;
    }
  }

  function showLocalPreview(target, file) {
    const input = findImageInput(target);
    const thumb = document.querySelector(`.cms-thumb[data-for="${target}"]`)
      || input?.closest(".image-uploader")?.querySelector(".cms-thumb");
    if (!thumb || !file) return null;
    const objectUrl = URL.createObjectURL(file);
    thumb.style.backgroundImage = `url('${objectUrl}')`;
    thumb.style.backgroundSize = "cover";
    thumb.style.backgroundPosition = "center";
    return objectUrl;
  }

  function loadImageElement(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read image"));
      };
      img.src = url;
    });
  }

  /** Compress large photos before upload so admin uploads feel fast. */
  async function compressImage(file) {
    if (!file || !/^image\//.test(file.type)) return file;
    if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
    if (file.size < 350 * 1024) return file;

    try {
      const img = await loadImageElement(file);
      const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(img, 0, 0, width, height);

      const preferJpeg = !/png/i.test(file.type) || file.size > 1024 * 1024;
      const mime = preferJpeg ? "image/jpeg" : "image/png";
      const blob = await new Promise((resolve) => {
        canvas.toBlob((result) => resolve(result), mime, preferJpeg ? JPEG_QUALITY : undefined);
      });
      if (!blob || blob.size >= file.size) return file;

      const base = (file.name || "image").replace(/\.[^.]+$/, "");
      const ext = mime === "image/jpeg" ? ".jpg" : ".png";
      return new File([blob], `${base}${ext}`, { type: mime, lastModified: Date.now() });
    } catch {
      return file;
    }
  }

  async function uploadImage(file) {
    const token = localStorage.getItem("caledor_token");
    const uploadFile = file.type.startsWith("video/") ? file : await compressImage(file);
    const form = new FormData();
    form.append("image", uploadFile);
    const res = await fetch(window.CALEDOR_CONFIG?.uploadUrl?.() ?? "/api/upload", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  }

  function syncThumb(input) {
    const id = input.id?.replace("img-", "") || `${input.dataset.cmsSection}-${input.dataset.cmsKey}`;
    const thumbs = id
      ? document.querySelectorAll(`.cms-thumb[data-for="${id}"]`)
      : [];
    const fallback = input.closest(".image-uploader")?.querySelector(".cms-thumb")
      || input.closest(".team-card")?.querySelector(".team-avatar");
    const targets = thumbs.length ? thumbs : (fallback ? [fallback] : []);
    targets.forEach((thumb) => {
      if (input.value) {
        const preview = window.CALEDOR_CONFIG?.mediaUrl?.(input.value) || input.value;
        thumb.style.backgroundImage = `url('${preview.replace(/'/g, "%27")}')`;
        thumb.style.backgroundSize = "cover";
        thumb.style.backgroundPosition = "center";
      } else {
        thumb.style.backgroundImage = "";
      }
    });
  }

  function findImageInput(target) {
    return document.getElementById(`img-${target}`)
      || document.querySelector(`input.cms-image-url[data-image-target="${target}"]`);
  }

  function wireAddButton(container, selector, listSelector, rowFn) {
    const btn = container.querySelector(selector);
    if (!btn || btn._wired) return;
    btn._wired = true;
    btn.addEventListener("click", () => {
      const list = container.querySelector(listSelector);
      if (list) {
        list.insertAdjacentHTML("beforeend", rowFn({}));
        wire(list);
      }
    });
  }

  function wire(root) {
    const container = root || document.getElementById("view");
    if (!container) return;

    container.querySelectorAll(".switch").forEach((sw) => {
      if (sw._wired) return;
      sw._wired = true;
      sw.setAttribute("role", "switch");
      sw.setAttribute("aria-checked", sw.classList.contains("on") ? "true" : "false");
      sw.addEventListener("click", () => {
        sw.classList.toggle("on");
        const on = sw.classList.contains("on");
        sw.setAttribute("aria-checked", on ? "true" : "false");
        sw.dataset.switchValue = on ? "1" : "0";
        const panel = sw.closest(".settings-panel");
        if (panel && sw.classList.contains("section-switch")) {
          panel.classList.toggle("section-disabled", !on);
        }
      });
      if (sw.classList.contains("section-switch") && !sw.classList.contains("on")) {
        sw.closest(".settings-panel")?.classList.add("section-disabled");
      }
    });

    container.querySelectorAll(".cms-image-url, .cms-team-photo").forEach((input) => {
      if (input._wired) return;
      input._wired = true;
      input.addEventListener("input", () => syncThumb(input));
      syncThumb(input);
    });

    container.querySelectorAll(".cms-upload-image").forEach((btn) => {
      if (btn._wired) return;
      btn._wired = true;
      btn.addEventListener("click", () => {
        const fileInput = container.querySelector(`.cms-file-input[data-target="${btn.dataset.target}"]`)
          || document.querySelector(`.cms-file-input[data-target="${btn.dataset.target}"]`);
        fileInput?.click();
      });
    });

    container.querySelectorAll(".cms-file-input").forEach((fileInput) => {
      if (fileInput._wired) return;
      fileInput._wired = true;
      fileInput.addEventListener("change", async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        const target = fileInput.dataset.target;
        const input = findImageInput(target);
        const localPreview = showLocalPreview(target, file);
        setUploadBusy(target, true, "Optimizing…");
        try {
          setUploadBusy(target, true, "Uploading…");
          const url = await uploadImage(file);
          if (input) {
            input.value = url;
            input.dispatchEvent(new Event("input"));
          }
        } catch (err) {
          alert(err.message || "Upload failed");
          if (input) syncThumb(input);
        } finally {
          if (localPreview) URL.revokeObjectURL(localPreview);
          setUploadBusy(target, false);
          fileInput.value = "";
        }
      });
    });

    container.querySelectorAll(".cms-change-image").forEach((btn) => {
      if (btn._wired) return;
      btn._wired = true;
      btn.addEventListener("click", () => {
        const input = findImageInput(btn.dataset.target);
        const url = prompt("Enter image URL:", input?.value || "");
        if (url == null || !input) return;
        input.value = url;
        input.dispatchEvent(new Event("input"));
      });
    });

    container.querySelectorAll(".cms-remove-image").forEach((btn) => {
      if (btn._wired) return;
      btn._wired = true;
      btn.addEventListener("click", () => {
        const input = findImageInput(btn.dataset.target);
        if (input) {
          input.value = "";
          input.dispatchEvent(new Event("input"));
        }
      });
    });

    container.querySelectorAll(".cms-slider").forEach((slider) => {
      if (slider._wired) return;
      slider._wired = true;
      const val = slider.parentElement?.querySelector(".slider-value");
      slider.addEventListener("input", () => {
        if (val) val.textContent = `${slider.value}s`;
      });
    });

    container.querySelectorAll(".cms-remove-row").forEach((btn) => {
      if (btn._wired) return;
      btn._wired = true;
      btn.addEventListener("click", () => btn.closest("[data-list]")?.remove());
    });

    container.querySelectorAll(".cms-remove-tag").forEach((btn) => {
      if (btn._wired) return;
      btn._wired = true;
      btn.addEventListener("click", () => btn.closest(".tag-pill")?.remove());
    });

    wireAddButton(container, ".cms-add-feature", '[data-json-section="why_choose"]', window.CmsSchema.featureRow);
    wireAddButton(container, ".cms-add-destination", '[data-json-section="destinations"]', window.CmsSchema.destinationRow);
    wireAddButton(container, ".cms-add-team", '[data-json-section="team"]', window.CmsSchema.teamRow);
    wireAddButton(container, ".cms-add-footer-column", '[data-json-section="navigation"]', window.CmsSchema.footerColumnRow);
    wireAddButton(container, ".cms-add-about-feature", '[data-json-section="about_features"]', window.CmsSchema.aboutFeatureRow);
    container.querySelectorAll(".scotland-media-type").forEach((select) => {
      if (select._wired) return;
      select._wired = true;
      const sync = () => {
        const row = select.closest(".scotland-tile-row");
        const videoField = row?.querySelector(".scotland-video-field");
        const imageLabel = row?.querySelector('label[for], .field label');
        if (videoField) videoField.hidden = select.value !== "video";
        const imageUploader = row?.querySelector('.image-uploader:not(.scotland-video-field .image-uploader)');
        const imageFieldLabel = imageUploader?.closest(".field-full, .field")?.querySelector("label")
          || row?.querySelector('.field-full label, .field label');
        if (imageFieldLabel) {
          imageFieldLabel.textContent = select.value === "video" ? "Poster / Thumbnail (optional)" : "Image";
        }
      };
      select.addEventListener("change", sync);
      sync();
    });

    wireAddButton(container, ".cms-add-scotland", '[data-json-section="scotland_attractions"]', window.CmsSchema.scotlandTileRow);
    wireAddButton(container, ".cms-add-premium", '[data-json-section="premium_services"]', window.CmsSchema.premiumServiceRow);
    wireAddButton(container, ".cms-add-mice", '[data-json-section="mice"]', window.CmsSchema.miceItemRow);
    wireAddButton(container, ".cms-add-mice-stat", '[data-json-section="mice_stats"]', () => window.CmsSchema.statRow({}, "mice-stats"));
    wireAddButton(container, ".cms-add-process", '[data-json-section="process"]', window.CmsSchema.processStepRow);
    wireAddButton(container, ".cms-add-testimonial", '[data-json-section="testimonials"]', window.CmsSchema.testimonialItemRow);
    wireAddButton(container, ".cms-add-success", '[data-json-section="success_stories"]', window.CmsSchema.successStoryRow);
    wireAddButton(container, ".cms-add-number", '[data-json-section="numbers"]', () => window.CmsSchema.statRow({}, "numbers-stats"));
    wireAddButton(container, ".cms-add-owned-card", '[data-json-section="owned_assets"]', window.CmsSchema.ownedPropertyCardRow);

    const addPostTag = container.querySelector(".cms-add-post-tag");
    if (addPostTag && !addPostTag._wired) {
      addPostTag._wired = true;
      addPostTag.addEventListener("click", () => {
        const name = prompt("Blog post title to feature:");
        if (!name) return;
        const area = container.querySelector('[data-list="post-tags"]');
        const btn = area?.querySelector(".cms-add-post-tag");
        if (btn) {
          btn.insertAdjacentHTML("beforebegin", `<span class="tag-pill">${name} <button class="remove cms-remove-tag" type="button">×</button></span>`);
          wire(area);
        }
      });
    }
  }

  return { wire, uploadImage, compressImage };
})();
