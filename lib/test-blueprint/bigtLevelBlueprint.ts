import type { Blueprint } from './bigtBlueprint'

export type LevelBlueprintId = 'A1_LEVEL_EXAM' | 'A2_LEVEL_EXAM' | 'A1_A2_PLACEMENT' | 'QUICK_PLACEMENT'

export type SkillCode = 'reading' | 'listening' | 'writing' | 'speaking' | 'mediation' | 'integrated'

export interface LevelBlueprint {
  id: LevelBlueprintId
  label: string
  description: string
  targetLevel: string
  totalItems: number
  estimatedDurationMinutes: number
  activeSkills: SkillCode[]
  futureSkills: SkillCode[]
  sections: Array<{
    skill: SkillCode
    totalItems: number
    sourceLevels: Array<{ cefr: string; count: number }>
  }>
  difficultyDistribution: {
    low: number
    medium: number
    high: number
  }
  scoring: {
    thresholds: Array<{ minPercent: number; level: string; label: string; recommendation: string }>
    skillFloor: number
    highBar: number
    highBarLevel: string
  }
}

export const LEVEL_BLUEPRINTS: Record<LevelBlueprintId, LevelBlueprint> = {
  A1_LEVEL_EXAM: {
    id: 'A1_LEVEL_EXAM',
    label: 'A1 Pemula',
    description: 'Menguji pemahaman dasar dalam situasi sehari-hari — mencakup Membaca, Mendengarkan, Menulis, dan Berbicara.',
    targetLevel: 'A1',
    totalItems: 80,
    estimatedDurationMinutes: 60,
    activeSkills: ['reading', 'listening', 'writing', 'speaking'],
    futureSkills: ['mediation', 'integrated'],
    sections: [
      { skill: 'reading', totalItems: 30, sourceLevels: [{ cefr: 'A1', count: 30 }] },
      { skill: 'listening', totalItems: 30, sourceLevels: [{ cefr: 'A1', count: 30 }] },
      { skill: 'writing', totalItems: 10, sourceLevels: [{ cefr: 'A1', count: 10 }] },
      { skill: 'speaking', totalItems: 10, sourceLevels: [{ cefr: 'A1', count: 10 }] },
    ],
    difficultyDistribution: { low: 30, medium: 45, high: 25 },
    scoring: {
      thresholds: [
        { minPercent: 80, level: 'A1_STRONG', label: 'A1 Kuat', recommendation: 'Peserta siap mencoba level A2.' },
        { minPercent: 60, level: 'A1_ACHIEVED', label: 'A1 Tercapai', recommendation: 'Peserta memahami dasar-dasar bahasa Indonesia dengan baik.' },
        { minPercent: 40, level: 'A1_DEVELOPING', label: 'A1 Berkembang', recommendation: 'Peserta perlu penguatan di beberapa area A1.' },
        { minPercent: 0, level: 'PRE_A1', label: 'Pra-A1', recommendation: 'Mulai dari materi pengenalan dasar A1.' },
      ],
      skillFloor: 40,
      highBar: 80,
      highBarLevel: 'A1+',
    },
  },

  A2_LEVEL_EXAM: {
    id: 'A2_LEVEL_EXAM',
    label: 'A2 Dasar',
    description: 'Menguji pemahaman situasi sehari-hari, jadwal, layanan, dan percakapan pendek — mencakup Membaca, Mendengarkan, Menulis, dan Berbicara.',
    targetLevel: 'A2',
    totalItems: 80,
    estimatedDurationMinutes: 65,
    activeSkills: ['reading', 'listening', 'writing', 'speaking'],
    futureSkills: ['mediation', 'integrated'],
    sections: [
      { skill: 'reading', totalItems: 30, sourceLevels: [{ cefr: 'A2', count: 30 }] },
      { skill: 'listening', totalItems: 30, sourceLevels: [{ cefr: 'A2', count: 30 }] },
      { skill: 'writing', totalItems: 10, sourceLevels: [{ cefr: 'A2', count: 10 }] },
      { skill: 'speaking', totalItems: 10, sourceLevels: [{ cefr: 'A2', count: 10 }] },
    ],
    difficultyDistribution: { low: 25, medium: 50, high: 25 },
    scoring: {
      thresholds: [
        { minPercent: 80, level: 'A2_STRONG', label: 'A2 Kuat', recommendation: 'Peserta siap mencoba level B1.' },
        { minPercent: 65, level: 'A2_ACHIEVED', label: 'A2 Tercapai', recommendation: 'Peserta memahami situasi sehari-hari dengan baik.' },
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
    label: 'Tes Penempatan A1–A2',
    description: 'Menentukan level awal pengguna secara otomatis — mencakup Membaca, Mendengarkan, Menulis, dan Berbicara.',
    targetLevel: 'A1_A2',
    totalItems: 70,
    estimatedDurationMinutes: 60,
    activeSkills: ['reading', 'listening', 'writing', 'speaking'],
    futureSkills: [],
    sections: [
      {
        skill: 'reading', totalItems: 30,
        sourceLevels: [{ cefr: 'A1', count: 15 }, { cefr: 'A2', count: 15 }],
      },
      {
        skill: 'listening', totalItems: 30,
        sourceLevels: [{ cefr: 'A1', count: 15 }, { cefr: 'A2', count: 15 }],
      },
      {
        skill: 'writing', totalItems: 5,
        sourceLevels: [{ cefr: 'A1', count: 3 }, { cefr: 'A2', count: 2 }],
      },
      {
        skill: 'speaking', totalItems: 5,
        sourceLevels: [{ cefr: 'A1', count: 3 }, { cefr: 'A2', count: 2 }],
      },
    ],
    difficultyDistribution: { low: 25, medium: 50, high: 25 },
    scoring: {
      thresholds: [
        { minPercent: 75, level: 'A2_PLUS', label: 'A2+', recommendation: 'Peserta siap mencoba level B1 awal.' },
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
    label: 'Tes Cepat',
    description: 'Tes cepat untuk gambaran awal level.',
    targetLevel: 'QUICK',
    totalItems: 30,
    estimatedDurationMinutes: 25,
    activeSkills: ['reading', 'listening'],
    futureSkills: [],
    sections: [
      {
        skill: 'reading', totalItems: 15,
        sourceLevels: [{ cefr: 'A1', count: 7 }, { cefr: 'A2', count: 8 }],
      },
      {
        skill: 'listening', totalItems: 15,
        sourceLevels: [{ cefr: 'A1', count: 8 }, { cefr: 'A2', count: 7 }],
      },
    ],
    difficultyDistribution: { low: 25, medium: 50, high: 25 },
    scoring: {
      thresholds: [
        { minPercent: 75, level: 'A2_PLUS', label: 'A2+', recommendation: 'Peserta siap mencoba level B1 awal.' },
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

export function getLevelBlueprint(id: string): LevelBlueprint | undefined {
  return LEVEL_BLUEPRINTS[id as LevelBlueprintId]
}

export function listLevelBlueprints(): LevelBlueprint[] {
  return Object.values(LEVEL_BLUEPRINTS)
}

export function findBlueprintByTargetLevel(level: string): LevelBlueprint | undefined {
  const map: Record<string, LevelBlueprintId> = {
    A1: 'A1_LEVEL_EXAM',
    A2: 'A2_LEVEL_EXAM',
  }
  const id = map[level.toUpperCase()]
  return id ? LEVEL_BLUEPRINTS[id] : undefined
}
