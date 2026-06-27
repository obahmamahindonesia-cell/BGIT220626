export type AIDetectionLabel =
  | 'human'
  | 'likely_human'
  | 'uncertain'
  | 'needs_review'
  | 'likely_ai'
  | 'ai_generated'
  | 'insufficient_text'
  | 'not_applicable'

export type OverallRisk = 'low' | 'medium' | 'high' | 'needs_review' | 'not_applicable'

export interface AIDetectionResult {
  score: number
  label: AIDetectionLabel
  confidence: number
  reasoning: string
  details: {
    vocabularyDiversity: number
    sentenceLengthVariance: number
    repetitionScore: number
    naturalFlowScore: number
  }
  model: string
  analyzedAt: string
}

export interface PlagiarismMatch {
  matchedResponseId: string
  similarity: number
  matchingPassages: string[]
  wordCount: number
}

export interface PlagiarismReport {
  crossPlagiarismScore: number
  overallScore: number
  overallRisk: OverallRisk
  matches: PlagiarismMatch[]
  checkedResponsesCount: number
  checkedAt: string
}

export interface PlagiarismCheckResult {
  version: string
  checkedAt: string
  aiDetection: AIDetectionResult | null
  plagiarism: PlagiarismReport | null
  overallRisk: OverallRisk
  message: string
}
