"use client"

import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Box3, Group, Vector3 } from "three"
import { useEffect, useMemo, useRef } from "react"
import type { RefObject } from "react"

import { getDecorationModelPath } from "@/lib/city/scene-assets"
import type { ProjectedCityBuilding } from "@/lib/city/scene-projection"
import type { CityVisualState } from "@/types/city"

interface CityBuildingModelProps {
  building: ProjectedCityBuilding
  color: string
  opacity: number
  visualState?: CityVisualState
  quietMode?: boolean
  reducedMotion?: boolean
  recentlyChecked?: boolean
  stageChanged?: boolean
}

const STONE = "#e6ddc9"
const STONE_DARK = "#b8aa90"
const SOIL = "#7e6549"
const GLASS = "#9fc7cf"
const NIGHT_LIGHT = "#ffd98a"

export function CityBuildingModel({
  building,
  color,
  opacity,
  visualState = { timeOfDay: "day", activity: "clear" },
  quietMode = false,
  reducedMotion = false,
  recentlyChecked = false,
  stageChanged = false,
}: CityBuildingModelProps) {
  const revealRef = useRef<Group>(null)
  useBuildingReveal({
    active: stageChanged,
    reducedMotion,
    quietMode,
    groupRef: revealRef,
  })
  const night = visualState.timeOfDay !== "day"
  const lightIntensity = quietMode ? 0.45 : visualState.timeOfDay === "dusk" ? 0.68 : 0.95
  const glow = recentlyChecked ? 1 : 0

  return (
    <group ref={revealRef}>
      {building.presentation === "park-landscape" && (
        <ParkModel
          building={building}
          color={color}
          opacity={opacity}
          night={night}
          lightIntensity={lightIntensity}
          glow={glow}
        />
      )}
      {building.presentation === "civic-library" && (
        <LibraryModel
          building={building}
          color={color}
          opacity={opacity}
          night={night}
          lightIntensity={lightIntensity}
          glow={glow}
        />
      )}
      {building.presentation === "industrial-workshop" && (
        <WorkshopModel
          building={building}
          color={color}
          opacity={opacity}
          night={night}
          lightIntensity={lightIntensity}
          glow={glow}
        />
      )}
      {building.presentation === "road-bridge" && (
        <BridgeModel
          building={building}
          color={color}
          opacity={opacity}
          night={night}
          lightIntensity={lightIntensity}
          glow={glow}
        />
      )}
      {building.presentation === "city-tower" && (
        <TowerModel
          building={building}
          color={color}
          opacity={opacity}
          night={night}
          lightIntensity={lightIntensity}
          glow={glow}
        />
      )}
      {building.presentation === "coastal-lighthouse" && (
        <LighthouseModel
          building={building}
          color={color}
          opacity={opacity}
          night={night}
          lightIntensity={lightIntensity}
          glow={glow}
        />
      )}
    </group>
  )
}

interface BuildingPartProps {
  building: ProjectedCityBuilding
  color: string
  opacity: number
  night: boolean
  lightIntensity: number
  glow: number
}

function ParkModel({ building, color, opacity, night, lightIntensity, glow }: BuildingPartProps) {
  const stage = building.stage
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.45, 0.36, 2.45]} />
        <meshStandardMaterial color={SOIL} transparent opacity={opacity} roughness={1} />
      </mesh>
      <mesh position={[0, 0.39, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 1.05, 24]} />
        <meshStandardMaterial color={color} transparent opacity={0.38 * opacity} roughness={1} />
      </mesh>
      {stage === 0 ? (
        <Sapling color={color} opacity={opacity} />
      ) : (
        <>
          <LocalModel
            src={getDecorationModelPath(stage >= 3 ? "tree-large" : "tree-small")}
            position={[-0.42, 0.36, -0.16]}
            targetHeight={stage >= 3 ? 2.6 : 1.65 + stage * 0.14}
            opacity={opacity}
          />
          {stage >= 2 && (
            <>
              <LocalModel
                src={getDecorationModelPath("tree-small")}
                position={[0.58, 0.36, 0.35]}
                targetHeight={1.25}
                rotation={Math.PI / 3}
                opacity={opacity}
              />
              <LocalModel
                src={getDecorationModelPath("planter")}
                position={[0.15, 0.36, -0.7]}
                targetHeight={0.62}
                opacity={opacity}
              />
            </>
          )}
          {stage >= 3 && <GardenPavilion color={color} opacity={opacity} />}
        </>
      )}
      {stage >= 2 && <GardenPath color={color} opacity={opacity} />}
      {night && <NightLight position={[0.72, 0.62, -0.68]} opacity={opacity} intensity={lightIntensity} glow={glow} />}
    </group>
  )
}

