import * as fs from 'fs'
import * as path from 'path'

interface QuestionOption {
  key: string
  text: string
}

interface McqQuestion {
  questionId: string
  type: string
  subskill: string
  difficulty: number
  prompt: string
  options?: QuestionOption[]
  answer?: string
  explanation?: string
  points: number
}

interface ListeningItem extends McqQuestion {
  audioId: string
  audioFile: string
  transcript: string
  speaker: string
  speed: string
  durationSeconds: number
}

interface Passage {
  passageId: string
  title: string
  text: string
  topic: string
  wordCount: number
  items: McqQuestion[]
}

interface ReadingSet {
  setId: string
  cefr: string
  skill: string
  title: string
  version: string
  status: string
  itemsCount: number
  passages: Passage[]
}

interface ListeningSet {
  setId: string
  cefr: string
  skill: string
  title: string
  version: string
  status: string
  itemsCount: number
  audioBasePath: string
  items: ListeningItem[]
}

type QuestionSet = ReadingSet | ListeningSet

const VALID_CEFR = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
const VALID_SKILLS = new Set(['reading', 'listening', 'writing', 'speaking', 'integrated'])
const VALID_TYPES = new Set(['multiple_choice', 'true_false', 'matching', 'short_answer', 'essay', 'audio_response', 'integrated_task'])
const VALID_STATUSES = new Set(['draft', 'review', 'published', 'retired'])
const VALID_CEFR_PATTERN = /^A[12]|B[12]|C[12]$/

interface ValidationError {
  file: string
  field: string
  message: string
  id?: string
}

const errors: ValidationError[] = []
const allQuestionIds = new Map<string, string>()
const allPassageIds = new Map<string, string>()

function addError(file: string, field: string, message: string, id?: string) {
  errors.push({ file, field, message, id })
}

function validateQuestionId(file: string, qId: string, setCefr: string, setSkill: string) {
  if (!qId || qId.length === 0) {
    addError(file, 'questionId', 'questionId tidak boleh kosong.')
    return
  }
  if (qId.includes(' ')) {
    addError(file, 'questionId', `questionId "${qId}" mengandung spasi.`)
  }
  if (qId !== qId.toUpperCase()) {
    addError(file, 'questionId', `questionId "${qId}" harus uppercase.`)
  }

  const parts = qId.split('-')
  if (parts.length < 5) {
    addError(file, 'questionId', `questionId "${qId}" format tidak valid. Harus format BIGT-{CEFR}-{SKILL}-{SET}-{ITEM}.`)
    return
  }
  const [, idCefr, idSkill] = parts
  if (idCefr !== setCefr) {
    addError(file, 'questionId', `questionId "${qId}" CEFR "${idCefr}" tidak sesuai set CEFR "${setCefr}".`)
  }
  const skillMap: Record<string, string> = { RD: 'reading', LS: 'listening', WR: 'writing', SP: 'speaking', INT: 'integrated' }
  const expectedSkillCode = Object.entries(skillMap).find(([, v]) => v === setSkill)?.[0]
  if (expectedSkillCode && idSkill !== expectedSkillCode) {
    addError(file, 'questionId', `questionId "${qId}" skill code "${idSkill}" tidak sesuai set skill "${setSkill}".`)
  }

  if (allQuestionIds.has(qId)) {
    addError(file, 'questionId', `questionId "${qId}" duplikat (juga ada di "${allQuestionIds.get(qId)}").`)
  } else {
    allQuestionIds.set(qId, file)
  }
}

function validatePassageId(file: string, pId: string) {
  if (!pId || pId.length === 0) {
    addError(file, 'passageId', 'passageId tidak boleh kosong.')
    return
  }
  if (allPassageIds.has(pId)) {
    addError(file, 'passageId', `passageId "${pId}" duplikat.`)
  } else {
    allPassageIds.set(pId, file)
  }
}

