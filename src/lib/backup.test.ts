import { describe, expect, it } from "vitest"

import { createBackup, getBackupSummary, parseBackupText } from "@/lib/backup"
import { defaultPreferences } from "@/lib/db"

const baseBackup = {
  exportedAt: "2026-08-27T00:00:00.000Z",
  appVersion: "0.0.1",
  habits: [],
  checkIns: [],
  reflections: [],
}

const v1Backup = {
  ...baseBackup,
  schemaVersion: 1 as const,
  preferences: {
    ...defaultPreferences(),
    theme: "paper" as const,
  },
}

describe("city backup portability", () => {
  it("creates and parses a version 2 backup", () => {
    const backup = createBackup({ ...baseBackup, preferences: defaultPreferences() }, "0.0.1")
    const parsed = parseBackupText(JSON.stringify(backup))
    expect(parsed.schemaVersion).toBe(2)
    expect(parsed.preferences.theme).toBe("system")
    expect(getBackupSummary(parsed)).toEqual({ habits: 0, checkIns: 0, reflections: 0, exportedAt: backup.exportedAt })
  })

  it("migrates version 1 paper and night themes", () => {
    expect(parseBackupText(JSON.stringify(v1Backup)).preferences.theme).toBe("light")
    expect(parseBackupText(JSON.stringify({ ...v1Backup, preferences: { ...v1Backup.preferences, theme: "night" } })).preferences.theme).toBe("dark")
  })

  it("rejects unsupported schema versions and malformed records", () => {
    expect(() => parseBackupText(JSON.stringify({ ...v1Backup, schemaVersion: 3 }))).toThrow()
    expect(() => parseBackupText(JSON.stringify({ ...v1Backup, preferences: { ...v1Backup.preferences, theme: "system" } }))).toThrow()
    expect(() => parseBackupText("not json")).toThrow()
  })
})
