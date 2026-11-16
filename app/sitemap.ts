import type { MetadataRoute } from "next";

const base = "https://ponto-da-farra.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/produtos/all`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];
}