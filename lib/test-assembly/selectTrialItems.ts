import * as fs from 'fs'
import * as path from 'path'
import type { QuestionSet, ReadingSet, ListeningSet, ConstructedSet, ConstructedResponseItem, SanitizedQuestion } from '@/types/question-bank'

const DATA_DIR = path.resolve(process.cwd(), 'data', 'question-bank')

export interface TrialAssemblyItem extends SanitizedQuestion {
  trialSkill: string
  trialLevel: string
  constructed?: {
    id: string
    taskType: string
    responseMode: string
    instructionForCandidate: string
    constraints: any
    rubricRef: string
    maxScore: number
    scoringMode: string
    cefrCanDo: string[]
    stimulus?: any
  }
}

export interface TrialAssemblyResult {
  success: boolean
  items: TrialAssemblyItem[]
  sections: Array<{ skill: string; items: TrialAssemblyItem[] }>
  error?: string
  warnings: string[]
}

type TrialMode = 'trial_constructed' | 'dev_full'

const TRIAL_COMPOSITION: Record<string, Record<TrialMode, Record<string, number>>> = {
  A1: {
    trial_constructed: { reading: 5, listening: 5, writing: 2, speaking: 2 },
    dev_full: { reading: 3, listening: 3, writing: 2, speaking: 2, integrated: 1, mediation: 1 },
  },
  A2: {
    trial_constructed: { reading: 5, listening: 5, writing: 2, speaking: 2 },
    dev_full: { reading: 3, listening: 3, writing: 2, speaking: 2, integrated: 1, mediation: 1 },
  },
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandom<T>(pool: T[], count: number, usedKeys?: Set<string>, keyFn?: (item: T) => string): T[] {
  const available = usedKeys && keyFn
    ? pool.filter(i => !usedKeys.has(keyFn(i)))
    : pool
  const shuffled = shuffleArray(available)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

type LoadedReadingItem = {
  questionId: string
  type: string
  subskill: string
  difficulty: number
  prompt: string
  options?: { key: string; text: string }[]
  answer?: string
  explanation?: string
  points: number
  passageTitle: string
  passageText: string
  cefr: string
}

type LoadedListeningItem = {
  questionId: string
  type: string
  subskill: string
  difficulty: number
  prompt: string
  options?: { key: string; text: string }[]
  answer?: string
  explanation?: string
  points: number
  topic: string
  audioId: string
  audioFile: string
  transcript: string
  cefr: string
  audioBasePath: string
}

function loadAllItems(): {
  reading: Map<string, LoadedReadingItem>
  listening: Map<string, LoadedListeningItem>
  constructed: Map<string, ConstructedResponseItem & { skill: string; level: string; setId: string }>
} {
  const reading = new Map<string, LoadedReadingItem>()
  const listening = new Map<string, LoadedListeningItem>()
  const constructed = new Map<string, ConstructedResponseItem & { skill: string; level: string; setId: string }>()

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
          if (!raw.setId) continue
          const set = raw as QuestionSet

          if (set.skill === 'reading') {
            const rs = set as ReadingSet
            for (const passage of rs.passages) {
              for (const item of passage.items) {
                if (!reading.has(item.questionId)) {
                  reading.set(item.questionId, {
                    ...item,
                    passageTitle: passage.title,
                    passageText: passage.text,
                    cefr: set.cefr,
                  })
                }
              }
            }
          } else if (set.skill === 'listening') {
            const ls = set as ListeningSet
            for (const item of ls.items) {
              if (!listening.has(item.questionId)) {
                listening.set(item.questionId, {
                  ...item,
                  cefr: ls.cefr,
                  audioBasePath: ls.audioBasePath,
                })
              }
            }
          } else if (['writing', 'speaking', 'integrated', 'mediation'].includes(set.skill)) {
            const cs = set as ConstructedSet
            for (const item of cs.items) {
              if (!constructed.has(item.id)) {
                constructed.set(item.id, {
                  ...item,
                  skill: item.skill,
                  level: item.level,
                  setId: set.setId,
                })
              }
            }
          }
        } catch { /* skip invalid */ }
      }
    }
  }

  walkDir(DATA_DIR)
  return { reading, listening, constructed }
}

