import * as fs from 'fs'
import * as path from 'path'
import { syncQuestionItem } from '../lib/question-bank/syncQuestionItem'
import type { QuestionSet, ReadingSet, ListeningSet } from '../types/question-bank'

const DATA_DIR = path.resolve(process.cwd(), 'data', 'question-bank')

async function main() {
  console.log('============================================================')
  console.log('  SYNC ALL FILE-BASED QUESTIONS TO DATABASE')
  console.log('============================================================\n')

  const questionIds: string[] = []

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
          if (!raw.setId || !raw.skill) continue
          const set = raw as QuestionSet
          if (set.skill === 'reading') {
            const rs = set as ReadingSet
            for (const passage of rs.passages) {
              for (const item of passage.items) {
                questionIds.push(item.questionId)
              }
            }
          } else if (set.skill === 'listening') {
            const ls = set as ListeningSet
            for (const item of ls.items) {
              questionIds.push(item.questionId)
            }
          }
        } catch (e: any) {
          console.warn(`  ⚠️  Skip file ${entry.name}: ${e.message}`)
        }
      }
    }
  }

  walkDir(DATA_DIR)
  console.log(`  Total questions found: ${questionIds.length}\n`)

  let synced = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < questionIds.length; i++) {
    const qid = questionIds[i]
    try {
      const result = await syncQuestionItem(qid)
      if (result) {
        synced++
      } else {
        skipped++
      }
    } catch (e: any) {
      errors++
      console.error(`  ❌ [${i + 1}/${questionIds.length}] ${qid}: ${e.message}`)
    }

    if ((i + 1) % 50 === 0 || i === questionIds.length - 1) {
      console.log(`  📊 Progress: ${i + 1}/${questionIds.length} | synced=${synced} skipped=${skipped} errors=${errors}`)
    }
  }

  console.log(`\n  ✅ Done!`)
  console.log(`     Total:    ${questionIds.length}`)
  console.log(`     Synced:   ${synced}`)
  console.log(`     Skipped:  ${skipped}`)
  console.log(`     Errors:   ${errors}`)
  console.log()
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
