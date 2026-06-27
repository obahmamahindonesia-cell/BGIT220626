// BIGT Constructed Response Rubrics — A1/A2 Writing, Speaking, Integrated, Mediation
// Never expose full rubric to participant endpoint (only rubricRef)

export type RubricDimension = {
  id: string
  name: string
  nameId: string
  description: string
  levels: Record<number, { label: string; description: string }>
}

export type Rubric = {
  ref: string
  skill: string
  level: string
  name: string
  description: string
  dimensions: RubricDimension[]
  maxScore: number
}

const WRITING_LEVELS: Record<number, { label: string; description: string }> = {
  0: { label: 'Tidak ada respons', description: 'Tidak menjawab atau jawaban tidak relevan.' },
  1: { label: 'Sangat terbatas', description: 'Ide tidak jelas, kosa kata sangat minim, banyak kesalahan.' },
  2: { label: 'Sebagian', description: 'Ide mulai terbentuk namun masih sering terhenti/kurang tepat.' },
  3: { label: 'Cukup untuk A1', description: 'Ide cukup jelas, kosa kata dasar memadai, kesalahan tidak mengganggu.' },
  4: { label: 'Kuat A1', description: 'Ide jelas, kosa kata bervariasi, tata bahasa cukup baik.' },
  5: { label: 'Di atas A1', description: 'Menunjukkan kemampuan awal A2, struktur lebih kompleks.' },
}

const A2_WRITING_LEVELS: Record<number, { label: string; description: string }> = {
  0: { label: 'Tidak ada respons', description: 'Tidak menjawab atau jawaban tidak relevan.' },
  1: { label: 'Sangat terbatas', description: 'Sulit dipahami, kosa kata sangat terbatas.' },
  2: { label: 'Di bawah A2', description: 'Ide ada namun kurang jelas, banyak kesalahan signifikan.' },
  3: { label: 'Cukup A2', description: 'Ide jelas, kosa kata cukup, kesalahan minor.' },
  4: { label: 'Kuat A2', description: 'Ide terstruktur, kosa kata bervariasi, minim kesalahan.' },
  5: { label: 'Di atas A2', description: 'Menunjukkan kemampuan awal B1, kalimat kompleks.' },
}

const SPEAKING_LEVELS: Record<number, { label: string; description: string }> = {
  0: { label: 'Tidak ada respons', description: 'Tidak menjawab atau tidak dapat dipahami.' },
  1: { label: 'Sangat terbatas', description: 'Terbata-bata, pelafalan sulit dipahami.' },
  2: { label: 'Sebagian', description: 'Dapat dipahami sebagian, banyak jeda.' },
  3: { label: 'Cukup untuk A1', description: 'Dapat dipahami, pelafalan cukup jelas, ada jeda wajar.' },
  4: { label: 'Kuat A1', description: 'Lancar untuk level A1, pelafalan jelas.' },
  5: { label: 'Di atas A1', description: 'Menunjukkan kelancaran awal A2.' },
}

const A2_SPEAKING_LEVELS: Record<number, { label: string; description: string }> = {
  0: { label: 'Tidak ada respons', description: 'Tidak menjawab atau tidak dapat dipahami.' },
  1: { label: 'Sangat terbatas', description: 'Sulit dipahami, banyak jeda panjang.' },
  2: { label: 'Di bawah A2', description: 'Terbata-bata, pelafalan bermasalah.' },
  3: { label: 'Cukup A2', description: 'Cukup lancar, pelafalan jelas, jeda wajar.' },
  4: { label: 'Kuat A2', description: 'Lancar, pelafalan baik, intonasi sesuai.' },
  5: { label: 'Di atas A2', description: 'Mendekati B1, lancar dengan variasi.' },
}

