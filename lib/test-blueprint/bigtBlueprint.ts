export type BlueprintId = 'A1_DIAGNOSTIC' | 'A2_DIAGNOSTIC' | 'A1_A2_PLACEMENT' | 'QUICK_PLACEMENT'

interface DifficultyBand {
  low: [number, number]
  medium: [number, number]
  high: [number, number]
}

interface SectionConfig {
  skill: 'reading' | 'listening'
  count: number
  sourceLevels: Array<{ cefr: string; count: number }>
}

export interface Blueprint {
  id: BlueprintId
  name: string
  description: string
  totalItems: number
  estimatedDurationMinutes: number
  sections: SectionConfig[]
  difficultyBands: Record<string, DifficultyBand>
  scoring: {
    thresholds: Array<{ minPercent: number; level: string; label: string; recommendation: string }>
    skillFloor: number
    highBar: number
    highBarLevel: string
  }
}

export const BIGT_BLUEPRINTS: Record<BlueprintId, Blueprint> = {
  A1_DIAGNOSTIC: {
    id: 'A1_DIAGNOSTIC',
    name: 'Diagnostik A1',
    description: 'Menentukan apakah user berada di bawah A1, A1, atau siap naik ke A2.',
    totalItems: 40,
    estimatedDurationMinutes: 30,
    sections: [
      { skill: 'reading', count: 20, sourceLevels: [{ cefr: 'A1', count: 20 }] },
      { skill: 'listening', count: 20, sourceLevels: [{ cefr: 'A1', count: 20 }] },
    ],
    difficultyBands: {
      A1: { low: [0.10, 0.18], medium: [0.19, 0.24], high: [0.25, 0.45] },
    },
    scoring: {
      thresholds: [
        { minPercent: 70, level: 'A1', label: 'A1 Tercapai', recommendation: 'Peserta siap mencoba level A2.' },
        { minPercent: 40, level: 'A1_DEVELOPING', label: 'A1 Berkembang', recommendation: 'Peserta perlu penguatan di beberapa area A1.' },
        { minPercent: 0, level: 'PRE_A1', label: 'Pra-A1', recommendation: 'Mulai dari materi pengenalan dasar A1.' },
      ],
      skillFloor: 40,
      highBar: 80,
      highBarLevel: 'A1+',
    },
  },

  A2_DIAGNOSTIC: {
    id: 'A2_DIAGNOSTIC',
    name: 'Diagnostik A2',
    description: 'Menentukan apakah user berada di A1 kuat, A2, atau siap masuk B1.',
    totalItems: 40,
    estimatedDurationMinutes: 35,
    sections: [
      { skill: 'reading', count: 20, sourceLevels: [{ cefr: 'A2', count: 20 }] },
      { skill: 'listening', count: 20, sourceLevels: [{ cefr: 'A2', count: 20 }] },
    ],
    difficultyBands: {
      A2: { low: [0.20, 0.30], medium: [0.31, 0.38], high: [0.39, 0.45] },
    },
    scoring: {
      thresholds: [
        { minPercent: 80, level: 'A2+', label: 'A2+', recommendation: 'Peserta siap mencoba level B1.' },
        { minPercent: 70, level: 'A2', label: 'A2 Tercapai', recommendation: 'Peserta memahami situasi sehari-hari dengan baik.' },
        { minPercent: 45, level: 'A2_DEVELOPING', label: 'A2 Berkembang', recommendation: 'Peserta perlu penguatan di beberapa area A2.' },
        { minPercent: 0, level: 'A1_STRONG', label: 'A1 Kuat', recommendation: 'Peserta belum sepenuhnya di A2, perkuat dasar A2.' },
      ],
      skillFloor: 40,
      highBar: 80,
      highBarLevel: 'A2+',
    },
  },

  A1_A2_PLACEMENT: {
    id: 'A1_A2_PLACEMENT',
    name: 'Penempatan A1–A2',
    description: 'Placement awal untuk user baru.',
    totalItems: 60,
    estimatedDurationMinutes: 45,
    sections: [
      {
        skill: 'reading', count: 30,
        sourceLevels: [{ cefr: 'A1', count: 15 }, { cefr: 'A2', count: 15 }],
      },
      {
        skill: 'listening', count: 30,
        sourceLevels: [{ cefr: 'A1', count: 15 }, { cefr: 'A2', count: 15 }],
      },
    ],
    difficultyBands: {
      A1: { low: [0.10, 0.18], medium: [0.19, 0.24], high: [0.25, 0.45] },
      A2: { low: [0.20, 0.30], medium: [0.31, 0.38], high: [0.39, 0.45] },
    },
    scoring: {
      thresholds: [
        { minPercent: 75, level: 'A2+', label: 'A2+', recommendation: 'Peserta siap mencoba level B1 awal.' },
        { minPercent: 55, level: 'A2', label: 'A2', recommendation: 'Peserta memahami situasi sehari-hari sederhana.' },
        { minPercent: 35, level: 'A1', label: 'A1', recommendation: 'Peserta memahami informasi sangat dasar.' },
        { minPercent: 0, level: 'PRE_A1', label: 'Pra-A1', recommendation: 'Mulai dari materi pengenalan dasar.' },
      ],
      skillFloor: 40,
      highBar: 70,
      highBarLevel: 'A2+',
    },
  },

  QUICK_PLACEMENT: {
    id: 'QUICK_PLACEMENT',
    name: 'Penempatan Cepat',
    description: 'Tes cepat/demo untuk gambaran awal level.',
    totalItems: 30,
    estimatedDurationMinutes: 20,
    sections: [
      {
        skill: 'reading', count: 15,
        sourceLevels: [{ cefr: 'A1', count: 7 }, { cefr: 'A2', count: 8 }],
      },
      {
        skill: 'listening', count: 15,
        sourceLevels: [{ cefr: 'A1', count: 8 }, { cefr: 'A2', count: 7 }],
      },
    ],
    difficultyBands: {
      A1: { low: [0.10, 0.18], medium: [0.19, 0.24], high: [0.25, 0.45] },
      A2: { low: [0.20, 0.30], medium: [0.31, 0.38], high: [0.39, 0.45] },
    },
    scoring: {
      thresholds: [
        { minPercent: 75, level: 'A2+', label: 'A2+', recommendation: 'Peserta siap mencoba level B1 awal.' },
        { minPercent: 55, level: 'A2', label: 'A2', recommendation: 'Peserta memahami situasi sehari-hari sederhana.' },
        { minPercent: 35, level: 'A1', label: 'A1', recommendation: 'Peserta memahami informasi sangat dasar.' },
        { minPercent: 0, level: 'PRE_A1', label: 'Pra-A1', recommendation: 'Mulai dari materi pengenalan dasar.' },
      ],
      skillFloor: 40,
      highBar: 70,
      highBarLevel: 'A2+',
    },
  },
}

export function getBlueprint(id: string): Blueprint | undefined {
  return BIGT_BLUEPRINTS[id as BlueprintId]
}

export function listBlueprints(): Array<{ id: BlueprintId; name: string; description: string; totalItems: number; estimatedDurationMinutes: number }> {
  return Object.values(BIGT_BLUEPRINTS).map(b => ({
    id: b.id,
    name: b.name,
    description: b.description,
    totalItems: b.totalItems,
    estimatedDurationMinutes: b.estimatedDurationMinutes,
  }))
}
