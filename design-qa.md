# Interactive 3D City Design QA

## Reference and intent

- Visual reference: the supplied SimCity-inspired city workspace screenshot.
- The implementation keeps the reference's composition: a narrow city-only sidebar, a compact top toolbar, a large playable map, a progress/status card, a selected-building inspector, and a lower building browser.
- Buildings stay anchored to the user's persisted habit positions. Dragging pans the camera, zoom changes the view scale, and limited rotation provides a game-like view without changing local data.

## Renderer and art direction

- React Three Fiber, Drei, and Three.js provide the interactive orthographic scene.
- The scene uses 22 local Kenney CC0 GLB models, organized with their matching pack-specific `Textures/colormap.png` files under `public/models/city/`.
- `public/models/city/THIRD-PARTY-LICENSES.txt` records the asset attribution.
- Buildings use clean low-poly/isometric geometry with restrained color accents, roads, trees, paths, a roundabout, connectors, and landmark props. No generated or external image is used for the interactive map.
- The accessible SVG city map remains available as the Canvas fallback, while the semantic building browser exposes every habit independently of WebGL.

## Product behavior

- Habit data is projected into six districts: Body, Mind, Creative, Connection, Work, and Recovery.
- Building choice and duplicate-plot resolution are deterministic; filtering dims non-matching buildings without removing them.
- Search, district filters, building selection, today's check-in/undo, and View habit use the existing local store and route contracts.
- Camera controls are available by pointer/touch drag, wheel/pinch zoom, limited rotation, and the four accessible toolbar controls: Zoom in, Zoom out, Center city, and Reset map.
- The sample city remains an explicit action and does not seed IndexedDB until the visitor chooses it.

## Responsive, accessibility, and performance checks

- Verified city layout at 360, 390, 768, 1024, 1440, and 1572 CSS pixels with no horizontal overflow.
- Adaptive quality uses mobile, tablet, and desktop tiers; device pixel ratio, shadows, damping, and decoration count are capped by viewport and reduced-motion preference.
- Reduced motion is read before the first Canvas render and disables camera damping and scene reveal motion.
- The city shell exposes labeled navigation, search, district controls, map controls, a labeled draggable Canvas, and a keyboard-accessible building list.
- A direct in-app browser check confirmed meaningful content, no Next.js error overlay, no horizontal overflow, colored local models, and no browser console errors after the matching textures were packaged.
- The service worker uses the versioned `city-3d-models-v1` cache for same-origin city `.glb` files and matching `Textures/colormap.png` dependencies, with a bounded one-year expiration policy.
- No IndexedDB schema, backup schema, backend, analytics, or user-data transmission changes were introduced.

## Verification

- `pnpm lint` — passed
- `pnpm typecheck` — passed
- `pnpm test` — passed
- `pnpm build` — passed
- `pnpm test:e2e -- --workers=1` — passed
- Browser visual and console check — passed

## Result

final result: passed