export const CONSTRUCTED_RUBRICS: Rubric[] = [
  {
    ref: 'BIGT-RUBRIC-A1-WRITING',
    skill: 'WRITING',
    level: 'A1',
    name: 'Rubrik Menulis A1',
    description: 'Menilai kemampuan menulis teks sederhana level A1.',
    maxScore: 25,
    dimensions: [
      {
        id: 'taskAchievement',
        name: 'Task Achievement',
        nameId: 'Pencapaian Tugas',
        description: 'Sejauh mana peserta menyelesaikan tugas yang diminta.',
        levels: WRITING_LEVELS,
      },
      {
        id: 'vocabularyRange',
        name: 'Vocabulary Range',
        nameId: 'Ragam Kosa Kata',
        description: 'Penggunaan kosa kata sesuai level A1.',
        levels: WRITING_LEVELS,
      },
      {
        id: 'grammarAccuracy',
        name: 'Grammar Accuracy',
        nameId: 'Ketepatan Tata Bahasa',
        description: 'Ketepatan struktur kalimat dasar.',
        levels: WRITING_LEVELS,
      },
      {
        id: 'coherence',
        name: 'Coherence',
        nameId: 'Koherensi',
        description: 'Kejelasan hubungan antarkalimat.',
        levels: WRITING_LEVELS,
      },
      {
        id: 'mechanics',
        name: 'Mechanics',
        nameId: 'Mekanik',
        description: 'Ejaan, tanda baca, dan huruf kapital.',
        levels: WRITING_LEVELS,
      },
    ],
  },
  {
    ref: 'BIGT-RUBRIC-A2-WRITING',
    skill: 'WRITING',
    level: 'A2',
    name: 'Rubrik Menulis A2',
    description: 'Menilai kemampuan menulis teks sederhana level A2.',
    maxScore: 25,
    dimensions: [
      {
        id: 'taskAchievement',
        name: 'Task Achievement',
        nameId: 'Pencapaian Tugas',
        description: 'Sejauh mana peserta menyelesaikan tugas yang diminta.',
        levels: A2_WRITING_LEVELS,
      },
      {
        id: 'vocabularyRange',
        name: 'Vocabulary Range',
        nameId: 'Ragam Kosa Kata',
        description: 'Penggunaan kosa kata sesuai level A2.',
        levels: A2_WRITING_LEVELS,
      },
      {
        id: 'grammarAccuracy',
        name: 'Grammar Accuracy',
        nameId: 'Ketepatan Tata Bahasa',
        description: 'Ketepatan struktur kalimat.',
        levels: A2_WRITING_LEVELS,
      },
      {
        id: 'coherence',
        name: 'Coherence',
        nameId: 'Koherensi',
        description: 'Kejelasan hubungan antarkalimat dan paragraf.',
        levels: A2_WRITING_LEVELS,
      },
      {
        id: 'communicativeEffectiveness',
        name: 'Communicative Effectiveness',
        nameId: 'Efektivitas Komunikasi',
        description: 'Pesan tersampaikan dengan jelas kepada pembaca.',
        levels: A2_WRITING_LEVELS,
      },
    ],
  },
  {
    ref: 'BIGT-RUBRIC-A1-SPEAKING',
    skill: 'SPEAKING',
    level: 'A1',
    name: 'Rubrik Berbicara A1',
    description: 'Menilai kemampuan berbicara sederhana level A1.',
    maxScore: 25,
    dimensions: [
      {
        id: 'taskCompletion',
        name: 'Task Completion',
        nameId: 'Penyelesaian Tugas',
        description: 'Peserta menyelesaikan tugas berbicara.',
        levels: SPEAKING_LEVELS,
      },
      {
        id: 'pronunciation',
        name: 'Pronunciation',
        nameId: 'Pelafalan',
        description: 'Kejelasan pelafalan kata.',
        levels: SPEAKING_LEVELS,
      },
      {
        id: 'fluency',
        name: 'Fluency',
        nameId: 'Kelancaran',
        description: 'Kelancaran berbicara tanpa jeda berlebihan.',
        levels: SPEAKING_LEVELS,
      },
      {
        id: 'vocabulary',
        name: 'Vocabulary',
        nameId: 'Kosa Kata',
        description: 'Penggunaan kosa kata dasar A1.',
        levels: SPEAKING_LEVELS,
      },
      {
        id: 'grammarControl',
        name: 'Grammar Control',
        nameId: 'Penguasaan Tata Bahasa',
        description: 'Ketepatan struktur kalimat lisan.',
        levels: SPEAKING_LEVELS,
      },
    ],
  },
  {
    ref: 'BIGT-RUBRIC-A2-SPEAKING',
    skill: 'SPEAKING',
    level: 'A2',
    name: 'Rubrik Berbicara A2',
    description: 'Menilai kemampuan berbicara level A2.',
    maxScore: 30,
    dimensions: [
      {
        id: 'taskCompletion',
        name: 'Task Completion',
        nameId: 'Penyelesaian Tugas',
        description: 'Peserta menyelesaikan tugas berbicara.',
        levels: A2_SPEAKING_LEVELS,
      },
      {
        id: 'pronunciation',
        name: 'Pronunciation',
        nameId: 'Pelafalan',
        description: 'Kejelasan dan ketepatan pelafalan.',
        levels: A2_SPEAKING_LEVELS,
      },
      {
        id: 'fluency',
        name: 'Fluency',
        nameId: 'Kelancaran',
        description: 'Kelancaran dan ritme berbicara.',
        levels: A2_SPEAKING_LEVELS,
      },
      {
        id: 'vocabularyRange',
        name: 'Vocabulary Range',
        nameId: 'Ragam Kosa Kata',
        description: 'Variasi kosa kata yang digunakan.',
        levels: A2_SPEAKING_LEVELS,
      },
      {
        id: 'grammarControl',
        name: 'Grammar Control',
        nameId: 'Penguasaan Tata Bahasa',
        description: 'Ketepatan struktur kalimat lisan.',
        levels: A2_SPEAKING_LEVELS,
      },
      {
        id: 'interactionReadiness',
        name: 'Interaction Readiness',
        nameId: 'Kesiapan Interaksi',
        description: 'Kemampuan merespons dan berinteraksi.',
        levels: A2_SPEAKING_LEVELS,
      },
    ],
  },
  {
    ref: 'BIGT-RUBRIC-INTEGRATED-A1',
    skill: 'INTEGRATED',
    level: 'A1',
    name: 'Rubrik Tugas Terintegrasi A1',
    description: 'Menilai kemampuan menggabungkan reseptif dan produktif.',
    maxScore: 25,
    dimensions: [
      {
        id: 'comprehension',
        name: 'Comprehension',
        nameId: 'Pemahaman',
        description: 'Pemahaman terhadap stimulus.',
        levels: WRITING_LEVELS,
      },
      {
        id: 'transferAccuracy',
        name: 'Transfer Accuracy',
        nameId: 'Ketepatan Transfer',
        description: 'Ketepatan memindahkan informasi.',
        levels: WRITING_LEVELS,
      },
      {
        id: 'languageControl',
        name: 'Language Control',
        nameId: 'Penguasaan Bahasa',
        description: 'Ketepatan bahasa yang digunakan.',
        levels: WRITING_LEVELS,
      },
      {
        id: 'clarity',
        name: 'Clarity',
        nameId: 'Kejelasan',
        description: 'Kejelasan penyampaian.',
        levels: WRITING_LEVELS,
      },
      {
        id: 'taskCompletion',
        name: 'Task Completion',
        nameId: 'Penyelesaian Tugas',
        description: 'Tugas selesai sesuai instruksi.',
        levels: WRITING_LEVELS,
      },
    ],
  },
]

