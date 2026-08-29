"use client"

import { Canvas, type ThreeEvent } from "@react-three/fiber"
import { MapControls, useGLTF } from "@react-three/drei"
import { Box3, Group, Vector3 } from "three"
import * as React from "react"
import { Suspense, useEffect, useMemo, useState } from "react"

import { getDecorationModelPath } from "@/lib/city/scene-assets"
import { getCityRenderQuality, type CityRenderQuality } from "@/lib/city/city-quality"
import type {
  ProjectedCityBuilding,
  ProjectedCityConnector,
  ProjectedCityLandmark,
  ScenePosition,
} from "@/lib/city/scene-projection"
import { CITY_WORLD_LIMIT, projectCityScene } from "@/lib/city/scene-projection"
import type { CheckIn, DistrictId, Habit } from "@/types/city"

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

const path = getDecorationModelPath("path-long")

export interface City3DMapProps {
  habits: Habit[]
  checkIns: CheckIn[]
  selectedHabitId?: string
  query?: string
  district?: DistrictId | "all"
  onSelectHabit?: (habitId: string) => void
  fallback?: React.ReactNode
}

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
  onSelectHabit,
  fallback,
}: City3DMapProps) {
  const quality = useCityQuality()
  const projection = useMemo(
    () => projectCityScene(habits, checkIns, { query, district }),
    [checkIns, district, habits, query],
  )

  return (
    <div
      className="relative h-full min-h-[34rem] overflow-hidden rounded-xl bg-[#9fbd91]"
      data-city-renderer="3d"
      data-render-tier={quality.tier}
    >
      <Canvas
        orthographic
        dpr={quality.pixelRatio}
        shadows={quality.shadows}
        frameloop="demand"
        fallback={fallback}
        camera={{ position: [30, 32, 30], zoom: 20, near: 0.1, far: 200 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.domElement.setAttribute("aria-label", "Draggable 3D view of your living city")
          gl.domElement.setAttribute("role", "img")
        }}
      >
        <color attach="background" args={["#a9c79a"]} />
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
            quality={quality}
            selectedHabitId={selectedHabitId}
            onSelectHabit={onSelectHabit}
          />
        </Suspense>
        <MapControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan
          enableRotate
          enableZoom
          maxAzimuthAngle={Math.PI / 3}
          maxDistance={65}
          maxPolarAngle={Math.PI / 2.25}
          maxZoom={28}
          minAzimuthAngle={-Math.PI / 3}
          minDistance={20}
          minPolarAngle={Math.PI / 3.5}
          minZoom={11}
          screenSpacePanning={false}
        />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 text-[11px] font-medium text-white/90 drop-shadow-sm sm:inset-x-5">
        <span>Drag to explore</span>
        <span className="hidden sm:inline">Scroll to zoom · Right-drag to rotate</span>
      </div>
    </div>
  )
}

function CityScene({
  buildings,
  connectors,
  landmarks,
  quality,
  selectedHabitId,
  onSelectHabit,
}: {
  buildings: ProjectedCityBuilding[]
  connectors: ProjectedCityConnector[]
  landmarks: ProjectedCityLandmark[]
  quality: CityRenderQuality
  selectedHabitId?: string
  onSelectHabit?: (habitId: string) => void
}) {
  return (
    <group>
      <Terrain />
      <RoadNetwork />
      <Decorations limit={quality.decorationLimit} />
      {connectors.map((connector) => (
        <CityConnector key={connector.id} connector={connector} />
      ))}
      {landmarks.map((landmark) => (
        <CityLandmark key={landmark.id} landmark={landmark} />
      ))}
      {buildings.map((building) => (
        <CityBuilding
          key={building.id}
          building={building}
          selected={building.habitId === selectedHabitId}
          onSelect={onSelectHabit}
        />
      ))}
    </group>
  )
}

function Terrain() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.35, 0]}>
        <boxGeometry args={[CITY_WORLD_LIMIT * 2, 0.7, CITY_WORLD_LIMIT * 2]} />
        <meshStandardMaterial color="#83a873" roughness={1} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CITY_WORLD_LIMIT * 2 - 0.35, CITY_WORLD_LIMIT * 2 - 0.35]} />
        <meshStandardMaterial color="#b1ce92" roughness={1} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CITY_WORLD_LIMIT * 2 - 0.75, CITY_WORLD_LIMIT * 2 - 0.75]} />
        <meshStandardMaterial color="#b8d79c" transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

function RoadNetwork() {
  const roads = [
    { position: [0, 0.12, 0] as const, rotation: 0, size: [43, 1.1] as const },
    { position: [0, 0.13, 0] as const, rotation: Math.PI / 2, size: [43, 1.1] as const },
    { position: [-11, 0.14, 0] as const, rotation: 0, size: [43, 0.65] as const },
    { position: [11, 0.14, 0] as const, rotation: 0, size: [43, 0.65] as const },
    { position: [0, 0.14, -11] as const, rotation: Math.PI / 2, size: [43, 0.65] as const },
    { position: [0, 0.14, 11] as const, rotation: Math.PI / 2, size: [43, 0.65] as const },
  ]

  return (
    <group>
      {roads.map((road, index) => (
        <mesh key={index} position={road.position} rotation={[0, road.rotation, 0]} receiveShadow>
          <boxGeometry args={[road.size[0], 0.08, road.size[1]]} />
          <meshStandardMaterial color={index < 2 ? "#c7bda5" : "#d2c9b4"} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.1, 32]} />
        <meshStandardMaterial color="#7fb18b" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.6, 32]} />
        <meshStandardMaterial color="#b8d7cf" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.85, 1.1, 0.2, 32]} />
        <meshStandardMaterial color="#79a9af" roughness={0.45} />
      </mesh>
    </group>
  )
}

function Decorations({ limit }: { limit: number }) {
  return (
    <group>
      {treePositions.slice(0, limit).map((position, index) => (
        <LocalModel
          key={`${position.x}-${position.z}`}
          src={getDecorationModelPath(index % 4 === 0 ? "tree-large" : "tree-small")}
          position={[position.x, 0, position.z]}
          targetHeight={index % 4 === 0 ? 2.15 : 1.45}
          rotation={index % 2 ? Math.PI : 0}
          interactive={false}
        />
      ))}
      {[
        [-14, -11],
        [14, -11],
        [-14, 11],
        [14, 11],
      ].map(([x, z]) => (
        <LocalModel
          key={`${x}-${z}`}
          src={path}
          position={[x, 0.03, z]}
          targetHeight={0.6}
          rotation={Math.PI / 2}
          interactive={false}
        />
      ))}
    </group>
  )
}

function CityBuilding({
  building,
  selected,
  onSelect,
}: {
  building: ProjectedCityBuilding
  selected: boolean
  onSelect?: (habitId: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const color = tileColors[building.colorToken] ?? districtColors[building.district]
  const opacity = building.visibility === "visible" ? 1 : 0.28
  const handleSelect = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    onSelect?.(building.habitId)
  }

  return (
    <group
      position={[building.position.x, 0, building.position.z]}
      onClick={handleSelect}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
      userData={{ habitId: building.habitId }}
    >
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
    getCityRenderQuality({ width: 1024, devicePixelRatio: 1 }),
  )

  useEffect(() => {
    const update = () => {
      setQuality(getCityRenderQuality({
        width: window.innerWidth,
        devicePixelRatio: window.devicePixelRatio,
        prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      }))
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
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
