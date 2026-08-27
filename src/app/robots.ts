import type { MetadataRoute } from "next"

export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cityofhabits.vercel.app"
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/city", "/habit", "/district", "/report", "/settings", "/offline"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
