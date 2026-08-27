import { describe, expect, it } from "vitest"

import { getBackupSummary, parseBackupText } from "@/lib/backup"

const validBackup = {
  schemaVersion: 1,
  exportedAt: "2026-08-27T00:00:00.000Z",
  appVersion: "0.0.1",
  habits: [],
  checkIns: [],
  reflections: [],
  preferences: {
    id: "default",
    theme: "paper",
    quietMode: false,
    soundEnabled: false,
    motion: "system",
    hasSeenWelcome: false,
    updatedAt: "2026-08-27T00:00:00.000Z",
  },
}

describe("city backup portability", () => {
  it("accepts a versioned backup and summarizes its contents", () => {
    const backup = parseBackupText(JSON.stringify(validBackup))
    expect(getBackupSummary(backup)).toEqual({ habits: 0, checkIns: 0, reflections: 0, exportedAt: validBackup.exportedAt })
  })

  it("rejects unsupported schema versions and malformed records", () => {
    expect(() => parseBackupText(JSON.stringify({ ...validBackup, schemaVersion: 2 }))).toThrow()
    expect(() => parseBackupText(JSON.stringify({ ...validBackup, preferences: { ...validBackup.preferences, theme: "system" } }))).toThrow()
  })
})
