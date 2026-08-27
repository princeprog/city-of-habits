import type { Metadata } from "next"

import { CityDashboard } from "@/components/city/city-dashboard"

export const metadata: Metadata = {
  title: "Your city",
  robots: { index: false, follow: false },
}

export default function CityPage() {
  return <CityDashboard />
}
