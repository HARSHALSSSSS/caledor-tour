import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { flattenCmsDefaults } from './cms-defaults.js';
import { syncCanonicalTeamSection, syncCanonicalHeroSection, syncCanonicalGallerySection, syncCanonicalBlogPosts, syncAdminDisplayName } from './cms-repair.js';
import { DB_PATH, ensureDataDirs } from './paths.js';

let db;

export function getDb() {
  if (db) return db;

  ensureDataDirs();

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  initSchema();
  seedDefaults();
  seedDefaultCms();
  syncCanonicalHeroSection(db);
  syncCanonicalTeamSection(db);
  syncCanonicalGallerySection(db);
  syncCanonicalBlogPosts(db);
  syncAdminDisplayName(db);
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT 'Admin',
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'editor',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cms_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tab TEXT NOT NULL,
      section TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      type TEXT NOT NULL DEFAULT 'text',
      enabled INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(tab, section, key)
    );

    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL DEFAULT 'Adventure',
      duration TEXT,
      price_from REAL,
      currency TEXT NOT NULL DEFAULT 'USD',
      description TEXT,
      highlights TEXT,
      inclusions TEXT,
      itinerary TEXT,
      image_url TEXT,
      rating REAL DEFAULT 0,
      difficulty TEXT DEFAULT 'Moderate',
      featured INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS package_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      package_count INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT,
      package_name TEXT NOT NULL,
      travel_date TEXT,
      guests INTEGER DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      amount REAL,
      currency TEXT NOT NULL DEFAULT 'USD',
      notes TEXT,
      source TEXT DEFAULT 'website',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      source TEXT DEFAULT 'website',
      status TEXT NOT NULL DEFAULT 'unread',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gallery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      alt_text TEXT,
      image_url TEXT NOT NULL,
      album TEXT DEFAULT 'General',
      sort_order INTEGER DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT,
      author TEXT DEFAULT 'Caledor Team',
      category TEXT DEFAULT 'Uncategorized',
      tags TEXT,
      image_url TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 0,
      published_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      group_name TEXT DEFAULT 'general',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT 'info',
      title TEXT NOT NULL,
      message TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      sort_order INTEGER DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  migratePackageColumns();
  migrateGalleryColumns();
}

function migrateGalleryColumns() {
  const cols = db.prepare('PRAGMA table_info(gallery_items)').all().map((c) => c.name);
  const addCol = (name, type) => {
    if (!cols.includes(name)) db.exec(`ALTER TABLE gallery_items ADD COLUMN ${name} ${type}`);
  };
  addCol('media_type', "TEXT DEFAULT 'image'");
  addCol('video_url', 'TEXT');
  addCol('poster_url', 'TEXT');
}

function migratePackageColumns() {
  const cols = db.prepare('PRAGMA table_info(packages)').all().map((c) => c.name);
  const addCol = (name, type) => {
    if (!cols.includes(name)) db.exec(`ALTER TABLE packages ADD COLUMN ${name} ${type}`);
  };
  addCol('tagline', 'TEXT');
  addCol('badge', 'TEXT');
  addCol('group_size', 'TEXT');
  addCol('season', 'TEXT');
  addCol('exclusions', 'TEXT');
  addCol('gallery_json', 'TEXT');
  addCol('related_slugs_json', 'TEXT');
  addCol('about_label', 'TEXT');
  addCol('itinerary_heading', 'TEXT');
  addCol('gallery_heading', 'TEXT');
  seedPackageDetailDemo();
}

