"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

import { HabitWizard, type HabitWizardProps } from "@/components/habit/habit-wizard"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCityStore } from "@/stores/city-store"
import type { Habit } from "@/types/city"

interface HabitCreationContextValue {
  isCreateHabitOpen: boolean
  openCreateHabit: () => void
  closeCreateHabit: () => void
}

const HabitCreationContext = createContext<HabitCreationContextValue | null>(null)

export function HabitCreationProvider({ children }: { children: React.ReactNode }) {
  const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false)
  const openCreateHabit = useCallback(() => setIsCreateHabitOpen(true), [])
  const closeCreateHabit = useCallback(() => setIsCreateHabitOpen(false), [])
  const value = useMemo(
    () => ({ isCreateHabitOpen, openCreateHabit, closeCreateHabit }),
    [closeCreateHabit, isCreateHabitOpen, openCreateHabit],
  )

  return <HabitCreationContext.Provider value={value}>{children}</HabitCreationContext.Provider>
}

export function useHabitCreation() {
  const context = useContext(HabitCreationContext)
  if (!context) {
    throw new Error("useHabitCreation must be used within a HabitCreationProvider.")
  }
  return context
}

export interface HabitCreationDialogProps {
  onCreate?: HabitWizardProps["onCreate"]
  onCreated?: (habit: Habit) => void | Promise<void>
}

export function HabitCreationDialog({ onCreate, onCreated }: HabitCreationDialogProps) {
  const { isCreateHabitOpen, closeCreateHabit } = useHabitCreation()
  const addHabit = useCityStore((state) => state.addHabit)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDiscardOpen, setIsDiscardOpen] = useState(false)
  const [wizardKey, setWizardKey] = useState(0)

  const finishClose = useCallback(() => {
    setIsDiscardOpen(false)
    setIsDirty(false)
    closeCreateHabit()
    setWizardKey((key) => key + 1)
  }, [closeCreateHabit])

  const requestClose = useCallback(() => {
    if (isSaving) return
    if (isDirty) {
      setIsDiscardOpen(true)
      return
    }
    finishClose()
  }, [finishClose, isDirty, isSaving])

  const handleCreated = useCallback(
    async (habit: Habit) => {
      await onCreated?.(habit)
      finishClose()
    },
    [finishClose, onCreated],
  )

  return (
    <>
      <Dialog
        open={isCreateHabitOpen}
        onOpenChange={(open) => {
          if (!open) requestClose()
        }}
      >
        <DialogContent
          className="max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] overflow-hidden p-0 sm:max-h-[calc(100dvh-3rem)] sm:max-w-3xl"
          showCloseButton
        >
          <DialogTitle className="sr-only">Build a habit</DialogTitle>
          <DialogDescription className="sr-only">
            Create a local habit foundation in three steps.
          </DialogDescription>
          <HabitWizard
            key={wizardKey}
            onCreate={onCreate ?? addHabit}
            onCreated={handleCreated}
            onCancel={requestClose}
            onDirtyChange={setIsDirty}
            onSavingChange={setIsSaving}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDiscardOpen} onOpenChange={setIsDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this foundation?</AlertDialogTitle>
            <AlertDialogDescription>
              Your unfinished habit will be cleared from this form. Nothing has been saved yet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={finishClose}>Discard draft</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
