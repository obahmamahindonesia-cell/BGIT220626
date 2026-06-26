'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { toast } from 'sonner'
import Logo from '@/components/brand/Logo'
import PageMeta from '@/components/PageMeta'
import { useI18n } from '@/lib/i18n/context'
import { ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useI18n()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } },
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    if (data.user) {
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseId: data.user.id,
          email: data.user.email,
          name,
        }),
      })
    }
    toast.success(t('auth.registerSuccess'))
    router.push('/login')
  }

  const handleGoogleRegister = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/callback` },
    })
    if (error) { toast.error(error.message); setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] px-4">
      <PageMeta title="Daftar BIGT" />
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0B1F3A] transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('auth.backToHome')}
          </Link>
          <div className="text-center">
            <Link href="/" className="inline-block mb-4">
              <Logo variant="full" className="h-10" />
            </Link>
            <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#0B1F3A]">{t('auth.registerTitle')}</h1>
            <p className="text-[#64748B] text-sm mt-1">{t('auth.registerSubtitle')}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full rounded-lg border-[#E5EAF2] h-11 text-sm hover:bg-gray-50 mb-4"
          onClick={handleGoogleRegister} disabled={loading}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('auth.registerGoogle') || 'Daftar dengan Google'}
        </Button>
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E5EAF2]" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-[#64748B]">{t('auth.or')}</span></div>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium text-[#0B1F3A]">{t('auth.fullName')}</Label>
            <Input id="name" type="text" placeholder={t('auth.fullNamePlaceholder')}
              value={name} onChange={(e) => setName(e.target.value)} required
              className="rounded-lg border-[#E5EAF2] h-11 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-[#0B1F3A]">{t('auth.email')}</Label>
            <Input id="email" type="email" placeholder={t('auth.emailPlaceholder')}
              value={email} onChange={(e) => setEmail(e.target.value)} required
              className="rounded-lg border-[#E5EAF2] h-11 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-[#0B1F3A]">{t('auth.password')}</Label>
            <Input id="password" type="password" placeholder={t('auth.minChars')}
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
              className="rounded-lg border-[#E5EAF2] h-11 text-sm" />
          </div>
          <Button type="submit" disabled={loading}
            className="w-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white rounded-lg h-11 text-sm">
            {loading ? t('common.processing') : t('auth.registerButton')}
          </Button>
        </form>
        <div className="mt-6 p-4 rounded-lg bg-[#0B1F3A]/5 border border-[#0B1F3A]/10 text-center">
          <p className="text-xs text-[#0B1F3A]/70">{t('auth.registerInfo')}</p>
        </div>
        <p className="text-center text-sm text-[#64748B] mt-6">
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="text-[#0B1F3A] hover:underline font-medium">{t('auth.loginLink')}</Link>
        </p>
      </div>
    </div>
  )
}
