import Link from "next/link"
import { MapPinned } from "lucide-react"

import { cn } from "@/lib/utils"

export function CityLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", compact && "gap-2")}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <MapPinned aria-hidden="true" />
      </span>
      <span className={cn("flex flex-col leading-none", compact && "hidden sm:flex")}>
        <span className="font-editorial text-lg font-semibold tracking-tight">City of Habits</span>
        <span className="font-label mt-1 text-[0.55rem] text-muted-foreground">A living map</span>
      </span>
    </Link>
  )
}
