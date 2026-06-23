'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import PageMeta from '@/components/PageMeta'
import { useI18n } from '@/lib/i18n/context'

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
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } },
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success(t('auth.registerSuccess'))
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] px-4">
      <PageMeta title="Daftar BIGT" />
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#0B1F3A] inline-block mb-4">BIGT</Link>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#0B1F3A]">{t('auth.registerTitle')}</h1>
          <p className="text-[#64748B] text-sm mt-1">{t('auth.registerSubtitle')}</p>
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
