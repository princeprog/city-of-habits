export const CITY_MODEL_CACHE_NAME = "city-3d-models-v1"

export function isCityModelRequest(url: URL, origin: string) {
  return (
    url.origin === origin &&
    url.pathname.startsWith("/models/city/") &&
    url.pathname.endsWith(".glb")
  )
}
