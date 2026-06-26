import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { getTtsProvider } from '../lib/tts/ttsProvider'
import { getVoiceForSpeaker } from '../lib/tts/voiceMap'
import { normalizeIndonesianTranscript } from '../lib/tts/audioTextNormalizer'

interface CliArgs {
  cefr: string
  skill: string
  set: string
  dryRun: boolean
  force: boolean
  only: string[]
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2)
  const result: CliArgs = { cefr: 'A1', skill: 'listening', set: '02', dryRun: false, force: false, only: [] }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--cefr': result.cefr = args[++i]?.toUpperCase() || 'A1'; break
      case '--skill': result.skill = args[++i]?.toLowerCase() || 'listening'; break
      case '--set': result.set = args[++i] || '02'; break
      case '--dry-run': result.dryRun = true; break
      case '--force': result.force = true; break
      case '--only':
        const val = args[++i] || ''
        result.only = val.split(',').map(s => s.trim()).filter(Boolean)
        break
      case '--help':
        console.log(`
  Usage: npx tsx scripts/generate-listening-audio.ts [options]

  Options:
    --cefr <level>    CEFR level (A1, A2, etc.)   [default: A1]
    --skill <skill>   Skill type (listening)       [default: listening]
    --set <number>    Set number                   [default: 02]
    --only <ids>      Comma-separated audioId suffixes or questionIds (e.g. A001,A002 or BIGT-A1-LS-S02-A001)
    --dry-run         Preview without generating
    --force           Overwrite existing files
    --help            Show this help
        `)
        process.exit(0)
    }
  }

  return result
}

