import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://eduvisuals.lk", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://eduvisuals.lk/visuals", lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: "https://eduvisuals.lk/pricing", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://eduvisuals.lk/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    // Add category pages
    ...["biology", "chemistry", "physics", "mathematics", "ict", "history"].map(subject => ({
      url: `https://eduvisuals.lk/category/${subject}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