function sanitizeForTrial(
  item: LoadedReadingItem | LoadedListeningItem,
  skill: string,
): TrialAssemblyItem {
  const base: TrialAssemblyItem = {
    questionId: item.questionId,
    type: item.type === 'short_answer' ? 'SHORT_ANSWER' : 'MCQ',
    questionType: item.type === 'short_answer' ? 'SHORT_ANSWER' : 'MCQ',
    subskill: item.subskill || '',
    difficulty: item.difficulty,
    prompt: item.prompt,
    points: item.points || 1,
    trialSkill: skill,
    trialLevel: (item as any).cefr || 'A1',
  }

  if ('options' in item && item.options) {
    base.options = shuffleArray(item.options.map(o => ({ key: o.key, text: o.text })))
  }

  if ('passageTitle' in item && (item as any).passageTitle) {
    base.passageTitle = (item as any).passageTitle
    base.passageText = (item as any).passageText
    base.stimulus = { type: 'TEXT', title: (item as any).passageTitle, content: (item as any).passageText }
  }

  if ('topic' in item && (item as any).topic) {
    base.topic = (item as any).topic
  }

  if ('audioBasePath' in item && (item as any).audioBasePath && (item as any).audioFile) {
    base.audioUrl = `${(item as any).audioBasePath}${(item as any).audioFile}`
    base.stimulus = { type: 'AUDIO', title: 'Audio Listening', content: base.audioUrl }
  }

  return base
}

function sanitizeConstructedForTrial(
  item: ConstructedResponseItem & { skill: string; level: string },
): TrialAssemblyItem {
  const constructedSkill = item.skill.toLowerCase()
  const isAudio = item.responseMode === 'audio' || item.responseMode === 'text_audio'

  const base: TrialAssemblyItem = {
    questionId: item.id,
    type: isAudio ? 'AUDIO_RESPONSE' as any : 'ESSAY' as any,
    questionType: isAudio ? 'AUDIO_RESPONSE' as any : 'ESSAY' as any,
    subskill: item.taskType,
    difficulty: item.difficulty,
    prompt: item.prompt,
    points: item.maxScore || 10,
    trialSkill: constructedSkill,
    trialLevel: item.level,
    instruction: item.instructionForCandidate || '',
    constructed: {
      id: item.id,
      taskType: item.taskType,
      responseMode: item.responseMode,
      instructionForCandidate: item.instructionForCandidate,
      constraints: item.constraints,
      rubricRef: item.rubricRef,
      maxScore: item.maxScore,
      scoringMode: item.scoringMode,
      cefrCanDo: item.cefrCanDo,
      stimulus: item.stimulus
        ? {
            type: item.stimulus.type,
            ...(item.stimulus.text ? { text: item.stimulus.text } : {}),
            ...(item.stimulus.imageUrl ? { imageUrl: item.stimulus.imageUrl } : {}),
            ...(item.stimulus.audioUrl ? { audioUrl: item.stimulus.audioUrl } : {}),
          }
        : undefined,
    },
  }

  if (item.stimulus?.type === 'image' && item.stimulus.imageUrl) {
    base.stimulus = { type: 'IMAGE' as const, content: item.stimulus.imageUrl }
  } else if (item.stimulus?.audioUrl) {
    base.stimulus = { type: 'AUDIO' as const, content: item.stimulus.audioUrl }
  } else if (item.stimulus?.text) {
    base.stimulus = { type: 'TEXT' as const, content: item.stimulus.text }
  }

  return base
}

