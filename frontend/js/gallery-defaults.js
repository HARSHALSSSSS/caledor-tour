/** Homepage Photo Gallery — core images always kept; admin uploads merge on top. */
(function () {
  const GALLERY_DEFAULTS = [
    { title: "British Curry Championship Winner", alt_text: "British Curry Championship Winner", image_url: "/uploads/gallery/gallery-01-winner-certificate.png", sort_order: 1, album: "Events", media_type: "image" },
    { title: "On the Road", alt_text: "On the Road", image_url: "/uploads/gallery/gallery-02-team-vehicle.png", sort_order: 2, album: "Events", media_type: "image" },
    { title: "Scotland Community Event", alt_text: "Scotland Community Event", image_url: "/uploads/gallery/gallery-03-scotland-event.png", sort_order: 3, album: "Events", media_type: "image" },
    { title: "Award Presentation", alt_text: "Award Presentation", image_url: "/uploads/gallery/gallery-04-award-presentation.png", sort_order: 4, album: "Events", media_type: "image" },
    { title: "Team Portrait", alt_text: "Team Portrait", image_url: "/uploads/gallery/gallery-05-team-portrait.png", sort_order: 5, album: "Events", media_type: "image" },
    { title: "Partners and Team", alt_text: "Partners and Team", image_url: "/uploads/gallery/gallery-06-partners.png", sort_order: 6, album: "Events", media_type: "image" },
    { title: "Certifications", alt_text: "Certifications", image_url: "/uploads/gallery/gallery-07-certificates.png", sort_order: 7, album: "Events", media_type: "image" },
    { title: "Group Experience", alt_text: "Group Experience", image_url: "/uploads/gallery/gallery-08-group-walk.png", sort_order: 8, album: "Events", media_type: "image" },
    { title: "Celebrity Guest Experience", alt_text: "Celebrity Guest Experience", image_url: "/uploads/gallery/gallery-09-outdoor-guest.png", sort_order: 9, album: "Events", media_type: "image" },
  ];

  function normalizeGalleryUrl(url = "") {
    const value = String(url || "").trim().split("?")[0].split("#")[0];
    if (!value) return "";
    return value.startsWith("/") ? value.toLowerCase() : `/${value}`.toLowerCase();
  }

  function galleryItemKey(item = {}) {
    return normalizeGalleryUrl(item.image_url || item.video_url || "");
  }

  function mergeGalleryItems(apiItems = []) {
    const merged = new Map();
    GALLERY_DEFAULTS.forEach((item) => {
      const key = galleryItemKey(item);
      if (key) merged.set(key, { ...item });
    });

    (Array.isArray(apiItems) ? apiItems : []).forEach((item) => {
      const key = galleryItemKey(item);
      if (!key) return;
      const base = merged.get(key) || {};
      merged.set(key, {
        ...base,
        ...item,
        title: item.title || base.title || "",
        alt_text: item.alt_text || base.alt_text || item.title || base.title || "",
        image_url: item.image_url || base.image_url || item.video_url || "",
        sort_order: item.sort_order ?? base.sort_order ?? 99,
        album: item.album || base.album || "Events",
        media_type: item.media_type || base.media_type || "image",
      });
    });

    return [...merged.values()].sort((a, b) => {
      const order = Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);
      if (order !== 0) return order;
      return String(a.title || "").localeCompare(String(b.title || ""));
    });
  }

  function isCoreGalleryItem(item = {}) {
    const key = galleryItemKey(item);
    return GALLERY_DEFAULTS.some((d) => galleryItemKey(d) === key);
  }

  window.CaledorGallery = {
    GALLERY_DEFAULTS,
    mergeGalleryItems,
    isCoreGalleryItem,
    normalizeGalleryUrl,
  };
})();
