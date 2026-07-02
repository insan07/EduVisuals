import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://learnpik.com", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://learnpik.com/visuals", lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: "https://learnpik.com/pricing", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://learnpik.com/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    // Add category pages
    ...["biology", "chemistry", "physics", "mathematics", "ict", "history"].map(subject => ({
      url: `https://learnpik.com/category/${subject}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
