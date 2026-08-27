import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"
export const dynamic = "force-static"

export default function AppleIcon() {
  return new ImageResponse(
    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="16" fill="#171717" />
      <path d="M10 50h44" fill="none" stroke="#a3a3a3" strokeLinecap="round" strokeWidth="2" />
      <path d="M12 48V30l10-8v26H12ZM27 48V17l10-7v38H27ZM42 48V27l10-6v27H42Z" fill="#fff" />
      <path d="M16 35h3m-3 6h3m12-19h3m-3 7h3m12 4h3m-3 6h3" fill="none" stroke="#171717" strokeLinecap="round" strokeWidth="2" />
      <path d="M12 21c8 0 15-3 22-9 7-5 13-5 19-2" fill="none" stroke="#a3a3a3" strokeLinecap="round" strokeWidth="2" />
      <circle cx="52" cy="10" r="3" fill="#fff" />
    </svg>,
    size,
  )
}
