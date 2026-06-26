import { NextResponse } from 'next/server'
import { getAdminUser, unauthorized } from '@/lib/admin-auth'
import { getAllSetsMeta, getQuestionSet } from '@/lib/question-bank/loadQuestionBank'
import { getCorrectAnswer } from '@/lib/question-bank/loadQuestionBank'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const errors: string[] = []
  const sets = getAllSetsMeta()

  const allQuestionIds = new Set<string>()

  for (const meta of sets) {
    const set = getQuestionSet(meta.setId)
    if (!set) {
      errors.push(`${meta.setId}: tidak bisa dimuat.`)
      continue
    }

    if (set.itemsCount === 0) {
      errors.push(`${meta.setId}: itemsCount = 0.`)
    }

    if (set.skill === 'reading' && 'passages' in set) {
      for (const p of (set as any).passages || []) {
        if (!p.passageId) errors.push(`${meta.setId}: passage tanpa passageId.`)
        if (!p.text) errors.push(`${meta.setId}/${p.passageId}: text kosong.`)
        for (const item of p.items || []) {
          if (allQuestionIds.has(item.questionId)) {
            errors.push(`questionId duplikat: ${item.questionId}`)
          }
          allQuestionIds.add(item.questionId)
          if (item.type === 'multiple_choice') {
            if (!item.options || item.options.length < 4) {
              errors.push(`${item.questionId}: hanya ${item.options?.length || 0} opsi.`)
            }
          } else if (item.type === 'true_false') {
            if (!item.options || item.options.length !== 2) {
              errors.push(`${item.questionId}: true_false harus punya 2 opsi.`)
            }
          } else if (item.type === 'matching') {
            if (!item.options || item.options.length < 4) {
              errors.push(`${item.questionId}: matching butuh minimal 4 opsi.`)
            }
          }
          if (['multiple_choice', 'true_false', 'matching'].includes(item.type)) {
            if (item.options && !item.options.find((o: any) => o.key === item.answer)) {
              errors.push(`${item.questionId}: answer tidak valid.`)
            }
            if (!getCorrectAnswer(item.questionId)) {
              errors.push(`${item.questionId}: answer tidak ditemukan.`)
            }
          }
          if (item.difficulty < 0 || item.difficulty > 1) {
            errors.push(`${item.questionId}: difficulty ${item.difficulty} tidak valid.`)
          }
        }
      }
    }

    if (set.skill === 'listening' && 'items' in set) {
      for (const item of (set as any).items || []) {
        if (allQuestionIds.has(item.questionId)) {
          errors.push(`questionId duplikat: ${item.questionId}`)
        }
        allQuestionIds.add(item.questionId)
        if (item.type === 'multiple_choice') {
          if (!item.options || item.options.length < 4) {
            errors.push(`${item.questionId}: hanya ${item.options?.length || 0} opsi.`)
          }
        } else if (item.type === 'true_false') {
          if (!item.options || item.options.length !== 2) {
            errors.push(`${item.questionId}: true_false harus punya 2 opsi.`)
          }
        } else if (item.type === 'matching') {
          if (!item.options || item.options.length < 4) {
            errors.push(`${item.questionId}: matching butuh minimal 4 opsi.`)
          }
        }
        if (['multiple_choice', 'true_false', 'matching'].includes(item.type)) {
          if (item.options && !item.options.find((o: any) => o.key === item.answer)) {
            errors.push(`${item.questionId}: answer tidak valid.`)
          }
          if (!getCorrectAnswer(item.questionId)) {
            errors.push(`${item.questionId}: answer tidak ditemukan.`)
          }
        }
        if (!item.audioFile) errors.push(`${item.questionId}: audioFile kosong.`)
        if (!item.transcript) errors.push(`${item.questionId}: transcript kosong.`)
        if (item.difficulty < 0 || item.difficulty > 1) {
          errors.push(`${item.questionId}: difficulty ${item.difficulty} tidak valid.`)
        }
      }
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({
      success: false,
      ok: false,
      message: `${errors.length} error ditemukan.`,
      errors,
    })
  }

  return NextResponse.json({
    success: true,
    ok: true,
    message: `✅ ${sets.length} set valid. ${allQuestionIds.size} soal, 0 error.`,
  })
}
