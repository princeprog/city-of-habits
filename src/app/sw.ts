import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist"
import { CacheFirst, CacheableResponsePlugin, ExpirationPlugin, Serwist } from "serwist"

import { CITY_MODEL_CACHE_NAME, isCityModelRequest } from "@/lib/city/model-cache"

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const cityModelCache: RuntimeCaching = {
  matcher: ({ request, url }) => request.method === "GET" && isCityModelRequest(url, self.location.origin),
  handler: new CacheFirst({
    cacheName: CITY_MODEL_CACHE_NAME,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  }),
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  runtimeCaching: [cityModelCache, ...defaultCache],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  fallbacks: {
    entries: [{ url: "/offline/", matcher: ({ request }) => request.destination === "document" }],
  },
})

serwist.addEventListeners()
