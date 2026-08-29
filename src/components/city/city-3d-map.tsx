"use client"

import { Canvas, type ThreeEvent, useThree } from "@react-three/fiber"
import { MapControls, useGLTF } from "@react-three/drei"
import { Box3, Group, MOUSE, Plane, TOUCH, Vector3 } from "three"
import type { OrthographicCamera } from "three"
import * as React from "react"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"

import { getDecorationModelPath } from "@/lib/city/scene-assets"
import {
  CITY_CAMERA_PAN_LIMIT,
  CITY_TERRAIN_SIZE,
  findNearestValidPlot,
  toStoredPosition,
  type CityHomeFrame,
} from "@/lib/city/city-layout"
import type { ProjectedCityScenery } from "@/lib/city/city-scenery"
import {
  getBrowserCityRenderQuality,
  type CityRenderQuality,
} from "@/lib/city/city-quality"
import type {
  ProjectedCityBuilding,
  ProjectedCityConnector,
  ProjectedCityLandmark,
  ScenePosition,
} from "@/lib/city/scene-projection"
import { projectCityScene } from "@/lib/city/scene-projection"
import type { CheckIn, CityPosition, DistrictId, Habit } from "@/types/city"
import { cn } from "@/lib/utils"
import { CityFountain } from "@/components/city/city-fountain"
import { CityRoadNetwork } from "@/components/city/city-road-network"
import { isPositionClearOfRoads } from "@/lib/city/road-layout"

const tileColors: Record<string, string> = {
  coral: "#d98f6e",
  teal: "#70a9a1",
  gold: "#e7ba5c",
  sky: "#8ab5c7",
  moss: "#7ba67f",
  blue: "#6389b9",
}

const districtColors: Record<DistrictId, string> = {
  body: "#8db58a",
  mind: "#9ab8cd",
  creative: "#d79b81",
  connection: "#d5bc76",
  work: "#6f91b1",
  recovery: "#9b91bd",
}

const targetHeights: Record<Habit["buildingType"], number> = {
  park: 2.1,
  library: 3.1,
  workshop: 2.7,
  bridge: 2.4,
  tower: 5.2,
  lighthouse: 3.6,
}

const terrainPatches = [
  { x: -36, z: -28, radius: 15, color: "#a8c88f", opacity: 0.3 },
  { x: 30, z: -34, radius: 18, color: "#b9d49b", opacity: 0.24 },
  { x: -42, z: 24, radius: 20, color: "#b7d198", opacity: 0.22 },
  { x: 38, z: 30, radius: 16, color: "#a6c58b", opacity: 0.26 },
  { x: 4, z: 42, radius: 14, color: "#bbd69c", opacity: 0.2 },
  { x: -4, z: -48, radius: 17, color: "#a7c68e", opacity: 0.22 },
] as const

const treePositions: ScenePosition[] = [
  { x: -19, z: -17 },
  { x: -15, z: -5 },
  { x: -20, z: 7 },
  { x: -12, z: 17 },
  { x: -3, z: -19 },
  { x: 5, z: -17 },
  { x: 15, z: -19 },
  { x: 19, z: -9 },
  { x: 18, z: 4 },
  { x: 20, z: 16 },
  { x: 9, z: 19 },
  { x: -6, z: 20 },
  { x: -20, z: -11 },
  { x: 14, z: 11 },
  { x: -7, z: -15 },
  { x: 7, z: 14 },
  { x: -18, z: 13 },
  { x: 18, z: -17 },
  { x: 2, z: 19 },
  { x: -2, z: 7 },
  { x: 12, z: -4 },
  { x: -11, z: 4 },
  { x: 4, z: -7 },
  { x: -5, z: -4 },
  { x: 13, z: 18 },
  { x: -17, z: 2 },
  { x: 16, z: 7 },
  { x: 0, z: -20 },
  { x: -9, z: 18 },
  { x: 10, z: 3 },
  { x: -2, z: -12 },
  { x: 3, z: 12 },
  { x: -14, z: 10 },
  { x: 15, z: -12 },
  { x: -18, z: -19 },
  { x: 19, z: 19 },
  { x: -8, z: 13 },
  { x: 8, z: -13 },
  { x: -13, z: -17 },
  { x: 13, z: 14 },
  { x: -19, z: -1 },
  { x: 19, z: 1 },
]
const roadsideTreePositions = treePositions.filter(isPositionClearOfRoads)