function loadQuestionSet(cefr: string, skill: string, setNum: string): any {
  const filePath = path.join(process.cwd(), 'data', 'question-bank', cefr.toLowerCase(), skill, `set-${setNum}.json`)
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File tidak ditemukan: ${filePath}`)
    process.exit(1)
  }
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw)
}

function getOutputDir(cefr: string, setNum: string): string {
  return path.join(process.cwd(), 'public', 'audio', 'listening', cefr.toLowerCase(), `set-${setNum}`)
}

function getManifestPath(cefr: string, skill: string, setNum: string): string {
  return path.join(process.cwd(), 'data', 'question-bank', 'audio-manifests', `${cefr.toLowerCase()}-${skill}-set-${setNum}.json`)
}

function loadManifest(cefr: string, skill: string, setNum: string): any | null {
  const p = getManifestPath(cefr, skill, setNum)
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

function itemMatchesFilter(item: any, onlyList: string[], setId: string): boolean {
  if (onlyList.length === 0) return true
  const audioId = item.audioId || ''
  const qId = item.questionId || ''
  for (const filter of onlyList) {
    if (audioId === filter || audioId.endsWith(filter) || qId === filter || qId.endsWith(filter)) return true
  }
  return false
}

async function main() {
  const args = parseArgs()
  const { cefr, skill, set: setNum, dryRun, force, only } = args

  const questionSet = loadQuestionSet(cefr, skill, setNum)
  const allItems = questionSet.items || []
  const items = allItems.filter((item: any) => itemMatchesFilter(item, only, questionSet.setId))
  const outputDir = getOutputDir(cefr, setNum)

  console.log(`\n🔊  BIGT Listening Audio Generator\n`)
  console.log(`  Set:     ${questionSet.setId} — ${questionSet.title}`)
  console.log(`  Items:   ${items.length}/${allItems.length} listening item(s)${only.length ? ' (filtered)' : ''}`)
  console.log(`  Output:  ${outputDir}`)
  console.log(`  Mode:    ${dryRun ? '🧪 DRY RUN (no files written)' : force ? '⚡ FORCE (overwrite existing)' : 'Normal (skip existing)'}`)
  if (only.length > 0) console.log(`  Filter:  ${only.join(', ')}`)
  console.log()

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
    console.log(`  📁 Created output directory`)
  }

  const providerName = (process.env.TTS_PROVIDER || 'placeholder').toLowerCase()
  console.log(`  TTS Provider: ${providerName === 'elevenlabs' ? '🔊 ElevenLabs' : providerName === 'google' ? '🔊 Google Cloud TTS' : '🧪 Placeholder (dev mode)'}`)
  if (providerName === 'placeholder') {
    console.warn('  ⚠️  Generated placeholder audio — NOT for production.')
  }
  console.log()

  const existingManifest = loadManifest(cefr, skill, setNum)
  const manifestItemMap = new Map<string, any>()
  if (existingManifest) {
    for (const mi of existingManifest.items) {
      manifestItemMap.set(mi.audioId, mi)
    }
  }

  const newManifestItems: any[] = []
  let generatedCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const { questionId, audioId, audioFile, transcript, speaker, speed } = item

    const outputPath = path.join(outputDir, audioFile)
    const audioExists = fs.existsSync(outputPath)

    if (audioExists && !force && !dryRun) {
      console.log(`  ⏭️  [${i + 1}/${items.length}] ${questionId} — ${audioFile} (already exists, skipping)`)
      const stats = fs.statSync(outputPath)
      newManifestItems.push({
        questionId,
        audioId,
        audioFile,
        audioPath: `/audio/listening/${cefr.toLowerCase()}/set-${setNum}/${audioFile}`,
        speaker,
        voiceId: 'existing',
        status: 'generated',
        fileSizeBytes: stats.size,
        transcriptHash: crypto.createHash('sha256').update(transcript).digest('hex'),
        generatedAt: new Date().toISOString(),
      })
      skippedCount++
      continue
    }

    const normalized = normalizeIndonesianTranscript(transcript)
    const voice = getVoiceForSpeaker(speaker)

    if (dryRun) {
      console.log(`  📋 [${i + 1}/${items.length}] ${questionId}`)
      console.log(`       Audio:   ${audioFile}`)
      console.log(`       Path:    /audio/listening/${cefr.toLowerCase()}/set-${setNum}/${audioFile}`)
      console.log(`       Speaker: ${speaker} → Voice: ${voice.voiceId} (${voice.provider})`)
      console.log(`       Speed:   ${speed}`)
      console.log(`       Normal:  ${normalized}`)
      if (audioExists) {
        console.log(`       ⚠️  File already exists (will skip without --force)`)
      }
      console.log()
      newManifestItems.push({
        questionId,
        audioId,
        audioFile,
        audioPath: `/audio/listening/${cefr.toLowerCase()}/set-${setNum}/${audioFile}`,
        speaker,
        voiceId: voice.voiceId,
        status: audioExists ? 'skip-existing' : 'pending',
        transcriptHash: crypto.createHash('sha256').update(transcript).digest('hex'),
        generatedAt: null,
      })
      continue
    }

    try {
      const provider = getTtsProvider()
      const result = await provider.synthesize(normalized, voice, speed)

      fs.writeFileSync(outputPath, result.audioBuffer)

      const action = audioExists && force ? '♻️  Regenerated' : '✅ Generated'
      console.log(`  ${action} [${i + 1}/${items.length}] ${questionId} — ${audioFile} (${(result.fileSizeBytes / 1024).toFixed(1)} KB)`)

      newManifestItems.push({
        questionId,
        audioId,
        audioFile,
        audioPath: `/audio/listening/${cefr.toLowerCase()}/set-${setNum}/${audioFile}`,
        speaker,
        voiceId: voice.voiceId,
        status: result.provider === 'placeholder' ? 'placeholder' : 'generated',
        fileSizeBytes: result.fileSizeBytes,
        transcriptHash: crypto.createHash('sha256').update(transcript).digest('hex'),
        generatedAt: new Date().toISOString(),
      })
      generatedCount++
    } catch (err: any) {
      console.error(`  ❌ Error [${i + 1}/${items.length}] ${questionId}: ${err.message}`)
      newManifestItems.push({
        questionId,
        audioId,
        audioFile,
        audioPath: `/audio/listening/${cefr.toLowerCase()}/set-${setNum}/${audioFile}`,
        speaker,
        voiceId: 'error',
        status: 'error',
        error: err.message,
        transcriptHash: crypto.createHash('sha256').update(transcript).digest('hex'),
        generatedAt: new Date().toISOString(),
      })
      errorCount++
    }
  }

  if (dryRun) {
    console.log(`\n  🧪 DRY RUN COMPLETE`)
    console.log(`  Items: ${items.length}/${allItems.length} (filtered: ${only.length > 0})`)
    console.log(`  Generate: ${generatedCount}`)
    console.log(`  Skip:     ${skippedCount}`)
    console.log(`  Errors:   ${errorCount}`)
    console.log(`  (No files written)\n`)
    return
  }

  const mergedManifestItems = [...newManifestItems]

  if (existingManifest) {
    for (const existingItem of existingManifest.items) {
      const replaced = mergedManifestItems.find(mi => mi.audioId === existingItem.audioId)
      if (!replaced) {
        mergedManifestItems.push(existingItem)
      }
    }
  }

  const manifest = {
    setId: questionSet.setId,
    cefr: questionSet.cefr,
    skill: questionSet.skill,
    provider: providerName,
    generatedAt: new Date().toISOString(),
    items: mergedManifestItems,
  }

  const manifestPath = getManifestPath(cefr, skill, setNum)
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true })
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')

  console.log(`\n  📄 Manifest updated: ${manifestPath}`)
  console.log(`  📊 Summary:`)
  console.log(`       Total in set: ${allItems.length}`)
  console.log(`       Processed:    ${items.length}`)
  console.log(`       Generated:    ${generatedCount}`)
  console.log(`       Skipped:      ${skippedCount}`)
  console.log(`       Errors:       ${errorCount}`)
  console.log(`  ✅ Done.\n`)
}

main().catch((err) => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
