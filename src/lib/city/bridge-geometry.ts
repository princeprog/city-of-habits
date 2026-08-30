export type BridgeStage = 0 | 1 | 2 | 3

export interface BridgeGeometryProfile {
  plotSize: number
  deckLength: number
  deckWidth: number
  archRise: number
  railPostCount: number
  abutmentCount: number
  lampCount: number
  hasArch: boolean
  hasWaterClearance: boolean
}

function normalizeStage(stage: number): BridgeStage {
  return Math.max(0, Math.min(3, Math.floor(stage))) as BridgeStage
}

export function getBridgeGeometryProfile(stage: number, milestoneCount = 0): BridgeGeometryProfile {
  const normalizedStage = normalizeStage(stage)
  const hasArch = normalizedStage >= 1
  const established = normalizedStage >= 3 || milestoneCount >= 2

  return {
    plotSize: 2.45,
    deckLength: normalizedStage === 0 ? 0 : normalizedStage === 1 ? 1.76 : normalizedStage === 2 ? 1.98 : 2.16,
    deckWidth: normalizedStage >= 2 ? 1.5 : 1.34,
    archRise: normalizedStage === 0 ? 0 : normalizedStage === 1 ? 0.68 : normalizedStage === 2 ? 0.84 : 0.98,
    railPostCount: normalizedStage === 0 ? 0 : normalizedStage === 1 ? 3 : 5,
    abutmentCount: 2,
    lampCount: established ? 4 : 0,
    hasArch,
    hasWaterClearance: hasArch,
  }
}
