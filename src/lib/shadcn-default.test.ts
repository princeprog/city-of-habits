import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const globalsPath = path.join(projectRoot, "src/app/globals.css")

describe("default shadcn conformance", () => {
  it("keeps globals.css limited to the neutral Base Nova token layer", () => {
    const globals = fs.readFileSync(globalsPath, "utf8")
    const forbiddenTokens = [
      "font-editorial",
      "font-label",
      "paper-grain",
      "city-grid",
      "--city-",
      "--district-",
      "--map-",
    ]

    expect(globals).toContain('@import "shadcn/tailwind.css"')
    expect(globals).toContain("--radius: 0.625rem")
    expect(globals).toContain("--chart-1:")
    expect(globals).toContain("--sidebar:")
    expect(globals).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    for (const token of forbiddenTokens) expect(globals).not.toContain(token)
  })

  it("keeps product source free of removed custom global classes and variables", () => {
    const sourceRoots = [path.join(projectRoot, "src/app"), path.join(projectRoot, "src/components")]
    const sourceFiles = sourceRoots.flatMap((root) => collectSourceFiles(root))
    const forbiddenTokens = ["font-editorial", "font-label", "paper-grain", "city-grid", "--city-", "--district-", "--map-"]

    for (const file of sourceFiles) {
      const source = fs.readFileSync(file, "utf8")
      for (const token of forbiddenTokens) expect(source, file).not.toContain(token)
    }
  })
})

function collectSourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return collectSourceFiles(entryPath)
    return /\.(css|ts|tsx)$/.test(entry.name) ? [entryPath] : []
  })
}
