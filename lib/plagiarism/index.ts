import { detectAIGenerated } from './ai-detection'
import { runPlagiarismCheck } from './plagiarism-check'
import { prisma } from '@/lib/prisma'
import type { PlagiarismCheckResult, AIDetectionResult, PlagiarismReport, OverallRisk, AIDetectionLabel } from './types'

export type { PlagiarismCheckResult, AIDetectionResult, PlagiarismReport, OverallRisk, AIDetectionLabel }

export { detectAIGenerated, runPlagiarismCheck }

export async function runFullPlagiarismCheck(
  responseId: string,
  responseText: string,
  options?: {
    prompt?: string | null
    level?: string | null
    wordCount?: number | null
    isFormCompletion?: boolean
  }
): Promise<PlagiarismCheckResult> {
  if (!responseText || responseText.trim().length < 5) {
    return {
      version: '1.0',
      checkedAt: new Date().toISOString(),
      aiDetection: {
        score: 0,
        label: 'insufficient_text',
        confidence: 100,
        reasoning: 'Teks terlalu pendek untuk dianalisis.',
        details: {
          vocabularyDiversity: 0,
          sentenceLengthVariance: 0,
          repetitionScore: 0,
          naturalFlowScore: 0,
        },
        model: 'guardrail',
        analyzedAt: new Date().toISOString(),
      },
      plagiarism: {
        crossPlagiarismScore: 0,
        overallScore: 0,
        overallRisk: 'not_applicable',
        matches: [],
        checkedResponsesCount: 0,
        checkedAt: new Date().toISOString(),
      },
      overallRisk: 'not_applicable',
      message: 'Teks terlalu pendek untuk dianalisis.',
    }
  }

  const [aiDetection, plagiarism] = await Promise.all([
    detectAIGenerated(responseText, {
      prompt: options?.prompt,
      level: options?.level,
      wordCount: options?.wordCount,
      isFormCompletion: options?.isFormCompletion,
    }),
    runPlagiarismCheck(responseId, responseText),
  ])

  // Derive overall risk from both checks
  const overallRisk = deriveCombinedRisk(aiDetection, plagiarism)

  return {
    version: '1.0',
    checkedAt: new Date().toISOString(),
    aiDetection,
    plagiarism,
    overallRisk,
    message: deriveMessage(overallRisk, aiDetection.label, plagiarism.overallRisk),
  }
}

function deriveCombinedRisk(
  aiDetection: AIDetectionResult,
  plagiarism: PlagiarismReport
): OverallRisk {
  if (
    aiDetection.label === 'insufficient_text' ||
    aiDetection.label === 'not_applicable'
  ) {
    return 'not_applicable'
  }

  const aiRisk: OverallRisk =
    aiDetection.label === 'likely_ai' ? 'high' :
    aiDetection.label === 'needs_review' ? 'needs_review' :
    aiDetection.label === 'uncertain' ? 'medium' :
    'low'

  const scores = [aiRisk, plagiarism.overallRisk]

  if (scores.includes('high')) return 'high'
  if (scores.includes('needs_review')) return 'needs_review'
  if (scores.includes('medium')) return 'medium'
  if (scores.includes('not_applicable')) return 'not_applicable'
  return 'low'
}

function deriveMessage(
  overallRisk: OverallRisk,
  aiLabel: AIDetectionLabel,
  plagiarismRisk: OverallRisk
): string {
  if (aiLabel === 'insufficient_text') return 'Teks terlalu pendek untuk analisis yang akurat.'
  if (aiLabel === 'not_applicable') return 'Pemeriksaan tidak berlaku untuk tipe respons ini.'
  if (overallRisk === 'high') return 'Terindikasi potensi pelanggaran. Perlu review manual segera.'
  if (overallRisk === 'needs_review') return 'Beberapa indikator perlu diperiksa lebih lanjut oleh reviewer.'
  if (overallRisk === 'medium') return 'Terdapat sedikit kecurigaan. Disarankan review manual.'
  if (plagiarismRisk === 'not_applicable') return 'Tidak ada jawaban pembanding untuk deteksi plagiarisme.'
  return 'Tidak ditemukan indikasi pelanggaran yang signifikan.'
}

export async function savePlagiarismResult(
  responseId: string,
  result: PlagiarismCheckResult,
  checkedBy?: string
): Promise<void> {
  const payload: Record<string, any> = {
    plagiarismReport: {
      version: result.version,
      checkedAt: result.checkedAt,
      checkedBy: checkedBy || 'system',
      aiDetection: result.aiDetection,
      plagiarism: result.plagiarism,
      overallRisk: result.overallRisk,
      message: result.message,
    },
    assistedScoring: null,
  }

  await prisma.userAnswer.update({
    where: { id: responseId },
    data: { autoScoreJson: payload as any },
  })
}

export async function getPlagiarismResult(responseId: string): Promise<PlagiarismCheckResult | null> {
  const answer = await prisma.userAnswer.findUnique({
    where: { id: responseId },
    select: { autoScoreJson: true },
  })

  if (!answer?.autoScoreJson) return null

  const data = answer.autoScoreJson as Record<string, any>
  const report = data?.plagiarismReport

  if (!report) return null

  return {
    version: report.version || '1.0',
    checkedAt: report.checkedAt || new Date().toISOString(),
    aiDetection: report.aiDetection || null,
    plagiarism: report.plagiarism || null,
    overallRisk: report.overallRisk || 'low',
    message: report.message || '',
  }
}
