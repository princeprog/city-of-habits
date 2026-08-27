import type { Metadata } from "next"
import Link from "next/link"
import { CloudOff, RotateCcw } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "You are offline",
  description: "City of Habits is still available from this device while you are offline.",
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-5 sm:p-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardDescription>A quiet connection</CardDescription>
          <h1 className="text-3xl font-semibold tracking-tight">The network took a little walk.</h1>
          <CardDescription>Your city is local-first, so your saved habits and check-ins remain on this device. Reconnect when you want to load a new page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CloudOff />
            <AlertTitle>Still available offline</AlertTitle>
            <AlertDescription>Open the city from your browser history or try again when the connection returns.</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex-wrap gap-3">
          <Link href="/city" className={buttonVariants()}>Open the city</Link>
          <Link href="/offline" className={cn(buttonVariants({ variant: "outline" }))}><RotateCcw data-icon="inline-start" />Try again</Link>
        </CardFooter>
      </Card>
    </main>
  )
}
