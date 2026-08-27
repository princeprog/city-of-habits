import type { CSSProperties } from "react"

import type { BuildingType, HabitStatus } from "@/types/city"

interface BuildingIllustrationProps {
  type: BuildingType
  stage: number
  color: string
  status?: HabitStatus
  size?: number
  label?: string
}

function Window({ x, y, lit }: { x: number; y: number; lit: boolean }) {
  return (
    <rect
      x={x}
      y={y}
      width="1.8"
      height="2.5"
      rx="0.35"
      fill={lit ? "var(--building-light)" : "var(--building-shadow)"}
      opacity={lit ? 1 : 0.7}
    />
  )
}

function Windows({ rows, columns, stage }: { rows: number; columns: number; stage: number }) {
  return (
    <g aria-hidden="true">
      {Array.from({ length: rows * columns }, (_, index) => {
        const row = Math.floor(index / columns)
        const column = index % columns
        return (
          <Window
            key={`${row}-${column}`}
            x={3 + column * 5}
            y={5 + row * 7}
            lit={index % 3 === 0 || stage >= 2}
          />
        )
      })}
    </g>
  )
}

export function BuildingIllustration({
  type,
  stage,
  color,
  status = "active",
  size = 34,
  label,
}: BuildingIllustrationProps) {
  const opacity = status === "archived" ? 0.55 : status === "paused" ? 0.7 : 1
  const common = {
    "--building": `var(--city-${color})`,
    "--building-shadow": "color-mix(in srgb, var(--building) 45%, var(--foreground))",
    "--building-light": "color-mix(in srgb, var(--building) 35%, var(--primary-foreground))",
  } as CSSProperties

  if (stage === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 34 34" role="img" aria-label={label ?? "Foundation plot"} style={common}>
        <rect x="5" y="17" width="24" height="10" rx="2" fill="none" stroke="var(--building)" strokeWidth="1.5" strokeDasharray="2 2" opacity={opacity} />
        <path d="M9 22h16M12 18v9M22 18v9" stroke="var(--building)" strokeWidth="0.8" opacity={opacity * 0.7} />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 34 34" role="img" aria-label={label ?? `${type} building`} style={{ ...common, opacity }}>
      {type === "park" && (
        <g>
          <path d="M4 27c5-3 8-2 13 0 6-3 9-2 13 0v3H4Z" fill="var(--building)" opacity="0.35" />
          <circle cx="12" cy="15" r="6" fill="var(--building)" />
          <circle cx="22" cy="12" r="7" fill="var(--building)" opacity="0.82" />
          <path d="M12 18v10M22 16v12" stroke="var(--building-shadow)" strokeWidth="1.5" />
          {stage >= 2 && <circle cx="27" cy="24" r="1.5" fill="var(--building-light)" />}
        </g>
      )}
      {type === "library" && (
        <g>
          <path d="M4 12 17 5l13 7v17H4Z" fill="var(--building)" />
          <path d="M3 12h28" stroke="var(--building-shadow)" strokeWidth="1.4" />
          <path d="M7 15v13M12 15v13M22 15v13M27 15v13" stroke="var(--building-shadow)" strokeWidth="1.2" />
          <Windows rows={2} columns={4} stage={stage} />
          {stage >= 2 && <path d="M5 30h24" stroke="var(--building-light)" strokeWidth="1.2" />}
        </g>
      )}
      {type === "workshop" && (
        <g>
          <path d="M4 13 17 6l13 7v16H4Z" fill="var(--building)" />
          <path d="M4 13h26" stroke="var(--building-shadow)" strokeWidth="1.4" />
          <rect x="10" y="18" width="14" height="11" rx="1" fill="var(--building-shadow)" opacity="0.7" />
          <Windows rows={1} columns={3} stage={stage} />
          {stage >= 2 && <path d="m26 8 3-4M28 9l4-2" stroke="var(--building-light)" strokeWidth="1" />}
        </g>
      )}
      {type === "bridge" && (
        <g>
          <path d="M2 25h30" stroke="var(--building)" strokeWidth="4" />
          <path d="M5 25c2-13 22-13 24 0" fill="none" stroke="var(--building)" strokeWidth="3" />
          <path d="M7 19 5 12M27 19l2-7M11 15l-1-7M23 15l1-7" stroke="var(--building-shadow)" strokeWidth="1" />
          {stage >= 2 && <circle cx="17" cy="7" r="1.5" fill="var(--building-light)" />}
        </g>
      )}
      {type === "tower" && (
        <g>
          <path d="M9 30h16L22 7h-10Z" fill="var(--building)" />
          <path d="M10 8h14M8 30h18" stroke="var(--building-shadow)" strokeWidth="1.4" />
          <Windows rows={3} columns={2} stage={stage} />
          {stage >= 2 && <path d="M13 5h8" stroke="var(--building-light)" strokeWidth="2" />}
        </g>
      )}
      {type === "lighthouse" && (
        <g>
          <path d="M10 30h14l-2-18h-10Z" fill="var(--building)" />
          <path d="M9 12h16l-2-4H11Z" fill="var(--building-shadow)" />
          <circle cx="17" cy="6" r="3" fill="var(--building-light)" opacity={stage >= 2 ? 1 : 0.55} />
          <path d="M17 3V1M8 7 5 5M26 7l3-2" stroke="var(--building-light)" strokeWidth="1" opacity={stage >= 2 ? 1 : 0.45} />
          <Windows rows={2} columns={2} stage={stage} />
        </g>
      )}
    </svg>
  )
}