export function getRubric(ref: string): Rubric | undefined {
  return CONSTRUCTED_RUBRICS.find(r => r.ref === ref)
}

export function getRubricsForSkill(skill: string): Rubric[] {
  return CONSTRUCTED_RUBRICS.filter(r => r.skill === skill)
}

export function getRubricsForLevel(level: string): Rubric[] {
  return CONSTRUCTED_RUBRICS.filter(r => r.level === level)
}

export function calculateConstructedScore(
  rubricRef: string,
  dimensionScores: Record<string, number>
): { totalScore: number; maxScore: number; percentage: number; band: string } {
  const rubric = getRubric(rubricRef)
  if (!rubric) {
    return { totalScore: 0, maxScore: 0, percentage: 0, band: 'unknown' }
  }

  let total = 0
  let maxPossible = 0

  for (const dim of rubric.dimensions) {
    const score = dimensionScores[dim.id]
    if (typeof score === 'number' && score >= 0) {
      total += Math.min(score, 5)
    }
    maxPossible += 5
  }

  const percentage = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0

  let band: string
  if (percentage >= 80) band = 'strong'
  else if (percentage >= 60) band = 'pass'
  else if (percentage >= 40) band = 'borderline'
  else band = 'below'

  return { totalScore: total, maxScore: maxPossible, percentage, band }
}

export function deriveBandFromScore(percentage: number): string {
  if (percentage >= 80) return 'strong'
  if (percentage >= 60) return 'pass'
  if (percentage >= 40) return 'borderline'
  return 'below'
}

export function validateReviewerScore(
  rubricRef: string,
  dimensionScores: Record<string, number>
): { valid: boolean; errors: string[] } {
  const rubric = getRubric(rubricRef)
  const errors: string[] = []

  if (!rubric) {
    return { valid: false, errors: [`Rubrik "${rubricRef}" tidak ditemukan.`] }
  }

  for (const dim of rubric.dimensions) {
    const score = dimensionScores[dim.id]
    if (typeof score !== 'number') {
      errors.push(`Dimensi "${dim.nameId}" (${dim.id}) belum dinilai.`)
    } else if (score < 0 || score > 5) {
      errors.push(`Skor dimensi "${dim.nameId}" harus 0–5, mendapat ${score}.`)
    }
  }

  return { valid: errors.length === 0, errors }
}
