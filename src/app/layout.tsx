import type { Metadata, Viewport } from "next"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://city-of-habits.vercel.app"
const siteDescription = "A living map of your daily life. Turn recurring actions into buildings, streets, parks, and neighborhoods in a private personal city."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "City of Habits - A Living Map of Your Daily Life",
    template: "%s | City of Habits",
  },
  description: siteDescription,
  applicationName: "City of Habits",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "City of Habits",
    title: "City of Habits - A Living Map of Your Daily Life",
    description: siteDescription,
    url: "/",
    images: [{ url: "/og-city.svg", width: 1200, height: 630, alt: "City of Habits, a living map of daily life" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "City of Habits - A Living Map of Your Daily Life",
    description: siteDescription,
    images: ["/og-city.svg"],
  },
  keywords: ["habit tracker", "local-first", "private habit app", "daily routines"],
  category: "productivity",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider>{children}<Toaster /></ThemeProvider>
      </body>
    </html>
  )
}
