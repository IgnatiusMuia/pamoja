export const CITIES = [
  "Nairobi", "Mombasa", "Diani", "Kisumu", "Nakuru", "Eldoret",
  "Nyeri", "Malindi", "Lamu", "Naivasha", "Machakos", "Thika", "Nyahururu",
];

export const CITY_INFO = {
  Nairobi: {
    emoji: "🏙️",
    tagline: "Kenya's buzzing capital",
    intro:
      "The city that never sleeps — skyline views, world-class coffee, museums, night markets and safari day-trips an hour away. A local companion makes Nairobi feel instantly familiar.",
    highlights: ["Karura Forest walks", "Kazuri Beads & art tours", "Nyama choma dinners", "Langata & Karen estates", "Bomas of Kenya"],
  },
  Mombasa: {
    emoji: "🌴",
    tagline: "Historic island city on the Indian Ocean",
    intro:
      "Old Town's winding alleys, Fort Jesus, seafood by the docks, and beaches in easy reach. Mombasa locals are famously warm hosts.",
    highlights: ["Old Town heritage walk", "Fort Jesus & the tusks", "Sunset at the pier", "Swahili seafood nights"],
  },
  Diani: {
    emoji: "🏖️",
    tagline: "White sands and turquoise lagoons",
    intro:
      "Some of Africa's best beaches. Snorkelling in the marine reserve, dhow cruises at sunset, beachfront restaurants — Diani is best with company.",
    highlights: ["Snorkelling & diving", "Dhow sunset cruises", "Kitesurfing", "Beach bar hopping"],
  },
  Kisumu: {
    emoji: "🌅",
    tagline: "Lakeside city on Lake Victoria",
    intro:
      "Friendly city on the shores of Lake Victoria. Sunrise at Dunga fishing village, sunset boat rides, and some of Kenya's most welcoming people.",
    highlights: ["Dunga fishing village", "Sunset boat rides", "Impala Sanctuary", "Luo cuisine nights"],
  },
  Nakuru: {
    emoji: "🦩",
    tagline: "Flamingos, lakes and crater views",
    intro:
      "Gateway to Lake Nakuru National Park and a million flamingos. Fresh produce markets, crater viewpoints and great nyama choma culture.",
    highlights: ["Lake Nakuru flamingos", "Menengai Crater lookout", "Hyrax Hill ruins", "Local markets"],
  },
  Eldoret: {
    emoji: "🏃",
    tagline: "Home of champions",
    intro:
      "The heart of Kenyan athletics. Training runs with locals, Iten's high-altitude views, cheese farms and a thriving university-town vibe.",
    highlights: ["High-altitude jogging routes", "Iten viewpoint", "Cheese farms", "Local athletics stories"],
  },
  Nyeri: {
    emoji: "⛰️",
    tagline: "Mount Kenya foothills & coffee country",
    intro:
      "Green rolling hills, coffee estates and cool mountain air. Quiet beauty and very calm, kind company.",
    highlights: ["Mount Kenya foothills hikes", "Coffee estate tours", "Aberdare viewpoints", "Highland tea farms"],
  },
  Malindi: {
    emoji: "🐚",
    tagline: "Historic coast town",
    intro:
      "Centuries of Swahili history meets easy beach life. Gede Ruins, the marine park, and fresh-from-the-boat seafood.",
    highlights: ["Gede Ruins", "Malindi Marine Park", "Vasco da Gama pillar", "Local fish market"],
  },
  Lamu: {
    emoji: "🐫",
    tagline: "Island town frozen in time",
    intro:
      "A UNESCO-listed Swahili town where donkeys outnumber cars. Dhow trips, mangroves and the slowest, sweetest pace of life.",
    highlights: ["Lamu Old Town", "Dhow sunset trips", "Mangrove creeks", "Swahili architecture"],
  },
  Naivasha: {
    emoji: "🦒",
    tagline: "Lake, wildlife and garden town",
    intro:
      "Freshwater lake famous for birdlife, boat rides and Crescent Island. A favourite weekend escape from Nairobi.",
    highlights: ["Crescent Island walk", "Sunrise kayaking", "Giraffe & hippo sightings", "Flower farm visits"],
  },
  Machakos: {
    emoji: "⛺",
    tagline: "Green hills an hour from Nairobi",
    intro:
      "Rolling hills, camping spots and a growing food scene. An easy day-trip companion destination.",
    highlights: ["Kituluni hill views", "Weekend camping", "Local food spots"],
  },
  Thika: {
    emoji: "🍍",
    tagline: "Waterfalls, pineapple farms & gardens",
    intro:
      "Home of Kenya's pineapple farms and the famous Fourteen Falls. A lush green escape from the city.",
    highlights: ["Fourteen Falls", "Pineapple farm tours", "Blue Posts gardens"],
  },
  Nyahururu: {
    emoji: "💦",
    tagline: "Highlands town with a famous waterfall",
    intro:
      "Kenya's highest town, home to Thomson's Falls and Lake Ol' Bolossat. Cool air, birding and long quiet walks.",
    highlights: ["Thomson's Falls", "Lake Ol' Bolossat birding", "Highland hikes"],
  },
};

export function citySlug(city) {
  return city.toLowerCase().replace(/\s+/g, "-");
}

export function slugToCity(slug) {
  return CITIES.find((c) => citySlug(c) === slug) || null;
}