function validateMcq(file: string, item: McqQuestion, context: string) {
  if (!item.prompt || item.prompt.trim().length === 0) {
    addError(file, 'prompt', `Prompt kosong pada ${context}.`, item.questionId)
  }

  if (item.type === 'multiple_choice') {
    if (!item.options || item.options.length < 4) {
      addError(file, 'options', `${context}: multiple_choice butuh minimal 4 opsi (ada ${item.options?.length || 0}).`, item.questionId)
    }
  } else if (item.type === 'true_false') {
    if (!item.options || item.options.length !== 2) {
      addError(file, 'options', `${context}: true_false harus punya tepat 2 opsi.`, item.questionId)
    }
  } else if (item.type === 'matching') {
    if (!item.options || item.options.length < 4) {
      addError(file, 'options', `${context}: matching butuh minimal 4 opsi (ada ${item.options?.length || 0}).`, item.questionId)
    }
  } else if (item.type === 'short_answer') {
    // short_answer tidak perlu options
  }

  if (['multiple_choice', 'true_false', 'matching'].includes(item.type)) {
    if (!item.answer || item.answer.trim().length === 0) {
      addError(file, 'answer', `${context}: answer tidak boleh kosong.`, item.questionId)
    } else if (item.options && item.options.length > 0) {
      const validKeys = item.options.map(o => o.key)
      if (!validKeys.includes(item.answer)) {
        addError(file, 'answer', `${context}: answer "${item.answer}" tidak ada di opsi (${validKeys.join(', ')}).`, item.questionId)
      }
    }
  } else if (item.type === 'short_answer') {
    if (!item.answer || item.answer.trim().length === 0) {
      addError(file, 'answer', `${context}: short_answer harus memiliki answer.`, item.questionId)
    }
  }

  if (!item.explanation || item.explanation.trim().length === 0) {
    addError(file, 'explanation', `${context}: explanation tidak boleh kosong.`, item.questionId)
  }
}

function validateReadingSet(file: string, set: ReadingSet) {
  if (set.skill !== 'reading') {
    addError(file, 'skill', `Skill "${set.skill}" tidak sesuai untuk file reading.`)
  }
  if (!set.passages || set.passages.length === 0) {
    addError(file, 'passages', 'Tidak ada passage.')
    return
  }
  let totalQuestions = 0
  const seenPassageIds = new Set<string>()
  for (const passage of set.passages) {
    if (seenPassageIds.has(passage.passageId)) {
      addError(file, 'passageId', `passageId "${passage.passageId}" duplikat dalam satu set.`)
    } else {
      seenPassageIds.add(passage.passageId)
    }
    validatePassageId(file, passage.passageId)
    if (!passage.title || passage.title.trim().length === 0) {
      addError(file, 'title', `Passage "${passage.passageId}" tidak memiliki title.`)
    }
    if (!passage.text || passage.text.trim().length === 0) {
      addError(file, 'text', `Passage "${passage.passageId}" tidak memiliki text.`)
    }
    if (!passage.items || passage.items.length === 0) {
      addError(file, 'items', `Passage "${passage.passageId}" tidak memiliki items.`)
    }
    for (const item of passage.items) {
      validateQuestionId(file, item.questionId, set.cefr, set.skill)
      validateMcq(file, item, `Passage "${passage.passageId}" item "${item.questionId}"`)
      if (item.difficulty < 0 || item.difficulty > 1) {
        addError(file, 'difficulty', `Item "${item.questionId}" difficulty ${item.difficulty} di luar 0.00–1.00.`)
      }
      totalQuestions++
    }
  }
  if (set.itemsCount !== totalQuestions) {
    addError(file, 'itemsCount', `itemsCount ${set.itemsCount} tidak sesuai jumlah aktual ${totalQuestions}.`)
  }
}

