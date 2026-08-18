import { CITIES, citySlug } from "@/lib/cities";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://pamoja.ke";

export default function sitemap() {
  const staticRoutes = [
    "/",
    "/search",
    "/activities",
    "/how-it-works",
    "/pricing",
    "/safety",
    "/guidelines",
    "/terms",
    "/privacy",
    "/become-companion",
  ];
  const cityRoutes = CITIES.map((c) => `/cities/${citySlug(c)}`);
  return [...staticRoutes, ...cityRoutes].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : path.startsWith("/cities") ? 0.8 : 0.6,
  }));
}