function LibraryModel({ building, color, opacity, night, lightIntensity, glow }: BuildingPartProps) {
  const stage = building.stage
  const width = stage === 0 ? 1.55 : stage === 1 ? 1.95 : stage === 2 ? 2.2 : 2.45
  const height = stage === 0 ? 0.34 : stage === 1 ? 1.45 : stage === 2 ? 1.72 : 2.02
  const windows = stage === 0 ? 0 : stage === 1 ? 2 : stage === 2 ? 4 : 6
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.45, 0.36, 2.45]} />
        <meshStandardMaterial color={STONE_DARK} transparent opacity={opacity} roughness={0.92} />
      </mesh>
      {stage === 0 ? (
        <FoundationMarkers color={color} opacity={opacity} />
      ) : (
        <>
          <mesh position={[0, 0.42 + height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, height, 1.56]} />
            <meshStandardMaterial color={STONE} transparent opacity={opacity} roughness={0.84} />
          </mesh>
          <mesh position={[0, 0.45 + height, 0]} castShadow>
            <coneGeometry args={[width * 0.78, stage >= 3 ? 0.58 : 0.4, 4]} />
            <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.74} />
          </mesh>
          {[-0.65, -0.22, 0.22, 0.65].map((x) => (
            <mesh key={`column-${x}`} position={[x * Math.min(1, width / 2), 0.58, -0.84]} castShadow>
              <cylinderGeometry args={[0.07, 0.09, 1.08, 8]} />
              <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.8} />
            </mesh>
          ))}
          {Array.from({ length: windows }, (_, index) => {
            const x = windows === 2 ? (index === 0 ? -0.58 : 0.58) : -0.72 + (index % 3) * 0.72
            const z = index >= 3 ? 0.8 : -0.8
            const y = index >= 3 ? 1.06 : 1.1
            return <Window key={`window-${index}`} position={[x, y, z]} color={color} lit={night} opacity={opacity} intensity={lightIntensity + glow * 0.4} />
          })}
          {stage >= 3 && <mesh position={[0, 0.45 + height + 0.34, 0]} castShadow>
            <boxGeometry args={[0.76, 0.16, 0.24]} />
            <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.7} />
          </mesh>}
        </>
      )}
      {night && <NightLight position={[0, 0.9, -0.98]} opacity={opacity} intensity={lightIntensity} glow={glow} />}
    </group>
  )
}

function WorkshopModel({ building, color, opacity, night, lightIntensity, glow }: BuildingPartProps) {
  const stage = building.stage
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.45, 0.36, 2.45]} />
        <meshStandardMaterial color={SOIL} transparent opacity={opacity} roughness={1} />
      </mesh>
      {stage === 0 ? (
        <FoundationMarkers color={color} opacity={opacity} />
      ) : (
        <>
          <LocalModel
            src={building.modelPath}
            position={[0, 0.36, 0]}
            targetHeight={stage === 1 ? 1.65 : stage === 2 ? 2.05 : 2.42}
            rotation={building.variant ? Math.PI / 2 : 0}
            opacity={opacity}
          />
          {stage >= 2 && (
            <LocalModel
              src={getDecorationModelPath("chimney-basic")}
              position={[0.67, 0.36, -0.38]}
              targetHeight={stage >= 3 ? 1.55 : 1.15}
              opacity={opacity}
            />
          )}
          {stage >= 3 && <WorkshopExtension color={color} opacity={opacity} />}
        </>
      )}
      {night && <NightLight position={[0, 0.92, -0.86]} opacity={opacity} intensity={lightIntensity} glow={glow} color="#ffbd69" />}
    </group>
  )
}

