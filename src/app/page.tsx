import type { Metadata } from "next"

import { LandingPage } from "@/components/landing/landing-page"

export const metadata: Metadata = {
  title: "A living map of your daily life",
  description:
    "Turn recurring actions into buildings, streets, parks, and neighborhoods in a private personal city.",
}

export default function Page() {
  return <LandingPage />
}
