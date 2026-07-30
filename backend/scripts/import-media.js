/**
 * One-time import: copy user-provided images into /uploads and seed gallery + destinations CMS.
 * Run: npm run import-media (from backend/)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const UPLOADS = path.join(ROOT, 'uploads');
const ASSET_CANDIDATES = [
  path.join(process.env.USERPROFILE || process.env.HOME || '', '.cursor', 'projects', 'c-Users-Lenovo-Desktop-tour', 'assets'),
  path.join(ROOT, 'assets'),
];

function getAssetsDir() {
  for (const dir of ASSET_CANDIDATES) {
    if (!fs.existsSync(dir)) continue;
    const hasMedia = fs.readdirSync(dir).some((name) => /Photo_|Background|service-image|Container/i.test(name));
    if (hasMedia) return dir;
  }
  for (const dir of ASSET_CANDIDATES) {
    if (fs.existsSync(dir)) return dir;
  }
  throw new Error(`Assets folder not found. Checked: ${ASSET_CANDIDATES.join(', ')}`);
}

function findAsset(token) {
  const ASSETS = getAssetsDir();
  const match = fs.readdirSync(ASSETS).find((name) => name.includes(token));
  if (!match) throw new Error(`Asset not found for token: ${token}`);
  return path.join(ASSETS, match);
}

function copyTo(destDir, token, filename) {
  const src = findAsset(token);
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, filename);
  fs.copyFileSync(src, dest);
  return `/uploads/${path.basename(destDir)}/${filename}`;
}

const GALLERY = [
  { token: 'images_Photo_6-', file: 'gallery-01-winner-certificate.png', title: 'British Curry Championship Winner', alt: 'Best of Scotland — British Curry Championship 2024 winner certificate' },
  { token: 'images_Photo_8-', file: 'gallery-02-team-vehicle.png', title: 'On the Road', alt: 'Caledor team travelling between destinations' },
  { token: 'images_Photo_7-', file: 'gallery-03-scotland-event.png', title: 'Scotland Community Event', alt: 'Community welcome event in Scotland' },
  { token: 'images_Photo_2-', file: 'gallery-04-award-presentation.png', title: 'Award Presentation', alt: 'Award presentation with partners' },
  { token: 'images_Photo_5-', file: 'gallery-05-team-portrait.png', title: 'Team Portrait', alt: 'Caledor team portrait' },
  { token: 'images_Photo_4-', file: 'gallery-06-partners.png', title: 'Partners & Team', alt: 'Partners and team at an event' },
  { token: 'images_Photo_3-', file: 'gallery-07-certificates.png', title: 'Certifications', alt: 'Industry certifications and awards' },
  { token: 'images_Photo_9-', file: 'gallery-08-group-walk.png', title: 'Group Experience', alt: 'Travel group on a curated experience' },
  { token: 'images_Photo_10-', file: 'gallery-09-outdoor-guest.png', title: 'Celebrity Guest Experience', alt: 'Outdoor experience with celebrity guest' },
];

const DESTINATIONS = [
  { token: 'images_Background__1_-', file: 'england.png', name: 'England', places: 'London, Oxford, Cotswolds' },
  { token: 'images_Background-ecd5', file: 'scotland.png', name: 'Scotland', places: 'Edinburgh, Glasgow, Isle of Skye' },
  { token: 'images_Background__3_-', file: 'france.png', name: 'France', places: 'Paris, Nice, Bordeaux' },
  { token: 'images_Background__7_-', file: 'italy.png', name: 'Italy', places: 'Rome, Venice, Milan' },
  { token: 'images_Background__4_-', file: 'switzerland.png', name: 'Switzerland', places: 'Zurich, Geneva, Lucerne' },
  { token: 'images_Background__5_-', file: 'spain.png', name: 'Spain', places: 'Barcelona, Madrid, Seville' },
  { token: 'images_Background__2_-', file: 'germany.png', name: 'Germany', places: 'Berlin, Munich, Hamburg' },
  { token: 'images_Background__11_-', file: 'belgium.png', name: 'Belgium', places: 'Brussels, Bruges, Antwerp' },
  { token: 'images_Background__6_-', file: 'austria.png', name: 'Austria', places: 'Vienna, Salzburg, Innsbruck' },
  { token: 'images_Background__10_-', file: 'netherlands.png', name: 'Netherlands', places: 'Amsterdam, Hague, Rotterdam' },
  { token: 'images_Background__8_-', file: 'portugal.png', name: 'Portugal', places: 'Lisbon, Porto, Algarve' },
  { token: 'images_Background__9_-', file: 'ireland.png', name: 'Ireland', places: 'Dublin, Galway, Killarney' },
];

function seedGallery(db, galleryDir) {
  db.prepare('DELETE FROM gallery_items').run();
  const insert = db.prepare(
    'INSERT INTO gallery_items (title, alt_text, image_url, album, sort_order, active) VALUES (?, ?, ?, ?, ?, 1)'
  );
  GALLERY.forEach((item, index) => {
    const url = copyTo(galleryDir, item.token, item.file);
    insert.run(item.title, item.alt, url, 'Events', index + 1);
  });
  console.log(`✓ Gallery: ${GALLERY.length} images imported`);
}

function seedDestinationsCms(db, destDir) {
  const items = DESTINATIONS.map((dest, index) => {
    const image = copyTo(destDir, dest.token, dest.file);
    return {
      name: dest.name,
      places: dest.places,
      image,
      slug: dest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sort_order: String(index + 1),
      visible: true,
    };
  });

  const upsert = db.prepare(`
    INSERT INTO cms_content (tab, section, key, value, type, enabled, updated_at)
    VALUES (?, ?, ?, ?, 'text', 1, datetime('now'))
    ON CONFLICT(tab, section, key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `);

  const sectionFields = {
    enabled: '1',
    kicker: 'Explore Our Destinations',
    title: 'Europe made easy for every traveler.',
    items_json: JSON.stringify(items),
  };

  for (const [key, value] of Object.entries(sectionFields)) {
    upsert.run('home', 'destinations', key, String(value));
  }

  console.log(`✓ Destinations: ${items.length} regions imported into CMS`);
}

const PREMIUM_SERVICES = [
  { token: 'service-image_3x-077cad05', file: 'premium-01-hotel.png' },
  { token: 'Container__2_-d2731ac5', file: 'premium-02-holiday.png' },
  { token: 'service-image__6_-7ae40047', file: 'premium-03-sightseeing.png' },
  { token: 'service-image_3x__1_-0b018dbe', file: 'premium-04-vehicle.png' },
  { token: 'service-image__5_-37f83487', file: 'premium-05-airport.png' },
  { token: 'service-image__4_-53e117c0', file: 'premium-06-restaurant.png' },
];

function seedPremiumServices(destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  PREMIUM_SERVICES.forEach((item) => {
    copyTo(destDir, item.token, item.file);
  });
  console.log(`✓ Premium services: ${PREMIUM_SERVICES.length} images imported`);
}

function main() {
  const db = getDb();
  const galleryDir = path.join(UPLOADS, 'gallery');
  const destDir = path.join(UPLOADS, 'destinations');
  const premiumDir = path.join(UPLOADS, 'premium-services');

  seedGallery(db, galleryDir);
  seedDestinationsCms(db, destDir);
  seedPremiumServices(premiumDir);

  console.log('\nDone! Refresh the website and admin panel to see changes.');
}

main();
