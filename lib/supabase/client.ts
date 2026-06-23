import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
          return cookie ? cookie.split('=')[1] : null
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          let cookie = `${name}=${value}; path=/; max-age=${options?.maxAge ?? 3600}; samesite=lax`
          if (options?.domain) cookie += `; domain=${options.domain}`
          if (options?.secure) cookie += '; secure'
          if (options?.httpOnly) return
          document.cookie = cookie
        },
        remove(name: string) {
          document.cookie = `${name}=; path=/; max-age=0`
        },
      },
    }
  )