export interface City3DMapProps {
  habits: Habit[]
  checkIns: CheckIn[]
  selectedHabitId?: string
  query?: string
  district?: DistrictId | "all"
  positionOverrides?: ReadonlyMap<string, CityPosition>
  arranging?: boolean
  onSelectHabit?: (habitId: string) => void
  onMoveHabit?: (habitId: string, position: CityPosition) => void
  onArrangementIssue?: (message: string) => void
  mapCommand?: CityMapCommand
  fallback?: React.ReactNode
  className?: string
}

export type CityMapCommandAction = "zoom-in" | "zoom-out" | "center" | "reset"

export type CityMapCommand =
  | { id: number; action: CityMapCommandAction }
  | { id: number; action: "focus-habit"; habitId: string }

export function City3DMap({ fallback, ...props }: City3DMapProps) {
  return (
    <City3DErrorBoundary fallback={fallback}>
      <City3DCanvas {...props} fallback={fallback} />
    </City3DErrorBoundary>
  )
}

function City3DCanvas({
  habits,
  checkIns,
  selectedHabitId,
  query,
  district = "all",
  positionOverrides,
  arranging = false,
  onSelectHabit,
  onMoveHabit,
  onArrangementIssue,
  mapCommand,
  fallback,
  className,
}: City3DMapProps) {
  const quality = useCityQuality()
  const [draggingHabitId, setDraggingHabitId] = useState<string>()
  const projection = useMemo(
    () => projectCityScene(habits, checkIns, { query, district, positionOverrides }),
    [checkIns, district, habits, positionOverrides, query],
  )

  return (
    <div
      className={cn("relative h-full min-h-0 overflow-hidden bg-[#9fbd91]", className)}
      data-city-renderer="3d"
      data-city-centerpiece="fountain"
      data-city-terrain="seamless"
      data-city-camera-mode="fixed-isometric"
      data-city-density-tier={projection.density}
      data-city-scenery-count={Math.min(projection.scenery.length, quality.decorationLimit)}
      data-city-arrange-mode={arranging || undefined}
      data-city-dragging-habit={draggingHabitId}
      data-city-home-zoom={projection.homeFrame.zoom}
      data-render-tier={quality.tier}
      data-last-map-command={mapCommand?.action}
      data-city-focused-habit={mapCommand?.action === "focus-habit" ? mapCommand.habitId : undefined}
    >
      <Canvas
        orthographic
        dpr={quality.pixelRatio}
        shadows={quality.shadows}
        frameloop="demand"
        fallback={fallback}
        camera={{
          position: [
            projection.homeFrame.target.x + 30,
            32,
            projection.homeFrame.target.z + 30,
          ],
          zoom: projection.homeFrame.zoom,
          near: 0.1,
          far: 200,
        }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.domElement.setAttribute("aria-label", "Draggable 3D view of your living city")
          gl.domElement.setAttribute("role", "img")
        }}
      >
        <color attach="background" args={["#b1ce92"]} />
        <ambientLight intensity={2.2} color="#fff6df" />
        <directionalLight
          castShadow={quality.shadows}
          color="#fff1d1"
          intensity={3.5}
          position={[18, 28, 12]}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />
        <Suspense fallback={<SceneLoading /> }>
          <CityScene
            buildings={projection.buildings}
            connectors={projection.connectors}
            landmarks={projection.landmarks}
            scenery={projection.scenery}
            quality={quality}
            selectedHabitId={selectedHabitId}
            onSelectHabit={onSelectHabit}
            arranging={arranging}
            draggingHabitId={draggingHabitId}
            onDragStart={setDraggingHabitId}
            onDragEnd={() => setDraggingHabitId(undefined)}
            onDragMove={(habitId, candidate) => {
              const occupied = projection.buildings
                .filter((building) => building.habitId !== habitId)
                .map((building) => building.position)
              const snapped = findNearestValidPlot(candidate, occupied)
              if (!snapped) {
                onArrangementIssue?.("No valid parcel is available here. The building stayed in its last valid position.")
                return
              }
              onMoveHabit?.(habitId, toStoredPosition(snapped))
            }}
          />
        </Suspense>
        <CityMapControls
          command={mapCommand}
          buildings={projection.buildings}
          homeFrame={projection.homeFrame}
          quality={quality}
          enabled={!arranging}
        />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 text-[11px] font-medium text-white/90 drop-shadow-sm sm:inset-x-5">
        <span>{arranging ? "Drag a building to move it" : "Drag to move · Scroll to zoom"}</span>
        <span className="hidden sm:inline">{arranging ? "Map navigation is paused" : "Fixed isometric view"}</span>
      </div>
    </div>
  )
}

