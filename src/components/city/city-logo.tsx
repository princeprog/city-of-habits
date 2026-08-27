import Link from "next/link"
import Image from "next/image"

import { cn } from "@/lib/utils"

export function CityLogoContent() {
  return (
    <>
      <Image
        src="/brand-mark.svg"
        alt=""
        aria-hidden="true"
        width={32}
        height={32}
        className="size-8 shrink-0 rounded-md"
      />
      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate font-semibold tracking-tight">City of Habits</span>
        <span className="truncate text-xs text-muted-foreground">A living map</span>
      </div>
    </>
  )
}

export function CityLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", compact && "gap-1.5")}>
      <CityLogoContent />
    </Link>
  )
}
