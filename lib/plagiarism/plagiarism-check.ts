import { prisma } from '@/lib/prisma'
import type { PlagiarismReport, PlagiarismMatch, OverallRisk } from './types'

const MIN_WORD_COUNT = 5
const SIMILARITY_THRESHOLD_LOW = 0.3
const SIMILARITY_THRESHOLD_MEDIUM = 0.5
const SIMILARITY_THRESHOLD_HIGH = 0.7
const MAX_COMPARISONS = 50
const NGRAM_SIZE = 4

function extractNGrams(text: string, n: number): Set<string> {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean)
  const ngrams = new Set<string>()
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.add(words.slice(i, i + n).join(' '))
  }
  return ngrams
}

function calculateSimilarity(textA: string, textB: string): number {
  const gramsA = extractNGrams(textA, NGRAM_SIZE)
  const gramsB = extractNGrams(textB, NGRAM_SIZE)

  if (gramsA.size === 0 || gramsB.size === 0) return 0

  let intersection = 0
  for (const g of gramsA) {
    if (gramsB.has(g)) intersection++
  }

  const union = new Set([...gramsA, ...gramsB])
  return union.size > 0 ? intersection / union.size : 0
}

function findMatchingPassages(textA: string, textB: string): string[] {
  const sentencesA = textA.split(/[.!?]+/).map(s => s.trim()).filter(Boolean)
  const matches: string[] = []

  for (const sentence of sentencesA) {
    if (sentence.length < 20) continue
    const grams = extractNGrams(sentence, NGRAM_SIZE)
    const gramsB = extractNGrams(textB, NGRAM_SIZE)
    let matchCount = 0
    for (const g of grams) {
      if (gramsB.has(g)) matchCount++
    }
    const ratio = grams.size > 0 ? matchCount / grams.size : 0
    if (ratio > 0.5) {
      matches.push(sentence)
    }
  }

  return matches
}

function deriveOverallRisk(
  crossPlagiarismScore: number,
  matchCount: number,
  checkedCount: number
): OverallRisk {
  if (crossPlagiarismScore >= 70 && matchCount > 0) return 'high'
  if (crossPlagiarismScore >= 40 && matchCount > 0) return 'medium'
  if (crossPlagiarismScore >= 20) return 'needs_review'
  if (checkedCount === 0) return 'not_applicable'
  return 'low'
}

export async function runPlagiarismCheck(
  responseId: string,
  responseText: string
): Promise<PlagiarismReport> {
  const wordCount = responseText.trim().split(/\s+/).length

  // Insufficient text guardrail
  if (wordCount < MIN_WORD_COUNT || responseText.trim().length < 20) {
    return {
      crossPlagiarismScore: 0,
      overallScore: 0,
      overallRisk: 'not_applicable',
      matches: [],
      checkedResponsesCount: 0,
      checkedAt: new Date().toISOString(),
    }
  }

  // Fetch current response to get sessionItem context
  const current = await prisma.userAnswer.findUnique({
    where: { id: responseId },
    select: {
      sessionItemId: true,
      userId: true,
    },
  })

  if (!current) {
    return {
      crossPlagiarismScore: 0,
      overallScore: 0,
      overallRisk: 'not_applicable',
      matches: [],
      checkedResponsesCount: 0,
      checkedAt: new Date().toISOString(),
    }
  }

  // Fetch only comparable responses: same sessionItem, exclude self, exclude draft/too-short
  const otherResponses = await prisma.userAnswer.findMany({
    where: {
      id: { not: responseId },
      sessionItemId: current.sessionItemId,
      responseText: { not: null },
      responseStatus: { notIn: ['draft'] },
      userId: { not: current.userId }, // exclude self
    },
    select: {
      id: true,
      responseText: true,
    },
    take: MAX_COMPARISONS,
    orderBy: { submittedAt: 'desc' },
  })

  const matches: PlagiarismMatch[] = []
  let totalSimilarity = 0
  let matchCount = 0

  for (const other of otherResponses) {
    if (!other.responseText) continue

    const otherWordCount = other.responseText.trim().split(/\s+/).length
    if (otherWordCount < MIN_WORD_COUNT) continue

    const similarity = calculateSimilarity(responseText, other.responseText)
    if (similarity < SIMILARITY_THRESHOLD_LOW) continue

    const matchingPassages = findMatchingPassages(responseText, other.responseText)

    matches.push({
      matchedResponseId: other.id,
      similarity: Math.round(similarity * 100),
      matchingPassages: matchingPassages.slice(0, 3),
      wordCount: otherWordCount,
    })

    totalSimilarity += similarity
    matchCount++
  }

  matches.sort((a, b) => b.similarity - a.similarity)

  const crossPlagiarismScore = matchCount > 0
    ? Math.round((totalSimilarity / matchCount) * 100)
    : 0

  const overallRisk = deriveOverallRisk(
    crossPlagiarismScore,
    matchCount,
    otherResponses.length
  )

  // Slightly adjust overall score to avoid alarm for very low matches
  const overallScore = matchCount > 0 ? crossPlagiarismScore : 0

  return {
    crossPlagiarismScore,
    overallScore,
    overallRisk,
    matches: matches.slice(0, 10),
    checkedResponsesCount: otherResponses.length,
    checkedAt: new Date().toISOString(),
  }
}
