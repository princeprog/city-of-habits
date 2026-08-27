import type { Metadata } from "next"

import { CityReport } from "@/components/report/city-report"

export const metadata: Metadata = {
  title: "City report",
  description: "A private, local summary of your City of Habits rhythm.",
  robots: { index: false, follow: true },
}

export default function ReportRoute() {
  return <CityReport />
}
