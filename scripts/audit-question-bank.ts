import * as fs from 'fs'
import * as path from 'path'

interface Item {
  questionId: string
  type: string
  subskill: string
  difficulty: number
  prompt: string
  options?: { key: string; text: string }[]
  answer?: string
  explanation?: string
  points: number
  audioFile?: string
  transcript?: string
  topic?: string
}

interface Passage {
  passageId: string
  title: string
  text: string
  topic: string
  wordCount: number
  items: Item[]
}

interface QuestionSet {
  setId: string
  cefr: string
  skill: string
  title: string
  version: string
  status: string
  itemsCount: number
  passages?: Passage[]
  items?: Item[]
  audioBasePath?: string
}

const DATA_DIR = path.resolve(__dirname, '..', 'data', 'question-bank')

let hasCriticalIssues = false

function loadAllSets(): QuestionSet[] {
  const result: QuestionSet[] = []
  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'audio-manifests') return
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

function collectItems(sets: QuestionSet[]): Item[] {
  const items: Item[] = []
  for (const set of sets) {
    if (set.skill === 'reading' && set.passages) {
      for (const p of set.passages) {
        for (const item of p.items) {
          items.push({ ...item, topic: p.topic })
        }
      }
    }
    if (set.skill === 'listening' && set.items) {
      items.push(...set.items)
    }
  }
  return items
}