function BridgeModel({ building, color, opacity, night, lightIntensity, glow }: BuildingPartProps) {
  const stage = building.stage
  return (
    <group rotation={[0, building.variant ? Math.PI / 2 : 0, 0]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.45, 0.36, 2.45]} />
        <meshStandardMaterial color="#b9b08c" transparent opacity={opacity} roughness={0.96} />
      </mesh>
      {stage === 0 ? (
        <>
          <BridgeAbutment position={[-0.62, 0.38, 0]} color={color} opacity={opacity} />
          <BridgeAbutment position={[0.62, 0.38, 0]} color={color} opacity={opacity} />
        </>
      ) : (
        <LocalModel
          src={getDecorationModelPath("road-bridge")}
          position={[0, 0.38, 0]}
          targetHeight={stage === 1 ? 1.08 : stage === 2 ? 1.32 : 1.52}
          opacity={opacity}
        />
      )}
      {stage >= 2 && (
        <>
          <LocalModel src={getDecorationModelPath("bridge-pillar")} position={[-0.82, 0.38, 0]} targetHeight={0.92} opacity={opacity} />
          <LocalModel src={getDecorationModelPath("bridge-pillar")} position={[0.82, 0.38, 0]} targetHeight={0.92} opacity={opacity} />
          <BridgeRail color={color} opacity={opacity} established={stage >= 3} />
        </>
      )}
      {night && <NightLight position={[-0.82, 0.7, -0.22]} opacity={opacity} intensity={lightIntensity} glow={glow} />}
      {night && stage >= 3 && <NightLight position={[0.82, 0.7, 0.22]} opacity={opacity} intensity={lightIntensity} glow={glow} />}
    </group>
  )
}

function TowerModel({ building, color, opacity, night, lightIntensity, glow }: BuildingPartProps) {
  const stage = building.stage
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.45, 0.36, 2.45]} />
        <meshStandardMaterial color={STONE_DARK} transparent opacity={opacity} roughness={0.92} />
      </mesh>
      {stage === 0 ? (
        <FoundationMarkers color={color} opacity={opacity} />
      ) : (
        <LocalModel
          src={building.modelPath}
          position={[0, 0.36, 0]}
          targetHeight={stage === 1 ? 2.28 : stage === 2 ? 3.55 : 4.65}
          rotation={building.variant ? Math.PI / 2 : 0}
          opacity={opacity}
        />
      )}
      {stage >= 2 && <TowerCrown color={color} opacity={opacity} />}
      {night && <NightLight position={[0, stage >= 3 ? 4.72 : 3.62, 0]} opacity={opacity} intensity={lightIntensity} glow={glow} color="#ffe8a9" />}
    </group>
  )
}

function LighthouseModel({ building, color, opacity, night, lightIntensity, glow }: BuildingPartProps) {
  const stage = building.stage
  const towerHeight = stage === 0 ? 0.28 : stage === 1 ? 1.28 : stage === 2 ? 1.82 : 2.2
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.45, 0.36, 2.45]} />
        <meshStandardMaterial color="#b3a789" transparent opacity={opacity} roughness={0.98} />
      </mesh>
      {stage === 0 ? (
        <FoundationMarkers color={color} opacity={opacity} />
      ) : (
        <>
          <mesh position={[0, 0.38 + towerHeight / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.42, 0.58, towerHeight, 12]} />
            <meshStandardMaterial color={STONE} transparent opacity={opacity} roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.42 + towerHeight, 0]} castShadow>
            <cylinderGeometry args={[0.62, 0.62, 0.14, 16]} />
            <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.75} />
          </mesh>
          {stage >= 2 && <>
            <mesh position={[0, 0.56 + towerHeight, 0]} castShadow>
              <cylinderGeometry args={[0.42, 0.42, 0.42, 12]} />
              <meshStandardMaterial color={GLASS} transparent opacity={0.72 * opacity} roughness={0.18} metalness={0.1} />
            </mesh>
            <mesh position={[0, 0.78 + towerHeight, 0]} castShadow>
              <coneGeometry args={[0.5, 0.34, 12]} />
              <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.7} />
            </mesh>
          </>}
        </>
      )}
      {night && stage >= 2 && <NightLight position={[0, 0.56 + towerHeight, 0]} opacity={opacity} intensity={lightIntensity} glow={glow} color="#ffe8a9" />}
    </group>
  )
}

function Sapling({ color, opacity }: { color: string; opacity: number }) {
  return (
    <group position={[0, 0.4, 0]}>
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 0.62, 8]} />
        <meshStandardMaterial color={SOIL} transparent opacity={opacity} roughness={1} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <sphereGeometry args={[0.3, 12, 8]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.9} />
      </mesh>
    </group>
  )
}

