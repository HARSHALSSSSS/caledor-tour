/** Default CMS values — merged on GET so missing keys always have fallbacks */

export const CMS_DEFAULTS = {
  home: {
    hero: {
      enabled: "1",
      title: "Your Trusted DMC Partner for UK & Europe",
      subtitle: "Delivering exceptional travel experiences through bespoke hotel bookings, transfers, sightseeing, luxury transport, and curated holiday packages.",
      primary_cta_label: "Become a Partner",
      primary_cta_url: "#contact",
      secondary_cta_label: "Explore Destinations",
      secondary_cta_url: "#destinations",
      background_image: "assets/hero-background.png",
      eyebrow: "Destination Management Company",
    },
    trust: {
      point_1: "20+ European Countries",
      point_2: "Dedicated DMC Support",
      point_3: "Tailor-Made Itineraries",
      point_4: "Competitive Contracted Rates",
    },
    stats: {
      stat_1_value: "500+",
      stat_1_label: "Hotels Network",
      stat_2_value: "50+",
      stat_2_label: "Cities Covered",
      stat_3_value: "200+",
      stat_3_label: "Transfer Partners",
      stat_4_value: "15+",
      stat_4_label: "Years of Experience",
    },
    featured_tours: {
      enabled: "0",
      section_title: "Featured Experiences",
      section_subtitle: "Curated journeys across the UK and Europe, crafted for unforgettable moments and refined travel.",
      tours_count: "5",
      tour_tags_json: JSON.stringify(["Italian", "French Riviera", "Scottish Highlands", "London Royal", "Swiss Alps"]),
    },
    why_choose: {
      enabled: "1",
      section_title: "Why Choose Caledor",
      features_json: JSON.stringify([
        { icon: "👤", title: "Dedicated Account Managers", description: "Personalized support and a single point of contact for every request and itinerary." },
        { icon: "⚡", title: "Fast Quotations", description: "Quick turnaround on quotes and availability checks to keep your planning moving." },
        { icon: "🏨", title: "Contracted Hotel Rates", description: "Preferred partner rates and direct access to exclusive inventory across Europe." },
        { icon: "★", title: "Luxury Experiences", description: "Curated itineraries, private tours, and exclusive access to hidden gems." },
        { icon: "📍", title: "Ground Operations Support", description: "Transfers, logistics, and on-the-ground coordination for seamless execution." },
        { icon: "💼", title: "Corporate Travel Expertise", description: "Tailored solutions for corporate groups, meetings, and executive travel." },
        { icon: "🖥", title: "MICE Solutions", description: "End-to-end management for incentives, meetings, and events." },
      ]),
    },
    testimonials: {
      enabled: "1",
      section_title: "What Our Partners Say",
      section_subtitle: "Trusted by travel professionals and corporate teams across the globe.",
      count: "3",
      auto_rotate: "0",
      rotation_speed: "5",
      items_json: JSON.stringify([
        { quote: "Caledor DMC delivered a flawless incentive program in Scotland. Every detail was considered, every moment was exceptional.", name: "Ava Thompson", role: "Travel Agent · London", stars: "5" },
        { quote: "Their local knowledge and fast turnaround made our corporate event planning effortless.", name: "Marco Rossi", role: "Tour Operator · Milan", stars: "5" },
        { quote: "The team's attention to detail and 24/7 support gave us complete peace of mind for our executive travel.", name: "Sofia Patel", role: "Corporate Client · Zurich", stars: "5" },
      ]),
    },
    packages_heading: {
      enabled: "1",
      kicker: "Featured Experiences",
      title: "",
      subtitle: "Curated journeys across the UK and Europe, crafted for unforgettable moments and refined travel.",
    },
    blog_heading: {
      kicker: "Travel Insights",
      subtitle: "Editorial perspectives on destinations, trends, and travel planning.",
    },
    destinations: {
      enabled: "1",
      kicker: "Explore Our Destinations",
      title: "Europe made easy for every traveler.",
      map_image: "/assets/destinations/europe-coverage-map.png",
      items_json: JSON.stringify([
        { name: "England", places: "London, Oxford, Cotswolds", image: "/uploads/destinations/england.png", slug: "england", sort_order: "1", visible: true },
        { name: "Scotland", places: "Edinburgh, Glasgow, Isle of Skye", image: "/uploads/destinations/scotland.png", slug: "scotland", sort_order: "2", visible: true },
        { name: "France", places: "Paris, Nice, Bordeaux", image: "/uploads/destinations/france.png", slug: "france", sort_order: "3", visible: true },
        { name: "Italy", places: "Rome, Venice, Milan", image: "/uploads/destinations/italy.png", slug: "italy", sort_order: "4", visible: true },
        { name: "Switzerland", places: "Zurich, Geneva, Lucerne", image: "/uploads/destinations/switzerland.png", slug: "switzerland", sort_order: "5", visible: true },
        { name: "Spain", places: "Barcelona, Madrid, Seville", image: "/uploads/destinations/spain.png", slug: "spain", sort_order: "6", visible: true },
        { name: "Germany", places: "Berlin, Munich, Hamburg", image: "/uploads/destinations/germany.png", slug: "germany", sort_order: "7", visible: true },
        { name: "Belgium", places: "Brussels, Bruges, Antwerp", image: "/uploads/destinations/belgium.png", slug: "belgium", sort_order: "8", visible: true },
        { name: "Austria", places: "Vienna, Salzburg, Innsbruck", image: "/uploads/destinations/austria.png", slug: "austria", sort_order: "9", visible: true },
        { name: "Netherlands", places: "Amsterdam, Hague, Rotterdam", image: "/uploads/destinations/netherlands.png", slug: "netherlands", sort_order: "10", visible: true },
        { name: "Portugal", places: "Lisbon, Porto, Algarve", image: "/uploads/destinations/portugal.png", slug: "portugal", sort_order: "11", visible: true },
        { name: "Ireland", places: "Dublin, Galway, Killarney", image: "/uploads/destinations/ireland.png", slug: "ireland", sort_order: "12", visible: true },
      ]),
    },
    gallery_section: {
      enabled: "1",
      kicker: "Our Gallery",
      title: "Photo Gallery",
    },
    scotland_attractions: {
      enabled: "1",
      kicker: "Top Scotland Attractions",
      title: "Discover the most iconic experiences Scotland has to offer.",
      items_json: JSON.stringify([
        { label: "Loch Lomond Cruise", layout: "loch", image: "assets/scotland/loch-lomond.png", alt: "Loch Lomond Cruise", hero: false },
        { label: "The Kelpies", layout: "kelpies", image: "assets/scotland/the-kelpies.png", alt: "The Kelpies", hero: false },
        { label: "Highland Wildlife", layout: "tall", image: "assets/scotland/puffin-highlands.png", alt: "Atlantic puffin with wings spread", hero: false },
        { label: "Coastal Wildlife", layout: "wide", image: "assets/scotland/puffins-sea.png", alt: "Puffins on Scottish waters", hero: false },
        { label: "Isle of Skye", layout: "skye", image: "assets/scotland/isle-of-skye.png", alt: "Isle of Skye", hero: false },
        { label: "Whisky Distillery", layout: "whisky", image: "assets/scotland/whisky-distillery.png", alt: "Scottish Whisky Distillery", hero: false },
      ]),
    },
    premium_services: {
      enabled: "1",
      kicker: "Our Premium Services",
      title: "Curated luxury operations across the UK and Europe.",
      subtitle: "Bespoke travel services shaped around comfort, consistency, and a high-touch guest experience from arrival to departure.",
      items_json: JSON.stringify([
        { title: "Hotel Bookings", description: "Exclusive access to prestigious properties and boutique hotels with preferred partner benefits.", image: "/uploads/premium-services/premium-01-hotel.png", alt: "Luxury hotel lobby", link: "#proposal" },
        { title: "Holiday Packages", description: "Carefully curated itineraries that blend iconic landmarks with hidden gems for a smoother journey.", image: "/uploads/premium-services/premium-02-holiday.png", alt: "Luxury chauffeur service in Paris", link: "#proposal" },
        { title: "Sightseeing Tours", description: "Private, expert-led excursions with deep local context and access to cultural heritage sites.", image: "/uploads/premium-services/premium-03-sightseeing.png", alt: "Fine dining restaurant interior", link: "#proposal" },
        { title: "Vehicle At Disposal", description: "A fleet of premium vehicles with professional chauffeurs for flexible, private travel.", image: "/uploads/premium-services/premium-04-vehicle.png", alt: "Travel itinerary planning on a desk", link: "#proposal" },
        { title: "Airport Transfers", description: "Seamless, punctual, and comfortable transfers for a stress-free arrival and departure experience.", image: "/uploads/premium-services/premium-05-airport.png", alt: "Airport transfer with luxury car", link: "#proposal" },
        { title: "Restaurant Reservations", description: "Priority booking at Michelin-starred establishments and sought-after dining destinations.", image: "/uploads/premium-services/premium-06-restaurant.png", alt: "Couple sightseeing near historic ruins", link: "#proposal" },
      ]),
    },
    mice: {
      enabled: "1",
      kicker: "MICE & Corporate Travel",
      subtitle: "End-to-end corporate solutions for meetings, incentives, conferences, and events across the UK and Europe.",
      image_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85",
      items_json: JSON.stringify([
        { icon: "🏢", title: "Meetings", description: "Seamless venue sourcing, logistics, and on-site coordination." },
        { icon: "✦", title: "Incentives", description: "Reward trips with unique experiences and exclusive access." },
        { icon: "◎", title: "Conferences", description: "Large-scale event management with precision and reliability." },
        { icon: "✦", title: "Events", description: "Gala dinners, product launches, and bespoke corporate experiences." },
      ]),
      stats_json: JSON.stringify([
        { value: "120+", label: "Events Handled" },
        { value: "45+", label: "Corporate Clients" },
        { value: "15+", label: "Years Excellence" },
      ]),
    },
    process: {
      enabled: "1",
      kicker: "Our Process",
      subtitle: "A refined, step-by-step approach to delivering exceptional travel experiences.",
      eyebrow: "The Experience Journey",
      title: "A curated path from brief to delivery.",
      description: "We orchestrate every detail with precision, discretion, and a deep network so you can focus on the journey, not the logistics.",
      steps_json: JSON.stringify([
        { title: "Receive Brief", description: "We listen to your goals and preferences to craft a tailored proposal." },
        { title: "Build Proposal", description: "We curate hotels, transfers, and experiences into a cohesive itinerary." },
        { title: "Confirm Services", description: "Finalize details and secure preferred rates across our network." },
        { title: "Execute Operations", description: "Our team manages logistics, transfers, and on-site coordination." },
        { title: "On-Ground Support", description: "24/7 assistance for partners and travelers throughout the journey." },
        { title: "Successful Delivery", description: "Review, refine, and plan the next exceptional experience." },
      ]),
    },
    success_stories: {
      enabled: "1",
      kicker: "Success Stories",
      subtitle: "Real-world examples of bespoke travel and corporate event delivery.",
      items_json: JSON.stringify([
        { title: "Scotland Luxury Group Tour", image: "/uploads/success-stories/scotland-luxury-tour.png", alt: "Scotland luxury group tour at Eilean Donan Castle", challenge: "Coordinate private transfers and exclusive access for 40 guests.", solution: "Custom itinerary with luxury transport and private estate visits.", outcome: "100% client satisfaction and repeat booking for the next season." },
        { title: "Corporate Incentive Event", image: "/uploads/success-stories/corporate-incentive.png", alt: "Corporate incentive event in a grand ballroom", challenge: "Design an immersive 3-day program with high-end activities.", solution: "Venue sourcing, catering, and entertainment coordination.", outcome: "Exceptional feedback and a significant increase in team engagement." },
        { title: "Europe FIT Program", image: "/uploads/success-stories/europe-fit-program.png", alt: "Europe FIT program network map", challenge: "Scale bespoke operations across multiple destinations.", solution: "Standardized workflows and local partner network expansion.", outcome: "Improved efficiency and consistent luxury delivery." },
      ]),
    },
    numbers: {
      enabled: "1",
      kicker: "By The Numbers",
      subtitle: "A snapshot of our reach and commitment to excellence.",
      stats_json: JSON.stringify([
        { value: "5000+", label: "Travelers Served" },
        { value: "1000+", label: "Hotel Partners" },
        { value: "20+", label: "Countries" },
        { value: "98%", label: "Client Satisfaction" },
      ]),
    },
  },
  "about-us": {
    page_hero: {
      enabled: "1",
      title: "About Caledor DMC",
      subtitle: "Your trusted travel companion since 2012",
      background_image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85",
    },
    story: {
      enabled: "1",
      heading: "Our Story",
      description: "Caledor DMC stands as a premier B2B partner, bridging the gap between global travel professionals and the rich heritage of the UK and Europe. With decades of collective expertise, we deliver unparalleled reliability and sophisticated destination management solutions tailored for the most discerning clientele.",
      image_url: "assets/about-castle.png",
      stat_1_label: "Years",
      stat_1_value: "15+",
      stat_2_label: "Happy Clients",
      stat_2_value: "50K+",
      stat_3_label: "Destinations",
      stat_3_value: "20+",
      stat_4_label: "Tours Completed",
      stat_4_value: "2K+",
      show_stats: "0",
    },
    mission_vision: {
      enabled: "1",
      mission_title: "Our Mission",
      mission_text: "Deliver seamless destination management with accuracy, warmth, and operational trust for every partner and traveler.",
      mission_icon: "🎯",
      vision_title: "Our Vision",
      vision_text: "Be the most reliable DMC partner for premium leisure, corporate, and incentive travel across the UK and Europe.",
      vision_icon: "👁",
    },
    team: {
      enabled: "1",
      eyebrow: "THE TEAM BEHIND YOUR JOURNEY",
      heading: "Our Leadership Team",
      description: "Meet the people who make exceptional travel possible.",
      show_more: "0",
      members_json: JSON.stringify([
        {
          name: "Mr. Alok Singh",
          role: "Managing Director",
          bio: "Mr. Alok Singh comes from a strong hospitality background. His deep understanding of Indian travellers — their tastes, cultural preferences, and expectations — forms the backbone of our guest experience approach.",
          photo: "assets/team-alok-singh-portrait.jpg",
          linkedin: "",
          twitter: "",
        },
        {
          name: "Ms. Neha Sawant",
          role: "Head Asia Pacific",
          bio: "Ms. Neha Sawant brings over a decade of expertise in luxury and experiential travel across the Asia Pacific region. Her nuanced knowledge of regional markets — from Southeast Asia to East Asia — enables her to craft journeys that are both culturally immersive and seamlessly executed for today's discerning traveller.",
          photo: "assets/team-neha-sawant-portrait.jpg",
          linkedin: "",
          twitter: "",
        },
      ]),
    },
    awards: {
      enabled: "0",
      heading: "Our Achievements",
      items_json: JSON.stringify([
        { name: "Best Indian Restaurant in Scotland", org: "British Curry Award", year: "2026", icon: "🏆" },
        { name: "Partner Excellence", org: "Travel Weekly", year: "2024", icon: "🏅" },
        { name: "DMC of the Year", org: "Europe Travel Awards", year: "2023", icon: "⭐" },
      ]),
    },
    about_features: {
      enabled: "1",
      features_json: JSON.stringify([
        { icon_class: "hotel", title: "Hotel Contracting", description: "Direct access to exclusive inventory and preferred rates across Europe." },
        { icon_class: "map", title: "Destination Expertise", description: "Deep local knowledge ensuring authentic and seamless travel experiences." },
        { icon_class: "coach", title: "Ground Handling", description: "Premium logistics, transfers, and professional multi-lingual guides." },
        { icon_class: "support", title: "Assistance for Ground handling", description: "Assistance for partners and travelers on the ground." },
        { icon_class: "diamond", title: "Luxury FIT", description: "Bespoke itineraries crafted for high-net-worth individual travelers." },
        { icon_class: "mice-icon", title: "MICE Services", description: "End-to-end management for corporate meetings, incentives, and events." },
      ]),
    },
    owned_assets: {
      enabled: "1",
      kicker: "Owned Assets",
      title: "Our Properties & Experiences",
      description: "We do not just book experiences. We shape them through owned assets, controlled quality, and dependable service standards.",
      cards_json: JSON.stringify([
        {
          property_name: "Firangi",
          property_location: "Glasgow, Scotland",
          property_text: "A modern take on global flavors. Firangi reflects our passion for hospitality and our commitment to giving travellers a memorable dining experience with complete service control.",
          card_image: "",
          badges_json: JSON.stringify([
            { text: "Best Indian Restaurant in Scotland" },
            { text: "3 Consecutive Years" },
            { text: "British Curry Award 2026" },
          ]),
        },
      ]),
      property_name: "Firangi",
      property_location: "Glasgow, Scotland",
      property_text: "A modern take on global flavors. Firangi reflects our passion for hospitality and our commitment to giving travellers a memorable dining experience with complete service control.",
      card_image: "",
      badges_json: JSON.stringify([
        { text: "Best Indian Restaurant in Scotland" },
        { text: "3 Consecutive Years" },
        { text: "British Curry Award 2026" },
      ]),
    },
  },
  contact: {
    hero: {
      enabled: "1",
      title: "Let's Create Exceptional UK & Europe Experiences Together",
      subtitle: "Partner with a DMC that understands luxury, reliability, and bespoke operations.",
      background_image: "assets/final-cta-castle.png",
      button_label: "Request Proposal",
    },
    info: {
      enabled: "1",
      address: "4 Lynedoch Place, Glasgow, Scotland, G3 6AB",
      phone_1: "+91 97693 50333",
      phone_2: "+44 7917 854171",
      email_1: "neha.sawant@caledordmc.co.uk",
      email_2: "alok.singh@caledordmc.co.uk",
      hours_weekday: "Mon - Fri: 9:00 AM - 6:00 PM",
      hours_weekend: "Sat: 10:00 AM - 4:00 PM",
      whatsapp: "+44 7700 900000",
      show_whatsapp: "1",
    },
    form: {
      enabled: "1",
      heading: "Send Us a Message",
      submit_text: "Send Message",
      receiver_email: "leads@caledor.com",
      success_message: "Thank you for contacting us! We will get back to you within 24 hours.",
      captcha: "1",
      file_upload: "0",
      fields_json: JSON.stringify([
        { label: "Name", field: "fullName", required: true },
        { label: "Email", field: "emailAddress", required: true },
        { label: "Phone", field: "phoneNumber", required: false },
        { label: "Company", field: "companyName", required: false },
        { label: "Message", field: "proposalMessage", required: true },
      ]),
      title: "Request proposal",
      subtitle: "Fill out the form below and our team will be in touch shortly.",
    },
    map: {
      enabled: "0",
      embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.0!2d-0.1276!3d51.5074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zLondon!5e0!3m2!1sen!2suk!4v1",
      height: "400",
      zoom: "14",
    },
    social: {
      enabled: "1",
      show_footer: "1",
      show_contact: "1",
    },
  },
  blog: {
    page: {
      enabled: "1",
      title: "Travel Insights",
      subtitle: "Editorial perspectives on destinations, trends, and travel planning.",
      description: "",
    },
    listing: {
      enabled: "1",
      posts_per_page: "3",
      grid_columns: "3",
      show_featured: "0",
      show_author: "0",
      show_date: "0",
      show_read_time: "0",
      show_category_tags: "1",
      show_read_more: "1",
      show_pagination: "0",
      show_search: "0",
      infinite_scroll: "0",
      excerpt_length: "150",
      read_more_text: "Read More",
    },
    categories: {
      enabled: "1",
      show_filter: "1",
      items_json: JSON.stringify([
        { name: "Adventure Travel", slug: "adventure-travel", count: "12", order: "1", visible: true },
        { name: "Destinations", slug: "destinations", count: "18", order: "2", visible: true },
        { name: "Travel Tips", slug: "travel-tips", count: "9", order: "3", visible: true },
        { name: "Food & Culture", slug: "food-culture", count: "7", order: "4", visible: true },
        { name: "Gear & Packing", slug: "gear-packing", count: "5", order: "5", visible: false },
      ]),
    },
    homepage_featured: {
      enabled: "1",
      section_title: "Travel Insights",
      posts_count: "3",
      post_tags_json: JSON.stringify([]),
      show_on_homepage: "1",
    },
    comments: {
      enabled: "0",
      manual_approval: "1",
    },
    author: {
      enabled: "1",
      show_bio: "1",
      show_photo: "1",
      show_social: "1",
      bio_position: "Below Post",
    },
  },
  "packages-page": {
    hero: {
      enabled: "0",
      title: "Explore Our Packages",
      subtitle: "Find the perfect adventure tailored for you",
      background_image: "",
      show_search: "0",
      search_placeholder: "Search destinations, activities...",
    },
    filters: {
      enabled: "0",
      filter_position: "top",
      show_results_count: "0",
      default_sort: "Most Popular",
    },
    listing: {
      enabled: "1",
      default_view: "grid",
      grid_columns: "3",
      packages_per_page: "5",
      show_rating: "0",
      show_price: "0",
      show_duration: "0",
      show_difficulty: "0",
      card_style: "Image Top with Details",
    },
    categories: {
      enabled: "0",
      show_tabs: "0",
      show_all_tab: "0",
      items_json: JSON.stringify([]),
    },
    cta: {
      enabled: "0",
      show_inquiry_form: "0",
      title: "Not Sure Which Package?",
      subtitle: "Our travel experts will help you plan the perfect trip",
      button_text: "Get Free Consultation",
      button_link: "#proposal",
      background_style: "gradient-dark",
      show_at_bottom: "0",
    },
  },
  faq: {
    section: {
      enabled: "1",
      kicker: "Frequently Asked Questions",
      subtitle: "Answers to common questions about partnerships, operations, and bespoke travel.",
    },
  },
  footer: {
    brand: { enabled: "1" },
    navigation: {
      enabled: "1",
      columns_json: JSON.stringify([
        {
          title: "Services",
          links: [
            { label: "Hotel Bookings", url: "/premium-services#hotel-bookings" },
            { label: "Sightseeing Tours", url: "/premium-services#sightseeing-tours" },
            { label: "Transfers", url: "/premium-services#airport-transfers" },
            { label: "MICE", url: "#mice" },
          ],
        },
        {
          title: "Destinations",
          links: [
            { label: "UK", url: "#destinations" },
            { label: "France", url: "#destinations" },
            { label: "Italy", url: "#destinations" },
            { label: "Switzerland", url: "#destinations" },
          ],
        },
        {
          title: "Resources",
          links: [
            { label: "FAQ", url: "#faq" },
            { label: "Travel Insights", url: "#blogSection" },
            { label: "Case Studies", url: "#successStories" },
          ],
        },
      ]),
    },
    newsletter: {
      enabled: "1",
      title: "Newsletter",
      subtitle: "Get travel insights and destination updates.",
      button_text: "Subscribe",
      placeholder: "Your email address",
    },
    bottom_bar: {
      enabled: "1",
      privacy_url: "#",
      terms_url: "#",
      cookie_url: "#",
    },
  },
};

export function mergeCmsSections(tab, sections = {}) {
  const defaults = CMS_DEFAULTS[tab] || {};
  const merged = {};
  for (const [section, fields] of Object.entries(defaults)) {
    merged[section] = { ...fields, ...(sections[section] || {}) };
  }
  for (const [section, fields] of Object.entries(sections)) {
    if (!merged[section]) merged[section] = { ...fields };
  }
  return merged;
}

export function flattenCmsDefaults() {
  const rows = [];
  for (const [tab, sections] of Object.entries(CMS_DEFAULTS)) {
    for (const [section, fields] of Object.entries(sections)) {
      for (const [key, value] of Object.entries(fields)) {
        rows.push([tab, section, key, value]);
      }
    }
  }
  return rows;
}
