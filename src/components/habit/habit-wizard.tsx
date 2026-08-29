"use client"

import { useEffect, useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { BuildingIllustration } from "@/components/city/building-illustration"
import {
  habitCreationBuildingItems,
  habitCreationColorItems,
  habitCreationDefaults,
  habitCreationDistrictItems,
  habitCreationSchema,
  type HabitCreationValues,
} from "@/components/habit/habit-creation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { buildingCatalog, districtCatalog } from "@/lib/city/catalog"
import { cn } from "@/lib/utils"
import type { Habit } from "@/types/city"

const steps = [
  {
    title: "Name the habit.",
    description: "Start with one repeatable action you want to make room for.",
  },
  {
    title: "Choose its place.",
    description: "Give the habit a district and a building that feels like it.",
  },
  {
    title: "Set a supportive rhythm.",
    description: "Choose a weekly direction, then place the foundation.",
  },
] as const

const stepFields: Array<Array<keyof HabitCreationValues>> = [
  ["name", "intention"],
  ["district", "buildingType", "colorToken"],
  ["targetPerWeek"],
]

export interface HabitWizardProps {
  onCreate: (values: HabitCreationValues) => Promise<Habit>
  onCreated?: (habit: Habit) => void | Promise<void>
  onCancel: () => void
  onDirtyChange?: (dirty: boolean) => void
  onSavingChange?: (saving: boolean) => void
  scrollable?: boolean
}

export function HabitWizard({
  onCreate,
  onCreated,
  onCancel,
  onDirtyChange,
  onSavingChange,
  scrollable = false,
}: HabitWizardProps) {
  const [step, setStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const form = useForm<HabitCreationValues>({
    resolver: zodResolver(habitCreationSchema),
    defaultValues: habitCreationDefaults,
    mode: "onTouched",
  })
  const district = useWatch({ control: form.control, name: "district" })
  const buildingType = useWatch({ control: form.control, name: "buildingType" })
  const colorToken = useWatch({ control: form.control, name: "colorToken" })
  const target = useWatch({ control: form.control, name: "targetPerWeek" })
  const name = useWatch({ control: form.control, name: "name" })

  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty)
  }, [form.formState.isDirty, onDirtyChange])

  function focusStepHeading() {
    window.requestAnimationFrame(() => headingRef.current?.focus())
  }

  async function goNext() {
    const valid = await form.trigger(stepFields[step], { shouldFocus: true })
    if (!valid) return
    setStep((current) => Math.min(current + 1, steps.length - 1))
    focusStepHeading()
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0))
    focusStepHeading()
  }

  async function onSubmit(values: HabitCreationValues) {
    setIsSaving(true)
    onSavingChange?.(true)
    try {
      const habit = await onCreate(values)
      toast.success("A new foundation is ready.", {
        description: `${habit.name} now has a place in your city.`,
      })
      await onCreated?.(habit)
      setIsSaving(false)
      onSavingChange?.(false)
    } catch {
      toast.error("The foundation could not be saved.", {
        description: "Try again, or check that browser storage is available.",
      })
      setIsSaving(false)
      onSavingChange?.(false)
    }
  }

  const stepContent = (
    <>
      {step === 0 && <IdentityStep form={form} />}
      {step === 1 && (
        <PlacementStep
          form={form}
          district={district}
          buildingType={buildingType}
          colorToken={colorToken}
        />
      )}
      {step === 2 && (
        <RhythmStep
          form={form}
          target={target}
          name={name}
          district={district}
          buildingType={buildingType}
          colorToken={colorToken}
        />
      )}
    </>
  )

  return (
    <div
      className="flex min-h-0 flex-col"
      data-habit-wizard
      data-habit-step={step + 1}
      data-habit-saving={isSaving || undefined}
    >
      <div className="flex flex-col gap-4 border-b px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4 pr-8">
          <div>
            <Badge variant="outline" className="gap-2">
              <Sparkles data-icon="inline-start" />
              Build a foundation
            </Badge>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="mt-3 text-xl font-semibold tracking-tight outline-none sm:text-2xl"
            >
              {steps[step].title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {steps[step].description}
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium text-muted-foreground">
            Step {step + 1} of {steps.length}
          </span>
        </div>
        <Progress
          value={((step + 1) / steps.length) * 100}
          aria-label={`Step ${step + 1} of ${steps.length}`}
        />
        <ol className="grid grid-cols-3 gap-2" aria-label="Habit creation steps">
          {steps.map((item, index) => (
            <li
              key={item.title}
              className={cn(
                "flex items-center gap-2 text-xs text-muted-foreground",
                index === step && "font-medium text-foreground",
              )}
              aria-current={index === step ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px]",
                  index < step && "border-primary bg-primary text-primary-foreground",
                  index === step && "border-primary text-primary",
                )}
              >
                {index < step ? <Check aria-hidden="true" /> : index + 1}
              </span>
              <span className="hidden truncate sm:inline">{item.title.replace(".", "")}</span>
            </li>
          ))}
        </ol>
      </div>

      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {scrollable ? (
          <ScrollArea className="min-h-0 flex-1">
            <div className="px-4 py-5 sm:px-6 sm:py-6">{stepContent}</div>
          </ScrollArea>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
            {stepContent}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t bg-muted/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSaving}
          >
            {step === 0 ? "Cancel" : "Cancel setup"}
          </Button>
          <div className="flex gap-2 sm:ml-auto">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={goBack} disabled={isSaving}>
                <ArrowLeft data-icon="inline-start" />
                Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button type="button" onClick={() => void goNext()} disabled={isSaving}>
                Next
                <ArrowRight data-icon="inline-end" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Spinner /> : "Place the foundation"}
                {!isSaving && <ArrowRight data-icon="inline-end" />}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

