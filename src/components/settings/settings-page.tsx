"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { AlertTriangle, Download, Laptop, Moon, RotateCcw, Sun, Upload } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { createBackup, getBackupSummary, parseBackupText, serializeBackup } from "@/lib/backup"
import { useCityStore } from "@/stores/city-store"
import type { CityBackupV2, MotionMode, ThemeMode } from "@/types/city"

const APP_VERSION = "0.0.1"

export function SettingsPage() {
  const { habits, checkIns, reflections, preferences, hydrated, hydrate, setPreferences, resetCity, replaceFromBackup } = useCityStore()
  const { setTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingBackup, setPendingBackup] = useState<CityBackupV2 | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    if (!hydrated) void hydrate()
  }, [hydrate, hydrated])

  useEffect(() => {
    if (hydrated) setTheme(preferences.theme)
  }, [hydrated, preferences.theme, setTheme])

  async function updateTheme(theme: ThemeMode) {
    setTheme(theme)
    await setPreferences({ theme })
  }

  async function updateMotion(motion: MotionMode) {
    await setPreferences({ motion })
  }

  function downloadBackup() {
    const backup = createBackup({ habits, checkIns, reflections, preferences }, APP_VERSION)
    const blob = new Blob([serializeBackup(backup)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `city-of-habits-${backup.exportedAt.slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success("Your city backup is ready to download.")
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setImportError(null)
    try {
      const backup = parseBackupText(await file.text())
      setPendingBackup(backup)
    } catch {
      setImportError("That file could not be read as a supported City of Habits backup. Your current city is unchanged.")
    }
  }

  async function confirmImport() {
    if (!pendingBackup) return
    setIsImporting(true)
    try {
      await replaceFromBackup(pendingBackup)
      setPendingBackup(null)
      toast.success("Your city was restored.")
    } catch {
      toast.error("The backup could not be restored. Your current city is unchanged.")
    } finally {
      setIsImporting(false)
    }
  }

  if (!hydrated) return <SettingsSkeleton />

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:px-6 sm:py-9 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <header><p className="text-sm font-medium text-primary">The city charter</p><h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-6xl">Settings</h1><p className="mt-3 max-w-xl text-sm text-muted-foreground">Shape the atmosphere, keep a copy, and decide how much motion feels right. Everything here stays on this device.</p></header>

        <div className="mt-8 flex flex-col gap-5">
          <Card><CardHeader><CardTitle>Atmosphere</CardTitle><CardDescription>Choose how City of Habits follows your device theme, or set a mode explicitly.</CardDescription></CardHeader><CardContent><FieldGroup><FieldSet><FieldLegend>Theme</FieldLegend><FieldDescription>Theme selection is saved with your local city preferences.</FieldDescription><ToggleGroup value={[preferences.theme]} onValueChange={(values) => { const next = values[0] as ThemeMode | undefined; if (next) void updateTheme(next) }} variant="outline" spacing={0} aria-label="Choose city theme"><ToggleGroupItem value="light"><Sun data-icon="inline-start" />Light</ToggleGroupItem><ToggleGroupItem value="dark"><Moon data-icon="inline-start" />Dark</ToggleGroupItem><ToggleGroupItem value="system"><Laptop data-icon="inline-start" />System</ToggleGroupItem></ToggleGroup></FieldSet><Field orientation="horizontal"><FieldContent><FieldLabel htmlFor="quiet-mode">Quiet mode</FieldLabel><FieldDescription>Remove celebratory effects and ambient prompts while keeping every action available.</FieldDescription></FieldContent><Switch id="quiet-mode" checked={preferences.quietMode} onCheckedChange={(checked) => void setPreferences({ quietMode: checked })} /></Field><Field orientation="horizontal"><FieldContent><FieldLabel htmlFor="sound-enabled">Ambient sound</FieldLabel><FieldDescription>Optional sound texture. It is off by default and never starts without your choice.</FieldDescription></FieldContent><Switch id="sound-enabled" checked={preferences.soundEnabled} onCheckedChange={(checked) => void setPreferences({ soundEnabled: checked })} /></Field></FieldGroup></CardContent></Card>

          <Card><CardHeader><CardTitle>Motion</CardTitle><CardDescription>Animations are calm by default and respect your preference.</CardDescription></CardHeader><CardContent><FieldSet><FieldLegend>Motion preference</FieldLegend><ToggleGroup value={[preferences.motion]} onValueChange={(values) => { const next = values[0] as MotionMode | undefined; if (next) void updateMotion(next) }} variant="outline" spacing={0} aria-label="Choose motion preference"><ToggleGroupItem value="system">System</ToggleGroupItem><ToggleGroupItem value="reduced">Reduced</ToggleGroupItem><ToggleGroupItem value="full">Full</ToggleGroupItem></ToggleGroup></FieldSet></CardContent></Card>

          <Card><CardHeader><CardTitle>Backup and portability</CardTitle><CardDescription>Export a readable JSON copy, or replace this city with a previously exported one.</CardDescription></CardHeader><CardContent className="flex flex-col gap-4"><div className="flex flex-wrap gap-3"><Button onClick={downloadBackup}><Download data-icon="inline-start" />Export city</Button><Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload data-icon="inline-start" />Import city</Button><Input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={(event) => void handleImportFile(event)} /></div>{importError && <Alert variant="destructive"><AlertTriangle /><AlertTitle>Import not accepted</AlertTitle><AlertDescription>{importError}</AlertDescription></Alert>}<p className="text-xs text-muted-foreground">{habits.length} habits · {checkIns.length} check-ins · {reflections.length} reflections</p></CardContent></Card>

          <Card><CardHeader><CardTitle>Reset this city</CardTitle><CardDescription>Use this only if you want to start over. Export a backup first if there is anything you want to keep.</CardDescription></CardHeader><CardContent><AlertDialog><AlertDialogTrigger render={<Button variant="outline" />}><RotateCcw data-icon="inline-start" />Reset all local data</AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Clear this city?</AlertDialogTitle><AlertDialogDescription>This permanently removes habits, check-ins, reflections, and preferences from this browser. A downloaded backup is the only way to restore them.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep my city</AlertDialogCancel><AlertDialogAction onClick={() => void resetCity().then(() => toast.success("A fresh city is ready."))}>Clear local data</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></CardContent></Card>
        </div>
      </div>

      <AlertDialog open={Boolean(pendingBackup)} onOpenChange={(open) => { if (!open && !isImporting) setPendingBackup(null) }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Replace this city with the backup?</AlertDialogTitle><AlertDialogDescription>{pendingBackup ? (() => { const summary = getBackupSummary(pendingBackup); return `This backup contains ${summary.habits} habit${summary.habits === 1 ? "" : "s"}, ${summary.checkIns} check-ins, and ${summary.reflections} reflection${summary.reflections === 1 ? "" : "s"}. Your current city will be replaced in one transaction.` })() : ""}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isImporting}>Cancel</AlertDialogCancel><AlertDialogAction disabled={isImporting} onClick={() => void confirmImport()}>{isImporting ? "Restoring..." : "Replace city"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  )
}

function SettingsSkeleton() {
  return <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-6 p-6 sm:p-10"><Skeleton className="h-3 w-32" /><Skeleton className="h-14 w-64 max-w-full" /><Skeleton className="h-56 w-full" /><Skeleton className="h-48 w-full" /></div>
}
