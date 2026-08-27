"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { BuildingIllustration } from "@/components/city/building-illustration"
import { Badge } from "@/components/ui/badge"
import { buttonVariants, Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { buildingCatalog, colorTokens, districtCatalog } from "@/lib/city/catalog"
import { cn } from "@/lib/utils"
import { useCityStore } from "@/stores/city-store"
import type { BuildingType } from "@/types/city"

const formSchema = z.object({
  name: z.string().trim().min(2, "Give the habit a name.").max(80, "Keep the name under 80 characters."),
  district: z.enum(["body", "mind", "creative", "connection", "work", "recovery"]),
  buildingType: z.enum(["park", "library", "workshop", "bridge", "tower", "lighthouse"]),
  targetPerWeek: z.number().int().min(1).max(7),
  colorToken: z.enum(["coral", "teal", "gold", "sky", "moss", "blue"]),
  intention: z.string().trim().max(240, "Keep the intention under 240 characters.").optional(),
})

type HabitFormValues = z.infer<typeof formSchema>

const districtItems = [
  { label: "Choose a district", value: null },
  ...Object.entries(districtCatalog).map(([value, district]) => ({ label: district.name, value })),
]

const colorItems = colorTokens.map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value }))

export function HabitForm() {
  const router = useRouter()
  const addHabit = useCityStore((state) => state.addHabit)
  const [isSaving, setIsSaving] = useState(false)
  const form = useForm<HabitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      district: "mind",
      buildingType: "library",
      targetPerWeek: 4,
      colorToken: "sky",
      intention: "",
    },
  })
  const district = useWatch({ control: form.control, name: "district" })
  const buildingType = useWatch({ control: form.control, name: "buildingType" })
  const colorToken = useWatch({ control: form.control, name: "colorToken" })
  const target = useWatch({ control: form.control, name: "targetPerWeek" })
  const name = useWatch({ control: form.control, name: "name" })

  async function onSubmit(values: HabitFormValues) {
    setIsSaving(true)
    try {
      const habit = await addHabit(values)
      toast.success("A new foundation is ready.", { description: `${habit.name} now has a place in your city.` })
      router.push(`/habit?id=${habit.id}`)
    } catch {
      toast.error("The foundation could not be saved.", { description: "Try again, or check that browser storage is available." })
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <Card>
          <CardHeader>
            <Link href="/city" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 w-fit")}><ArrowLeft data-icon="inline-start" />Back to the city</Link>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <CardDescription>Build a foundation</CardDescription>
                <CardTitle className="mt-2 text-4xl">Give a habit a place to live.</CardTitle>
                <CardDescription className="mt-3 max-w-xl">Name one repeated action. The city will take care of the rest, one small detail at a time.</CardDescription>
              </div>
              <Badge variant="outline" className="hidden gap-2 sm:flex"><Sparkles />2 min setup</Badge>
            </div>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FieldGroup>
                <Field data-invalid={Boolean(form.formState.errors.name)}>
                  <FieldLabel htmlFor="habit-name">What do you want to repeat?</FieldLabel>
                  <Input id="habit-name" placeholder="Read for 20 minutes" aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
                  <FieldDescription>Use the words you would say to yourself, not a score.</FieldDescription>
                  <FieldError errors={[form.formState.errors.name]} />
                </Field>

                <Field data-invalid={Boolean(form.formState.errors.district)}>
                  <FieldLabel htmlFor="habit-district">Where does it belong?</FieldLabel>
                  <Controller name="district" control={form.control} render={({ field, fieldState }) => <>
                    <Select items={districtItems} value={field.value} onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger id="habit-district" aria-invalid={fieldState.invalid} className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}><SelectGroup>{districtItems.filter((item) => item.value).map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup></SelectContent>
                    </Select>
                    <FieldDescription>{districtCatalog[district].description}</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </>} />
                </Field>

                <Field data-invalid={Boolean(form.formState.errors.buildingType)}>
                  <FieldLabel>What should it become?</FieldLabel>
                  <Controller name="buildingType" control={form.control} render={({ field, fieldState }) => <>
                    <ToggleGroup value={[field.value]} onValueChange={(value) => value[0] && field.onChange(value[0])} variant="outline" spacing={2} className="grid w-full grid-cols-2 sm:grid-cols-3">
                      {Object.entries(buildingCatalog).map(([value, building]) => <ToggleGroupItem key={value} value={value} aria-label={building.name}><BuildingIllustration type={value as BuildingType} stage={2} color={colorToken} size={30} /><span>{building.name}</span></ToggleGroupItem>)}
                    </ToggleGroup>
                    <FieldDescription>{buildingCatalog[buildingType].description}</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </>} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="habit-target">How often would feel supportive?</FieldLabel>
                  <div className="flex items-center justify-between gap-4"><span className="text-sm text-muted-foreground">A flexible weekly intention</span><Badge variant="secondary">{target} {target === 1 ? "time" : "times"}</Badge></div>
                  <Controller name="targetPerWeek" control={form.control} render={({ field }) => <Slider id="habit-target" min={1} max={7} step={1} value={[field.value]} onValueChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)} aria-label="Target times per week" />} />
                  <div className="flex justify-between text-sm text-muted-foreground"><span>Once is enough</span><span>Every day</span></div>
                  <FieldDescription>It is a direction, not a grade.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="habit-color">Choose a city color</FieldLabel>
                  <Controller name="colorToken" control={form.control} render={({ field }) => <Select items={colorItems} value={field.value} onValueChange={(value) => field.onChange(value)}>
                    <SelectTrigger id="habit-color" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}><SelectGroup>{colorItems.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup></SelectContent>
                  </Select>} />
                  <FieldDescription>This is how you will recognize the building at a glance.</FieldDescription>
                </Field>

                <Field data-invalid={Boolean(form.formState.errors.intention)}>
                  <FieldLabel htmlFor="habit-intention">Optional intention</FieldLabel>
                  <Textarea id="habit-intention" placeholder="Make a little room for ideas every day." className="min-h-24 resize-none" aria-invalid={Boolean(form.formState.errors.intention)} {...form.register("intention")} />
                  <FieldDescription>A short note can make the building feel like yours.</FieldDescription>
                  <FieldError errors={[form.formState.errors.intention]} />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="justify-between gap-3">
              <Link href="/city" className={buttonVariants({ variant: "ghost" })}>Cancel</Link>
              <Button type="submit" size="lg" disabled={isSaving}>{isSaving ? "Placing foundation..." : "Place the foundation"}<ArrowRight data-icon="inline-end" /></Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="sticky top-20">
          <CardHeader>
            <CardDescription>A glimpse of the future</CardDescription>
            <CardTitle className="text-3xl">{name || "Your next building"}</CardTitle>
            <CardDescription>{districtCatalog[district].name} district · {buildingCatalog[buildingType].name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-48 items-center justify-center"><BuildingIllustration type={buildingType} stage={2} color={colorToken} size={132} /></div>
            <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground"><span>First stage</span><span>0 check-ins</span></div>
            <Progress value={33} aria-label="First stage progress" className="mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
