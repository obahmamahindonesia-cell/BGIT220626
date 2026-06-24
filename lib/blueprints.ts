import { prisma } from '@/lib/prisma'

export interface BlueprintConfig {
  product: string
  name: string
  description: string
  durationMinutes: number
  defaultQuestionCount: number
  dimensions: string[]
  dimensionWeights: Record<string, number>
  levelDistribution: Record<string, number>
  questionTypeDistribution: Record<string, number>
}

export const BLUEPRINTS: BlueprintConfig[] = [
  {
    product: 'ACADEMIC',
    name: 'BIGT Akademik',
    description: 'Asesmen komprehensif 6 dimensi untuk keperluan akademik dan sertifikasi resmi.',
    durationMinutes: 120,
    defaultQuestionCount: 50,
    dimensions: ['LISTENING', 'READING', 'SPEAKING', 'WRITING', 'MEDIATION', 'INTEGRATED'],
    dimensionWeights: { LISTENING: 0.2, READING: 0.2, SPEAKING: 0.2, WRITING: 0.15, MEDIATION: 0.15, INTEGRATED: 0.1 },
    levelDistribution: { A1: 0.05, A2: 0.1, B1: 0.25, B2: 0.3, C1: 0.2, C2: 0.1 },
    questionTypeDistribution: { MCQ: 0.4, SHORT_ANSWER: 0.2, ESSAY: 0.15, AUDIO_RESPONSE: 0.15, INTEGRATED_TASK: 0.1 },
  },
  {
    product: 'PROFESSIONAL',
    name: 'BIGT Profesional',
    description: 'Asesmen untuk dunia kerja dengan fokus pada konteks profesional dan komunikasi bisnis.',
    durationMinutes: 90,
    defaultQuestionCount: 40,
    dimensions: ['READING', 'SPEAKING', 'WRITING', 'MEDIATION'],
    dimensionWeights: { READING: 0.25, SPEAKING: 0.3, WRITING: 0.25, MEDIATION: 0.2 },
    levelDistribution: { A1: 0, A2: 0.05, B1: 0.2, B2: 0.35, C1: 0.3, C2: 0.1 },
    questionTypeDistribution: { MCQ: 0.3, SHORT_ANSWER: 0.25, ESSAY: 0.2, AUDIO_RESPONSE: 0.2, INTEGRATED_TASK: 0.05 },
  },
  {
    product: 'PLACEMENT',
    name: 'BIGT Penempatan',
    description: 'Tes adaptif-lite 3 tahap untuk menentukan level CEFR peserta secara cepat.',
    durationMinutes: 45,
    defaultQuestionCount: 25,
    dimensions: ['LISTENING', 'READING', 'SPEAKING', 'WRITING'],
    dimensionWeights: { LISTENING: 0.25, READING: 0.25, SPEAKING: 0.25, WRITING: 0.25 },
    levelDistribution: { A1: 0.1, A2: 0.15, B1: 0.4, B2: 0.2, C1: 0.1, C2: 0.05 },
    questionTypeDistribution: { MCQ: 0.5, SHORT_ANSWER: 0.3, ESSAY: 0.1, AUDIO_RESPONSE: 0.1, INTEGRATED_TASK: 0 },
  },
  {
    product: 'PRACTICE',
    name: 'BIGT Latihan',
    description: 'Latihan mandiri fleksibel sesuai pilihan dimensi, level, dan jumlah soal.',
    durationMinutes: 30,
    defaultQuestionCount: 15,
    dimensions: ['LISTENING', 'READING', 'SPEAKING', 'WRITING', 'MEDIATION', 'INTEGRATED'],
    dimensionWeights: { LISTENING: 0.2, READING: 0.2, SPEAKING: 0.2, WRITING: 0.15, MEDIATION: 0.15, INTEGRATED: 0.1 },
    levelDistribution: { A1: 0.15, A2: 0.15, B1: 0.2, B2: 0.2, C1: 0.15, C2: 0.15 },
    questionTypeDistribution: { MCQ: 0.4, SHORT_ANSWER: 0.2, ESSAY: 0.15, AUDIO_RESPONSE: 0.15, INTEGRATED_TASK: 0.1 },
  },
]

export async function seedBlueprints() {
  for (const bp of BLUEPRINTS) {
    await prisma.testBlueprint.upsert({
      where: { product: bp.product as any },
      update: {
        name: bp.name,
        description: bp.description,
        durationMinutes: bp.durationMinutes,
        defaultQuestionCount: bp.defaultQuestionCount,
        dimensionWeights: bp.dimensionWeights,
        levelDistribution: bp.levelDistribution,
        questionTypeDistribution: bp.questionTypeDistribution,
      },
      create: {
        product: bp.product as any,
        name: bp.name,
        description: bp.description,
        durationMinutes: bp.durationMinutes,
        defaultQuestionCount: bp.defaultQuestionCount,
        dimensionWeights: bp.dimensionWeights,
        levelDistribution: bp.levelDistribution,
        questionTypeDistribution: bp.questionTypeDistribution,
      },
    })
  }
}

export function getBlueprint(product: string): BlueprintConfig | null {
  return BLUEPRINTS.find(b => b.product === product.toUpperCase()) || null
}

export function distributeQuestions(
  totalCount: number,
  dimensionWeights: Record<string, number>,
  selectedDimensions: string[]
): Record<string, number> {
  const filtered: Record<string, number> = {}
  const active = selectedDimensions.length > 0
    ? selectedDimensions
    : Object.keys(dimensionWeights)

  const activeWeights: Record<string, number> = {}
  let totalWeight = 0
  for (const d of active) {
    const w = dimensionWeights[d] || 0
    activeWeights[d] = w
    totalWeight += w
  }

  let allocated = 0
  for (const d of active) {
    const count = Math.round((activeWeights[d] / totalWeight) * totalCount)
    filtered[d] = count
    allocated += count
  }

  // Adjust rounding errors
  const diff = totalCount - allocated
  if (diff !== 0 && active.length > 0) {
    filtered[active[0]] = (filtered[active[0]] || 0) + diff
  }

  return filtered
}
