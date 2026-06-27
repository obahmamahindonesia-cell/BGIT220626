import * as fs from 'fs'
import * as path from 'path'
import type { LevelBlueprint } from '@/lib/test-blueprint/bigtLevelBlueprint'
import type { ReadingSet, ListeningSet, ConstructedSet, ConstructedResponseItem, QuestionSet, SanitizedQuestion } from '@/types/question-bank'

interface SelectionLog {
  warnings: string[]
  setUsage: Record<string, number>
  subskillDistribution: Record<string, number>
  difficultyDistribution: Record<string, number>
}

export interface AssemblyResult {
  success: boolean
  blueprintId: string
  items: SanitizedQuestion[]
  sections: Array<{ skill: string; items: SanitizedQuestion[] }>
  log: SelectionLog
  error?: string
}

const DATA_DIR = path.resolve(process.cwd(), 'data', 'question-bank')

type LoadedReadingItem = {
  questionId: string
  type: string
  subskill: string
  difficulty: number
  prompt: string
  options?: { key: string; text: string }[]
  answer?: string
  explanation?: string
  instruction?: string
  points: number
  passageTitle: string
  passageText: string
  cefr: string
  setId: string
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
  instruction?: string
  points: number
  topic: string
  audioId: string
  audioFile: string
  transcript: string
  cefr: string
  audioBasePath: string
  setId: string
}

type LoadedConstructedItem = ConstructedResponseItem & {
  skill: string
  level: string
  setId: string
}

