/** Shared public-site URL helpers for the admin panel */
window.AdminNav = (() => {
  function siteRoot() {
    const path = window.location.pathname.replace(/\\/g, "/");
    const lower = path.toLowerCase();
    const adminIdx = lower.lastIndexOf("/admin");
    if (adminIdx >= 0) return path.slice(0, adminIdx) || "";
    return path.replace(/\/index\.html$/i, "").replace(/\/$/, "") || "";
  }

  function join(base, segment) {
    const root = base.replace(/\/+$/, "");
    const part = String(segment || "").replace(/^\/+/, "");
    if (!root) return `/${part}`;
    return `${root}/${part}`;
  }

  function siteUrl(hash = "") {
    const root = siteRoot().replace(/\/+$/, "");
    const prefix = `${window.location.origin}${root}`;
    const home = prefix.endsWith("/") ? prefix : `${prefix}/`;
    if (!hash) return home;
    return `${home}#${String(hash).replace(/^#/, "")}`;
  }

  function packageUrl(slug) {
    const value = String(slug || "").trim();
    if (!value) return "";
    const root = siteRoot();
    return `${window.location.origin}${join(root, `package/${encodeURIComponent(value)}`)}`;
  }

  function resolvePackageSlug() {
    const formSlug = document.querySelector('#packageForm [name="slug"]')?.value?.trim();
    if (formSlug) return formSlug;

    const select = document.getElementById("packageSelect");
    if (select?.selectedOptions?.[0]?.dataset?.slug) {
      return select.selectedOptions[0].dataset.slug.trim();
    }

    const cmsSelect = document.getElementById("cmsPackagePreviewSelect");
    if (cmsSelect?.value) return cmsSelect.value.trim();

    return "";
  }

  function syncPackagePreviewLink(linkId = "previewPackageLink", slug = "") {
    const link = document.getElementById(linkId);
    if (!link) return;
    const resolved = slug || resolvePackageSlug();
    if (resolved) {
      link.href = packageUrl(resolved);
      link.removeAttribute("aria-disabled");
    } else {
      link.href = "#";
      link.setAttribute("aria-disabled", "true");
    }
  }

  function openPackagePreview(slug) {
    const resolved = String(slug || resolvePackageSlug()).trim();
    if (!resolved) {
      throw new Error("Select a package or enter a URL slug first");
    }
    window.open(packageUrl(resolved), "_blank", "noopener");
  }

  return { siteRoot, siteUrl, packageUrl, resolvePackageSlug, syncPackagePreviewLink, openPackagePreview };
})();
