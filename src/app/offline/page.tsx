import type { Metadata } from "next"
import Link from "next/link"
import { CloudOff, RotateCcw } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "You are offline",
  description: "City of Habits is still available from this device while you are offline.",
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return <main className="paper-grain flex min-h-screen items-center justify-center p-5 sm:p-8"><Card className="w-full max-w-lg bg-card/90"><CardHeader><p className="font-label text-[0.6rem] text-primary">A quiet connection</p><CardTitle className="font-editorial mt-2 text-4xl">The network took a little walk.</CardTitle><CardDescription className="max-w-md text-base leading-relaxed">Your city is local-first, so your saved habits and check-ins remain on this device. Reconnect when you want to load a new page.</CardDescription></CardHeader><CardContent><Alert><CloudOff /><AlertTitle>Still available offline</AlertTitle><AlertDescription>Open the city from your browser history or try again when the connection returns.</AlertDescription></Alert></CardContent><CardFooter className="flex flex-wrap gap-3"><Button render={<Link href="/city" />} nativeButton={false}>Open the city</Button><Button variant="outline" render={<Link href="/offline" />} nativeButton={false}><RotateCcw data-icon="inline-start" />Try again</Button></CardFooter></Card></main>
}
