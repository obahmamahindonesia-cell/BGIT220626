import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const CRITICAL_USERANSWER_COLUMNS = [
  'id', 'sessionItemId', 'userId', 'answer', 'score', 'aiScore', 'isCorrect',
  'submittedAt', 'updatedAt',
]

const CONSTRUCTED_USERANSWER_COLUMNS = [
  'responseText', 'responseAudioUrl', 'responseAudioMimeType',
  'audioDurationSec', 'audioFileSize', 'audioStoragePath', 'audioStorageProvider',
  'wordCount', 'reviewerId', 'reviewedAt', 'reviewerScoreJson',
  'finalScoreJson', 'internalNotes', 'responseStatus', 'autoScoreJson',
]

const CRITICAL_TABLES = [
  'User', 'UserProfile', 'TestSession', 'TestSessionItem', 'UserAnswer',
  'TestResult', 'QuestionItem', 'QuestionOption', 'QuestionStimulus',
  'Certificate', 'CanDoDescriptor',
]

async function columnCheck(table: string, column: string): Promise<{ name: string; status: 'ok' | 'missing' | 'error'; message: string }> {
  try {
    const result = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2 LIMIT 1`,
      table, column
    )
    if (result.length > 0) {
      return { name: `${table}.${column}`, status: 'ok', message: 'Column exists' }
    }
    return { name: `${table}.${column}`, status: 'missing', message: `Column ${column} not found in ${table}` }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { name: `${table}.${column}`, status: 'error', message: msg }
  }
}

async function tableCheck(table: string): Promise<{ name: string; status: 'ok' | 'missing' | 'error'; message: string }> {
  try {
    const result = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT table_name FROM information_schema.tables WHERE table_name = $1 LIMIT 1`,
      table
    )
    if (result.length > 0) {
      return { name: table, status: 'ok', message: 'Table exists' }
    }
    return { name: table, status: 'missing', message: `Table ${table} not found` }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { name: table, status: 'error', message: msg }
  }
}

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: authUser.id } })
    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 })
    }

    const checks: Array<{ name: string; status: string; message: string }> = []

    // Check critical tables
    for (const table of CRITICAL_TABLES) {
      const result = await tableCheck(table)
      checks.push(result)
    }

    // Check critical UserAnswer columns
    for (const col of CRITICAL_USERANSWER_COLUMNS) {
      const result = await columnCheck('UserAnswer', col)
      checks.push(result)
    }

    // Check constructed response columns
    for (const col of CONSTRUCTED_USERANSWER_COLUMNS) {
      const result = await columnCheck('UserAnswer', col)
      checks.push(result)
    }

    // Test simple query to verify runtime
    let queryOk = true
    try {
      await prisma.$queryRawUnsafe(`SELECT 1`)
    } catch {
      queryOk = false
    }

    const failures = checks.filter(c => c.status !== 'ok')
    const errors = checks.filter(c => c.status === 'error')
    const missing = checks.filter(c => c.status === 'missing')

    let overall: 'ok' | 'warning' | 'critical' = 'ok'
    if (errors.length > 0) overall = 'critical'
    else if (missing.length > 0 || !queryOk) overall = 'warning'

    if (!queryOk && errors.length === 0) {
      checks.push({ name: 'runtime_query', status: 'error', message: 'SELECT 1 failed' })
      overall = 'critical'
    } else if (queryOk) {
      checks.unshift({ name: 'runtime_query', status: 'ok', message: 'SELECT 1 passed' })
    }

    return NextResponse.json({
      success: true,
      data: {
        status: overall,
        summary: {
          total: checks.length,
          ok: checks.filter(c => c.status === 'ok').length,
          missing: missing.length,
          errors: errors.length,
        },
        failures: failures.map(f => ({ name: f.name, status: f.status, message: f.message })),
        checks,
      },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[db-health:get] failed:', msg)
    return NextResponse.json({ success: false, error: 'DB health check failed' }, { status: 500 })
  }
}
