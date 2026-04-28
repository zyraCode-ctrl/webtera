import type { MetadataRoute } from "next";
import { tools } from "@/data/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  const base = (configured || (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000")).replace(/\/+$/, "");
  const now = new Date();

  const staticRoutes = [
    "/",
    "/tools",
    "/tools/help",
    "/request-tool",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...tools.map((tool) => ({
      url: `${base}/tools/${tool.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

