import Link from "next/link"
import Image from "next/image"

import { cn } from "@/lib/utils"

export function CityLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", compact && "gap-1.5")}>
      <Image src="/brand-mark.svg" alt="" aria-hidden="true" width={32} height={32} className="size-8 shrink-0 rounded-md" />
      <span className={cn("flex flex-col leading-none", compact && "hidden sm:flex")}>
        <span className="font-semibold tracking-tight">City of Habits</span>
        <span className="mt-1 text-xs text-muted-foreground">A living map</span>
      </span>
    </Link>
  )
}
