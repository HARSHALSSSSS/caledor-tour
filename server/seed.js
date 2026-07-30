import { getDb } from './db.js';

const db = getDb();

// Sample packages
const packages = [
  { name: 'Scottish Highlands Luxury Tour', slug: 'scottish-highlands-luxury-tour', category: 'Luxury Escapes', duration: '6 Days / 5 Nights', price_from: 3450, description: 'An exquisite journey through the rugged beauty of the Scottish Highlands, featuring private castle tours, whisky tastings, and luxury accommodations.', difficulty: 'Easy', featured: 1 },
  { name: 'Swiss Alps Private Retreat', slug: 'swiss-alps-private-retreat', category: 'Luxury Escapes', duration: '7 Days / 6 Nights', price_from: 5200, description: 'Experience the majesty of the Swiss Alps with private chalet accommodations, helicopter transfers, and exclusive mountain experiences.', difficulty: 'Moderate', featured: 1 },
  { name: 'London Royal Escape', slug: 'london-royal-escape', category: 'Cultural Heritage', duration: '4 Days / 3 Nights', price_from: 1890, description: 'Private access to palaces, bespoke shopping experiences, and Michelin-starred dining in the heart of London.', difficulty: 'Easy', featured: 1 },
  { name: 'Italian Heritage Grand Tour', slug: 'italian-heritage-grand-tour', category: 'Cultural Heritage', duration: '10 Days / 9 Nights', price_from: 4100, description: 'A comprehensive tour through Italy\'s most iconic cities — Rome, Florence, Venice — with expert guides and exclusive access.', difficulty: 'Moderate', featured: 0 },
  { name: 'French Riviera Villa Escape', slug: 'french-riviera-villa-escape', category: 'Luxury Escapes', duration: '5 Days / 4 Nights', price_from: 6750, description: 'Yachts, private villas, and refined living on the Côte d\'Azur. The ultimate Mediterranean luxury experience.', difficulty: 'Easy', featured: 1 },
  { name: 'Dublin & Irish Countryside', slug: 'dublin-irish-countryside', category: 'Adventure & Trekking', duration: '5 Days / 4 Nights', price_from: 2200, description: 'Explore Dublin\'s vibrant culture and the breathtaking Irish countryside with private guides and luxury transport.', difficulty: 'Easy', featured: 0 },
  { name: 'Amsterdam & Belgian Discovery', slug: 'amsterdam-belgian-discovery', category: 'Cultural Heritage', duration: '5 Days / 4 Nights', price_from: 1950, description: 'Discover the artistic heritage and canal-side beauty of Amsterdam paired with Bruges and Brussels\' medieval charm.', difficulty: 'Easy', featured: 0 },
  { name: 'Nordic Adventure Circuit', slug: 'nordic-adventure-circuit', category: 'Adventure & Trekking', duration: '8 Days / 7 Nights', price_from: 4800, description: 'An epic journey through Norway, Sweden, and Denmark featuring fjords, northern lights, and luxury wilderness lodges.', difficulty: 'Challenging', featured: 0 },
];

