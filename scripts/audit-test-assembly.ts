import { getLevelBlueprint, listLevelBlueprints, type LevelBlueprint } from '../lib/test-blueprint/bigtLevelBlueprint'
import { selectLevelExamItems } from '../lib/test-assembly/selectLevelExamItems'
import type { SanitizedQuestion } from '../types/question-bank'
import * as fs from 'fs'
import * as path from 'path'

const BLUEPRINT_IDS = ['A1_LEVEL_EXAM', 'A2_LEVEL_EXAM', 'A1_A2_PLACEMENT', 'QUICK_PLACEMENT']
const RUNS_PER_BLUEPRINT = 20
const DATA_DIR = path.resolve(process.cwd(), 'data', 'question-bank')

interface AuditResult {
  blueprintId: string
  runs: number
  errors: string[]
  warnings: string[]
  stats: {
    avgItems: number
    minItems: number
    maxItems: number
    readingOk: boolean
    listeningOk: boolean
    cefrOk: boolean
    allAudioOk: boolean
    noLeak: boolean
    noDuplicate: boolean
    setDistributionOk: boolean
    difficultyCoverageOk: boolean
  }
}

function checkAudioFiles(item: SanitizedQuestion): boolean {
  if (!item.audioUrl) return true
  const audioPath = path.resolve(process.cwd(), 'public', item.audioUrl.replace(/^\//, ''))
  return fs.existsSync(audioPath)
}

async function main() {
  console.log('============================================================')
  console.log('  LEVEL EXAM ASSEMBLY AUDIT REPORT')
  console.log('============================================================\n')

  let allPassed = true

  for (const bpId of BLUEPRINT_IDS) {
    console.log(`📋 Blueprint: ${bpId}`)
    console.log('  ' + '-'.repeat(60))

    const blueprint = getLevelBlueprint(bpId)
    if (!blueprint) {
      console.log(`  ❌ Blueprint ${bpId} tidak ditemukan!\n`)
      allPassed = false
      continue
    }

    console.log(`  Label: ${blueprint.label}`)
    console.log(`  Target: ${blueprint.totalItems} items (${blueprint.estimatedDurationMinutes} min)`)
    console.log(`  Sections: ${blueprint.sections.map(s => `${s.skill}=${s.totalItems}`).join(', ')}`)
    console.log(`  Difficulty: low=${blueprint.difficultyDistribution.low}% med=${blueprint.difficultyDistribution.medium}% high=${blueprint.difficultyDistribution.high}%`)
    console.log()

    const errors: string[] = []
    const warnings: string[] = []

    let totalItemsSum = 0
    let minItems = Infinity
    let maxItems = -Infinity
    let allReadingCounts: number[] = []
    let allListeningCounts: number[] = []
    let audioFailCount = 0
    let leakCount = 0
    let duplicateCount = 0
    let setDistributionIssues = 0

    for (let r = 0; r < RUNS_PER_BLUEPRINT; r++) {
      const assembly = selectLevelExamItems(blueprint)

      // Check total items match blueprint
      if (assembly.items.length !== blueprint.totalItems) {
        errors.push(`[Run ${r + 1}] Jumlah item ${assembly.items.length} tidak sesuai blueprint (${blueprint.totalItems})`)
      }

      totalItemsSum += assembly.items.length
      if (assembly.items.length < minItems) minItems = assembly.items.length
      if (assembly.items.length > maxItems) maxItems = assembly.items.length

      // Check sections
      for (const section of assembly.sections) {
        if (section.skill === 'reading') {
          allReadingCounts.push(section.items.length)
        } else if (section.skill === 'listening') {
          allListeningCounts.push(section.items.length)
        }
      }

      // Check CEFR distribution (from questionId prefix)
      const a1Count = assembly.items.filter((i: any) => i.questionId?.startsWith('BIGT-A1')).length
      const a2Count = assembly.items.filter((i: any) => i.questionId?.startsWith('BIGT-A2')).length

      const expectedA1 = blueprint.sections.reduce((s, sec) =>
        s + sec.sourceLevels.filter(sl => sl.cefr === 'A1').reduce((ss, sl) => ss + sl.count, 0), 0)
      const expectedA2 = blueprint.sections.reduce((s, sec) =>
        s + sec.sourceLevels.filter(sl => sl.cefr === 'A2').reduce((ss, sl) => ss + sl.count, 0), 0)

      if (expectedA1 > 0 && expectedA2 > 0) {
        const tolerance = 3
        const a1Diff = Math.abs(a1Count - expectedA1)
        const a2Diff = Math.abs(a2Count - expectedA2)
        if (a1Diff > tolerance || a2Diff > tolerance) {
          warnings.push(`[Run ${r + 1}] Distribusi CEFR: A1=${a1Count} (target ${expectedA1}), A2=${a2Count} (target ${expectedA2})`)
        }
      }

      // Check audio - all listening items must have real files
      const missingAudioItems: SanitizedQuestion[] = []
      for (const item of assembly.items) {
        if (item.questionId?.startsWith('BIGT-A') && /LS/i.test(item.questionId || '')) {
          if (!checkAudioFiles(item)) {
            missingAudioItems.push(item)
          }
        }
      }
      if (missingAudioItems.length > 0) {
        audioFailCount++
        errors.push(`[Run ${r + 1}] ${missingAudioItems.length} listening item(s) missing audio file: ${missingAudioItems.map(i => i.questionId).join(', ')}`)
      }

      // Check for leaks (answer/explanation/transcript in sanitized output)
      const hasLeak = assembly.items.some((i: any) =>
        'answer' in i || 'explanation' in i || 'transcript' in i || 'correctAnswer' in i || 'correctOption' in i || 'scoringLogic' in i
      )
      if (hasLeak) {
        leakCount++
        const leakedKeys = assembly.items.map((i: any) => {
          const keys = ['answer', 'explanation', 'transcript', 'correctAnswer', 'correctOption', 'scoringLogic'].filter(k => k in i)
          return `${i.questionId}: ${keys.join(',')}`
        }).filter(Boolean)
        errors.push(`[Run ${r + 1}] Answer/explanation/transcript bocor ke output sanitized! ${leakedKeys.join('; ')}`)
      }

      // Check for duplicates
      const idSet = new Set(assembly.items.map(i => i.questionId))
      if (idSet.size !== assembly.items.length) {
        const dupes = assembly.items.filter(i => {
          const count = assembly.items.filter(j => j.questionId === i.questionId).length
          return count > 1
        })
        duplicateCount++
        errors.push(`[Run ${r + 1}] Duplikasi questionId dalam satu session: ${[...new Set(dupes.map(d => d.questionId))].join(', ')}`)
      }

      // Check set distribution - any set used more than 40% of total?
      const setUsage = Object.values(assembly.log.setUsage)
      const maxFromOneSet = Math.max(...setUsage, 0)
      const maxAllowed = Math.ceil(blueprint.totalItems * 0.4)
      if (maxFromOneSet > maxAllowed) {
        setDistributionIssues++
        warnings.push(`[Run ${r + 1}] Satu set menyumbang ${maxFromOneSet} item (maks ${maxAllowed})`)
      }
    }

    // Compile stats
    const readingAvg = allReadingCounts.length > 0
      ? allReadingCounts.reduce((a, b) => a + b, 0) / allReadingCounts.length : 0
    const listeningAvg = allListeningCounts.length > 0
      ? allListeningCounts.reduce((a, b) => a + b, 0) / allListeningCounts.length : 0

    const expectedReading = blueprint.sections.find(s => s.skill === 'reading')?.totalItems || 0
    const expectedListening = blueprint.sections.find(s => s.skill === 'listening')?.totalItems || 0

    const readingOk = Math.abs(readingAvg - expectedReading) <= 1
    const listeningOk = Math.abs(listeningAvg - expectedListening) <= 1
    const cefrOk = audioFailCount === 0
    const allAudioOk = audioFailCount === 0
    const noLeak = leakCount === 0
    const noDuplicate = duplicateCount === 0
    const setDistributionOk = setDistributionIssues === 0

    // Print results
    console.log(`  📊 Results (${RUNS_PER_BLUEPRINT} runs):`)
    console.log(`     Avg items:    ${(totalItemsSum / RUNS_PER_BLUEPRINT).toFixed(0)} (target ${blueprint.totalItems})`)
    console.log(`     Min/Max:      ${minItems}/${maxItems}`)
    console.log(`     Reading avg:  ${readingAvg.toFixed(0)} (target ${expectedReading}) ${readingOk ? '✅' : '❌'}`)
    console.log(`     Listening avg: ${listeningAvg.toFixed(0)} (target ${expectedListening}) ${listeningOk ? '✅' : '❌'}`)
    console.log(`     Audio ok:     ${allAudioOk ? '✅' : `❌ (${audioFailCount} run fails)`}`)
    console.log(`     No leak:      ${noLeak ? '✅' : `❌ (${leakCount} runs)`}`)
    console.log(`     No duplicate: ${noDuplicate ? '✅' : `❌ (${duplicateCount} runs)`}`)
    console.log(`     Set distrib:  ${setDistributionOk ? '✅' : `⚠️ (${setDistributionIssues} runs)`}`)
    console.log()

    if (errors.length > 0) {
      console.log(`  ❌ Errors (${errors.length}):`)
      for (const e of errors) console.log(`       ${e}`)
      console.log()
      allPassed = false
    }

    if (warnings.length > 0) {
      console.log(`  ⚠️  Warnings (${warnings.length}):`)
      for (const w of warnings.slice(0, 10)) console.log(`       ${w}`)
      if (warnings.length > 10) console.log(`       ... and ${warnings.length - 10} more`)
      console.log()
    }

    // Final blueprint verdict
    const bpOk = readingOk && listeningOk && allAudioOk && noLeak && noDuplicate
    console.log(`  ${bpOk ? '✅' : '❌'} Blueprint ${bpId}: ${bpOk ? 'PASS' : 'FAIL'}\n`)
  }

  console.log('='.repeat(60))
  console.log(`\n  ${allPassed ? '✅ ALL BLUEPRINTS PASSED' : '❌ SOME BLUEPRINTS FAILED'}\n`)
  process.exit(allPassed ? 0 : 1)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
