import { openai } from '@/lib/openai'
import { AIScoreResult, QuestionRubric } from '@/types'

const SCORING_SYSTEM_PROMPT = `
Kamu adalah penilai kemahiran Bahasa Indonesia yang terlatih menggunakan framework CEFR.
Evaluasi jawaban peserta berdasarkan rubrik yang diberikan.
Berikan:
1. score: angka 0-10 (satu desimal)
2. level: level CEFR yang sesuai (A1/A2/B1/B2/C1/C2)
3. feedback: maksimal 3 kalimat, spesifik dan konstruktif dalam Bahasa Indonesia
4. strengths: array 1-2 poin kelebihan
5. improvements: array 1-2 poin yang perlu ditingkatkan

Respond ONLY in JSON format.
`

export async function evaluateWithAI(
  prompt: string,
  response: string,
  rubric: QuestionRubric | null
): Promise<AIScoreResult> {
  const userMessage = `
Soal: ${prompt}

Jawaban Peserta:
${response}

${rubric ? `Rubrik Penilaian: ${JSON.stringify(rubric)}` : ''}
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SCORING_SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
  })

  const result = JSON.parse(completion.choices[0].message.content || '{}')
  
  return {
    score: result.score || 0,
    level: result.level || 'B1',
    feedback: result.feedback || '',
    strengths: result.strengths || [],
    improvements: result.improvements || [],
  }
}