const pkgStmt = db.prepare(
  'INSERT OR IGNORE INTO packages (name, slug, category, duration, price_from, description, difficulty, featured, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

for (const pkg of packages) {
  pkgStmt.run(pkg.name, pkg.slug, pkg.category, pkg.duration, pkg.price_from, pkg.description, pkg.difficulty, pkg.featured, null);
}

// Sample blog posts
const posts = [
  { title: 'Scotland\'s Wild Highlands Beckon Travelers', slug: 'scotlands-wild-highlands-beckon-travelers', excerpt: 'From ancient castles to rugged coastlines, exploring the untamed beauty of the Scottish Highlands.', content: 'The Scottish Highlands offer a journey through time, where ancient castles stand guard over misty lochs and rugged coastlines stretch to the horizon. Our expert guides lead you through this breathtaking landscape, sharing stories of clan battles and legendary creatures. Whether you\'re exploring the shores of Loch Ness or hiking through Glen Coe, the Highlands promise an unforgettable experience.', category: 'Destinations', featured: 1, published: 1 },
  { title: 'The New Wave of Luxury in London', slug: 'new-wave-luxury-london', excerpt: 'Discover the latest openings and hidden gems shaping the city\'s travel scene.', content: 'London continues to reinvent itself as a global luxury destination. From the newly opened Peninsula hotel to exclusive dining experiences in Mayfair, the city offers an ever-evolving landscape of refined experiences. Our curated guide takes you through the most exceptional offerings, ensuring your London visit is nothing short of extraordinary.', category: 'UK Travel', featured: 1, published: 1 },
  { title: 'Why the French Riviera Remains a Benchmark', slug: 'french-riviera-remains-benchmark', excerpt: 'From yachts to private villas, a guide to the Côte d\'Azur\'s enduring appeal.', content: 'The French Riviera continues to set the standard for Mediterranean luxury. With its glamorous resorts, world-class restaurants, and stunning coastline, it remains a favorite among discerning travelers. Our local experts provide insider access to the region\'s best-kept secrets.', category: 'Europe Trends', featured: 1, published: 1 },
  { title: 'Inside Italy\'s Hidden Heritage Sites', slug: 'inside-italys-hidden-heritage-sites', excerpt: 'Expert-led tours that unlock the authentic soul of Italy\'s iconic cities.', content: 'Beyond the well-trodden paths of Rome and Venice lies a treasure trove of hidden heritage sites. From secret gardens in Florence to underground ruins in Naples, our expert-led tours reveal the authentic soul of Italy.', category: 'Destination Highlights', featured: 0, published: 1 },
  { title: 'Essential Travel Tips for Europe 2026', slug: 'essential-travel-tips-europe-2026', excerpt: 'Everything you need to know before planning your European adventure.', content: 'Planning a trip to Europe requires careful consideration of visas, transportation, and cultural nuances. Our comprehensive guide covers everything from Schengen visa requirements to local customs, ensuring your journey is smooth and memorable.', category: 'Travel Tips', featured: 0, published: 1 },
];

const postStmt = db.prepare(
  'INSERT OR IGNORE INTO blog_posts (title, slug, excerpt, content, category, featured, published) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

for (const post of posts) {
  postStmt.run(post.title, post.slug, post.excerpt, post.content, post.category, post.featured, post.published);
}

// Sample bookings
const bookingData = [
  ['TRV-9042', 'Sarah Jenkins', 'sarah@example.com', '+44 7700 900042', 'Scottish Highlands Luxury Tour', '2025-10-12', 2, 'confirmed', 'paid', 3450],
  ['TRV-9041', 'Michael Chen', 'michael@example.com', '+1 555 010041', 'Swiss Alps Private Retreat', '2025-10-15', 4, 'pending', 'deposit', 5200],
  ['TRV-9040', 'Emma Thompson', 'emma@example.com', '+44 7700 900040', 'London Royal Escape', '2025-10-10', 2, 'completed', 'paid', 1890],
  ['TRV-9039', 'David Miller', 'david@example.com', '+1 555 010039', 'Italian Heritage Grand Tour', '2025-11-02', 6, 'cancelled', 'refunded', 4100],
  ['TRV-9038', 'Robert Garcia', 'robert@example.com', '+34 600 010038', 'French Riviera Villa Escape', '2025-10-22', 8, 'confirmed', 'paid', 6750],
  ['TRV-9043', 'Ava Thompson', 'ava@example.com', '+44 7700 900043', 'Dublin & Irish Countryside', '2025-11-15', 3, 'pending', 'unpaid', 2200],
  ['TRV-9044', 'Marco Rossi', 'marco@example.com', '+39 320 010044', 'Italian Heritage Grand Tour', '2025-12-01', 2, 'confirmed', 'paid', 4100],
];

const bookingStmt = db.prepare(
  'INSERT OR IGNORE INTO bookings (booking_id, customer_name, customer_email, customer_phone, package_name, travel_date, guests, status, payment_status, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

for (const b of bookingData) {
  bookingStmt.run(...b);
}

// Sample contact submissions
const contacts = [
  ['Helen Parker', 'VIP Travel Ltd', 'helen@viptravel.com', '+44 7700 900050', 'We are interested in partnering with Caledor DMC for our 2026 European programs. Please send us your corporate rate sheet.', 'read'],
  ['James Wilson', 'Global Incentives Inc', 'james@globalincentives.com', '+1 555 010060', 'Looking for a DMC partner to handle a 50-person incentive program across London, Paris, and Rome. Need proposal within 2 weeks.', 'read'],
  ['Priya Sharma', 'Wanderlust Tours', 'priya@wanderlust.com', '+91 98765 43210', 'We have a group of 20 travelers interested in the Scottish Highlands tour for next spring. Please share availability and best rates.', 'unread'],
];

const contactStmt = db.prepare(
  'INSERT OR IGNORE INTO contact_submissions (name, company, email, phone, message, status) VALUES (?, ?, ?, ?, ?, ?)'
);

for (const c of contacts) {
  contactStmt.run(...c);
}

// Create admin notification
db.prepare('INSERT OR IGNORE INTO notifications (type, title, message) VALUES (?, ?, ?)').run(
  'system', 'Welcome to Caledor Admin',
  'Your admin panel is fully set up. Start managing your content, packages, and bookings.'
);

console.log('✅ Database seeded successfully!');
console.log('📧 Admin login: admin@caledor.com / admin123');

// Sample FAQs
const faqs = [
  ['What is your typical response time?', 'We typically respond to quotes and requests within 24 hours.', 'General', 1],
  ['Do you offer 24/7 on-ground support?', 'Yes, our team provides round-the-clock assistance for partners and travelers.', 'General', 2],
  ['Can you handle corporate groups and events?', 'We specialize in tailored corporate solutions, from meetings to incentives.', 'General', 3],
  ['What destinations do you cover?', 'We operate across the UK and 20+ European countries with deep local expertise.', 'General', 4],
  ['How do you handle last-minute changes?', 'We prioritize flexibility and work closely with partners to adjust itineraries as needed.', 'General', 5],
];

const faqCount = db.prepare('SELECT COUNT(*) as count FROM faqs').get();
if (faqCount.count === 0) {
  const faqStmt = db.prepare('INSERT INTO faqs (question, answer, category, sort_order, active) VALUES (?, ?, ?, ?, 1)');
  for (const f of faqs) faqStmt.run(...f);
}

// Sample gallery
const galleryUrls = [
  ['Mountain landscape', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=85'],
  ['Gala dinner', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=500&q=85'],
  ['Paris street', 'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?auto=format&fit=crop&w=500&q=85'],
  ['London', 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=500&q=85'],
  ['Alpine lake', 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=500&q=85'],
  ['Venice', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=500&q=85'],
  ['Amsterdam', 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=500&q=85'],
  ['Coast', 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=500&q=85'],
  ['Architecture', 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=500&q=85'],
  ['Belgium city', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=500&q=85'],
];

const galleryCount = db.prepare('SELECT COUNT(*) as count FROM gallery_items').get();
if (galleryCount.count === 0) {
  const galleryStmt = db.prepare('INSERT INTO gallery_items (title, alt_text, image_url, album, sort_order, active) VALUES (?, ?, ?, ?, ?, 1)');
  galleryUrls.forEach(([title, url], i) => galleryStmt.run(title, title, url, 'General', i + 1));
}