function seedPackageDetailDemo() {
  // Never auto-insert demo packages on Render/production — they overwrite the live admin list.
  if (process.env.NODE_ENV === 'production' || process.env.SKIP_DEMO_SEED === '1') return;

  const demo = db.prepare('SELECT id FROM packages WHERE slug = ?').get('scottish-highlands-journey');
  if (demo) return;

  const existing = db.prepare('SELECT id FROM packages WHERE slug = ?').get('scottish-highlands-luxury-tour');
  const itinerary = JSON.stringify([
    { day: 1, title: 'Arrival in Edinburgh', description: 'Private transfer to your luxury hotel. Evening welcome dinner with local whisky tasting and briefing on your highland adventure.' },
    { day: 2, title: 'Edinburgh to Loch Lomond', description: 'Scenic drive through Trossachs National Park. Private boat cruise on Loch Lomond with champagne service.' },
    { day: 3, title: 'Glencoe & Fort William', description: 'Explore the dramatic Glencoe valley. Visit a historic distillery and enjoy a private guided hike with expert local guides.' },
    { day: 4, title: 'Isle of Skye', description: 'Cross the Skye Bridge to explore fairy pools, Old Man of Storr, and a private castle estate tour.' },
    { day: 5, title: 'Highland Wilderness', description: 'Off-road 4x4 adventure through remote highland tracks. Picnic lunch at a secluded lochside spot.' },
    { day: 6, title: 'Inverness & Culloden', description: 'Visit Culloden Battlefield with a historian guide. Afternoon at leisure in Inverness with optional spa treatment.' },
    { day: 7, title: 'Departure', description: 'Private transfer to airport or extend your stay. Farewell gift hamper of Scottish delicacies.' },
  ]);
  const highlights = JSON.stringify([
    'Private castle and estate access',
    'Expert local guides throughout',
    'Luxury 4x4 transport',
    'Whisky distillery private tasting',
    'Hand-picked boutique accommodations',
  ]);
  const inclusions = JSON.stringify([
    'All private transfers and transport',
    '6 nights luxury accommodation',
    'Daily breakfast and select dinners',
    'All guided tours and entrance fees',
    '24/7 concierge support',
  ]);
  const exclusions = JSON.stringify([
    'International flights',
    'Travel insurance',
    'Personal expenses and gratuities',
    'Optional spa treatments',
  ]);
  const gallery = JSON.stringify([
    { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85', alt: 'Scottish highlands loch' },
    { url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85', alt: 'Highland mountains' },
    { url: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1200&q=85', alt: 'Alpine lake Scotland' },
  ]);
  const related = JSON.stringify(['london-royal-escape', 'swiss-alps-private-retreat', 'french-riviera-villa-escape']);

  const payload = {
    name: 'Scottish Highlands Journey',
    slug: 'scottish-highlands-journey',
    category: 'Luxury Escapes',
    duration: '7 Days',
    price_from: 4850,
    description: 'Embark on an unforgettable journey through the misty landscapes of the Scottish Highlands. From ancient castles perched on lochs to rugged coastlines and whisky distilleries, this curated experience reveals the soul of Scotland in refined comfort.',
    tagline: 'A curated path through misty lochs, ancient castles, and rugged highland beauty.',
    badge: 'MULTI-DAY',
    group_size: '2–8 Guests',
    season: 'Year-Round',
    difficulty: 'Moderate',
    about_label: 'The Expedition',
    itinerary_heading: 'A Curated Day-by-Day Path',
    gallery_heading: 'Capturing the Highland Soul',
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85',
    featured: 1,
  };

  if (existing) {
    db.prepare(`UPDATE packages SET name=?, slug=?, category=?, duration=?, price_from=?, description=?, tagline=?, badge=?, group_size=?, season=?, difficulty=?, about_label=?, itinerary_heading=?, gallery_heading=?, image_url=?, highlights=?, inclusions=?, exclusions=?, itinerary=?, gallery_json=?, related_slugs_json=?, featured=?, updated_at=datetime('now') WHERE id=?`)
      .run(payload.name, payload.slug, payload.category, payload.duration, payload.price_from, payload.description, payload.tagline, payload.badge, payload.group_size, payload.season, payload.difficulty, payload.about_label, payload.itinerary_heading, payload.gallery_heading, payload.image_url, highlights, inclusions, exclusions, itinerary, gallery, related, payload.featured, existing.id);
  } else {
    db.prepare(`INSERT INTO packages (name, slug, category, duration, price_from, description, tagline, badge, group_size, season, difficulty, about_label, itinerary_heading, gallery_heading, image_url, highlights, inclusions, exclusions, itinerary, gallery_json, related_slugs_json, featured, active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`)
      .run(payload.name, payload.slug, payload.category, payload.duration, payload.price_from, payload.description, payload.tagline, payload.badge, payload.group_size, payload.season, payload.difficulty, payload.about_label, payload.itinerary_heading, payload.gallery_heading, payload.image_url, highlights, inclusions, exclusions, itinerary, gallery, related, payload.featured);
  }
}

function seedDefaults() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'Admin', 'admin@caledor.com', hash, 'super_admin'
    );
  }

  const catCount = db.prepare('SELECT COUNT(*) as count FROM package_categories').get();
  if (catCount.count === 0) {
    const stmt = db.prepare('INSERT INTO package_categories (name, slug, package_count, sort_order) VALUES (?, ?, ?, ?)');
    for (const cat of [
      ['Adventure & Trekking', 'adventure-trekking', 18, 1],
      ['Beach & Island', 'beach-island', 12, 2],
      ['Cultural Heritage', 'cultural-heritage', 9, 3],
      ['Luxury Escapes', 'luxury-escapes', 7, 4],
      ['Family Holidays', 'family-holidays', 14, 5],
    ]) stmt.run(...cat);
  }

  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get();
  if (settingsCount.count === 0) {
    const stmt = db.prepare('INSERT INTO settings (key, value, group_name) VALUES (?, ?, ?)');
    for (const [k, v, g] of [
      ['site_name', 'Caledor DMC', 'general'],
      ['site_tagline', 'Your Trusted DMC Partner for UK & Europe', 'general'],
      ['site_description', 'Premium destination management for the UK and Europe.', 'general'],
      ['contact_email', 'info@caledor.com', 'contact'],
      ['contact_phone', '+44 20 0000 0000', 'contact'],
      ['address', '12 Waterfront Lane, London, United Kingdom', 'contact'],
      ['facebook_url', 'https://facebook.com/caledor', 'social'],
      ['instagram_url', 'https://instagram.com/caledor', 'social'],
      ['twitter_url', 'https://twitter.com/caledor', 'social'],
      ['linkedin_url', 'https://linkedin.com/company/caledor', 'social'],
      ['youtube_url', 'https://youtube.com/caledor', 'social'],
      ['copyright', '© 2026 Caledor DMC. All rights reserved.', 'general'],
      ['meta_title', 'Caledor DMC | UK & Europe', 'seo'],
      ['meta_description', 'Premium destination management for the UK and Europe.', 'seo'],
      ['focus_keywords', 'DMC, UK travel, Europe tours, corporate travel', 'seo'],
    ]) stmt.run(k, v, g);
  }
}

function seedDefaultCms() {
  const insert = db.prepare(
    `INSERT INTO cms_content (tab, section, key, value) VALUES (?, ?, ?, ?)
     ON CONFLICT(tab, section, key) DO NOTHING`
  );

  const rows = flattenCmsDefaults();

  const transaction = db.transaction(() => {
    for (const row of rows) insert.run(...row);
  });
  transaction();
}