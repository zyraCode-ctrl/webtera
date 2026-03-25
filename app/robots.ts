import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/tools", "/tools/help", "/request-tool", "/about", "/contact", "/privacy", "/terms"],
        disallow: ["/go", "/post/", "/out/", "/help/", "/ig/"],
      },
    ],
    sitemap: "/sitemap.xml",
  };
}

