import type { MetadataRoute } from "next"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "City of Habits - A Living Map of Your Daily Life",
    short_name: "City of Habits",
    description: "A private, local-first habit tracker that turns repeated actions into a living personal city.",
    start_url: "/city/",
    display: "standalone",
    background_color: "#f5f0e8",
    theme_color: "#193238",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/city-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/city-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/city-maskable.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  }
}
