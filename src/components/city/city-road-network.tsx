import {
  CITY_ROAD_SEGMENTS,
  type RoadSegment,
} from "@/lib/city/road-layout"

const ROAD_LENGTH = 43

export function CityRoadNetwork() {
  return (
    <group>
      {CITY_ROAD_SEGMENTS.map((road) => (
        <RoadStrip key={road.id} {...road} />
      ))}
    </group>
  )
}

function RoadStrip({ position, rotation, width }: RoadSegment) {
  return (
    <group position={[position[0], 0, position[1]]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.09, 0]} receiveShadow>
        <boxGeometry args={[ROAD_LENGTH, 0.06, width + 0.22]} />
        <meshStandardMaterial color="#ded5c2" roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.135, 0]} receiveShadow>
        <boxGeometry args={[ROAD_LENGTH, 0.04, width]} />
        <meshStandardMaterial color="#a7a89f" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.16, 0]} receiveShadow>
        <boxGeometry args={[ROAD_LENGTH, 0.012, 0.035]} />
        <meshStandardMaterial color="#eee4ce" roughness={0.9} />
      </mesh>
    </group>
  )
}
