"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Building2, Compass, Map, Plus, Settings2 } from "lucide-react"

import { CityLogoContent } from "@/components/city/city-logo"
import { CityImmersiveShell } from "@/components/app/city-immersive-shell"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

const mainLinks = [
  { href: "/city", label: "Your city", icon: Map },
  { href: "/habit/new", label: "Build a habit", icon: Plus },
  { href: "/report", label: "City report", icon: BarChart3 },
]

const exploreLinks = [
  { href: "/district?id=all", label: "Districts", icon: Compass },
  { href: "/settings", label: "Settings", icon: Settings2 },
]

function normalizePath(path: string) {
  const normalized = path.replace(/\/+$/, "")
  return normalized || "/"
}

function isCurrentRoute(pathname: string, href: string) {
  return normalizePath(pathname) === normalizePath(href.split("?")[0])
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (normalizePath(pathname) === "/city") {
    return <CityImmersiveShell>{children}</CityImmersiveShell>
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="h-16 shrink-0 justify-center border-b">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                render={<Link href="/" aria-label="City of Habits" />}
                tooltip="City of Habits"
              >
                <CityLogoContent />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigate</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainLinks.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isCurrentRoute(pathname, item.href)}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Explore</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {exploreLinks.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isCurrentRoute(pathname, item.href)}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <p className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">A private city for the life you are building.</p>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4 sm:px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 aria-hidden="true" />
            <span className="hidden sm:inline">Your living city</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" className="text-xs text-muted-foreground transition-colors hover:text-foreground">About the project</Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
