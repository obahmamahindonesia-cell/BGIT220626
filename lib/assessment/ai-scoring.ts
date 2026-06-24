export interface AIAssessmentResult {
  score: number
  cefrEstimate: string
  feedback: string
  strengths: string[]
  weaknesses: string[]
}

export async function assessAnswer(
  question: { questionType: string; prompt?: string | null; correctAnswer?: any; rubric?: any },
  answer: any
): Promise<AIAssessmentResult> {
  // MCQ: auto-score
  if (question.questionType === 'MCQ') {
    const isCorrect = String(answer) === String(question.correctAnswer)
    return {
      score: isCorrect ? 10 : 0,
      cefrEstimate: '',
      feedback: isCorrect ? 'Jawaban benar.' : 'Jawaban salah.',
      strengths: isCorrect ? ['Pemahaman baik'] : [],
      weaknesses: isCorrect ? [] : ['Periksa kembali pemahaman soal'],
    }
  }

  // SHORT_ANSWER: basic matching
  if (question.questionType === 'SHORT_ANSWER') {
    const correct = String(question.correctAnswer || '').toLowerCase().trim()
    const userAns = String(answer || '').toLowerCase().trim()
    const isCorrect = correct === userAns || userAns.includes(correct) || correct.includes(userAns)
    return {
      score: isCorrect ? 10 : 2,
      cefrEstimate: '',
      feedback: isCorrect ? 'Jawaban sesuai.' : 'Jawaban tidak sesuai dengan kunci.',
      strengths: [],
      weaknesses: isCorrect ? [] : ['Ketepatan jawaban perlu ditingkatkan'],
    }
  }

  // ESSAY, AUDIO_RESPONSE, INTEGRATED_TASK: placeholder AI scoring
  return {
    score: 0,
    cefrEstimate: '',
    feedback: 'Penilaian AI belum tersedia untuk sesi ini. Jawaban akan dinilai oleh pengajar.',
    strengths: [],
    weaknesses: [],
  }
}

export function needsHumanReview(questionType: string): boolean {
  return ['ESSAY', 'AUDIO_RESPONSE', 'INTEGRATED_TASK'].includes(questionType)
}
