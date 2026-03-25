import type { MetadataRoute } from "next";
import { tools } from "@/data/tools";
import { getRequiredEnv } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NODE_ENV === "production"
      ? getRequiredEnv("NEXT_PUBLIC_SITE_URL")
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
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

