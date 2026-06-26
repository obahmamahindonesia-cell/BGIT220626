import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }) },
        },
      }
    )

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: authUser.id } })
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Delete user data from Prisma
    await prisma.loginHistory.deleteMany({ where: { userId: dbUser.id } })
    await prisma.userProfile.deleteMany({ where: { userId: dbUser.id } })
    await prisma.certificate.deleteMany({ where: { userId: dbUser.id } })
    await prisma.userAnswer.deleteMany({ where: { userId: dbUser.id } })
    await prisma.testResult.deleteMany({ where: { session: { userId: dbUser.id } } })
    await prisma.testSession.deleteMany({ where: { userId: dbUser.id } })
    await prisma.user.delete({ where: { id: dbUser.id } })

    // Delete user from Supabase Auth using service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id)
    if (deleteError) {
      console.error('Failed to delete auth user:', deleteError)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Error deleting account:', err)
    return NextResponse.json({ success: false, error: 'Gagal menghapus akun.' }, { status: 500 })
  }
}
