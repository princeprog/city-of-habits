import type { CSSProperties, KeyboardEvent } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { districtCatalog } from "@/lib/city/catalog"
import { getHabitStage, projectCity } from "@/lib/city/rules"
import type { CheckIn, Habit } from "@/types/city"
import { BuildingIllustration } from "@/components/city/building-illustration"

interface CityMapProps {
  habits: Habit[]
  checkIns: CheckIn[]
  onSelectHabit?: (habit: Habit) => void
  sample?: boolean
  className?: string
}

function handleKeyDown(event: KeyboardEvent<SVGGElement>, onSelect: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault()
    onSelect()
  }
}

export function CityMap({ habits, checkIns, onSelectHabit, sample = false, className }: CityMapProps) {
  const elements = projectCity(habits, checkIns)
  const districts = Object.entries(districtCatalog) as Array<[
    keyof typeof districtCatalog,
    (typeof districtCatalog)[keyof typeof districtCatalog],
  ]>
  const mapId = sample ? "sample" : "personal"

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-0">
        <svg viewBox="0 0 100 100" className="block h-full min-h-[25rem] w-full" role="img" aria-labelledby={`${mapId}-map-title ${mapId}-map-desc`}>
          <title id={`${mapId}-map-title`}>{sample ? "A sample living city" : "Your living city"}</title>
          <desc id={`${mapId}-map-desc`}>A central fountain anchors the city. Buildings grow from repeated habits across six districts. Select a building to inspect its habit.</desc>
          <defs>
            <pattern id={`${mapId}-grid`} width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="var(--border)" strokeWidth="0.12" opacity="0.65" />
            </pattern>
            <filter id={`${mapId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.1" floodColor="var(--foreground)" floodOpacity="0.16" />
            </filter>
          </defs>
          <rect width="100" height="100" fill="var(--background)" />
          <rect width="100" height="100" fill={`url(#${mapId}-grid)`} />
          <path d="M0 58C18 49 25 63 41 54S69 37 100 47" fill="none" stroke="var(--chart-4)" strokeWidth="8" opacity="0.2" />
          <path d="M-4 41C18 50 25 45 42 55S71 72 104 61M-5 80C20 70 33 82 48 67S76 49 105 55" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.2" strokeDasharray="1.8 1.8" opacity="0.45" />
          <g data-city-centerpiece="fountain" transform="translate(50 50)" aria-hidden="true">
            <circle r="5.2" fill="var(--muted)" stroke="var(--border)" strokeWidth="0.7" />
            <circle r="3.25" fill="var(--primary)" opacity="0.18" />
            <circle r="2.55" fill="var(--chart-2)" opacity="0.62" />
            <circle r="1.05" fill="var(--background)" stroke="var(--border)" strokeWidth="0.55" />
            <path d="M0-4.1V-0.8M-1.8-2.5 0-0.8 1.8-2.5" fill="none" stroke="var(--primary)" strokeLinecap="round" strokeWidth="0.55" />
          </g>
          {districts.map(([id, district]) => {
            const centers: Record<string, [number, number]> = {
              body: [74, 76],
              mind: [25, 28],
              creative: [55, 24],
              connection: [74, 50],
              work: [48, 67],
              recovery: [27, 72],
            }
            const [cx, cy] = centers[id]
            return (
              <g key={id} opacity="0.9">
                <circle cx={cx} cy={cy} r="15" fill={`var(${district.token})`} opacity="0.1" />
                <text x={cx - 10} y={cy + 13} fill="var(--muted-foreground)" fontSize="2.8" fontFamily="var(--font-sans)" letterSpacing="0.3">{district.name.toUpperCase()}</text>
              </g>
            )
          })}
          {elements.filter((element) => element.kind === "path").map((element) => {
            const sources = element.sourceHabitIds?.map((id) => habits.find((habit) => habit.id === id)).filter(Boolean) as Habit[]
            if (sources.length !== 2) return null
            return <path key={element.id} d={`M${sources[0].position.x} ${sources[0].position.y} Q${element.position.x} ${element.position.y - 8} ${sources[1].position.x} ${sources[1].position.y}`} fill="none" stroke="var(--primary)" strokeWidth="0.65" strokeDasharray="1.5 1.5" opacity="0.8" />
          })}
          {elements.filter((element) => element.kind === "building").map((element) => {
            const habit = habits.find((candidate) => candidate.id === element.sourceHabitId)
            if (!habit) return null
            const colorVariable: Record<string, string> = {
              coral: "var(--chart-1)",
              teal: "var(--chart-2)",
              gold: "var(--chart-3)",
              sky: "var(--chart-4)",
              moss: "var(--chart-5)",
              blue: "var(--primary)",
            }
            const style = { "--building": colorVariable[habit.colorToken] ?? "var(--primary)" } as CSSProperties
            const select = () => onSelectHabit?.(habit)
            const interactiveProps = onSelectHabit
              ? {
                  tabIndex: 0,
                  role: "button" as const,
                  "aria-label": `${habit.name}, ${getHabitStage(habit.id, checkIns)} stage`,
                  onClick: select,
                  onKeyDown: (event: KeyboardEvent<SVGGElement>) => handleKeyDown(event, select),
                }
              : {}
            return (
              <g
                key={element.id}
                transform={`translate(${habit.position.x - 6} ${habit.position.y - 9})`}
                style={style}
                filter={`url(#${mapId}-shadow)`}
                {...interactiveProps}
                className={onSelectHabit ? "cursor-pointer outline-none focus-visible:opacity-80" : undefined}
              >
                <BuildingIllustration type={habit.buildingType} stage={element.stage} color={habit.colorToken} status={habit.status} size={12} label={habit.name} />
              </g>
            )
          })}
          {elements.filter((element) => element.kind === "landmark").map((element) => (
            <g key={element.id} transform={`translate(${element.position.x} ${element.position.y})`} aria-label={element.label}>
              <circle r="2.2" fill="var(--primary)" opacity="0.13" />
              <path d="M0-1.5 1.2 1H-1.2Z" fill="var(--primary)" />
              <circle cy="-0.25" r="0.35" fill="var(--primary-foreground)" />
            </g>
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-4">
          <Badge variant="outline">{sample ? "Sample city" : "Your city"}</Badge>
          <Badge variant="outline">{habits.length} {habits.length === 1 ? "building" : "buildings"}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