function loadAllItems(): {
  reading: Map<string, LoadedReadingItem>
  listening: Map<string, LoadedListeningItem>
  constructed: Map<string, LoadedConstructedItem>
} {
  const reading = new Map<string, LoadedReadingItem>()
  const listening = new Map<string, LoadedListeningItem>()
  const constructed = new Map<string, LoadedConstructedItem>()

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
                    setId: set.setId,
                    passageTitle: passage.title,
                    passageText: passage.text,
                    cefr: set.cefr,
                    points: item.points || 1,
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
                  setId: set.setId,
                  cefr: ls.cefr,
                  audioBasePath: ls.audioBasePath,
                  points: item.points || 1,
                })
              }
            }
          } else if (['writing', 'speaking'].includes(set.skill)) {
            const cs = set as ConstructedSet
            for (const item of cs.items) {
              const key = item.id
              if (!constructed.has(key)) {
                constructed.set(key, {
                  ...item,
                  skill: item.skill || set.skill.toUpperCase(),
                  level: item.level || set.cefr,
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

function difficultyBand(difficulty: number, cefr: string): 'low' | 'medium' | 'high' {
  if (cefr === 'A1') {
    if (difficulty <= 0.30) return 'low'
    if (difficulty <= 0.36) return 'medium'
    return 'high'
  }
  if (difficulty <= 0.30) return 'low'
  if (difficulty <= 0.38) return 'medium'
  return 'high'
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function shuffleOptions(item: any): any {
  if (!item.options || !Array.isArray(item.options)) return item
  const shuffled = shuffleArray(item.options)
  return { ...item, options: shuffled }
}

function sanitizeMCQ(item: any): SanitizedQuestion {
  const qType = item.type === 'short_answer' ? 'SHORT_ANSWER' : 'MCQ'
  const base: SanitizedQuestion = {
    questionId: item.questionId,
    type: qType,
    questionType: qType,
    subskill: item.subskill || '',
    difficulty: item.difficulty,
    prompt: item.prompt,
    points: item.points || 1,
    instruction: item.instruction || '',
  }
  if (item.options) base.options = shuffleArray(item.options.map((o: any) => ({ key: o.key, text: o.text })))
  if (item.topic) base.topic = item.topic
  if (item.passageTitle) base.passageTitle = item.passageTitle
  if (item.passageText) {
    base.passageText = item.passageText
    base.stimulus = { type: 'TEXT', title: item.passageTitle, content: item.passageText }
  }
  if (item.audioBasePath && item.audioFile) {
    base.audioUrl = `${item.audioBasePath}${item.audioFile}`
    base.stimulus = { type: 'AUDIO', title: 'Audio Listening', content: base.audioUrl }
  }
  if (item.audioUrl) {
    base.audioUrl = item.audioUrl
    base.stimulus = { type: 'AUDIO', title: 'Audio Listening', content: item.audioUrl }
  }
  return base
}

function sanitizeConstructed(item: LoadedConstructedItem): SanitizedQuestion {
  const isAudio = item.responseMode === 'audio' || item.responseMode === 'text_audio'
  const qType = isAudio ? 'AUDIO_RESPONSE' : 'ESSAY'

  const base: SanitizedQuestion = {
    questionId: item.id,
    type: qType as any,
    questionType: qType,
    subskill: item.taskType,
    difficulty: item.difficulty || 0.5,
    prompt: item.prompt,
    points: item.maxScore || 25,
    instruction: item.instructionForCandidate || '',
    constraints: item.constraints || {},
    responseMode: item.responseMode,
  }

  if (item.stimulus) {
    const s = item.stimulus
    if (s.type === 'image' && s.imageUrl) {
      base.stimulus = { type: 'IMAGE' as const, content: s.imageUrl }
    } else if (s.audioUrl) {
      base.stimulus = { type: 'AUDIO' as const, content: s.audioUrl }
    } else if (s.text) {
      base.stimulus = { type: 'TEXT' as const, content: s.text }
    }
    base.constructedStimulus = {
      type: s.type,
      ...(s.text ? { text: s.text } : {}),
      ...(s.imageUrl ? { imageUrl: s.imageUrl } : {}),
      ...(s.audioUrl ? { audioUrl: s.audioUrl } : {}),
    }
  }

  return base
}

function checkAudioFile(audioUrl: string | undefined): boolean {
  if (!audioUrl) return false
  const audioPath = path.resolve(process.cwd(), 'public', audioUrl.replace(/^\//, ''))
  return fs.existsSync(audioPath)
}

export function selectLevelExamItems(blueprint: LevelBlueprint): AssemblyResult {
  const { reading, listening, constructed } = loadAllItems()
  const log: SelectionLog = { warnings: [], setUsage: {}, subskillDistribution: {}, difficultyDistribution: {} }

  const selected: SanitizedQuestion[] = []
  const sections: Array<{ skill: string; items: SanitizedQuestion[] }> = []
  const usedIds = new Set<string>()

  for (const section of blueprint.sections) {
    const sectionItems: SanitizedQuestion[] = []

    for (const sl of section.sourceLevels) {
      let pool: any[]
      if (section.skill === 'reading') {
        pool = Array.from(reading.values()).filter(i => i.cefr === sl.cefr)
      } else if (section.skill === 'listening') {
        pool = Array.from(listening.values()).filter(i => i.cefr === sl.cefr)
      } else if (section.skill === 'writing' || section.skill === 'speaking') {
        const dim = section.skill === 'writing' ? 'WRITING' : 'SPEAKING'
        pool = Array.from(constructed.values()).filter(i => i.skill === dim && i.level === sl.cefr)
      } else {
        pool = []
      }

      const needed = sl.count
      if (pool.length === 0) {
        log.warnings.push(`Tidak ada soal ${section.skill} ${sl.cefr} di bank.`)
        continue
      }

      if (section.skill === 'writing' || section.skill === 'speaking') {
        // Constructed items: random pick, no difficulty distribution
        const available = shuffleArray(pool).filter((i: any) => !usedIds.has(i.id))
        const picked = available.slice(0, Math.min(needed, available.length))
        if (picked.length < needed) {
          log.warnings.push(`${section.skill} ${sl.cefr}: hanya ${picked.length} dari ${needed} tersedia`)
        }
        for (const item of picked) {
          const sanitized = sanitizeConstructed(item)
          sectionItems.push(sanitized)
          usedIds.add(item.id)
        }
      } else {
        const bandDistribution = distributeDifficulty(pool, blueprint, sl, log)
        const picked = pickBalanced(bandDistribution, needed, usedIds, section.skill, log, blueprint)

        for (const item of picked) {
          const sanitizedItem = sanitizeMCQ(item)
          sectionItems.push(sanitizedItem)
          usedIds.add(item.questionId)
          log.setUsage[item.setId] = (log.setUsage[item.setId] || 0) + 1
          const subskill = item.subskill || 'unknown'
          log.subskillDistribution[subskill] = (log.subskillDistribution[subskill] || 0) + 1
          const band = difficultyBand(item.difficulty, sl.cefr)
          log.difficultyDistribution[band] = (log.difficultyDistribution[band] || 0) + 1
        }
      }
    }

    sections.push({ skill: section.skill, items: shuffleArray(sectionItems) })
    selected.push(...sectionItems)
  }

  return {
    success: true,
    blueprintId: blueprint.id,
    items: shuffleArray(selected),
    sections,
    log,
  }
}

function distributeDifficulty(
  pool: any[],
  blueprint: LevelBlueprint,
  sl: { cefr: string; count: number },
  log: SelectionLog
): { low: any[]; medium: any[]; high: any[] } {
  const cefr = sl.cefr
  const low = pool.filter(i => difficultyBand(i.difficulty, cefr) === 'low')
  const medium = pool.filter(i => difficultyBand(i.difficulty, cefr) === 'medium')
  const high = pool.filter(i => difficultyBand(i.difficulty, cefr) === 'high')

  const total = low.length + medium.length + high.length
  if (total < sl.count) {
    log.warnings.push(`Hanya ${total} soal tersedia untuk ${cefr} ${sl.cefr}, dibutuhkan ${sl.count}.`)
  }

  return { low, medium, high }
}

function pickBalanced(
  bands: { low: any[]; medium: any[]; high: any[] },
  needed: number,
  usedIds: Set<string>,
  skill: string,
  log: SelectionLog,
  blueprint: LevelBlueprint
): any[] {
  const dist = blueprint.difficultyDistribution
  const lowTarget = Math.round(needed * dist.low / 100)
  const highTarget = Math.round(needed * dist.high / 100)
  const mediumTarget = needed - lowTarget - highTarget

  const picked: any[] = []
  const pickedIds = new Set<string>()

  const pickWithLimit = (pool: any[], count: number): any[] => {
    const available = shuffleArray(pool.filter(i => !usedIds.has(i.questionId) && !pickedIds.has(i.questionId)))
    const result = available.slice(0, count)
    for (const item of result) pickedIds.add(item.questionId)
    return result
  }

  let lowPicked = pickWithLimit(bands.low, lowTarget)
  if (lowPicked.length < lowTarget) {
    const deficit = lowTarget - lowPicked.length
    log.warnings.push(`Low difficulty shortfall: perlu ${deficit} tambahan dari medium.`)
    const backup = pickWithLimit(bands.medium.filter(i => !pickedIds.has(i.questionId)), deficit)
    lowPicked.push(...backup)
  }
  picked.push(...lowPicked)

  let medPicked = pickWithLimit(bands.medium, mediumTarget)
  if (medPicked.length < mediumTarget) {
    const deficit = mediumTarget - medPicked.length
    log.warnings.push(`Medium difficulty shortfall: perlu ${deficit} tambahan.`)
    const backup = pickWithLimit([...bands.low, ...bands.high].filter(i => !pickedIds.has(i.questionId)), deficit)
    medPicked.push(...backup)
  }
  picked.push(...medPicked)

  let highPicked = pickWithLimit(bands.high, highTarget)
  if (highPicked.length < highTarget) {
    const deficit = highTarget - highPicked.length
    log.warnings.push(`High difficulty shortfall: perlu ${deficit} tambahan dari medium.`)
    const backup = pickWithLimit(bands.medium.filter(i => !pickedIds.has(i.questionId)), deficit)
    highPicked.push(...backup)
  }
  picked.push(...highPicked)

  if (picked.length < needed) {
    const deficit = needed - picked.length
    log.warnings.push(`Total shortfall: perlu ${deficit} tambahan dari semua pool.`)
    const remaining = shuffleArray([...bands.low, ...bands.medium, ...bands.high]
      .filter(i => !pickedIds.has(i.questionId) && !usedIds.has(i.questionId)))
    picked.push(...remaining.slice(0, deficit))
  }

  const result = shuffleArray(picked).slice(0, needed)

  return result.map(item => ({
    ...item,
    options: shuffleOptions(item).options,
  }))
}
