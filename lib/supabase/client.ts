import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return []
          const cookies = document.cookie.split('; ').filter(Boolean)
          return cookies.map(c => {
            const eq = c.indexOf('=')
            return { name: c.slice(0, eq), value: c.slice(eq + 1) }
          })
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = `${name}=${value}; path=/; max-age=${options?.maxAge ?? 34560000}; samesite=lax${options?.secure ? '; secure' : ''}${options?.domain ? `; domain=${options.domain}` : ''}`
          })
        },
      },
    }
  )
