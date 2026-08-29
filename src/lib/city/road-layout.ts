export interface RoadSegment {
  id: string
  position: [number, number]
  rotation: number
  width: number
}

export const ROAD_GRID_OFFSETS = [-11, 0, 11] as const
export const ROAD_DECORATION_CLEARANCE = 1.1

const PRIMARY_ROAD_WIDTH = 0.82
const SECONDARY_ROAD_WIDTH = 0.5

export const CITY_ROAD_SEGMENTS: RoadSegment[] = [
  { id: "central-east-west", position: [0, 0], rotation: 0, width: PRIMARY_ROAD_WIDTH },
  { id: "central-north-south", position: [0, 0], rotation: Math.PI / 2, width: PRIMARY_ROAD_WIDTH },
  { id: "north-east-west", position: [0, -11], rotation: 0, width: SECONDARY_ROAD_WIDTH },
  { id: "south-east-west", position: [0, 11], rotation: 0, width: SECONDARY_ROAD_WIDTH },
  { id: "west-north-south", position: [-11, 0], rotation: Math.PI / 2, width: SECONDARY_ROAD_WIDTH },
  { id: "east-north-south", position: [11, 0], rotation: Math.PI / 2, width: SECONDARY_ROAD_WIDTH },
]

export function isPositionClearOfRoads(
  position: { x: number; z: number },
  clearance = ROAD_DECORATION_CLEARANCE,
) {
  return (
    ROAD_GRID_OFFSETS.every((offset) => Math.abs(position.x - offset) > clearance) &&
    ROAD_GRID_OFFSETS.every((offset) => Math.abs(position.z - offset) > clearance)
  )
}
