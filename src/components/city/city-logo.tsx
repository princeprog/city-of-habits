import Link from "next/link"
import { MapPinned } from "lucide-react"

import { cn } from "@/lib/utils"

export function CityLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", compact && "gap-1.5")}>
      <MapPinned aria-hidden="true" />
      <span className={cn("flex flex-col leading-none", compact && "hidden sm:flex")}>
        <span className="font-semibold tracking-tight">City of Habits</span>
        <span className="mt-1 text-xs text-muted-foreground">A living map</span>
      </span>
    </Link>
  )
}
