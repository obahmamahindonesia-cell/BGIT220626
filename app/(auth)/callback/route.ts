import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      await prisma.user.upsert({
        where: { supabaseId: data.user.id },
        update: { email: data.user.email!, name: data.user.user_metadata?.name || null },
        create: {
          supabaseId: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || null,
        },
      })
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
