import OpenAI from 'openai'
import type { AIDetectionResult, AIDetectionLabel } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function detectAIGenerated(
  text: string,
  options?: {
    prompt?: string | null
    level?: string | null
    wordCount?: number | null
    isFormCompletion?: boolean
  }
): Promise<AIDetectionResult> {
  const { prompt, level, wordCount, isFormCompletion } = options || {}

  // A1/A2 fairness: form completion → not applicable
  if (isFormCompletion) {
    return {
      score: 0,
      label: 'not_applicable',
      confidence: 100,
      reasoning: 'Deteksi AI tidak relevan untuk formulir isian.',
      details: {
        vocabularyDiversity: 0,
        sentenceLengthVariance: 0,
        repetitionScore: 0,
        naturalFlowScore: 0,
      },
      model: 'guardrail',
      analyzedAt: new Date().toISOString(),
    }
  }

  const actualWordCount = wordCount || text.trim().split(/\s+/).length

  // A1/A2 fairness: very short text → insufficient_text
  if (actualWordCount < 5 || text.trim().length < 20) {
    return {
      score: 0,
      label: 'insufficient_text',
      confidence: 100,
      reasoning: 'Teks terlalu pendek untuk analisis AI yang akurat.',
      details: {
        vocabularyDiversity: 0,
        sentenceLengthVariance: 0,
        repetitionScore: 0,
        naturalFlowScore: 0,
      },
      model: 'guardrail',
      analyzedAt: new Date().toISOString(),
    }
  }

  const levelHint = level ? `\nLevel CEFR peserta: ${level}. Pertimbangkan bahwa jawaban level A1/A2 cenderung pendek, sederhana, dan mungkin repetitif secara alami — ini TIDAK otomatis berarti buatan AI.` : ''

  const systemPrompt = `Anda adalah ahli deteksi teks buatan AI untuk bahasa Indonesia.
Analisis apakah teks berikut ditulis oleh manusia atau dihasilkan oleh AI (seperti ChatGPT, Gemini, Claude).${levelHint}

Berikan skor 0-100:
- 0-20: Pasti tulisan manusia (human)
- 21-40: Kemungkinan besar manusia (likely_human)
- 41-60: Tidak yakin — mungkin AI mungkin manusia (uncertain)
- 61-80: Mencurigakan — perlu review manual (needs_review)
- 81-100: Kemungkinan besar buatan AI (likely_ai)

CATATAN PENTING — JANGAN GUNAKAN "ai_generated" KARENA SULIT DIPASTIKAN:
- Untuk teks A1/A2 yang pendek/sederhana, jangan curigai sebagai AI
- Pengulangan kata sederhana pada level A1/A2 adalah WAJAR
- Kalimat pendek dan struktur sederhana pada A1/A2 adalah NORMAL
- Baru curigai AI jika ada kosakata kompleks di luar level peserta

Pertimbangkan:
1. Keragaman kosakata — apakah terlalu bervariasi untuk level A1/A2?
2. Variasi panjang kalimat — manusia tidak konsisten
3. Pengulangan kata/frasa — AI cenderung mengulang struktur
4. Alur alami — apakah terasa seperti tulisan manusia asli
5. Penggunaan idiom dan ekspresi informal khas Indonesia
6. Kesalahan tata bahasa alami yang biasa dibuat pembelajar bahasa
7. Kehadiran pengalaman personal atau detail spesifik

Balas dalam format JSON:
{
  "score": number (0-100),
  "label": "human" | "likely_human" | "uncertain" | "needs_review" | "likely_ai",
  "confidence": number (0-100),
  "reasoning": "Penjelasan singkat dalam bahasa Indonesia (maks 2 kalimat)",
  "details": {
    "vocabularyDiversity": number (0-100),
    "sentenceLengthVariance": number (0-100),
    "repetitionScore": number (0-100, higher = more repetitive),
    "naturalFlowScore": number (0-100, higher = more natural)
  }
}`

  const userContent = prompt
    ? `Prompt tugas: ${prompt}\n\nJawaban peserta:\n${text}`
    : `Jawaban peserta:\n${text}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    })

    const raw = JSON.parse(completion.choices[0].message.content || '{}')
    let label: AIDetectionLabel = raw.label || 'uncertain'

    // Map legacy labels if OpenAI returns old format
    if (label === 'ai_generated') label = 'likely_ai'

    return {
      score: Math.max(0, Math.min(100, raw.score ?? 50)),
      label,
      confidence: Math.max(0, Math.min(100, raw.confidence ?? 50)),
      reasoning: raw.reasoning || '',
      details: {
        vocabularyDiversity: raw.details?.vocabularyDiversity ?? 50,
        sentenceLengthVariance: raw.details?.sentenceLengthVariance ?? 50,
        repetitionScore: raw.details?.repetitionScore ?? 50,
        naturalFlowScore: raw.details?.naturalFlowScore ?? 50,
      },
      model: 'gpt-4o-mini',
      analyzedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('AI detection error:', error)
    return {
      score: 0,
      label: 'uncertain',
      confidence: 0,
      reasoning: 'Gagal menjalankan deteksi AI.',
      details: {
        vocabularyDiversity: 0,
        sentenceLengthVariance: 0,
        repetitionScore: 0,
        naturalFlowScore: 0,
      },
      model: 'error',
      analyzedAt: new Date().toISOString(),
    }
  }
}
