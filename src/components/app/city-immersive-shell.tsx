"use client"

import Link from "next/link"
import { BarChart3, Compass, Map, Plus, Settings2 } from "lucide-react"

import { CityLogoContent } from "@/components/city/city-logo"
import {
  HabitCreationProvider,
  useHabitCreation,
} from "@/components/habit/habit-creation-dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"

const cityLinks = [
  { kind: "link", href: "/city", label: "My city", icon: Map },
  { kind: "action", label: "Add habit", icon: Plus },
  { kind: "link", href: "/report", label: "Reports", icon: BarChart3 },
  { kind: "link", href: "/district?id=all", label: "Districts", icon: Compass },
  { kind: "link", href: "/settings", label: "Settings", icon: Settings2 },
] as const

export function CityImmersiveShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      defaultOpen={false}
      className="bg-[#edf1e8]"
      data-city-shell="immersive"
    >
      <HabitCreationProvider>
        <Sidebar collapsible="icon" variant="sidebar" data-city-sidebar>
          <SidebarHeader className="h-16 shrink-0 justify-center border-b bg-background">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  render={<Link href="/" aria-label="City of Habits" />}
                  tooltip="City of Habits"
                >
                  <CityLogoContent showTagline={false} />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent className="bg-background">
            <SidebarGroup className="pt-4">
              <SidebarGroupContent>
                <SidebarMenu>
                  {cityLinks.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      {item.kind === "action" ? (
                        <CityAddHabitButton />
                      ) : (
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          isActive={item.href === "/city"}
                          tooltip={item.label}
                        >
                          <item.icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter className="bg-background">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/" />}
                  tooltip="About City of Habits"
                >
                  <span className="text-xs">?</span>
                  <span>About</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="min-h-svh bg-[#edf1e8] md:peer-data-[variant=sidebar]:m-0 md:peer-data-[variant=sidebar]:rounded-none md:peer-data-[variant=sidebar]:shadow-none">
          {children}
        </SidebarInset>
      </HabitCreationProvider>
    </SidebarProvider>
  )
}

function CityAddHabitButton() {
  const { openCreateHabit } = useHabitCreation()
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <SidebarMenuButton
      type="button"
      onClick={() => {
        openCreateHabit()
        if (isMobile) setOpenMobile(false)
      }}
      tooltip="Add habit"
    >
      <Plus />
      <span>Add habit</span>
    </SidebarMenuButton>
  )
}
