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
