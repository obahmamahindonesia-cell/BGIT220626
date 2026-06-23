'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n/context'
import {
  UserCircle,
  Mail,
  MapPin,
  Globe,
  Target,
  ShieldCheck,
  Award,
  Clock,
  Lock,
  ChevronRight,
  Sparkles,
  BookOpen,
} from 'lucide-react'

export default function ProfilePage() {
  const { t } = useI18n()
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string; country?: string; native_language?: string; target_level?: string } } | null>(null)
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [nativeLanguage, setNativeLanguage] = useState('')
  const [targetLevel, setTargetLevel] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setName(user?.user_metadata?.name || '')
      setCountry(user?.user_metadata?.country || '')
      setNativeLanguage(user?.user_metadata?.native_language || '')
      setTargetLevel(user?.user_metadata?.target_level || '')
      setLoading(false)
    }
    loadUser()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: { name, country, native_language: nativeLanguage, target_level: targetLevel }
    })
    if (error) toast.error(error.message)
    else toast.success('Profil berhasil diperbarui')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-[#E5E5EA] rounded-lg" />
        <div className="h-36 bg-[#E5E5EA] rounded-xl" />
        <div className="h-64 bg-[#E5E5EA] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-[#1C1C1E]">{t('profile.title')}</h1>
        <p className="text-[#8E8E93] text-sm mt-1">{t('profile.subtitle')}</p>
      </div>

      {/* Profile Header */}
      <div className="rounded-2xl overflow-hidden border border-[#E5E5EA] shadow-sm">
        <div className="bg-gradient-to-r from-[#007AFF] to-[#0062CC] px-6 md:px-8 py-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 flex-shrink-0">
              <UserCircle className="w-8 h-8 text-white/80" />
            </div>
            <div className="text-white min-w-0">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold">{name || 'Pengguna BIGT'}</h2>
              <p className="text-white/60 text-sm mt-0.5 flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                {user?.email}
              </p>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {country && (
                  <span className="inline-flex items-center gap-1 bg-white/10 text-white rounded-md px-2 py-0.5 text-[10px] font-normal">
                    <MapPin className="w-3 h-3" />{country}
                  </span>
                )}
                {nativeLanguage && (
                  <span className="inline-flex items-center gap-1 bg-white/10 text-white rounded-md px-2 py-0.5 text-[10px] font-normal">
                    <Globe className="w-3 h-3" />{nativeLanguage}
                  </span>
                )}
                {targetLevel && (
                  <span className="inline-flex items-center gap-1 bg-[#FF9500]/20 text-[#FF9500] rounded-md px-2 py-0.5 text-[10px] font-medium">
                    <Target className="w-3 h-3" />{t('profile.targetLabel', { level: targetLevel })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Card */}
          <div className="rounded-2xl bg-white border border-[#E5E5EA] shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-center gap-2 mb-1">
                <UserCircle className="w-4 h-4 text-[#007AFF]" />
                <h3 className="text-base font-semibold text-[#1C1C1E]">{t('profile.personalInfo')}</h3>
              </div>
              <p className="text-xs text-[#8E8E93]">{t('profile.personalInfoDesc')}</p>
            </div>
            <div className="px-6 pb-6">
              <form onSubmit={handleUpdate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1C1C1E]">{t('profile.fullName')}</label>
                    <input value={name} onChange={(e) => setName(e.target.value)}
                      placeholder={t('profile.fullNamePlaceholder')}
                      className="w-full rounded-xl border border-[#E5E5EA] h-11 px-4 text-sm text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/20 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1C1C1E]">{t('profile.email')}</label>
                    <input value={user?.email || ''} disabled
                      className="w-full rounded-xl border border-[#E5E5EA] h-11 px-4 text-sm text-[#8E8E93] bg-[#F2F2F7] cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1C1C1E]">{t('profile.country')}</label>
                    <input value={country} onChange={(e) => setCountry(e.target.value)}
                      placeholder={t('profile.countryPlaceholder')}
                      className="w-full rounded-xl border border-[#E5E5EA] h-11 px-4 text-sm text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/20 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1C1C1E]">{t('profile.nativeLanguage')}</label>
                    <input value={nativeLanguage} onChange={(e) => setNativeLanguage(e.target.value)}
                      placeholder={t('profile.nativePlaceholder')}
                      className="w-full rounded-xl border border-[#E5E5EA] h-11 px-4 text-sm text-[#1C1C1E] placeholder:text-[#C7C7CC] focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/20 transition-all" />
                  </div>
                </div>
                <button type="submit" disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007AFF] text-white text-sm font-semibold shadow-lg shadow-[#007AFF]/25 hover:shadow-[#007AFF]/40 hover:translate-y-[-1px] active:translate-y-0 transition-all duration-200 disabled:opacity-50">
                  {saving ? t('common.saving') : t('profile.saveChanges')}
                </button>
              </form>
            </div>
          </div>

          {/* Learning Preferences Card */}
          <div className="rounded-2xl bg-white border border-[#E5E5EA] shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#FF9500]" />
                <h3 className="text-base font-semibold text-[#1C1C1E]">{t('profile.learningPrefs')}</h3>
              </div>
              <p className="text-xs text-[#8E8E93]">{t('profile.learningPrefsDesc')}</p>
            </div>
            <div className="px-6 pb-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#1C1C1E] flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-[#007AFF]" />
                    {t('profile.targetLevel')}
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
                      <button key={level} type="button"
                        onClick={() => setTargetLevel(targetLevel === level ? '' : level)}
                        className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                          targetLevel === level
                            ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]'
                            : 'border-[#E5E5EA] hover:border-[#C7C7CC] text-[#8E8E93]'
                        }`}>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleUpdate} disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007AFF] text-white text-sm font-semibold shadow-lg shadow-[#007AFF]/25 hover:shadow-[#007AFF]/40 hover:translate-y-[-1px] active:translate-y-0 transition-all duration-200 disabled:opacity-50">
                  {t('profile.saveTarget')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Security Card */}
          <div className="rounded-2xl bg-white border border-[#E5E5EA] shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-[#1C1C1E]" />
                <h3 className="text-base font-semibold text-[#1C1C1E]">{t('profile.security')}</h3>
              </div>
            </div>
            <div className="px-6 pb-6 space-y-3">
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[#E5E5EA] hover:bg-[#F2F2F7] transition-all text-left">
                <span className="flex items-center gap-2 text-xs text-[#1C1C1E]"><Lock className="w-3.5 h-3.5 text-[#8E8E93]" />{t('profile.changePassword')}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8E8E93]" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[#E5E5EA] hover:bg-[#F2F2F7] transition-all text-left">
                <span className="flex items-center gap-2 text-xs text-[#1C1C1E]"><Clock className="w-3.5 h-3.5 text-[#8E8E93]" />{t('profile.loginHistory')}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8E8E93]" />
              </button>
            </div>
          </div>

          {/* Certificates Card */}
          <div className="rounded-2xl bg-white border border-[#E5E5EA] shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-[#FF9500]" />
                <h3 className="text-base font-semibold text-[#1C1C1E]">{t('profile.certificates')}</h3>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#FF9500]/5 to-[#FF9500]/10 border border-[#FF9500]/20 mb-3">
                <div className="flex items-center gap-3">
                  <Award className="w-7 h-7 text-[#FF9500] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1C1C1E]">BIGT Level B1</p>
                    <p className="text-[11px] text-[#8E8E93]">Diterbitkan 15 Jun 2026</p>
                  </div>
                </div>
              </div>
              <button className="w-full py-2.5 rounded-xl border border-[#E5E5EA] text-xs font-medium text-[#1C1C1E] hover:bg-[#F2F2F7] transition-all">
                {t('profile.viewAllCerts')}
              </button>
            </div>
          </div>

          {/* Achievements Card */}
          <div className="rounded-2xl bg-white border border-[#E5E5EA] shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-[#1C1C1E]" />
                <h3 className="text-base font-semibold text-[#1C1C1E]">{t('profile.achievements')}</h3>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#F2F2F7] border border-[#E5E5EA] text-center">
                  <BookOpen className="w-5 h-5 text-[#007AFF] mx-auto mb-1.5" />
                  <p className="text-[11px] font-medium text-[#1C1C1E]">{t('profile.firstTest')}</p>
                  <p className="text-[9px] text-[#8E8E93]">{t('profile.firstTestDesc')}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F2F2F7] border border-[#E5E5EA] text-center">
                  <Award className="w-5 h-5 text-[#FF9500] mx-auto mb-1.5" />
                  <p className="text-[11px] font-medium text-[#1C1C1E]">{t('profile.levelUp')}</p>
                  <p className="text-[9px] text-[#8E8E93]">{t('profile.levelUpDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