function IdentityStep({ form }: { form: ReturnType<typeof useForm<HabitCreationValues>> }) {
  return (
    <FieldSet>
      <FieldLegend>Make it recognizable</FieldLegend>
      <FieldDescription>
        Use the words you would say to yourself, not a score.
      </FieldDescription>
      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.name)}>
          <FieldLabel htmlFor="habit-name">What do you want to repeat?</FieldLabel>
          <Input
            id="habit-name"
            autoFocus
            placeholder="Read for 20 minutes"
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register("name")}
          />
          <FieldDescription>A clear, short action is easier to return to.</FieldDescription>
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.intention)}>
          <FieldLabel htmlFor="habit-intention">Optional intention</FieldLabel>
          <Textarea
            id="habit-intention"
            placeholder="Make a little room for ideas every day."
            className="min-h-28 resize-none"
            aria-invalid={Boolean(form.formState.errors.intention)}
            {...form.register("intention")}
          />
          <FieldDescription>
            A short note can make the building feel like yours.
          </FieldDescription>
          <FieldError errors={[form.formState.errors.intention]} />
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

function PlacementStep({
  form,
  district,
  buildingType,
  colorToken,
}: {
  form: ReturnType<typeof useForm<HabitCreationValues>>
  district: HabitCreationValues["district"]
  buildingType: HabitCreationValues["buildingType"]
  colorToken: HabitCreationValues["colorToken"]
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start">
      <FieldSet>
        <FieldLegend>Shape the city block</FieldLegend>
        <FieldDescription>
          These choices are a visual home for the habit and can be changed later.
        </FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="habit-district">Where does it belong?</FieldLabel>
            <Controller
              name="district"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Select
                    items={habitCreationDistrictItems}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger id="habit-district" aria-invalid={fieldState.invalid}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {habitCreationDistrictItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>{districtCatalog[district].description}</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </>
              )}
            />
          </Field>

          <Field>
            <FieldLabel>What should it become?</FieldLabel>
            <Controller
              name="buildingType"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <ToggleGroup
                    value={[field.value]}
                    onValueChange={(value) => value[0] && field.onChange(value[0])}
                    variant="outline"
                    spacing={2}
                    className="grid w-full grid-cols-2 sm:grid-cols-3"
                  >
                    {habitCreationBuildingItems.map((item) => (
                      <ToggleGroupItem key={item.value} value={item.value} aria-label={item.label}>
                        <BuildingIllustration
                          type={item.value}
                          stage={2}
                          color={colorToken}
                          size={30}
                        />
                        <span>{item.label}</span>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <FieldDescription>{buildingCatalog[buildingType].description}</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </>
              )}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="habit-color">Choose a city color</FieldLabel>
            <Controller
              name="colorToken"
              control={form.control}
              render={({ field }) => (
                <Select
                  items={habitCreationColorItems}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger id="habit-color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {habitCreationColorItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldDescription>This is how you will recognize the building at a glance.</FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardDescription>A glimpse of the future</CardDescription>
          <CardTitle className="truncate">Your next building</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-36 items-center justify-center rounded-lg bg-background/70">
            <BuildingIllustration type={buildingType} stage={2} color={colorToken} size={112} />
          </div>
          <p className="mt-4 text-sm font-medium">{districtCatalog[district].name} district</p>
          <p className="mt-1 text-sm text-muted-foreground">{buildingCatalog[buildingType].name}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function RhythmStep({
  form,
  target,
  name,
  district,
  buildingType,
  colorToken,
}: {
  form: ReturnType<typeof useForm<HabitCreationValues>>
  target: HabitCreationValues["targetPerWeek"]
  name: string
  district: HabitCreationValues["district"]
  buildingType: HabitCreationValues["buildingType"]
  colorToken: HabitCreationValues["colorToken"]
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <FieldSet>
        <FieldLegend>Choose a rhythm you can return to</FieldLegend>
        <FieldDescription>
          A weekly direction is a support, not a grade.
        </FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="habit-target">How often would feel supportive?</FieldLabel>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Weekly intention</span>
              <Badge variant="secondary">
                {target} {target === 1 ? "time" : "times"}
              </Badge>
            </div>
            <Controller
              name="targetPerWeek"
              control={form.control}
              render={({ field }) => (
                <Slider
                  id="habit-target"
                  min={1}
                  max={7}
                  step={1}
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                  aria-label="Target times per week"
                />
              )}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Once is enough</span>
              <span>Every day</span>
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>

      <Card>
        <CardHeader>
          <CardDescription>Ready to place</CardDescription>
          <CardTitle className="truncate">{name || "Your new habit"}</CardTitle>
          <CardDescription>
            {districtCatalog[district].name} · {buildingCatalog[buildingType].name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-lg bg-muted/40 py-4">
            <BuildingIllustration type={buildingType} stage={2} color={colorToken} size={92} />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>First stage</span>
            <span>0 check-ins</span>
          </div>
          <Progress value={33} aria-label="First stage progress" className="mt-2" />
        </CardContent>
      </Card>
    </div>
  )
}
