import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

interface CliArgs {
  cefr: string
  skill: string
  set: string
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2)
  const result: CliArgs = { cefr: 'A1', skill: 'listening', set: '02' }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--cefr': result.cefr = args[++i]?.toUpperCase() || 'A1'; break
      case '--skill': result.skill = args[++i]?.toLowerCase() || 'listening'; break
      case '--set': result.set = args[++i] || '02'; break
      case '--help':
        console.log(`
  Usage: npx tsx scripts/validate-listening-audio.ts [options]

  Options:
    --cefr <level>    CEFR level (A1, A2, etc.)  [default: A1]
    --skill <skill>   Skill type (listening)      [default: listening]
    --set <number>    Set number                  [default: 02]
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
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function loadManifest(cefr: string, skill: string, setNum: string): any | null {
  const filePath = path.join(process.cwd(), 'data', 'question-bank', 'audio-manifests', `${cefr.toLowerCase()}-${skill}-set-${setNum}.json`)
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function detectAudioFormat(filePath: string): 'mp3' | 'wav' | 'unknown' {
  try {
    const fd = fs.openSync(filePath, 'r')
    const buf = Buffer.alloc(4)
    fs.readSync(fd, buf, 0, 4, 0)
    fs.closeSync(fd)

    if (buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0) return 'mp3'
    if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return 'mp3'
    if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return 'wav'
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

async function main() {
  const args = parseArgs()
  const { cefr, skill, set: setNum } = args

  const questionSet = loadQuestionSet(cefr, skill, setNum)
  const items = questionSet.items || []
  const isDraft = questionSet.status === 'draft'
  const audioDir = path.join(process.cwd(), 'public', 'audio', 'listening', cefr.toLowerCase(), `set-${setNum}`)

  console.log(`\n🔍  BIGT Listening Audio Validator\n`)
  console.log(`  Set:     ${questionSet.setId} — ${questionSet.title}`)
  console.log(`  Status:  ${questionSet.status}`)
  console.log(`  Items:   ${items.length} listening item(s)`)
  console.log(`  Audio:   ${audioDir}`)
  console.log()

  let missingFiles = 0
  let corruptedFiles = 0
  let placeholderFiles = 0
  let generatedFiles = 0
  let manifestMissing = false
  let hashMismatch = 0
  let orphanFiles = 0
  let errors: string[] = []
  let warnings: string[] = []

  const manifest = loadManifest(cefr, skill, setNum)
  if (!manifest) {
    manifestMissing = true
    warnings.push('Tidak ada manifest audio. Generate audio dulu dengan npm run audio:generate.')
  }

  const manifestMap = new Map<string, any>()
  if (manifest) {
    for (const mi of manifest.items) {
      manifestMap.set(mi.audioId, mi)
    }
  }

  const expectedAudioFiles = new Set<string>()

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const { questionId, audioId, audioFile, transcript, speaker } = item
    const audioPath = path.join(audioDir, audioFile)

    expectedAudioFiles.add(audioFile)

    if (!fs.existsSync(audioPath)) {
      missingFiles++
      errors.push(`[${i + 1}] ${questionId}: File audio tidak ditemukan — ${audioPath}`)
      continue
    }

    const stats = fs.statSync(audioPath)
    if (stats.size === 0) {
      corruptedFiles++
      errors.push(`[${i + 1}] ${questionId}: File audio kosong (0 bytes) — ${audioFile}`)
      continue
    }

    const detectedFormat = detectAudioFormat(audioPath)
    if (detectedFormat === 'wav') {
      errors.push(`[${i + 1}] ${questionId}: File berekstensi .mp3 tetapi berformat WAV — ${audioFile}`)
    } else if (detectedFormat === 'unknown') {
      warnings.push(`[${i + 1}] ${questionId}: Format audio tidak dikenal — ${audioFile}`)
    }

    const manifestItem = manifestMap.get(audioId)
    if (manifestItem) {
      if (manifestItem.status === 'placeholder') {
        placeholderFiles++
        errors.push(`[${i + 1}] ${questionId}: Audio masih placeholder — harus digenerate dengan TTS real`)
      } else if (manifestItem.status === 'generated') {
        generatedFiles++
      }

      const expectedHash = crypto.createHash('sha256').update(transcript).digest('hex')
      if (manifestItem.transcriptHash && manifestItem.transcriptHash !== expectedHash) {
        hashMismatch++
        warnings.push(`[${i + 1}] ${questionId}: Transcript hash mismatch — transcript mungkin sudah berubah sejak audio digenerate.`)
      }
    } else {
      if (!isDraft) {
        warnings.push(`[${i + 1}] ${questionId}: File ada tapi tidak ada di manifest (mungkin digenerate manual).`)
      }
    }
  }

  const allFilesInDir = fs.existsSync(audioDir) ? fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3')) : []
  for (const file of allFilesInDir) {
    if (!expectedAudioFiles.has(file)) {
      orphanFiles++
      warnings.push(`File orphan (tidak ada di JSON): ${file}`)
    }
  }

  console.log(`  Results:`)
  console.log(`    ✅ Audio files present:   ${items.length - missingFiles}/${items.length}`)
  console.log(`    ❌ Missing:               ${missingFiles}`)
  console.log(`    ❌ Corrupted (0 bytes):   ${corruptedFiles}`)
  console.log(`    🔊 Generated:            ${generatedFiles}`)
  console.log(`    🧪 Placeholder:          ${placeholderFiles}`)
  console.log(`    ⚠️  Hash mismatch:        ${hashMismatch}`)
  console.log(`    📄 Orphan files:         ${orphanFiles}`)
  console.log(`    📋 Manifest exists:      ${!manifestMissing}`)
  console.log()

  if (warnings.length > 0) {
    console.warn(`  ⚠️  Warnings (${warnings.length}):`)
    for (const w of warnings) console.warn(`       ${w}`)
    console.log()
  }

  if (errors.length > 0) {
    console.error(`  ❌ Errors (${errors.length}):`)
    for (const e of errors) console.error(`       ${e}`)
    console.log()
  }

  if (!isDraft && missingFiles > 0) {
    console.error(`  ❌ FATAL: Set sudah published tetapi ada ${missingFiles} file audio hilang.\n`)
    process.exit(1)
  }

  if (errors.length > 0) {
    process.exit(1)
  }

  console.log(`  ✅ Validation passed.\n`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
