import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser, unauthorized } from '@/lib/admin-auth'
import { getAllSetsMeta, getQuestionSet } from '@/lib/question-bank/loadQuestionBank'
import * as fs from 'fs'
import * as path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getAudioStatus(setId: string): Map<string, string> {
  const statusMap = new Map<string, string>()
  const manifestDir = path.resolve(process.cwd(), 'data', 'question-bank', 'audio-manifests')
  const parts = setId.split('-')
  const cefr = (parts[1] || '').toLowerCase()
  const skillCode = parts[2] || ''
  const skillMap: Record<string, string> = { LS: 'listening', RD: 'reading' }
  const skill = skillMap[skillCode] || 'listening'
  const setNum = (parts[3] || '').replace(/^S0?/, '')
  const manifestFile = path.join(manifestDir, `${cefr}-${skill}-set-${setNum.padStart(2, '0')}.json`)
  if (!fs.existsSync(manifestFile)) return statusMap
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf-8'))
    const items = manifest.items || []
    for (const item of items) {
      statusMap.set(item.audioId || item.questionId, item.status || 'unknown')
    }
  } catch {
    // ignore
  }
  return statusMap
}

export async function GET(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const setId = searchParams.get('setId')

  if (setId) {
    const set = getQuestionSet(setId)
    if (!set) {
      return NextResponse.json({ success: false, error: 'Set tidak ditemukan.' }, { status: 404 })
    }
    const audioStatus = getAudioStatus(setId)
    if (set.skill === 'listening') {
      const ls = set as any
      const basePath = ls.audioBasePath || '/audio/listening/'
      const enhanced = {
        ...ls,
        items: ls.items?.map((item: any) => {
          let st = audioStatus.get(item.audioId)
          if (!st) {
            const audioPath = path.resolve(process.cwd(), 'public', basePath.replace(/^\//, ''), item.audioFile || '')
            st = fs.existsSync(audioPath) ? 'present' : 'missing'
          }
          return { ...item, audioStatus: st }
        }) || [],
      }
      return NextResponse.json({ success: true, data: enhanced })
    }
    return NextResponse.json({ success: true, data: set })
  }

  const sets = getAllSetsMeta()
  return NextResponse.json({ success: true, data: sets })
}
