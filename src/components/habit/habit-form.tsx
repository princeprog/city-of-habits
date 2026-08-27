"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Palette, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { BuildingIllustration } from "@/components/city/building-illustration"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { buildingCatalog, colorTokens, districtCatalog } from "@/lib/city/catalog"
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
    <div className="paper-grain min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <Card className="bg-card/85">
          <CardHeader className="border-b">
            <Button variant="ghost" size="sm" className="-ml-2 w-fit" render={<Link href="/city" />} nativeButton={false}><ArrowLeft data-icon="inline-start" />Back to the city</Button>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div><p className="font-label text-[0.6rem] text-primary">Build a foundation</p><CardTitle className="font-editorial mt-2 text-4xl tracking-[-0.04em]">Give a habit a place to live.</CardTitle><CardDescription className="mt-3 max-w-xl text-base leading-relaxed">Name one repeated action. The city will take care of the rest, one small detail at a time.</CardDescription></div>
              <Badge variant="outline" className="hidden gap-2 rounded-full sm:flex"><Sparkles />2 min setup</Badge>
            </div>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="pt-7">
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
                      {Object.entries(buildingCatalog).map(([value, building]) => <ToggleGroupItem key={value} value={value} className="h-auto min-h-20 flex-col items-start justify-center gap-1 px-3 py-3 text-left"><BuildingIllustration type={value as BuildingType} stage={2} color={colorToken} size={30} /><span className="text-xs font-medium">{building.name}</span></ToggleGroupItem>)}
                    </ToggleGroup>
                    <FieldDescription>{buildingCatalog[buildingType].description}</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </>} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="habit-target">How often would feel supportive?</FieldLabel>
                  <Controller name="targetPerWeek" control={form.control} render={({ field }) => <div className="rounded-xl border bg-background/60 px-4 py-4"><div className="flex items-center justify-between gap-4"><span className="text-sm text-muted-foreground">A flexible weekly intention</span><Badge variant="secondary" className="font-mono">{target} {target === 1 ? "time" : "times"}</Badge></div><Slider id="habit-target" min={1} max={7} step={1} value={field.value} onValueChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)} className="mt-4" aria-label="Target times per week" /><div className="mt-2 flex justify-between text-[0.65rem] text-muted-foreground"><span>Once is enough</span><span>Every day</span></div></div>} />
                  <FieldDescription>It is a direction, not a grade.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Choose a city color</FieldLabel>
                  <Controller name="colorToken" control={form.control} render={({ field }) => <ToggleGroup value={[field.value]} onValueChange={(value) => value[0] && field.onChange(value[0])} variant="outline" spacing={2} aria-label="Choose a city color">
                    {colorTokens.map((token) => <ToggleGroupItem key={token} value={token} aria-label={`${token} color`} className="size-9 rounded-full p-0"><span className="size-4 rounded-full" style={{ backgroundColor: `var(--city-${token})` }} /></ToggleGroupItem>)}
                  </ToggleGroup>} />
                  <FieldDescription><Palette className="mr-1 inline size-3" aria-hidden="true" />This is how you will recognize it at a glance.</FieldDescription>
                </Field>

                <Field data-invalid={Boolean(form.formState.errors.intention)}>
                  <FieldLabel htmlFor="habit-intention">Optional intention</FieldLabel>
                  <Textarea id="habit-intention" placeholder="Make a little room for ideas every day." className="min-h-24 resize-none" aria-invalid={Boolean(form.formState.errors.intention)} {...form.register("intention")} />
                  <FieldDescription>A short note can make the building feel like yours.</FieldDescription>
                  <FieldError errors={[form.formState.errors.intention]} />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="justify-between gap-3 border-t pt-5"><Button type="button" variant="ghost" render={<Link href="/city" />} nativeButton={false}>Cancel</Button><Button type="submit" size="lg" disabled={isSaving}>{isSaving ? "Placing foundation..." : "Place the foundation"}<ArrowRight data-icon="inline-end" /></Button></CardFooter>
          </form>
        </Card>

        <Card className="sticky top-20 overflow-hidden bg-primary text-primary-foreground shadow-none">
          <CardHeader><p className="font-label text-[0.58rem] opacity-70">A glimpse of the future</p><CardTitle className="font-editorial text-3xl">{name || "Your next building"}</CardTitle><CardDescription className="text-primary-foreground/75">{districtCatalog[district].name} district · {buildingCatalog[buildingType].name}</CardDescription></CardHeader>
          <CardContent><div className="flex min-h-48 items-center justify-center rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5"><BuildingIllustration type={buildingType} stage={2} color={colorToken} size={132} /></div><div className="mt-5 flex items-center justify-between text-xs text-primary-foreground/70"><span>First stage</span><span className="font-mono">0 check-ins</span></div><div className="mt-2 grid grid-cols-3 gap-1"><div className="h-1.5 rounded-full bg-primary-foreground/80" /><div className="h-1.5 rounded-full bg-primary-foreground/20" /><div className="h-1.5 rounded-full bg-primary-foreground/20" /></div></CardContent>
        </Card>
      </div>
    </div>
  )
}
