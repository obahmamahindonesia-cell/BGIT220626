import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            const cookie = request.headers.get('cookie') || ''
            return cookie.split('; ').filter(Boolean).map(c => {
              const eq = c.indexOf('=')
              return { name: c.slice(0, eq), value: c.slice(eq + 1) }
            })
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              pendingCookies.push({ name, value, options: options ?? {} })
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const dbUser = await prisma.user.upsert({
        where: { supabaseId: data.user.id },
        update: { email: data.user.email!, name: data.user.user_metadata?.name || null },
        create: {
          supabaseId: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || null,
        },
      })
      await prisma.loginHistory.create({
        data: { userId: dbUser.id },
      })

      const redirectResponse = NextResponse.redirect(`${origin}${next}`)

      for (const { name, value, options } of pendingCookies) {
        redirectResponse.cookies.set(name, value, options as Record<string, unknown>)
      }

      return redirectResponse
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