function CityMapControls({
  command,
  buildings,
  homeFrame,
  quality,
  enabled,
}: {
  command?: CityMapCommand
  buildings: ProjectedCityBuilding[]
  homeFrame: CityHomeFrame
  quality: CityRenderQuality
  enabled: boolean
}) {
  const { get, invalidate } = useThree()
  const controlsRef = useRef<React.ElementRef<typeof MapControls>>(null)
  const constrainPan = () => {
    const controls = controlsRef.current
    if (!controls) return
    const distance = Math.hypot(controls.target.x, controls.target.z)
    if (distance > CITY_CAMERA_PAN_LIMIT) {
      const scale = CITY_CAMERA_PAN_LIMIT / distance
      const nextX = controls.target.x * scale
      const nextZ = controls.target.z * scale
      const deltaX = nextX - controls.target.x
      const deltaZ = nextZ - controls.target.z
      controls.target.x = nextX
      controls.target.z = nextZ
      const mapCamera = get().camera as OrthographicCamera
      mapCamera.position.x += deltaX
      mapCamera.position.z += deltaZ
    }
    invalidate()
  }

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || command?.action === "focus-habit") return
    const mapCamera = get().camera as OrthographicCamera
    controls.target.set(homeFrame.target.x, 0, homeFrame.target.z)
    mapCamera.position.set(homeFrame.target.x + 30, 32, homeFrame.target.z + 30)
    mapCamera.zoom = homeFrame.zoom
    mapCamera.updateProjectionMatrix()
    controls.update()
    invalidate()
  }, [command?.action, get, homeFrame.target.x, homeFrame.target.z, homeFrame.zoom, invalidate])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || !command) return

    const mapCamera = get().camera as OrthographicCamera
    let animationFrame: number | undefined

    const cancelAnimation = () => {
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame)
        animationFrame = undefined
      }
    }

    const moveCamera = (target: Vector3, position: Vector3, zoom: number) => {
      const prefersReducedMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false

      if (prefersReducedMotion) {
        controls.target.copy(target)
        mapCamera.position.copy(position)
        mapCamera.zoom = zoom
        return
      }

      const startingTarget = controls.target.clone()
      const startingPosition = mapCamera.position.clone()
      const startingZoom = mapCamera.zoom
      const startedAt = performance.now()
      const duration = 280

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration)
        const eased = 1 - Math.pow(1 - progress, 3)
        controls.target.lerpVectors(startingTarget, target, eased)
        mapCamera.position.lerpVectors(startingPosition, position, eased)
        mapCamera.zoom = startingZoom + (zoom - startingZoom) * eased
        mapCamera.updateProjectionMatrix()
        controls.update()
        invalidate()

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(tick)
        } else {
          animationFrame = undefined
        }
      }

      animationFrame = window.requestAnimationFrame(tick)
    }

    cancelAnimation()
    if (command.action === "focus-habit") {
      const building = buildings.find(({ habitId }) => habitId === command.habitId)
      if (!building) return
      moveCamera(
        new Vector3(building.position.x, 0, building.position.z),
        new Vector3(building.position.x + 30, 32, building.position.z + 30),
        24,
      )
    } else if (command.action === "zoom-in") {
      mapCamera.zoom = Math.min(28, mapCamera.zoom + 2)
    } else if (command.action === "zoom-out") {
      mapCamera.zoom = Math.max(11, mapCamera.zoom - 2)
    } else {
      controls.target.set(homeFrame.target.x, 0, homeFrame.target.z)
      if (command.action === "reset") {
        mapCamera.position.set(homeFrame.target.x + 30, 32, homeFrame.target.z + 30)
        mapCamera.zoom = homeFrame.zoom
      }
    }

    mapCamera.updateProjectionMatrix()
    controls.update()
    invalidate()

    return cancelAnimation
  }, [buildings, command, get, homeFrame.target.x, homeFrame.target.z, homeFrame.zoom, invalidate])

  return (
    <MapControls
      ref={controlsRef}
      makeDefault
      enabled={enabled}
      enableDamping={quality.damping}
      dampingFactor={quality.damping ? 0.08 : 0}
      enablePan
      enableRotate={false}
      enableZoom
      maxZoom={28}
      minZoom={11}
      mouseButtons={{ LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }}
      onChange={constrainPan}
      screenSpacePanning={false}
      touches={{ ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN }}
    />
  )
}