function FoundationMarkers({ color, opacity }: { color: string; opacity: number }) {
  return (
    <group>
      <mesh position={[0, 0.44, 0]} rotation={[0, Math.PI / 4, 0]}>
        <ringGeometry args={[0.52, 0.76, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.85 * opacity} />
      </mesh>
      {[-0.48, 0.48].map((x) => (
        <mesh key={x} position={[x, 0.64, 0]}>
          <boxGeometry args={[0.1, 0.44, 0.1]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function GardenPath({ color, opacity }: { color: string; opacity: number }) {
  return (
    <mesh position={[0, 0.4, 0.78]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.34, 0.82]} />
      <meshStandardMaterial color={color} transparent opacity={0.48 * opacity} roughness={1} />
    </mesh>
  )
}

function GardenPavilion({ color, opacity }: { color: string; opacity: number }) {
  return (
    <group position={[0.4, 0.4, -0.68]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.82, 0.12, 0.82]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.75} />
      </mesh>
      {[-0.28, 0.28].flatMap((x) => [-0.28, 0.28].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, 0.23, z]} castShadow>
          <cylinderGeometry args={[0.045, 0.06, 0.46, 8]} />
          <meshStandardMaterial color={STONE_DARK} transparent opacity={opacity} roughness={0.8} />
        </mesh>
      )))}
    </group>
  )
}

function WorkshopExtension({ color, opacity }: { color: string; opacity: number }) {
  return (
    <mesh position={[0.72, 0.62, 0.34]} castShadow>
      <boxGeometry args={[0.66, 0.62, 0.74]} />
      <meshStandardMaterial color={color} transparent opacity={0.75 * opacity} roughness={0.82} />
    </mesh>
  )
}

function BridgeAbutment({ position, color, opacity }: { position: [number, number, number]; color: string; opacity: number }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.42, 0.7, 1.28]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.82} />
    </mesh>
  )
}

function BridgeRail({ color, opacity, established }: { color: string; opacity: number; established: boolean }) {
  const width = established ? 1.25 : 0.98
  return (
    <group>
      {[-0.62, 0.62].map((x) => (
        <group key={x} position={[x, 0.9, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.84, width]} />
            <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.75} />
          </mesh>
          {established && <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[0.1, 0.08, width + 0.1]} />
            <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.72} />
          </mesh>}
        </group>
      ))}
    </group>
  )
}

function TowerCrown({ color, opacity }: { color: string; opacity: number }) {
  return (
    <group position={[0, 3.7, 0]}>
      <mesh castShadow>
        <coneGeometry args={[0.66, 0.32, 8]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.42, 8]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.72} />
      </mesh>
    </group>
  )
}

function Window({
  position,
  color,
  lit,
  opacity,
  intensity,
}: {
  position: [number, number, number]
  color: string
  lit: boolean
  opacity: number
  intensity: number
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.22, 0.3, 0.04]} />
      <meshStandardMaterial
        color={lit ? NIGHT_LIGHT : color}
        emissive={lit ? NIGHT_LIGHT : "#000000"}
        emissiveIntensity={lit ? intensity : 0}
        transparent
        opacity={opacity}
        roughness={0.34}
      />
    </mesh>
  )
}

function NightLight({
  position,
  opacity,
  intensity,
  glow,
  color = NIGHT_LIGHT,
}: {
  position: [number, number, number]
  opacity: number
  intensity: number
  glow: number
  color?: string
}) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.09 + glow * 0.06, 10, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity + glow * 1.4}
          transparent
          opacity={opacity}
        />
      </mesh>
      <pointLight color={color} intensity={(0.12 + glow * 0.55) * intensity * opacity} distance={2.8} decay={2} />
    </group>
  )
}

function LocalModel({
  src,
  position,
  targetHeight,
  rotation = 0,
  opacity = 1,
}: {
  src: string
  position: [number, number, number]
  targetHeight: number
  rotation?: number
  opacity?: number
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

  return <primitive object={clone} position={position} rotation={[0, rotation, 0]} scale={scale} />
}

function useBuildingReveal({
  active,
  reducedMotion,
  quietMode,
  groupRef,
}: {
  active: boolean
  reducedMotion: boolean
  quietMode: boolean
  groupRef: RefObject<Group | null>
}) {
  const startedAt = useRef<number | null>(null)

  useEffect(() => {
    if (!active || reducedMotion || quietMode) {
      groupRef.current?.scale.setScalar(1)
      startedAt.current = null
      return
    }
    groupRef.current?.scale.setScalar(0.86)
    startedAt.current = performance.now()
  }, [active, groupRef, quietMode, reducedMotion])

  useFrame(({ invalidate }) => {
    if (startedAt.current === null) return
    const elapsed = performance.now() - startedAt.current
    const nextProgress = Math.min(1, 0.86 + elapsed / 450 * 0.14)
    groupRef.current?.scale.setScalar(nextProgress)
    invalidate()
    if (nextProgress >= 1) startedAt.current = null
  })
}
