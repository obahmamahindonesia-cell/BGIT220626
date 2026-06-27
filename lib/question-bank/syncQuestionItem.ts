import { prisma } from '@/lib/prisma'
import { getCorrectAnswer, getExplanation } from '@/lib/question-bank/loadQuestionBank'
import type { QuestionSet, ReadingSet, ListeningSet, ConstructedSet, ConstructedResponseItem } from '@/types/question-bank'

const SKILL_TO_DIMENSION: Record<string, 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING' | 'INTEGRATED'> = {
  listening: 'LISTENING',
  reading: 'READING',
  speaking: 'SPEAKING',
  writing: 'WRITING',
  integrated: 'INTEGRATED',
}

const TYPE_MAP: Record<string, 'MCQ' | 'SHORT_ANSWER' | 'ESSAY' | 'AUDIO_RESPONSE' | 'INTEGRATED_TASK'> = {
  multiple_choice: 'MCQ',
  true_false: 'MCQ',
  matching: 'MCQ',
  short_answer: 'SHORT_ANSWER',
  essay: 'ESSAY',
  audio_response: 'AUDIO_RESPONSE',
  integrated_task: 'INTEGRATED_TASK',
}

const CONSTRUCTED_TYPE_MAP: Record<string, 'ESSAY' | 'AUDIO_RESPONSE' | 'INTEGRATED_TASK'> = {
  text: 'ESSAY',
  audio: 'AUDIO_RESPONSE',
  text_audio: 'AUDIO_RESPONSE',
}

const CEFR_MAP: Record<string, 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'> = {
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
  B2: 'B2',
  C1: 'C1',
  C2: 'C2',
}

export async function syncQuestionItem(questionId: string): Promise<string | null> {
  const existing = await prisma.questionItem.findUnique({ where: { code: questionId } })
  if (existing) return existing.id

  const all = await getAllSetsAsync()

  for (const set of all) {
    const dim = SKILL_TO_DIMENSION[set.skill]
    if (!dim) continue
    const cefr = CEFR_MAP[set.cefr]
    if (!cefr) continue

    if (set.skill === 'reading') {
      const rs = set as ReadingSet
      for (const passage of rs.passages) {
        for (const item of passage.items) {
          if (item.questionId !== questionId) continue

          const qType = TYPE_MAP[item.type] || 'MCQ'
          const created = await prisma.questionItem.create({
            data: {
              code: item.questionId,
              dimension: dim,
              subskill: item.subskill,
              questionType: qType,
              level: cefr,
              difficulty: Math.max(1, Math.round(item.difficulty * 18)),
              topic: passage.topic,
              prompt: item.prompt,
              correctAnswer: item.answer,
              explanation: item.explanation,
              status: 'DRAFT',
              tags: ['file-bank', `source:${set.setId}`],
            },
          })

          if ('options' in item && item.options && item.options.length > 0) {
            await prisma.questionOption.createMany({
              data: item.options.map((o, i) => ({
                questionId: created.id,
                label: o.key,
                text: o.text,
                isCorrect: o.key === item.answer,
                order: i + 1,
              })),
            })
          }

          return created.id
        }
      }
    }

    if (['writing', 'speaking', 'integrated'].includes(set.skill)) {
      const cs = set as ConstructedSet
      for (const item of cs.items) {
        if (item.id !== questionId) continue

        const qType = CONSTRUCTED_TYPE_MAP[item.responseMode] || 'ESSAY'
        const created = await prisma.questionItem.create({
          data: {
            code: item.id,
            dimension: dim,
            subskill: item.taskType,
            questionType: qType,
            level: cefr,
            difficulty: Math.max(1, Math.round((item.difficulty || 0.5) * 18)),
            topic: item.tags?.[0] || '',
            prompt: item.prompt,
            correctAnswer: item.adminOnly?.sampleResponse || '',
            explanation: item.adminOnly?.scoringNotes || '',
            status: 'DRAFT',
            tags: ['file-bank', `source:${set.setId}`],
          },
        })

        return created.id
      }
    }

    if (set.skill === 'listening') {
      const ls = set as ListeningSet
      for (const item of ls.items) {
        if (item.questionId !== questionId) continue

        const created = await prisma.questionItem.create({
          data: {
            code: item.questionId,
            dimension: dim,
            subskill: item.subskill,
            questionType: 'MCQ',
            level: cefr,
            difficulty: Math.max(1, Math.round(item.difficulty * 18)),
            topic: item.topic,
            prompt: item.prompt,
            correctAnswer: item.answer,
            explanation: item.explanation,
            status: 'DRAFT',
            tags: ['file-bank', `source:${set.setId}`],
          },
        })

        if ('options' in item && item.options && item.options.length > 0) {
          await prisma.questionOption.createMany({
            data: item.options.map((o, i) => ({
              questionId: created.id,
              label: o.key,
              text: o.text,
              isCorrect: o.key === item.answer,
              order: i + 1,
            })),
          })
        }

        return created.id
      }
    }
  }

  return null
}

async function getAllSetsAsync(): Promise<QuestionSet[]> {
  const fs = await import('fs')
  const path = await import('path')
  const DATA_DIR = path.resolve(process.cwd(), 'data', 'question-bank')
  const result: QuestionSet[] = []

  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'audio-manifests') continue
        walkDir(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
          if (raw.setId) result.push(raw as QuestionSet)
        } catch {}
      }
    }
  }

  walkDir(DATA_DIR)
  return result
}
