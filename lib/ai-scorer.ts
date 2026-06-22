import OpenAI from 'openai'
import { toFile } from 'openai'

let openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

export async function scoreWriting(prompt: string, response: string, rubric: Record<string, unknown> | null, level: string) {
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert Indonesian language assessor. Evaluate the writing response based on CEFR level ${level} standards.

Scoring criteria:
- Task Achievement (0-25 points): Does the response address the prompt completely?
- Coherence & Cohesion (0-25 points): Is the text well-organized and logically connected?
- Lexical Resource (0-25 points): Range and accuracy of vocabulary
- Grammatical Range & Accuracy (0-25 points): Range and accuracy of grammatical structures

Provide:
1. Total score (0-100)
2. Breakdown by criteria
3. CEFR level assessment (A1-C2)
4. Strengths (2-3 bullet points)
5. Areas for improvement (2-3 bullet points)
6. Specific feedback in Indonesian

Respond in JSON format:
{
  "score": number,
  "breakdown": {
    "taskAchievement": number,
    "coherenceCohesion": number,
    "lexicalResource": number,
    "grammaticalRangeAccuracy": number
  },
  "cefrLevel": string,
  "strengths": string[],
  "improvements": string[],
  "feedback": string
}`,
        },
        {
          role: 'user',
          content: `Prompt: ${prompt}\n\nResponse: ${response}\n\nRubric: ${JSON.stringify(rubric)}`,
        },
      ],
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return result
  } catch (error) {
    console.error('Error scoring writing:', error)
    throw error
  }
}

export async function scoreSpeaking(audioBase64: string, prompt: string, level: string) {
  try {
    const audioBuffer = Buffer.from(audioBase64, 'base64')
    const audioFile = await toFile(audioBuffer, 'audio.webm', { type: 'audio/webm' })
    
    const transcription = await getOpenAI().audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'id',
    })

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert Indonesian language speaking assessor. Evaluate the speaking response based on CEFR level ${level} standards.

Scoring criteria:
- Fluency & Coherence (0-25 points): Smoothness and logical flow of speech
- Lexical Resource (0-25 points): Range and accuracy of vocabulary
- Grammatical Range & Accuracy (0-25 points): Range and accuracy of grammatical structures
- Pronunciation (0-25 points): Clarity and naturalness of pronunciation

Provide:
1. Total score (0-100)
2. Breakdown by criteria
3. CEFR level assessment (A1-C2)
4. Strengths (2-3 bullet points)
5. Areas for improvement (2-3 bullet points)
6. Specific feedback in Indonesian

Respond in JSON format:
{
  "score": number,
  "transcription": string,
  "breakdown": {
    "fluencyCoherence": number,
    "lexicalResource": number,
    "grammaticalRangeAccuracy": number,
    "pronunciation": number
  },
  "cefrLevel": string,
  "strengths": string[],
  "improvements": string[],
  "feedback": string
}`,
        },
        {
          role: 'user',
          content: `Prompt: ${prompt}\n\nTranscription: ${transcription.text}`,
        },
      ],
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    result.transcription = transcription.text
    return result
  } catch (error) {
    console.error('Error scoring speaking:', error)
    throw error
  }
}

export function normalizeScore(rawScore: number, maxScore: number = 100): number {
  return Math.min(100, Math.max(0, (rawScore / maxScore) * 100))
}

export function mapToCEFR(score: number): string {
  if (score >= 90) return 'C2'
  if (score >= 75) return 'C1'
  if (score >= 60) return 'B2'
  if (score >= 40) return 'B1'
  if (score >= 20) return 'A2'
  return 'A1'
}