export function selectTrialItems(cefr: string, mode: TrialMode): TrialAssemblyResult {
  const { reading, listening, constructed } = loadAllItems()
  const composition = TRIAL_COMPOSITION[cefr]?.[mode]
  if (!composition) {
    return { success: false, items: [], sections: [], error: `Komposisi tidak ditemukan untuk ${cefr} ${mode}`, warnings: [] }
  }

  const warnings: string[] = []
  const allItems: TrialAssemblyItem[] = []
  const sections: Array<{ skill: string; items: TrialAssemblyItem[] }> = []
  const usedKeys = new Set<string>()

  // Pick reading
  if (composition.reading) {
    const pool = Array.from(reading.values()).filter(i => i.cefr === cefr)
    const picked = pickRandom(pool, composition.reading, usedKeys, i => i.questionId)
    if (picked.length < composition.reading) {
      warnings.push(`Reading ${cefr}: hanya ${picked.length} dari ${composition.reading} tersedia`)
    }
    const items = picked.map(i => sanitizeForTrial(i, 'reading'))
    for (const item of items) usedKeys.add(item.questionId)
    allItems.push(...items)
    sections.push({ skill: 'reading', items })
  }

  // Pick listening
  if (composition.listening) {
    const pool = Array.from(listening.values()).filter(i => i.cefr === cefr)
    const picked = pickRandom(pool, composition.listening, usedKeys, i => i.questionId)
    if (picked.length < composition.listening) {
      warnings.push(`Listening ${cefr}: hanya ${picked.length} dari ${composition.listening} tersedia`)
    }
    const items = picked.map(i => sanitizeForTrial(i, 'listening'))
    for (const item of items) usedKeys.add(item.questionId)
    allItems.push(...items)
    sections.push({ skill: 'listening', items })
  }

  // Pick writing (from constructed items)
  if (composition.writing) {
    const skillKey = cefr === 'A1' ? 'WRITING' : 'WRITING'
    const pool = Array.from(constructed.values()).filter(i => i.skill === 'WRITING' && i.level === cefr)
    const picked = pickRandom(pool, composition.writing, usedKeys, i => i.id)
    if (picked.length < composition.writing) {
      warnings.push(`Writing ${cefr}: hanya ${picked.length} dari ${composition.writing} tersedia`)
    }
    const items = picked.map(i => sanitizeConstructedForTrial(i))
    for (const item of items) usedKeys.add(item.questionId)
    allItems.push(...items)
    sections.push({ skill: 'writing', items })
  }

  // Pick speaking (from constructed items)
  if (composition.speaking) {
    const pool = Array.from(constructed.values()).filter(i => i.skill === 'SPEAKING' && i.level === cefr)
    const picked = pickRandom(pool, composition.speaking, usedKeys, i => i.id)
    if (picked.length < composition.speaking) {
      warnings.push(`Speaking ${cefr}: hanya ${picked.length} dari ${composition.speaking} tersedia`)
    }
    const items = picked.map(i => sanitizeConstructedForTrial(i))
    for (const item of items) usedKeys.add(item.questionId)
    allItems.push(...items)
    sections.push({ skill: 'speaking', items })
  }

  // Pick integrated (dev_full only)
  if (composition.integrated) {
    const pool = Array.from(constructed.values()).filter(i => i.skill === 'INTEGRATED' && i.level === cefr)
    const picked = pickRandom(pool, composition.integrated)
    if (picked.length < composition.integrated) {
      warnings.push(`Integrated ${cefr}: hanya ${picked.length} dari ${composition.integrated} tersedia`)
    }
    const items = picked.map(i => sanitizeConstructedForTrial(i))
    allItems.push(...items)
    sections.push({ skill: 'integrated', items })
  }

  // Pick mediation (dev_full only)
  if (composition.mediation) {
    const pool = Array.from(constructed.values()).filter(i => i.skill === 'MEDIATION' && i.level === cefr)
    const picked = pickRandom(pool, composition.mediation)
    if (picked.length < composition.mediation) {
      warnings.push(`Mediation ${cefr}: hanya ${picked.length} dari ${composition.mediation} tersedia`)
    }
    const items = picked.map(i => sanitizeConstructedForTrial(i))
    allItems.push(...items)
    sections.push({ skill: 'mediation', items })
  }

  return {
    success: allItems.length > 0,
    items: shuffleArray(allItems),
    sections,
    warnings,
  }
}
