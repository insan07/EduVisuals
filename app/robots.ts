import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/dashboard/", "/upload/"] },
    sitemap: "https://learnpik.com/sitemap.xml",
  };
}
