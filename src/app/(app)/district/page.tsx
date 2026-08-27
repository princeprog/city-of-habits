import type { Metadata } from "next"

import { DistrictPage } from "@/components/district/district-page"

export const metadata: Metadata = {
  title: "Districts",
  description: "Explore the neighborhoods and connections in your private City of Habits.",
  robots: { index: false, follow: true },
}

export default function DistrictRoute() {
  return <DistrictPage />
}