function CityScene({
  buildings,
  connectors,
  landmarks,
  scenery,
  quality,
  selectedHabitId,
  onSelectHabit,
  arranging,
  draggingHabitId,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  buildings: ProjectedCityBuilding[]
  connectors: ProjectedCityConnector[]
  landmarks: ProjectedCityLandmark[]
  scenery: ProjectedCityScenery[]
  quality: CityRenderQuality
  selectedHabitId?: string
  onSelectHabit?: (habitId: string) => void
  arranging: boolean
  draggingHabitId?: string
  onDragStart: (habitId: string) => void
  onDragMove: (habitId: string, position: ScenePosition) => void
  onDragEnd: () => void
}) {
  return (
    <group>
      <Terrain />
      <CityRoadNetwork />
      <Decorations limit={quality.decorationLimit} />
      <NeighborhoodScenery items={scenery} limit={quality.decorationLimit} />
      {connectors.map((connector) => (
        <CityConnector key={connector.id} connector={connector} />
      ))}
      <CityFountain />
      {landmarks.map((landmark) => (
        <CityLandmark key={landmark.id} landmark={landmark} />
      ))}
      {buildings.map((building) => (
        <CityBuilding
          key={building.id}
          building={building}
          selected={building.habitId === selectedHabitId}
          onSelect={onSelectHabit}
          arranging={arranging}
          dragging={building.habitId === draggingHabitId}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
        />
      ))}
    </group>
  )
}