function validateListeningSet(file: string, set: ListeningSet) {
  if (set.skill !== 'listening') {
    addError(file, 'skill', `Skill "${set.skill}" tidak sesuai untuk file listening.`)
  }
  if (!set.audioBasePath || set.audioBasePath.trim().length === 0) {
    addError(file, 'audioBasePath', 'audioBasePath tidak boleh kosong.')
  }
  if (!set.items || set.items.length === 0) {
    addError(file, 'items', 'Tidak ada items.')
    return
  }
  for (const item of set.items) {
    validateQuestionId(file, item.questionId, set.cefr, set.skill)
    validateMcq(file, item, `Item "${item.questionId}"`)
    if (!item.audioId || item.audioId.trim().length === 0) {
      addError(file, 'audioId', `Item "${item.questionId}" tidak memiliki audioId.`)
    }
    if (!item.audioFile || item.audioFile.trim().length === 0) {
      addError(file, 'audioFile', `Item "${item.questionId}" tidak memiliki audioFile.`)
    }
    if (!item.transcript || item.transcript.trim().length === 0) {
      addError(file, 'transcript', `Item "${item.questionId}" tidak memiliki transcript.`)
    }
    if (!item.speaker || item.speaker.trim().length === 0) {
      addError(file, 'speaker', `Item "${item.questionId}" tidak memiliki speaker.`)
    }
    if (!item.speed || item.speed.trim().length === 0) {
      addError(file, 'speed', `Item "${item.questionId}" tidak memiliki speed.`)
    }
    if (!item.durationSeconds || item.durationSeconds <= 0) {
      addError(file, 'durationSeconds', `Item "${item.questionId}" durationSeconds tidak valid (${item.durationSeconds}).`)
    }
    if (item.difficulty < 0 || item.difficulty > 1) {
      addError(file, 'difficulty', `Item "${item.questionId}" difficulty ${item.difficulty} di luar 0.00–1.00.`)
    }
  }
  if (set.itemsCount !== set.items.length) {
    addError(file, 'itemsCount', `itemsCount ${set.itemsCount} tidak sesuai jumlah aktual ${set.items.length}.`)
  }
}

function validateSet(file: string, set: QuestionSet) {
  // setId
  if (!set.setId || set.setId.trim().length === 0) {
    addError(file, 'setId', 'setId tidak boleh kosong.')
  }
  // CEFR
  if (!set.cefr || !VALID_CEFR.has(set.cefr)) {
    addError(file, 'cefr', `CEFR "${set.cefr}" tidak valid. Harus A1-C2.`)
  }
  // Skill
  if (!set.skill || !VALID_SKILLS.has(set.skill)) {
    addError(file, 'skill', `Skill "${set.skill}" tidak valid. Harus reading/listening/writing/speaking/integrated.`)
  }
  // title
  if (!set.title || set.title.trim().length === 0) {
    addError(file, 'title', 'title tidak boleh kosong.')
  }
  // version
  if (!set.version) {
    addError(file, 'version', 'version tidak boleh kosong.')
  }
  // status
  if (!set.status || !VALID_STATUSES.has(set.status)) {
    addError(file, 'status', `Status "${set.status}" tidak valid. Harus draft/review/published/retired.`)
  }

  if (set.skill === 'reading') {
    validateReadingSet(file, set as ReadingSet)
  } else if (set.skill === 'listening') {
    validateListeningSet(file, set as ListeningSet)
  } else {
    addError(file, 'skill', `Validasi untuk skill "${set.skill}" belum diimplementasikan.`)
  }
}

function main() {
  const questionBankDir = path.resolve(__dirname, '..', 'data', 'question-bank')
  if (!fs.existsSync(questionBankDir)) {
    console.error(`❌  Direktori question bank tidak ditemukan: ${questionBankDir}`)
    process.exit(1)
  }

  const files: string[] = []
  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'audio-manifests') return
        walkDir(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        files.push(fullPath)
      }
    }
  }
  walkDir(questionBankDir)

  console.log(`\n🔍  Validating ${files.length} question set file(s)...\n`)

  for (const file of files) {
    const relativePath = path.relative(path.resolve(__dirname, '..'), file)
    try {
      const content = JSON.parse(fs.readFileSync(file, 'utf-8'))
      validateSet(relativePath, content)
    } catch (err: any) {
      addError(relativePath, 'parse', `Gagal parse JSON: ${err.message}`)
    }
  }

  // Report
  if (errors.length === 0) {
    console.log('✅  All question sets passed validation!')
    console.log(`   Files validated: ${files.length}`)
    console.log(`   Total questions: ${allQuestionIds.size}`)
    console.log()
    process.exit(0)
  } else {
    console.log(`❌  Found ${errors.length} validation error(s):\n`)
    for (const err of errors) {
      const idStr = err.id ? ` [${err.id}]` : ''
      console.log(`   • ${err.file} > ${err.field}${idStr}`)
      console.log(`     ${err.message}`)
    }
    console.log()
    process.exit(1)
  }
}

main()
