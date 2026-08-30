const STONE = "#eadfc9"
const STONE_EDGE = "#d4c5aa"
const WATER = "#78c9c4"
const SOIL = "#7d6847"
const LEAF = "#5f9b58"
const FLOWER = "#e89455"

const planterPositions = [
  [2.2, 2.2],
  [-2.2, 2.2],
  [2.2, -2.2],
  [-2.2, -2.2],
] as const

const overflowPositions = [
  [0.52, 0],
  [-0.52, 0],
  [0, 0.52],
  [0, -0.52],
] as const

export function CityFountain({ intensity = 0.82 }: { intensity?: number }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh receiveShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[3.25, 3.25, 0.16, 40]} />
        <meshStandardMaterial color={STONE} roughness={0.92} />
      </mesh>
      <mesh receiveShadow position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.72, 3.08, 40]} />
        <meshStandardMaterial color={STONE_EDGE} roughness={0.92} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.47, 0]}>
        <cylinderGeometry args={[2.18, 2.32, 0.4, 40]} />
        <meshStandardMaterial color={STONE_EDGE} roughness={0.86} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.65, 0]}>
        <cylinderGeometry args={[1.92, 2.08, 0.22, 40]} />
        <meshStandardMaterial color={STONE} roughness={0.88} />
      </mesh>
      <WaterSurface radius={1.82} height={0.77} intensity={intensity} />

      <mesh castShadow receiveShadow position={[0, 1.17, 0]}>
        <cylinderGeometry args={[0.48, 0.68, 1.02, 16]} />
        <meshStandardMaterial color={STONE_EDGE} roughness={0.84} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.62, 0]}>
        <cylinderGeometry args={[1.08, 0.92, 0.26, 32]} />
        <meshStandardMaterial color={STONE} roughness={0.86} />
      </mesh>
      <WaterSurface radius={0.84} height={1.76} intensity={intensity} />

      <mesh castShadow receiveShadow position={[0, 2.03, 0]}>
        <cylinderGeometry args={[0.28, 0.4, 0.65, 14]} />
        <meshStandardMaterial color={STONE_EDGE} roughness={0.84} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 2.33, 0]}>
        <cylinderGeometry args={[0.72, 0.58, 0.22, 28]} />
        <meshStandardMaterial color={STONE} roughness={0.86} />
      </mesh>
      <WaterSurface radius={0.53} height={2.45} intensity={intensity} />

      <mesh position={[0, 2.93, 0]}>
        <cylinderGeometry args={[0.045, 0.075, 0.96, 8]} />
        <WaterMaterial opacity={0.74} intensity={intensity} />
      </mesh>
      <mesh position={[0, 3.43, 0]}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <WaterMaterial opacity={0.68} intensity={intensity} />
      </mesh>

      {overflowPositions.map(([x, z]) => (
        <group key={`${x}-${z}`}>
          <mesh position={[x, 2.08, z]}>
            <cylinderGeometry args={[0.025, 0.04, 0.68, 7]} />
            <WaterMaterial opacity={0.6} intensity={intensity} />
          </mesh>
          <mesh position={[x * 1.65, 1.22, z * 1.65]}>
            <cylinderGeometry args={[0.028, 0.045, 0.72, 7]} />
            <WaterMaterial opacity={0.55} intensity={intensity} />
          </mesh>
        </group>
      ))}

      {planterPositions.map(([x, z]) => (
        <FountainPlanter key={`${x}-${z}`} position={[x, 0.34, z]} />
      ))}
    </group>
  )
}

function WaterSurface({ radius, height, intensity }: { radius: number; height: number; intensity: number }) {
  return (
    <mesh position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 36]} />
      <WaterMaterial opacity={0.82} intensity={intensity} />
    </mesh>
  )
}

function WaterMaterial({ opacity, intensity }: { opacity: number; intensity: number }) {
  return (
    <meshStandardMaterial
      color={WATER}
      emissive="#2f8581"
      emissiveIntensity={0.08 * intensity}
      metalness={0.04}
      opacity={opacity}
      roughness={0.2}
      transparent
    />
  )
}

function FountainPlanter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, Math.PI / 4, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.78, 0.34, 0.78]} />
        <meshStandardMaterial color={STONE_EDGE} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.58, 0.08, 0.58]} />
        <meshStandardMaterial color={SOIL} roughness={1} />
      </mesh>
      {[-0.18, 0, 0.18].map((offset, index) => (
        <group key={offset} position={[offset, 0.38 + (index % 2) * 0.05, 0]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.03, 0.36, 6]} />
            <meshStandardMaterial color={LEAF} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.1, 7, 5]} />
            <meshStandardMaterial color={FLOWER} roughness={0.82} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
