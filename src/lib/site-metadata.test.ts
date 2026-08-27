import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")

describe("site identity", () => {
  it("uses the cityofhabits.vercel.app canonical domain everywhere", () => {
    const metadataFiles = ["src/app/layout.tsx", "src/app/page.tsx", "src/app/robots.ts", "src/app/sitemap.ts", "README.md"]
    for (const relativePath of metadataFiles) {
      const source = fs.readFileSync(path.join(projectRoot, relativePath), "utf8")
      expect(source, relativePath).toContain("https://cityofhabits.vercel.app")
      expect(source, relativePath).not.toContain("https://city-of-habits.vercel.app")
    }
  })

  it("ships one brand mark for favicon, Apple touch, navigation, and PWA icons", () => {
    const brandMark = fs.readFileSync(path.join(projectRoot, "public/brand-mark.svg"), "utf8")
    const appIcon = fs.readFileSync(path.join(projectRoot, "src/app/icon.svg"), "utf8")
    const appleIcon = fs.readFileSync(path.join(projectRoot, "src/app/apple-icon.tsx"), "utf8")

    expect(brandMark).toContain("City of Habits")
    expect(appIcon).toContain("City of Habits")
    expect(appleIcon).toContain("contentType = \"image/png\"")
    for (const filename of ["city-192.svg", "city-512.svg", "city-maskable.svg"]) {
      expect(fs.readFileSync(path.join(projectRoot, "public/icons", filename), "utf8"), filename).toContain("#171717")
    }
  })
})
