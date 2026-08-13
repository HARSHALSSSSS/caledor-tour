/** No hardcoded packages. The website only shows packages saved in admin. */
window.CALEDOR_PACKAGE_DEFAULTS = {
  getAll() { return []; },
  getFeatured() { return []; },
  getBySlug() { return null; },
  getRelated() { return []; },
};
