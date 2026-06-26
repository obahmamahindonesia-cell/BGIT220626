import * as fs from 'fs'
import * as path from 'path'
import type { LevelBlueprint } from '@/lib/test-blueprint/bigtLevelBlueprint'
import type { ReadingSet, ListeningSet, QuestionSet, SanitizedQuestion, ReadingQuestion, ListeningItem } from '@/types/question-bank'

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

function loadAllItems(): {
  reading: Map<string, ReadingQuestion & { setId: string; passageTitle: string; passageText: string; cefr: string }>
  listening: Map<string, ListeningItem & { setId: string; cefr: string; audioBasePath: string }>
} {
  const readingItems = new Map<any, any>()
  const listeningItems = new Map<any, any>()

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
                if (!readingItems.has(item.questionId)) {
                  readingItems.set(item.questionId, {
                    ...item,
                    setId: set.setId,
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
              if (!listeningItems.has(item.questionId)) {
                listeningItems.set(item.questionId, {
                  ...item,
                  setId: set.setId,
                  cefr: ls.cefr,
                  audioBasePath: ls.audioBasePath,
                })
              }
            }
          }
        } catch { /* skip invalid */ }
      }
    }
  }

  walkDir(DATA_DIR)
  return { reading: readingItems, listening: listeningItems }
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

function sanitize(item: any): SanitizedQuestion {
  const base: SanitizedQuestion = {
    questionId: item.questionId,
    type: item.type,
    subskill: item.subskill || '',
    difficulty: item.difficulty,
    prompt: item.prompt,
    points: item.points || 1,
  }
  if (item.options) base.options = shuffleArray(item.options.map((o: any) => ({ key: o.key, text: o.text })))
  if (item.topic) base.topic = item.topic
  if (item.passageTitle) base.passageTitle = item.passageTitle
  if (item.passageText) base.passageText = item.passageText
  if (item.audioBasePath && item.audioFile) base.audioUrl = `${item.audioBasePath}${item.audioFile}`
  if (item.audioUrl) base.audioUrl = item.audioUrl
  return base
}

function checkAudioFile(audioUrl: string | undefined): boolean {
  if (!audioUrl) return false
  const audioPath = path.resolve(process.cwd(), 'public', audioUrl.replace(/^\//, ''))
  return fs.existsSync(audioPath)
}

export function selectLevelExamItems(blueprint: LevelBlueprint): AssemblyResult {
  const { reading, listening } = loadAllItems()
  const log: SelectionLog = { warnings: [], setUsage: {}, subskillDistribution: {}, difficultyDistribution: {} }

  const selected: SanitizedQuestion[] = []
  const sections: Array<{ skill: string; items: SanitizedQuestion[] }> = []
  const usedIds = new Set<string>()

  for (const section of blueprint.sections) {
    const sectionItems: SanitizedQuestion[] = []

    for (const sl of section.sourceLevels) {
      const pool = section.skill === 'reading'
        ? Array.from(reading.values()).filter(i => i.cefr === sl.cefr)
        : Array.from(listening.values()).filter(i => i.cefr === sl.cefr)

      const needed = sl.count
      if (pool.length === 0) {
        log.warnings.push(`Tidak ada soal ${section.skill} ${sl.cefr} di bank.`)
        continue
      }

      const bandDistribution = distributeDifficulty(pool, blueprint, sl, log)
      const picked = pickBalanced(bandDistribution, needed, usedIds, section.skill, log, blueprint)

      for (const item of picked) {
        const sanitizedItem = sanitize(item)
        sectionItems.push(sanitizedItem)
        usedIds.add(item.questionId)
        log.setUsage[item.setId] = (log.setUsage[item.setId] || 0) + 1
        const subskill = item.subskill || 'unknown'
        log.subskillDistribution[subskill] = (log.subskillDistribution[subskill] || 0) + 1
        const band = difficultyBand(item.difficulty, sl.cefr)
        log.difficultyDistribution[band] = (log.difficultyDistribution[band] || 0) + 1
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
  const low = pool.filter(i => {
    const band = difficultyBand(i.difficulty, cefr)
    return band === 'low'
  })
  const medium = pool.filter(i => {
    const band = difficultyBand(i.difficulty, cefr)
    return band === 'medium'
  })
  const high = pool.filter(i => {
    const band = difficultyBand(i.difficulty, cefr)
    return band === 'high'
  })

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
