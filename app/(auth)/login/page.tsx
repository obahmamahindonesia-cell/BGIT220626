'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'
import { Globe, Sparkles, ShieldCheck, BarChart3, ArrowLeft } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const supabase = createClient()
  const { t } = useI18n()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }
    if (data.user) {
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseId: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || null,
        }),
      })
    }
    toast.success(t('auth.loginSuccess'))
    router.push(redirectTo)
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { toast.error(error.message); setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-[#F7F9FC]">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#123E7C] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-20 left-20 w-72 h-72 border border-white/20 rounded-full" />
          <div className="absolute bottom-20 right-20 w-96 h-96 border border-white/10 rounded-full" />
        </div>
        <div className="flex-1 flex items-center justify-center -mt-16">
          <Link href="/" className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-xl px-8 py-5 border border-white/10">
            <Image src="/logo_BIGT.png" alt="BIGT Logo" width={260} height={80} className="h-14 w-auto brightness-0 invert opacity-90" />
          </Link>
        </div>
        <div className="relative z-10">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-white mb-4 leading-tight whitespace-pre-line">
            {t('auth.loginHeroTitle')}
          </h1>
          <p className="text-white/50 text-sm max-w-md mb-10 leading-relaxed">
            {t('auth.loginHeroDesc')}
          </p>
          <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-[#C9A227]" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{t('landing.features.aiScoring')}</p>
                  <p className="text-white/40 text-xs">{t('landing.features.aiScoringDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-[#C9A227]" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{t('landing.features.diagnosticReport')}</p>
                  <p className="text-white/40 text-xs">{t('landing.features.diagnosticReportDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{t('landing.features.digitalCert')}</p>
                  <p className="text-white/40 text-xs">{t('landing.features.digitalCertDesc')}</p>
                </div>
              </div>
          </div>
        </div>
        <div className="relative z-10 text-white/30 text-xs">
          <Globe className="w-4 h-4 inline mr-1" />
          {t('auth.trustedBy')}
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0B1F3A] transition-colors mb-4">
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('auth.backToHome')}
            </Link>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#0B1F3A]">{t('auth.loginTitle')}</h2>
            <p className="text-[#64748B] text-sm mt-1">{t('auth.loginSubtitle')}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-[#0B1F3A]">{t('auth.email')}</Label>
              <Input id="email" type="email" placeholder={t('auth.emailPlaceholder')}
                value={email} onChange={(e) => setEmail(e.target.value)} required
                className="rounded-lg border-[#E5EAF2] h-11 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-[#0B1F3A]">{t('auth.password')}</Label>
              <Input id="password" type="password" placeholder={t('auth.passwordPlaceholder')}
                value={password} onChange={(e) => setPassword(e.target.value)} required
                className="rounded-lg border-[#E5EAF2] h-11 text-sm" />
            </div>
            <Button type="submit" disabled={loading}
              className="w-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white rounded-lg h-11 text-sm">
              {loading ? t('common.processing') : t('auth.loginButton')}
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E5EAF2]" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-[#64748B]">{t('auth.or')}</span></div>
          </div>
          <Button variant="outline" className="w-full rounded-lg border-[#E5EAF2] h-11 text-sm hover:bg-gray-50"
            onClick={handleGoogleLogin} disabled={loading}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.loginGoogle')}
          </Button>
          <p className="text-center text-sm text-[#64748B] mt-8">
            {t('auth.noAccount')}{' '}
            <Link href="/register" className="text-[#0B1F3A] hover:underline font-medium">{t('auth.registerLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { t } = useI18n()
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]"><p className="text-[#64748B]">{t('common.loading')}</p></div>}>
      <LoginForm />
    </Suspense>
  )
}
