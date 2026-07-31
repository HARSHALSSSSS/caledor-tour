/** CMS admin UI interactions — dynamic lists, image preview, toggles, uploads */
window.CmsUI = (() => {
  async function uploadImage(file) {
    const token = localStorage.getItem("caledor_token");
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(window.CALEDOR_CONFIG?.uploadUrl?.() ?? "/api/upload", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await res.json();
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
      sw.addEventListener("click", () => sw.classList.toggle("on"));
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
        const input = findImageInput(fileInput.dataset.target);
        try {
          const url = await uploadImage(file);
          if (input) {
            input.value = url;
            input.dispatchEvent(new Event("input"));
          }
        } catch (err) {
          alert(err.message || "Upload failed");
        } finally {
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
    wireAddButton(container, ".cms-add-scotland", '[data-json-section="scotland_attractions"]', window.CmsSchema.scotlandTileRow);
    wireAddButton(container, ".cms-add-premium", '[data-json-section="premium_services"]', window.CmsSchema.premiumServiceRow);
    wireAddButton(container, ".cms-add-mice", '[data-json-section="mice"]', window.CmsSchema.miceItemRow);
    wireAddButton(container, ".cms-add-mice-stat", '[data-json-section="mice_stats"]', () => window.CmsSchema.statRow({}, "mice-stats"));
    wireAddButton(container, ".cms-add-process", '[data-json-section="process"]', window.CmsSchema.processStepRow);
    wireAddButton(container, ".cms-add-testimonial", '[data-json-section="testimonials"]', window.CmsSchema.testimonialItemRow);
    wireAddButton(container, ".cms-add-success", '[data-json-section="success_stories"]', window.CmsSchema.successStoryRow);
    wireAddButton(container, ".cms-add-number", '[data-json-section="numbers"]', () => window.CmsSchema.statRow({}, "numbers-stats"));
    wireAddButton(container, ".cms-add-badge", '[data-json-section="owned_assets"]', window.CmsSchema.badgeRow);

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

  return { wire, uploadImage };
})();
