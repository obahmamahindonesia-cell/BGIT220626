import * as fs from 'fs'
import * as path from 'path'
import type { Cefr, Skill, QuestionSet, ReadingSet, ListeningSet, SanitizedQuestion } from '@/types/question-bank'

const DATA_DIR = path.resolve(process.cwd(), 'data', 'question-bank')

const SKILL_DIR_MAP: Record<Skill, string> = {
  reading: 'reading',
  listening: 'listening',
  writing: 'writing',
  speaking: 'speaking',
  integrated: 'integrated',
}

let cache: Map<string, QuestionSet> | null = null

function loadAllSets(): Map<string, QuestionSet> {
  if (cache) return cache
  cache = new Map()

  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walkDir(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
          if (raw.setId && cache) {
            cache.set(raw.setId, raw as QuestionSet)
          }
        } catch {
          // skip invalid files silently
        }
      }
    }
  }

  walkDir(DATA_DIR)
  return cache!
}

export function getQuestionSet(setId: string): QuestionSet | null {
  const all = loadAllSets()
  return all.get(setId) ?? null
}

export function getQuestionsByLevel(cefr: Cefr): QuestionSet[] {
  const all = loadAllSets()
  return Array.from(all.values()).filter(s => s.cefr === cefr)
}

export function getQuestionsBySkill(skill: Skill): QuestionSet[] {
  const all = loadAllSets()
  return Array.from(all.values()).filter(s => s.skill === skill)
}

export function getAllSetsMeta(): Array<Pick<QuestionSet, 'setId' | 'cefr' | 'skill' | 'title' | 'status' | 'itemsCount'>> {
  const all = loadAllSets()
  return Array.from(all.values()).map(s => ({
    setId: s.setId,
    cefr: s.cefr,
    skill: s.skill,
    title: s.title,
    status: s.status,
    itemsCount: s.itemsCount,
  }))
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getQuestionsForTest(options: {
  cefr: Cefr
  skill: Skill
  limit?: number
}): SanitizedQuestion[] {
  const { cefr, skill, limit = 10 } = options
  const sets = getQuestionsByLevel(cefr).filter(s => s.skill === skill)
  const result: SanitizedQuestion[] = []

  for (const set of sets) {
    if (result.length >= limit) break
    if (set.skill === 'reading') {
      const rs = set as ReadingSet
      for (const passage of rs.passages) {
        for (const item of passage.items) {
          if (result.length >= limit) break
          result.push({
            questionId: item.questionId,
            type: item.type,
            subskill: item.subskill,
            difficulty: item.difficulty,
            prompt: item.prompt,
            options: 'options' in item && item.options ? shuffleArray(item.options) : undefined,
            passageTitle: passage.title,
            passageText: passage.text,
            points: item.points,
          })
        }
      }
    } else if (set.skill === 'listening') {
      const ls = set as ListeningSet
      for (const item of ls.items) {
        if (result.length >= limit) break
        result.push({
          questionId: item.questionId,
          type: item.type,
          subskill: item.subskill,
          difficulty: item.difficulty,
          prompt: item.prompt,
          options: item.options ? shuffleArray(item.options) : undefined,
          topic: item.topic,
          audioUrl: `${ls.audioBasePath}${item.audioFile}`,
          points: item.points,
        })
      }
    }
  }

  return shuffleArray(result)
}

export function getNextQuestion(_options: {
  userId: string
  currentLevel: string
  skill: Skill
  previousAnswers: Array<{ questionId: string; isCorrect: boolean }>
}): SanitizedQuestion | null {
  const { currentLevel, skill, previousAnswers } = _options

  const answeredIds = new Set(previousAnswers.map(a => a.questionId))

  const correctRate = previousAnswers.length > 0
    ? previousAnswers.filter(a => a.isCorrect).length / previousAnswers.length
    : 0.5

  const levelIndex = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(currentLevel)
  let targetLevel: Cefr = currentLevel as Cefr

  if (correctRate > 0.8 && levelIndex < 5) {
    targetLevel = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'][levelIndex + 1] as Cefr
  } else if (correctRate < 0.3 && levelIndex > 0) {
    targetLevel = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'][levelIndex - 1] as Cefr
  }

  const sets = getQuestionsByLevel(targetLevel).filter(s => s.skill === skill)
  const candidates: SanitizedQuestion[] = []

  for (const set of sets) {
    if (set.skill === 'reading') {
      const rs = set as ReadingSet
      for (const passage of rs.passages) {
        for (const item of passage.items) {
          if (answeredIds.has(item.questionId)) continue
          candidates.push({
            questionId: item.questionId,
            type: item.type,
            subskill: item.subskill,
            difficulty: item.difficulty,
            prompt: item.prompt,
            options: 'options' in item && item.options ? shuffleArray(item.options) : undefined,
            passageTitle: passage.title,
            passageText: passage.text,
            points: item.points,
          })
        }
      }
    } else if (set.skill === 'listening') {
      const ls = set as ListeningSet
      for (const item of ls.items) {
        if (answeredIds.has(item.questionId)) continue
        candidates.push({
          questionId: item.questionId,
          type: item.type,
          subskill: item.subskill,
          difficulty: item.difficulty,
          prompt: item.prompt,
          options: shuffleArray(item.options ?? []),
          topic: item.topic,
          audioUrl: `${ls.audioBasePath}${item.audioFile}`,
          points: item.points,
        })
      }
    }
  }

  return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : null
}

export function getCorrectAnswer(questionId: string): string | null {
  const all = loadAllSets()
  for (const set of all.values()) {
    if (set.skill === 'reading') {
      const rs = set as ReadingSet
      for (const passage of rs.passages) {
        for (const item of passage.items) {
          if (item.questionId === questionId) return item.answer
        }
      }
    } else if (set.skill === 'listening') {
      const ls = set as ListeningSet
      for (const item of ls.items) {
        if (item.questionId === questionId) return item.answer
      }
    }
  }
  return null
}

export function getExplanation(questionId: string): string | null {
  const all = loadAllSets()
  for (const set of all.values()) {
    if (set.skill === 'reading') {
      const rs = set as ReadingSet
      for (const passage of rs.passages) {
        for (const item of passage.items) {
          if (item.questionId === questionId) return item.explanation
        }
      }
    } else if (set.skill === 'listening') {
      const ls = set as ListeningSet
      for (const item of ls.items) {
        if (item.questionId === questionId) return item.explanation
      }
    }
  }
  return null
}
