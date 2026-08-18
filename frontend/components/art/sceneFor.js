const CITY_VARIANTS = {
  nairobi: "city",
  mombasa: "coast",
  malindi: "coast",
  diani: "coast",
  kisumu: "coast",
  watamu: "coast",
  nyali: "coast",
  eldoret: "highlands",
  nyeri: "highlands",
  naivasha: "highlands",
  nyahururu: "highlands",
  nanyuki: "highlands",
};

export function sceneForCity(city = "") {
  const key = city.toLowerCase().trim();
  return CITY_VARIANTS[key] || "savanna";
}

const ACTIVITY_VARIANTS = {
  coffee: [
    "coffee", "tea", "cafe", "brunch", "dining", "food", "restaurant",
    "street food", "market", "shopping", "date",
  ],
  highlands: [
    "hiking", "cycling", "mountain", "nature", "picnic", "camping",
    "forest", "farm", "golf", "safari",
  ],
  coast: [
    "beach", "diving", "snorkelling", "boating", "fishing", "swimming",
    "sailing", "sunset", "water", "island", "kayak",
  ],
  city: [
    "city", "museum", "gallery", "art", "heritage", "history",
    "nightlife", "theatre", "architecture", "tour", "cultural",
  ],
};

export function sceneForActivity(label = "") {
  const haystack = label.toLowerCase();
  for (const [variant, keywords] of Object.entries(ACTIVITY_VARIANTS)) {
    if (keywords.some((k) => haystack.includes(k))) return variant;
  }
  return "savanna";
}