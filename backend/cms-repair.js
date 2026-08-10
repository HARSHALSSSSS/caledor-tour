import { CMS_DEFAULTS } from './cms-defaults.js';

function upsertCmsSection(db, tab, sectionKey, fields) {
  const upsert = db.prepare(
    `INSERT INTO cms_content (tab, section, key, value, type, enabled, updated_at)
     VALUES (?, ?, ?, ?, 'text', 1, datetime('now'))
     ON CONFLICT(tab, section, key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  );
  const transaction = db.transaction(() => {
    for (const [key, value] of Object.entries(fields)) {
      upsert.run(tab, sectionKey, key, String(value));
    }
  });
  transaction();
}

function teamNeedsRepair(db) {
  const row = db.prepare(
    `SELECT value FROM cms_content WHERE tab = 'about-us' AND section = 'team' AND key = 'members_json'`
  ).get();
  const value = row?.value || '';
  return !value.includes('Alok Singh') || !value.includes('Neha Sawant');
}

function upsertTeamDefaults(db, team) {
  upsertCmsSection(db, 'about-us', 'team', team);
}

/** Repair hero CMS when title/trust/stats do not match canonical homepage copy. */
export function syncCanonicalHeroSection(db) {
  const hero = CMS_DEFAULTS.home?.hero;
  const trust = CMS_DEFAULTS.home?.trust;
  const stats = CMS_DEFAULTS.home?.stats;
  if (!hero) return false;

  const row = db.prepare(
    `SELECT value FROM cms_content WHERE tab = 'home' AND section = 'hero' AND key = 'title'`
  ).get();
  const title = row?.value || '';
  const needsRepair = !title.includes('Your Trusted DMC Partner');
  if (!needsRepair) return false;

  upsertCmsSection(db, 'home', 'hero', hero);
  if (trust) upsertCmsSection(db, 'home', 'trust', trust);
  if (stats) upsertCmsSection(db, 'home', 'stats', stats);
  return true;
}

/** Repair leadership CMS only when stored data is not Alok + Neha. */
export function syncCanonicalTeamSection(db) {
  const team = CMS_DEFAULTS['about-us']?.team;
  if (!team || !teamNeedsRepair(db)) return false;
  upsertTeamDefaults(db, team);
  return true;
}

/** Always overwrite team CMS with canonical leadership (bootstrap). */
export function forceSyncCanonicalTeamSection(db) {
  const team = CMS_DEFAULTS['about-us']?.team;
  if (!team) return false;
  upsertTeamDefaults(db, team);
  return true;
}

/** Always overwrite hero, trust, and stats CMS (bootstrap). */
export function forceSyncCanonicalHeroSection(db) {
  const hero = CMS_DEFAULTS.home?.hero;
  const trust = CMS_DEFAULTS.home?.trust;
  const stats = CMS_DEFAULTS.home?.stats;
  if (!hero) return false;
  upsertCmsSection(db, 'home', 'hero', hero);
  if (trust) upsertCmsSection(db, 'home', 'trust', trust);
  if (stats) upsertCmsSection(db, 'home', 'stats', stats);
  return true;
}

/** Homepage Travel Insights cards — same posts/images shown on the website blog section. */
export const WEB_BLOG_DEFAULTS = [
  {
    title: "Scotland's Wild Highlands Beckon Travelers",
    slug: "scotlands-wild-highlands-beckon-travelers",
    excerpt: "From ancient castles to rugged coastlines, exploring the untamed beauty of the Scottish Highlands.",
    content: "The Scottish Highlands offer a journey through time, where ancient castles stand guard over misty lochs and rugged coastlines stretch to the horizon.",
    category: "Destinations",
    featured: 1,
    published: 1,
    image_url: "/assets/scotland/isle-of-skye.png",
  },
  {
    title: "The New Wave of Luxury in London",
    slug: "new-wave-luxury-london",
    excerpt: "Discover the latest openings and hidden gems shaping the city's travel scene.",
    content: "London continues to reinvent itself as a global luxury destination, from exclusive hotels to refined dining in Mayfair.",
    category: "UK Travel",
    featured: 1,
    published: 1,
    image_url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Why the French Riviera Remains a Benchmark",
    slug: "french-riviera-remains-benchmark",
    excerpt: "From yachts to private villas, a guide to the Côte d'Azur's enduring appeal.",
    content: "The French Riviera continues to set the standard for Mediterranean luxury with glamorous resorts and a stunning coastline.",
    category: "Europe Trends",
    featured: 1,
    published: 1,
    image_url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Inside Italy's Hidden Heritage Sites",
    slug: "inside-italys-hidden-heritage-sites",
    excerpt: "Expert-led tours that unlock the authentic soul of Italy's iconic cities.",
    content: "Beyond the well-trodden paths of Rome and Venice lies a treasure trove of hidden heritage sites.",
    category: "Destination Highlights",
    featured: 0,
    published: 1,
    image_url: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Essential Travel Tips for Europe 2026",
    slug: "essential-travel-tips-europe-2026",
    excerpt: "Everything you need to know before planning your European adventure.",
    content: "Planning a trip to Europe requires careful consideration of visas, transportation, and cultural nuances.",
    category: "Travel Tips",
    featured: 0,
    published: 1,
    image_url: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=85",
  },
];

/** Fill missing blog images so admin CMS Blog matches the homepage Travel Insights cards. */
export function syncCanonicalBlogPosts(db) {
  const existing = db.prepare('SELECT id, slug, image_url FROM blog_posts').all();
  const bySlug = new Map(existing.map((row) => [row.slug, row]));
  const insert = db.prepare(
    `INSERT INTO blog_posts (title, slug, excerpt, content, category, featured, published, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const updateImage = db.prepare(
    `UPDATE blog_posts SET image_url = ?, updated_at = datetime('now') WHERE id = ?`
  );

  let changed = false;
  const run = db.transaction(() => {
    for (const post of WEB_BLOG_DEFAULTS) {
      const row = bySlug.get(post.slug);
      if (!row) {
        insert.run(
          post.title,
          post.slug,
          post.excerpt,
          post.content,
          post.category,
          post.featured,
          post.published,
          post.image_url
        );
        changed = true;
        continue;
      }
      if (!String(row.image_url || "").trim()) {
        updateImage.run(post.image_url, row.id);
        changed = true;
      }
    }
  });
  run();
  return changed;
}

/** Homepage Photo Gallery images — must match frontend/index.html static gallery. */
export const WEB_GALLERY_DEFAULTS = [
  { title: 'British Curry Championship Winner', alt_text: 'British Curry Championship Winner', image_url: '/uploads/gallery/gallery-01-winner-certificate.png', album: 'Events', sort_order: 1 },
  { title: 'On the Road', alt_text: 'On the Road', image_url: '/uploads/gallery/gallery-02-team-vehicle.png', album: 'Events', sort_order: 2 },
  { title: 'Scotland Community Event', alt_text: 'Scotland Community Event', image_url: '/uploads/gallery/gallery-03-scotland-event.png', album: 'Events', sort_order: 3 },
  { title: 'Award Presentation', alt_text: 'Award Presentation', image_url: '/uploads/gallery/gallery-04-award-presentation.png', album: 'Events', sort_order: 4 },
  { title: 'Team Portrait', alt_text: 'Team Portrait', image_url: '/uploads/gallery/gallery-05-team-portrait.png', album: 'Events', sort_order: 5 },
  { title: 'Partners and Team', alt_text: 'Partners and Team', image_url: '/uploads/gallery/gallery-06-partners.png', album: 'Events', sort_order: 6 },
  { title: 'Certifications', alt_text: 'Certifications', image_url: '/uploads/gallery/gallery-07-certificates.png', album: 'Events', sort_order: 7 },
  { title: 'Group Experience', alt_text: 'Group Experience', image_url: '/uploads/gallery/gallery-08-group-walk.png', album: 'Events', sort_order: 8 },
  { title: 'Celebrity Guest Experience', alt_text: 'Celebrity Guest Experience', image_url: '/uploads/gallery/gallery-09-outdoor-guest.png', album: 'Events', sort_order: 9 },
];

/** Sync admin gallery with the live website gallery images (no web HTML changes). */
export function syncCanonicalGallerySection(db) {
  const existing = db.prepare('SELECT id, image_url FROM gallery_items').all();
  const hasWeb = existing.some((row) => String(row.image_url || '').includes('/uploads/gallery/gallery-01'));
  const hasUnsplash = existing.some((row) => String(row.image_url || '').includes('unsplash.com'));

  if (hasWeb && !hasUnsplash) return false;

  const wipe = db.transaction(() => {
    if (hasUnsplash || !hasWeb) {
      db.prepare(
        `DELETE FROM gallery_items WHERE image_url LIKE '%unsplash.com%' OR image_url NOT LIKE '/uploads/gallery/%'`
      ).run();
    }
    const find = db.prepare('SELECT id FROM gallery_items WHERE image_url = ?');
    const insert = db.prepare(
      `INSERT INTO gallery_items (title, alt_text, image_url, album, sort_order, active)
       VALUES (?, ?, ?, ?, ?, 1)`
    );
    for (const item of WEB_GALLERY_DEFAULTS) {
      if (!find.get(item.image_url)) {
        insert.run(item.title, item.alt_text, item.image_url, item.album, item.sort_order);
      }
    }
  });
  wipe();
  return true;
}

/** Rename default Alex Graham account label to generic Admin. */
export function syncAdminDisplayName(db) {
  const result = db.prepare(
    `UPDATE users SET name = 'Admin' WHERE email = 'admin@caledor.com' AND (name = 'Alex Graham' OR name LIKE 'Alex%')`
  ).run();
  return result.changes > 0;
}
