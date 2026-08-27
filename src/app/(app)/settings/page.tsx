import type { Metadata } from "next"

import { SettingsPage } from "@/components/settings/settings-page"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your private City of Habits preferences and backups.",
  robots: { index: false, follow: true },
}

export default function SettingsRoute() {
  return <SettingsPage />
}
