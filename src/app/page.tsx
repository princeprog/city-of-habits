import type { Metadata, Viewport } from "next"

import { LandingPage } from "@/components/landing/landing-page"

export const metadata: Metadata = {
  title: "City of Habits - A Living Map of Your Daily Life",
  description:
    "Turn recurring actions into buildings, streets, parks, and neighborhoods in a private personal city.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#f7f3e8",
}

export default function Page() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "City of Habits",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    description: "A private, local-first habit tracker that turns repeated actions into a living personal city.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cityofhabits.vercel.app",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  }

  return <><LandingPage /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></>
}
