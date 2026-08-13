/** Default featured experiences — matches Figma; used when API is empty or offline */
window.CALEDOR_PACKAGE_DEFAULTS = (() => {
  const packages = [
    {
      id: "italian-heritage-tour",
      name: "Italian Heritage Tour",
      slug: "italian-heritage-tour",
      badge: "ITALY",
      category: "Cultural Heritage",
      duration: "10 Days / 9 Nights",
      price_from: 4100,
      featured: 1,
      tagline: "Private tours, wine estates, and authentic culinary journeys through Italy.",
      description: "Discover Italy through private guides, heritage estates, and refined dining. From Rome's ancient forums to Tuscan vineyards and Venetian palazzos, this journey is crafted for travelers who want depth, comfort, and exclusive access at every stop.",
      group_size: "2–10 Guests",
      season: "Apr – Oct",
      difficulty: "Moderate",
      about_label: "The Journey",
      itinerary_heading: "A Curated Day-by-Day Path",
      gallery_heading: "Italian Atmosphere",
      image_url: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=85",
      highlights: [
        "Private guides in Rome, Florence, and Venice",
        "Wine estate tastings in Tuscany",
        "After-hours access at select heritage sites",
        "Michelin-level dining reservations",
        "Luxury boutique hotel portfolio",
      ],
      inclusions: [
        "Private transfers and chauffeured transport",
        "9 nights in hand-picked luxury hotels",
        "Daily breakfast and curated dining experiences",
        "All guided tours and entrance fees",
        "Dedicated concierge throughout",
      ],
      exclusions: [
        "International flights",
        "Travel insurance",
        "Personal expenses and gratuities",
        "Optional spa treatments",
      ],
      itinerary: [
        { day: 1, title: "Arrival in Rome", description: "Private transfer to your hotel. Evening aperitivo walk through the historic center with your local host." },
        { day: 2, title: "Ancient Rome & Vatican", description: "Skip-the-line private tour of the Colosseum and Vatican Museums with an expert art historian." },
        { day: 3, title: "Tuscany Wine Country", description: "Scenic transfer to Florence. Afternoon estate visit with cellar tasting and farm-to-table dinner." },
        { day: 4, title: "Florence in Depth", description: "Uffizi Gallery private viewing, artisan workshops, and sunset from Piazzale Michelangelo." },
        { day: 5, title: "Venice Arrival", description: "First-class rail to Venice. Private water taxi to your canal-side hotel and evening gondola experience." },
      ],
      gallery_json: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=85", alt: "Italian piazza at sunset" },
        { url: "https://images.unsplash.com/photo-1516483638268-f4dbaf036963?auto=format&fit=crop&w=1200&q=85", alt: "Tuscany landscape" },
        { url: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=85", alt: "Venice canal" },
      ]),
      related_slugs_json: JSON.stringify(["french-riviera-retreat", "london-royal-escape", "swiss-alps-experience"]),
    },
    {
      id: "french-riviera-retreat",
      name: "French Riviera Retreat",
      slug: "french-riviera-retreat",
      badge: "FRANCE",
      category: "Luxury Escapes",
      duration: "5 Days / 4 Nights",
      price_from: 6750,
      featured: 1,
      tagline: "Yachts, private villas, and refined living on the Côte d'Azur.",
      description: "Experience the French Riviera at its most glamorous — private yacht charters, cliffside villas, and Michelin-starred tables along the Mediterranean. A seamless blend of coastal beauty and elevated living.",
      group_size: "2–8 Guests",
      season: "May – Sep",
      difficulty: "Easy",
      about_label: "The Retreat",
      itinerary_heading: "Riviera Highlights",
      gallery_heading: "Mediterranean Light",
      image_url: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=1200&q=85",
      highlights: [
        "Private yacht day on the Mediterranean",
        "Villa or palace hotel stays",
        "Monaco and Cannes insider access",
        "Beach club reservations",
        "Personal shopping appointments",
      ],
      inclusions: [
        "All private transfers and yacht charter",
        "4 nights luxury accommodation",
        "Selected lunches and dinners",
        "Concierge and on-ground host",
        "VIP venue access where listed",
      ],
      exclusions: [
        "International flights",
        "Travel insurance",
        "Premium wines and spirits",
        "Personal shopping",
      ],
      itinerary: [
        { day: 1, title: "Nice & Cap Ferrat", description: "Arrival in Nice. Private transfer to your coastal retreat. Sunset dinner overlooking the bay." },
        { day: 2, title: "Monaco & Monte Carlo", description: "Guided tour of Monaco with reserved entry to key venues. Evening at a premier casino lounge." },
        { day: 3, title: "Yacht Day", description: "Full-day private yacht charter with swim stops, onboard chef, and champagne service." },
        { day: 4, title: "Cannes & Antibes", description: "Explore old Antibes and La Croisette. Private gallery visit and farewell dinner." },
        { day: 5, title: "Departure", description: "Leisurely morning and private transfer to Nice airport." },
      ],
      gallery_json: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=1200&q=85", alt: "Luxury yacht at dusk" },
        { url: "https://images.unsplash.com/photo-1533104816936-62f8701ead5a?auto=format&fit=crop&w=1200&q=85", alt: "French Riviera coast" },
        { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85", alt: "Mediterranean beach" },
      ]),
      related_slugs_json: JSON.stringify(["italian-heritage-tour", "swiss-alps-experience", "london-royal-escape"]),
    },
    {
      id: "scottish-highlands-journey",
      name: "Scottish Highlands Journey",
      slug: "scottish-highlands-journey",
      badge: "SCOTLAND",
      category: "Luxury Escapes",
      duration: "7 Days / 6 Nights",
      price_from: 4850,
      featured: 1,
      tagline: "Private estates, rugged coastlines, and whisky tastings in the heart of Scotland.",
      description: "Embark on an unforgettable journey through the misty landscapes of the Scottish Highlands. From ancient castles perched on lochs to rugged coastlines and whisky distilleries, this curated experience reveals the soul of Scotland in refined comfort.",
      group_size: "2–8 Guests",
      season: "Year-Round",
      difficulty: "Moderate",
      about_label: "The Expedition",
      itinerary_heading: "A Curated Day-by-Day Path",
      gallery_heading: "Capturing the Highland Soul",
      image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
      highlights: [
        "Private castle and estate access",
        "Expert local guides throughout",
        "Luxury 4x4 transport",
        "Whisky distillery private tasting",
        "Hand-picked boutique accommodations",
      ],
      inclusions: [
        "All private transfers and transport",
        "6 nights luxury accommodation",
        "Daily breakfast and select dinners",
        "All guided tours and entrance fees",
        "24/7 concierge support",
      ],
      exclusions: [
        "International flights",
        "Travel insurance",
        "Personal expenses and gratuities",
        "Optional spa treatments",
      ],
      itinerary: [
        { day: 1, title: "Arrival in Edinburgh", description: "Private transfer to your luxury hotel. Evening welcome dinner with local whisky tasting." },
        { day: 2, title: "Edinburgh to Loch Lomond", description: "Scenic drive through Trossachs National Park. Private boat cruise on Loch Lomond." },
        { day: 3, title: "Glencoe & Fort William", description: "Explore Glencoe valley. Visit a historic distillery with private tasting." },
        { day: 4, title: "Isle of Skye", description: "Explore fairy pools, Old Man of Storr, and a private estate tour." },
        { day: 5, title: "Inverness & Culloden", description: "Historian-led visit to Culloden Battlefield. Afternoon at leisure." },
        { day: 6, title: "Highland Wilderness", description: "Off-road adventure through remote tracks. Lochside picnic lunch." },
        { day: 7, title: "Departure", description: "Private airport transfer. Farewell gift hamper of Scottish delicacies." },
      ],
      gallery_json: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85", alt: "Scottish highlands loch" },
        { url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85", alt: "Highland mountains" },
        { url: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1200&q=85", alt: "Scottish loch at dusk" },
      ]),
      related_slugs_json: JSON.stringify(["london-royal-escape", "swiss-alps-experience", "french-riviera-retreat"]),
    },
    {
      id: "london-royal-escape",
      name: "London Royal Escape",
      slug: "london-royal-escape",
      badge: "ENGLAND",
      category: "Cultural Heritage",
      duration: "4 Days / 3 Nights",
      price_from: 1890,
      featured: 1,
      tagline: "Private access to palaces, bespoke shopping, and Michelin dining in the capital.",
      description: "London reimagined for the discerning traveler — private palace tours, reserved tables at celebrated restaurants, and bespoke shopping with a personal stylist. Perfect for long weekends and executive leisure.",
      group_size: "1–6 Guests",
      season: "Year-Round",
      difficulty: "Easy",
      about_label: "The Capital",
      itinerary_heading: "London in Four Days",
      gallery_heading: "Royal London",
      image_url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=85",
      highlights: [
        "Private Westminster and palace access",
        "Michelin-star dining reservations",
        "Personal shopping on Bond Street",
        "Thames private river experience",
        "Luxury central London hotel",
      ],
      inclusions: [
        "Private transfers and chauffeur hours",
        "3 nights five-star accommodation",
        "Guided tours as per itinerary",
        "Selected dining reservations",
        "Concierge support",
      ],
      exclusions: [
        "International flights",
        "Travel insurance",
        "Theatre tickets unless specified",
        "Personal purchases",
      ],
      itinerary: [
        { day: 1, title: "Westminster & South Bank", description: "Private tour of Westminster Abbey and Parliament. Evening Thames cruise with canapés." },
        { day: 2, title: "Royal London", description: "Buckingham Palace area tour, St James's galleries, and afternoon tea at a prestigious address." },
        { day: 3, title: "Bespoke London", description: "Personal shopping appointment, spa time, and Michelin dinner." },
        { day: 4, title: "Departure", description: "Flexible morning before private transfer." },
      ],
      gallery_json: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=85", alt: "London skyline at night" },
        { url: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=1200&q=85", alt: "Tower Bridge London" },
        { url: "https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=1200&q=85", alt: "London street" },
      ]),
      related_slugs_json: JSON.stringify(["scottish-highlands-journey", "italian-heritage-tour", "french-riviera-retreat"]),
    },
    {
      id: "swiss-alps-experience",
      name: "Swiss Alps Experience",
      slug: "swiss-alps-experience",
      badge: "SWITZERLAND",
      category: "Luxury Escapes",
      duration: "6 Days / 5 Nights",
      price_from: 5200,
      featured: 1,
      tagline: "Alpine peaks, luxury chalets, and exclusive mountain experiences.",
      description: "From snow-capped peaks to fireside chalets, this Swiss Alps itinerary combines scenic rail journeys, private mountain guides, and world-class hospitality in Zermatt, Lucerne, and beyond.",
      group_size: "2–8 Guests",
      season: "Dec – Mar / Jun – Sep",
      difficulty: "Moderate",
      about_label: "Alpine Escape",
      itinerary_heading: "Mountain Days",
      gallery_heading: "Alpine Grandeur",
      image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=85",
      highlights: [
        "Luxury chalet or five-star alpine hotel",
        "Glacier Paradise or Jungfrau experience",
        "Private mountain guide",
        "Scenic rail in first class",
        "Fondue and fine dining",
      ],
      inclusions: [
        "Swiss Travel Pass or private transfers",
        "5 nights luxury accommodation",
        "Daily breakfast",
        "Guided excursions listed",
        "Concierge throughout",
      ],
      exclusions: [
        "International flights",
        "Ski equipment rental",
        "Travel insurance",
        "Personal expenses",
      ],
      itinerary: [
        { day: 1, title: "Zurich to Lucerne", description: "Arrival and lakeside luxury hotel. Evening stroll and fondue dinner." },
        { day: 2, title: "Mount Pilatus", description: "Golden round trip to Pilatus with private guide. Spa afternoon." },
        { day: 3, title: "Interlaken & Jungfrau", description: "Scenic rail to Interlaken. Jungfraujoch excursion in VIP comfort." },
        { day: 4, title: "Zermatt", description: "Transfer to Zermatt. Matterhorn viewpoints and chalet dinner." },
        { day: 5, title: "Alpine Adventure", description: "Helicopter or glacier experience (seasonal). Farewell tasting menu." },
        { day: 6, title: "Departure", description: "Scenic return to Zurich airport." },
      ],
      gallery_json: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=85", alt: "Swiss Alps chalet" },
        { url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=85", alt: "Alpine peaks" },
        { url: "https://images.unsplash.com/photo-1527669625475-1353b4c4cb24?auto=format&fit=crop&w=1200&q=85", alt: "Swiss mountain village" },
      ]),
      related_slugs_json: JSON.stringify(["french-riviera-retreat", "scottish-highlands-journey", "italian-heritage-tour"]),
    },
  ];

  function getAll() {
    return packages.map((p) => ({ ...p }));
  }

  function getFeatured() {
    return getAll().filter((p) => p.featured).slice(0, 5);
  }

  function getBySlug(slug) {
    const normalized = {
      "scottish-highlands-luxury-tour": "scottish-highlands-journey",
      "french-riviera-villa-escape": "french-riviera-retreat",
      "italian-heritage-grand-tour": "italian-heritage-tour",
      "swiss-alps-private-retreat": "swiss-alps-experience",
    }[slug] || slug;
    return packages.find((p) => p.slug === normalized) || null;
  }

  function getRelated(slug) {
    const pkg = getBySlug(slug);
    const slugs = (() => {
      try { return JSON.parse(pkg.related_slugs_json || "[]"); } catch { return []; }
    })();
    return slugs.map((s) => getBySlug(s)).filter((p) => p.slug !== slug);
  }

  return { getAll, getFeatured, getBySlug, getRelated };
})();