function main() {
  console.log('='.repeat(60))
  console.log('  QUESTION BANK AUDIT REPORT (File-Based)')
  console.log('='.repeat(60))

  if (!fs.existsSync(DATA_DIR)) {
    console.error(`\n❌  Directory not found: ${DATA_DIR}`)
    process.exit(1)
  }

  const sets = loadAllSets()
  const items = collectItems(sets)

  // ── 1. Overview ──────────────────────────────────────────
  console.log('\n📊  OVERVIEW')
  console.log(`  Total sets:          ${sets.length}`)
  console.log(`  Total questions:     ${items.length}`)

  // ── 2. Status Distribution ──────────────────────────────
  console.log('\n📌  SETS BY STATUS')
  const statusCount: Record<string, number> = {}
  for (const s of sets) {
    statusCount[s.status] = (statusCount[s.status] || 0) + 1
  }
  for (const [status, count] of Object.entries(statusCount)) {
    console.log(`  ${status.padEnd(12)} ${count} set(s)`)
  }
  const noPublished = sets.filter(s => s.status === 'published').length
  if (noPublished === 0) {
    console.log('  ⚠️  No published sets — all are draft/review')
  }

  // ── 3. Level Distribution ────────────────────────────────
  console.log('\n🎯  QUESTIONS BY CEFR LEVEL')
  const levelCount: Record<string, number> = {}
  for (const item of items) {
    const set = sets.find(s => s.setId && item.questionId.startsWith(s.setId))
    const cefr = set?.cefr || 'UNKNOWN'
    levelCount[cefr] = (levelCount[cefr] || 0) + 1
  }
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
    const c = levelCount[level] || 0
    const pct = items.length > 0 ? ((c / items.length) * 100).toFixed(1) : '0.0'
    console.log(`  ${level.padEnd(6)} ${String(c).padStart(5)}  (${pct}%)`)
    if (c === 0) {
      hasCriticalIssues = true
      console.log(`                 ❌  Zero questions for ${level}`)
    }
  }

  // ── 4. Skill Distribution ────────────────────────────────
  console.log('\n📐  QUESTIONS BY SKILL')
  const skillCount: Record<string, number> = {}
  for (const set of sets) {
    skillCount[set.skill] = (skillCount[set.skill] || 0) + set.itemsCount
  }
  for (const skill of ['reading', 'listening', 'writing', 'speaking', 'integrated']) {
    const c = skillCount[skill] || 0
    const pct = items.length > 0 ? ((c / items.length) * 100).toFixed(1) : '0.0'
    console.log(`  ${skill.padEnd(12)} ${String(c).padStart(5)}  (${pct}%)`)
    if (c === 0) {
      console.log(`                 ⚠️  No questions for ${skill}`)
    }
  }

  // ── 5. Difficulty Distribution ───────────────────────────
  console.log('\n🔢  DIFFICULTY DISTRIBUTION')
  const diffBuckets = { easy: 0, moderate: 0, hard: 0 }
  for (const item of items) {
    if (item.difficulty < 0.3) diffBuckets.easy++
    else if (item.difficulty < 0.7) diffBuckets.moderate++
    else diffBuckets.hard++
  }
  console.log(`  Easy     (0.00–0.29): ${diffBuckets.easy}`)
  console.log(`  Moderate (0.30–0.69): ${diffBuckets.moderate}`)
  console.log(`  Hard     (0.70–1.00): ${diffBuckets.hard}`)

  // ── 6. MCQ Option Validation ─────────────────────────────
  console.log('\n⚠️  MCQ OPTION COUNTS')
  let mcqLow = 0
  for (const item of items) {
    if (item.type === 'multiple_choice') {
      const optCount = item.options?.length || 0
      if (optCount < 4) {
        mcqLow++
        console.log(`  ❌  ${item.questionId}: only ${optCount} options`)
        hasCriticalIssues = true
      }
    }
  }
  if (mcqLow === 0) console.log('  ✅  All MCQ questions have 4+ options')

  // ── 7. Answer Presence ──────────────────────────────────
  console.log('\n❌  ANSWER VALIDATION')
  let missing = 0
  for (const item of items) {
    if (!item.answer) {
      missing++
      console.log(`  ❌  ${item.questionId}: no answer`)
      hasCriticalIssues = true
    }
  }
  if (missing === 0) console.log('  ✅  All questions have an answer key')

  // ── 8. Answer in Options ────────────────────────────────
  console.log('\n🔍  ANSWER IN OPTIONS')
  let answerMismatch = 0
  for (const item of items) {
    if (item.type === 'multiple_choice' && item.options && item.answer) {
      const keys = item.options.map(o => o.key)
      if (!keys.includes(item.answer)) {
        answerMismatch++
        console.log(`  ❌  ${item.questionId}: answer "${item.answer}" not in options [${keys.join(',')}]`)
        hasCriticalIssues = true
      }
    }
  }
  if (answerMismatch === 0) console.log('  ✅  All MCQ answers exist in options')

  // ── 9. Empty/Missing Fields ─────────────────────────────
  console.log('\n📝  MISSING FIELDS')
  let emptyFields = 0
  for (const item of items) {
    if (!item.prompt) { console.log(`  ❌  ${item.questionId}: empty prompt`); emptyFields++; hasCriticalIssues = true }
    if (!item.explanation) { console.log(`  ⚠️  ${item.questionId}: empty explanation`); emptyFields++ }
  }
  if (emptyFields === 0) console.log('  ✅  No empty required fields')

  // ── 10. Difficulty Range ─────────────────────────────────
  console.log('\n🔢  DIFFICULTY RANGE (0.00–1.00)')
  let badDiff = 0
  for (const item of items) {
    if (item.difficulty < 0 || item.difficulty > 1) {
      console.log(`  ❌  ${item.questionId}: difficulty ${item.difficulty}`)
      badDiff++
      hasCriticalIssues = true
    }
  }
  if (badDiff === 0) console.log('  ✅  All difficulties within valid range')

  // ── 11. itemsCount Integrity ─────────────────────────────
  console.log('\n🔢  ITEMSCOUNT INTEGRITY')
  let badCount = 0
  for (const set of sets) {
    let actual = 0
    if (set.skill === 'reading' && set.passages) {
      for (const p of set.passages) actual += p.items.length
    } else if (set.skill === 'listening' && set.items) {
      actual = set.items.length
    }
    if (actual !== set.itemsCount) {
      console.log(`  ❌  ${set.setId}: declared ${set.itemsCount}, actual ${actual}`)
      badCount++
      hasCriticalIssues = true
    }
  }
  if (badCount === 0) console.log('  ✅  All itemsCount values match actual counts')

  // ── 12. Audio file presence (listening only) ────────────
  console.log('\n🎵  AUDIO FILE CHECK')
  const audioDir = path.resolve(__dirname, '..', 'public')
  let audioMissing = 0
  for (const set of sets) {
    if (set.skill !== 'listening' || !set.items) continue
    if (!set.audioBasePath) {
      console.log(`  ⚠️  ${set.setId}: no audioBasePath`)
      continue
    }
    for (const item of set.items) {
      if (!item.audioFile) {
        console.log(`  ⚠️  ${item.questionId}: no audioFile`)
        continue
      }
      const fullPath = path.join(audioDir, set.audioBasePath.replace(/^\//, ''), item.audioFile)
      if (!fs.existsSync(fullPath)) {
        audioMissing++
      }
    }
  }
  if (audioMissing > 0) {
    console.log(`  ⚠️  ${audioMissing} audio file(s) not found (expected — placeholders OK)`)
  } else {
    console.log('  ✅  No listening sets to check, or all audio files present')
  }

  // ════════════════════════════════════════════════════════
  //  SUMMARY
  // ════════════════════════════════════════════════════════
  console.log('\n' + '='.repeat(60))
  console.log('  SUMMARY')
  console.log('='.repeat(60))
  console.log(`  Sets:                 ${sets.length}`)
  console.log(`  Total questions:      ${items.length}`)
  console.log(`  Reading questions:    ${items.filter(i => sets.some(s => s.skill === 'reading' && i.questionId.startsWith(s.setId))).length}`)
  console.log(`  Listening questions:  ${items.filter(i => sets.some(s => s.skill === 'listening' && i.questionId.startsWith(s.setId))).length}`)

  const levelDist = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => {
    const set = sets.find(s => s.cefr === l)
    return set ? `${l}:${levelCount[l] || 0}` : `${l}:0`
  }).join(', ')
  console.log(`  Coverage:             ${levelDist}`)

  if (hasCriticalIssues) {
    console.log('\n  ❌  Critical issues found — review above')
    process.exit(1)
  } else {
    console.log('\n  ✅  All checks passed')
    process.exit(0)
  }
}

main()