function Terrain() {
  return (
    <group>
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CITY_TERRAIN_SIZE, CITY_TERRAIN_SIZE]} />
        <meshStandardMaterial color="#b1ce92" roughness={1} />
      </mesh>
      {terrainPatches.map(({ x, z, radius, color, opacity }) => (
        <mesh key={`${x}-${z}`} position={[x, -0.015, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius, 32]} />
          <meshStandardMaterial color={color} depthWrite={false} transparent opacity={opacity} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

function Decorations({ limit }: { limit: number }) {
  return (
    <group>
      {roadsideTreePositions.slice(0, limit).map((position, index) => (
        <LocalModel
          key={`${position.x}-${position.z}`}
          src={getDecorationModelPath(index % 4 === 0 ? "tree-large" : "tree-small")}
          position={[position.x, 0, position.z]}
          targetHeight={index % 4 === 0 ? 2.15 : 1.45}
          rotation={index % 2 ? Math.PI : 0}
          interactive={false}
        />
      ))}
    </group>
  )
}

function NeighborhoodScenery({
  items,
  limit,
}: {
  items: ProjectedCityScenery[]
  limit: number
}) {
  return (
    <group>
      {items.slice(0, limit).map((item) => (
        <SceneryItem key={item.id} item={item} />
      ))}
    </group>
  )
}

function SceneryItem({ item }: { item: ProjectedCityScenery }) {
  const color = districtColors[item.district]
  const position: [number, number, number] = [item.position.x, 0, item.position.z]

  if (item.kind === "tree" || item.kind === "planter" || item.kind === "light") {
    const model = item.kind === "tree" ? "tree-small" : item.kind === "planter" ? "planter" : "light-square"
    return (
      <LocalModel
        src={getDecorationModelPath(model)}
        position={position}
        targetHeight={item.kind === "tree" ? 1.15 : item.kind === "light" ? 0.8 : 0.5}
        rotation={item.rotation}
        interactive={false}
      />
    )
  }

  if (item.kind === "ground") {
    return (
      <mesh position={[item.position.x, 0.045, item.position.z]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
        <ringGeometry args={[1.48, 1.72, 4]} />
        <meshStandardMaterial color={color} transparent opacity={0.34} roughness={1} />
      </mesh>
    )
  }

  if (item.kind === "path") {
    return (
      <mesh position={[item.position.x, 0.07, item.position.z]} rotation={[0, item.rotation, 0]} receiveShadow>
        <boxGeometry args={[0.28, 0.06, 1.4]} />
        <meshStandardMaterial color="#e7dcc1" roughness={1} />
      </mesh>
    )
  }

  if (item.kind === "bench") {
    return (
      <group position={[item.position.x, 0.1, item.position.z]} rotation={[0, item.rotation, 0]} scale={item.scale}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.78, 0.12, 0.24]} />
          <meshStandardMaterial color="#a96f45" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.45, 0.09]} castShadow>
          <boxGeometry args={[0.78, 0.3, 0.09]} />
          <meshStandardMaterial color="#b97b4d" roughness={0.9} />
        </mesh>
      </group>
    )
  }

  if (item.kind === "hedge") {
    return (
      <mesh position={[item.position.x, 0.27, item.position.z]} rotation={[0, item.rotation, 0]} castShadow>
        <boxGeometry args={[1.05, 0.5, 0.34]} />
        <meshStandardMaterial color="#5f8e62" roughness={1} />
      </mesh>
    )
  }

  if (item.kind === "rocks") {
    return (
      <group position={[item.position.x, 0.1, item.position.z]} rotation={[0, item.rotation, 0]}>
        {[-0.25, 0.08, 0.3].map((offset, index) => (
          <mesh key={offset} position={[offset, 0.14 + index * 0.03, index % 2 ? 0.12 : -0.08]} castShadow>
            <dodecahedronGeometry args={[0.2 + index * 0.04, 0]} />
            <meshStandardMaterial color="#8b9188" roughness={1} />
          </mesh>
        ))}
      </group>
    )
  }

  return (
    <group position={[item.position.x, 0.08, item.position.z]} rotation={[0, item.rotation, 0]}>
      {[-0.26, 0, 0.26].map((offset, index) => (
        <mesh key={offset} position={[offset, 0.17, index % 2 ? 0.13 : -0.08]} castShadow>
          <sphereGeometry args={[0.16, 8, 6]} />
          <meshStandardMaterial color={index % 2 ? "#e5a4a1" : "#f0ce70"} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function CityBuilding({
  building,
  selected,
  onSelect,
  arranging,
  dragging,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  building: ProjectedCityBuilding
  selected: boolean
  onSelect?: (habitId: string) => void
  arranging: boolean
  dragging: boolean
  onDragStart: (habitId: string) => void
  onDragMove: (habitId: string, position: ScenePosition) => void
  onDragEnd: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const color = tileColors[building.colorToken] ?? districtColors[building.district]
  const opacity = building.visibility === "visible" ? 1 : 0.28
  const handleSelect = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    onSelect?.(building.habitId)
  }
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!arranging) return
    event.stopPropagation()
    const pointerTarget = event.target as EventTarget & {
      setPointerCapture(pointerId: number): void
    }
    pointerTarget.setPointerCapture(event.pointerId)
    onSelect?.(building.habitId)
    onDragStart(building.habitId)
  }
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!arranging || !dragging) return
    event.stopPropagation()
    const intersection = event.ray.intersectPlane(
      new Plane(new Vector3(0, 1, 0), 0),
      new Vector3(),
    )
    if (intersection) {
      onDragMove(building.habitId, { x: intersection.x, z: intersection.z })
    }
  }
  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (!arranging || !dragging) return
    event.stopPropagation()
    const pointerTarget = event.target as EventTarget & {
      releasePointerCapture(pointerId: number): void
    }
    pointerTarget.releasePointerCapture(event.pointerId)
    onDragEnd()
  }

  return (
    <group
      position={[building.position.x, 0, building.position.z]}
      onClick={handleSelect}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
      userData={{ habitId: building.habitId }}
    >
      {arranging && selected && (
        <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
          <ringGeometry args={[1.55, 2, 4]} />
          <meshBasicMaterial color={dragging ? "#ffffff" : color} transparent opacity={0.42} depthWrite={false} />
        </mesh>
      )}
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
        <ringGeometry args={[1.22, 1.36, 4]} />
        <meshBasicMaterial color={selected || hovered ? "#fff8d6" : color} transparent opacity={selected || hovered ? 0.98 : 0.6 * opacity} />
      </mesh>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[2.35, 0.12, 2.35]} />
        <meshStandardMaterial color={color} transparent opacity={0.9 * opacity} roughness={0.9} />
      </mesh>
      <LocalModel
        src={building.modelPath}
        position={[0, 0.12, 0]}
        targetHeight={targetHeights[building.buildingType] + building.stage * 0.28}
        rotation={building.variant ? Math.PI / 2 : 0}
        opacity={opacity}
        interactive
      />
      {building.stage >= 2 && (
        <mesh position={[0, targetHeights[building.buildingType] + 0.25, 0]}>
          <sphereGeometry args={[0.12 + building.stage * 0.03, 12, 8]} />
          <meshBasicMaterial color="#fff0a3" transparent opacity={0.8 * opacity} />
        </mesh>
      )}
    </group>
  )
}

function CityConnector({ connector }: { connector: ProjectedCityConnector }) {
  const mid = {
    x: (connector.from.x + connector.to.x) / 2,
    z: (connector.from.z + connector.to.z) / 2,
  }
  return (
    <mesh position={[mid.x, 0.22, mid.z]} rotation={[0, Math.atan2(connector.to.x - connector.from.x, connector.to.z - connector.from.z), 0]}>
      <boxGeometry args={[0.24, 0.08, Math.max(1, Math.hypot(connector.to.x - connector.from.x, connector.to.z - connector.from.z))]} />
      <meshStandardMaterial color="#e0c479" roughness={0.8} />
    </mesh>
  )
}

function CityLandmark({ landmark }: { landmark: ProjectedCityLandmark }) {
  return (
    <group position={[landmark.position.x, 0, landmark.position.z]}>
      <mesh position={[0, 0.35 + landmark.stage * 0.1, 0]}>
        <cylinderGeometry args={[0.28, 0.42, 0.7 + landmark.stage * 0.18, 8]} />
        <meshStandardMaterial color="#ead59b" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.82 + landmark.stage * 0.18, 0]}>
        <coneGeometry args={[0.35, 0.55, 8]} />
        <meshStandardMaterial color="#d88e6f" roughness={0.72} />
      </mesh>
    </group>
  )
}

function LocalModel({
  src,
  position,
  targetHeight,
  rotation = 0,
  opacity = 1,
  interactive,
}: {
  src: string
  position: [number, number, number]
  targetHeight: number
  rotation?: number
  opacity?: number
  interactive: boolean
}) {
  const { scene } = useGLTF(src)
  const { clone, scale } = useMemo(() => {
    const clone = scene.clone(true)
    const bounds = new Box3().setFromObject(clone)
    const size = bounds.getSize(new Vector3())
    const fitScale = targetHeight / Math.max(size.y, 0.001)
    clone.position.set(
      -((bounds.min.x + bounds.max.x) / 2) * fitScale,
      -bounds.min.y * fitScale,
      -((bounds.min.z + bounds.max.z) / 2) * fitScale,
    )
    clone.traverse((object) => {
      if (!(object instanceof Group) && "castShadow" in object) {
        object.castShadow = true
        object.receiveShadow = true
      }
      if ("material" in object && object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => {
          material.transparent = opacity < 1
          material.opacity = opacity
          material.needsUpdate = true
        })
      }
    })
    return { clone, scale: fitScale }
  }, [opacity, scene, targetHeight])

  return (
    <primitive
      object={clone}
      position={position}
      rotation={[0, rotation, 0]}
      scale={scale}
      userData={{ interactive }}
    />
  )
}

function SceneLoading() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[2, 1, 2]} />
      <meshStandardMaterial color="#b4cf9a" wireframe />
    </mesh>
  )
}

function useCityQuality() {
  const [quality, setQuality] = useState<CityRenderQuality>(() =>
    getBrowserCityRenderQuality(),
  )

  useEffect(() => {
    const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    const update = () => {
      setQuality(getBrowserCityRenderQuality())
    }
    update()
    window.addEventListener("resize", update)
    motionQuery?.addEventListener("change", update)
    return () => {
      window.removeEventListener("resize", update)
      motionQuery?.removeEventListener("change", update)
    }
  }, [])

  return quality
}

class City3DErrorBoundary extends React.Component<
  { fallback?: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
