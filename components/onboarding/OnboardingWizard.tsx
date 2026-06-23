'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/context'
import { useOnboardingStore } from '@/store/onboardingStore'
import {
  AGE_RANGES, CEFR_LEVELS, GOALS, PROFESSIONS,
  LEARNING_DURATIONS, PREVIOUS_TESTS, DURATION_OPTIONS, STEPS,
} from '@/lib/onboarding/schema'
import type { OnboardingData } from '@/lib/onboarding/schema'
import {
  Sparkles, User, Target, BookOpen, Settings, Mic, Zap,
  ChevronLeft, ChevronRight, ShieldCheck, CheckCircle2,
  Loader2, Headphones, Monitor, Globe, BarChart3,
  Award, GraduationCap, Briefcase, Plane, CheckCircle,
} from 'lucide-react'

const STEP_ICONS = [Sparkles, User, Target, BookOpen, Settings, Mic, Zap]

const GOAL_ICONS: Record<string, React.ElementType> = {
  Award, GraduationCap, Briefcase, BookOpen, Sparkles, Globe, Plane,
}

function classNames(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

function OptionCard({
  selected,
  onClick,
  children,
  className = '',
  icon,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
  icon?: React.ElementType
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'relative w-full text-left transition-all duration-300',
        selected
          ? 'border-[#007AFF] bg-gradient-to-br from-[#007AFF]/5 to-white shadow-[0_0_12px_rgba(0,122,255,0.15)]'
          : 'border-[#E5E5EA] bg-white hover:border-[#C7C7CC] hover:shadow-md',
        'rounded-2xl border-2 px-5 py-4',
        className,
      )}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className={classNames(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
            selected ? 'bg-[#007AFF]/10' : 'bg-[#F2F2F7]',
          )}>
            <icon className={classNames('w-5 h-5', selected ? 'text-[#007AFF]' : 'text-[#8E8E93]')} />
          </div>
        )}
        <div className="flex-1">
          {children}
        </div>
        {selected && (
          <div className="w-6 h-6 rounded-full bg-[#007AFF] flex items-center justify-center shadow-sm flex-shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>
    </button>
  )
}

export function OnboardingWizard() {
  const router = useRouter()
  const { t } = useI18n()
  const {
    step, setStep, data, updateData,
    userName, setUserName,
    loading, setLoading, saving, setSaving,
    mic, setMic, speaker, setSpeaker,
    loadProfile,
  } = useOnboardingStore()

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Pengguna')

      try {
        const res = await fetch('/api/user/onboarding')
        const json = await res.json()
        if (!json.needsOnboarding) { router.push('/dashboard'); return }
        if (json.profile) {
          loadProfile({
            profession: json.profile.profession || '',
            targetLevel: json.profile.targetLevel || '',
            testGoals: json.profile.testGoals || [],
            hasPreviousTest: json.profile.hasPreviousTest || false,
            previousTestType: json.profile.previousTestType || '',
            learningDuration: json.profile.learningDuration || '',
            estimatedLevel: json.profile.estimatedLevel || '',
            preferredDuration: json.profile.preferredDuration || 60,
            practiceMode: json.profile.practiceMode ?? true,
            emailNotifications: json.profile.emailNotifications ?? true,
          })
        }
      } catch { /* continue with defaults */ }
      setLoading(false)
    }
    init()
  }, [router, setUserName, loadProfile, setLoading])

  const handleSave = useCallback(async (completed = false) => {
    setSaving(true)
    try {
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profession: data.profession || null,
          targetLevel: data.targetLevel || null,
          testGoals: data.testGoals,
          hasPreviousTest: data.hasPreviousTest,
          previousTestType: data.previousTestType || null,
          learningDuration: data.learningDuration || null,
          estimatedLevel: data.estimatedLevel || null,
          preferredDuration: data.preferredDuration,
          practiceMode: data.practiceMode,
          emailNotifications: data.emailNotifications,
          technicalCheckPassed: data.micTested && data.speakerTested,
          onboardingCompleted: completed,
        }),
      })
      if (completed) router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }, [data, router, setSaving])

  const testMic = useCallback(async () => {
    setMic({ state: 'testing', message: '' })
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
      setMic({ state: 'pass', message: '' })
      updateData({ micTested: true })
    } catch {
      setMic({ state: 'fail', message: '' })
    }
  }, [setMic, updateData])

  const testSpeaker = useCallback(() => {
    setSpeaker({ state: 'testing', message: '' })
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    gain.gain.value = 0.1
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    setTimeout(() => {
      osc.stop()
      ctx.close()
      setSpeaker({ state: 'pass', message: '' })
      updateData({ speakerTested: true })
    }, 1000)
  }, [setSpeaker, updateData])

  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return true
      case 1: return data.profession.length > 0
      case 2: return data.testGoals.length > 0
      case 3: return true
      case 4: return true
      case 5: return true
      case 6: return true
      default: return false
    }
  }, [step, data])

  const progressPct = ((step + 1) / STEPS.length) * 100

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#0062CC] flex items-center justify-center mx-auto animate-pulse shadow-lg shadow-[#007AFF]/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <p className="text-[#8E8E93] text-sm">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-[#E5E5EA] flex-shrink-0 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#007AFF] to-[#0062CC] flex items-center justify-center shadow-lg shadow-[#007AFF]/20">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-[family-name:var(--font-playfair)] text-sm font-bold text-[#1C1C1E]">BIGT</span>
        </div>
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#8E8E93] text-xs font-medium transition-all"
            >
              <ChevronLeft className="w-3 h-3" /> {t('common.back')}
            </button>
          )}
          <button
            onClick={() => { if (confirm('Lewati proses onboarding?')) handleSave(false) }}
            className="text-[11px] text-[#8E8E93] hover:text-[#1C1C1E] transition-colors px-2 py-1"
          >
            {t('common.skip')}
          </button>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="px-6 pt-6 pb-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((_, i) => {
            const Icon = STEP_ICONS[i]
            const isComplete = i < step
            const isCurrent = i === step
            return (
              <div
                key={i}
                className={classNames(
                  'flex flex-col items-center gap-2 transition-all duration-300',
                  i === 0 ? 'flex-1' : 'flex-1',
                )}
              >
                <div
                  className={classNames(
                    'flex items-center justify-center w-10 h-10 rounded-full transition-all',
                    isCurrent
                      ? 'bg-[#007AFF] text-white scale-110 shadow-lg shadow-[#007AFF]/30'
                      : isComplete
                      ? 'bg-[#007AFF]/15 text-[#007AFF]'
                      : 'bg-[#F2F2F7] text-[#C7C7CC]',
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-full h-0.5 bg-[#E5E5EA] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#007AFF] to-[#0062CC] transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(100, (i + 1) * (100 / STEPS.length))}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-[10px] text-[#8E8E93] mt-2">
          <span>Selamat Datang</span>
          <span>Data Diri</span>
          <span>Tujuan Tes</span>
          <span>Pengalaman</span>
          <span>Preferensi</span>
          <span>Cek Teknis</span>
          <span>Siap Mulai</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 pb-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#0062CC] flex items-center justify-center mb-6 shadow-xl shadow-[#007AFF]/20">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-[#1C1C1E] mb-2">
                  {t('onboarding.welcome', { name: userName })}
                </h1>
                <p className="text-[#8E8E93] text-sm md:text-base max-w-md leading-relaxed">
                  {t('onboarding.welcomeDesc')}
                </p>
                <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-sm">
                  {[
                    { icon: Zap, labelKey: 'onboarding.featureCards.0.label', subKey: 'onboarding.featureCards.0.sub' },
                    { icon: Globe, labelKey: 'onboarding.featureCards.1.label', subKey: 'onboarding.featureCards.1.sub' },
                    { icon: BarChart3, labelKey: 'onboarding.featureCards.2.label', subKey: 'onboarding.featureCards.2.sub' },
                    { icon: ShieldCheck, labelKey: 'onboarding.featureCards.3.label', subKey: 'onboarding.featureCards.3.sub' },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.labelKey} className="p-3 rounded-xl bg-white border border-[#E5E5EA] text-left shadow-sm hover:shadow-md transition-shadow">
                        <Icon className="w-4 h-4 text-[#007AFF] mb-1.5" />
                        <p className="text-xs font-semibold text-[#1C1C1E]">{t(item.labelKey)}</p>
                        <p className="text-[10px] text-[#8E8E93]">{t(item.subKey)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="flex-1 py-4 space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#1C1C1E]">{t('onboarding.personalData')}</h2>
                  <p className="text-xs text-[#8E8E93] mt-1">{t('onboarding.personalDataDesc')}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#8E8E93]">{t('onboarding.fullName')}</label>
                  <input
                    value={userName}
                    disabled
                    className="w-full py-3 px-4 rounded-xl bg-[#F2F2F7] border border-[#E5E5EA] text-[#8E8E93] text-sm cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#8E8E93]">{t('onboarding.age')}</label>
                  <div className="grid grid-cols-5 gap-2">
                    {AGE_RANGES.map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => updateData({ age })}
                        className={classNames(
                          'py-2.5 rounded-xl text-xs font-medium border transition-all',
                          data.age === age
                            ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]'
                            : 'border-[#E5E5EA] bg-white text-[#8E8E93] hover:bg-[#F2F2F7]',
                        )}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#8E8E93]">{t('onboarding.profession')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PROFESSIONS.map((p) => (
                      <OptionCard
                        key={p.id}
                        selected={data.profession === p.id}
                        onClick={() => updateData({ profession: p.id })}
                        icon={p.id === 'student' ? GraduationCap : p.id === 'professional' ? Briefcase : p.id === 'teacher' ? BookOpen : p.id === 'bipaLearner' ? Globe : p.id === 'general' ? Sparkles : Settings}
                      >
                        <p className="font-medium text-[#1C1C1E]">{t(p.labelKey)}</p>
                      </OptionCard>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#8E8E93]">{t('onboarding.targetLevel')}</label>
                  <div className="flex gap-1.5">
                    {CEFR_LEVELS.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => updateData({ targetLevel: data.targetLevel === l ? '' : l })}
                        className={classNames(
                          'flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all',
                          data.targetLevel === l
                            ? 'border-[#FF9500] bg-[#FF9500]/10 text-[#FF9500]'
                            : 'border-[#E5E5EA] bg-white text-[#8E8E93] hover:bg-[#F2F2F7]',
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#8E8E93] mt-1.5">{t('onboarding.targetLevelHint')}</p>
                </div>
              </div>
            )}

            {/* Step 2: Goals */}
            {step === 2 && (
              <div className="flex-1 py-4 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#1C1C1E]">{t('onboarding.goalsTitle')}</h2>
                  <p className="text-xs text-[#8E8E93] mt-1">{t('onboarding.goalsDesc')}</p>
                </div>
                <div className="space-y-2">
                  {GOALS.map((goal) => {
                    const Icon = GOAL_ICONS[goal.icon] || Sparkles
                    const selected = data.testGoals.includes(goal.id)
                    return (
                      <OptionCard
                        key={goal.id}
                        selected={selected}
                        onClick={() => {
                          updateData({
                            testGoals: selected
                              ? data.testGoals.filter(g => g !== goal.id)
                              : [...data.testGoals, goal.id],
                          })
                        }}
                        icon={Icon}
                      >
                        <p className={classNames('font-medium', selected ? 'text-[#1C1C1E]' : 'text-[#8E8E93]')}>
                          {t(goal.labelKey)}
                        </p>
                      </OptionCard>
                    )
                  })}
                </div>
                {data.testGoals.length === 0 && (
                  <p className="text-[#FF3B30] text-[10px] text-center">{t('onboarding.goalsMinError')}</p>
                )}
              </div>
            )}

            {/* Step 3: Experience */}
            {step === 3 && (
              <div className="flex-1 py-4 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1C1C1E]">{t('onboarding.expTitle')}</h2>
                  <p className="text-xs text-[#8E8E93] mt-1">{t('onboarding.expDesc')}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#8E8E93]">{t('onboarding.prevTest')}</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateData({ hasPreviousTest: true })}
                      className={classNames(
                        'flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all',
                        data.hasPreviousTest
                          ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]'
                          : 'border-[#E5E5EA] bg-white text-[#8E8E93]',
                      )}
                    >
                      {t('common.yes')}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateData({ hasPreviousTest: false, previousTestType: '' })}
                      className={classNames(
                        'flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all',
                        !data.hasPreviousTest
                          ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]'
                          : 'border-[#E5E5EA] bg-white text-[#8E8E93]',
                      )}
                    >
                      {t('common.no')}
                    </button>
                  </div>
                </div>

                {data.hasPreviousTest && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#8E8E93]">{t('onboarding.prevTestType')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PREVIOUS_TESTS.map((pt) => (
                        <OptionCard
                          key={pt.id}
                          selected={data.previousTestType === pt.id}
                          onClick={() => updateData({ previousTestType: pt.id })}
                        >
                          <p className={classNames('font-medium', data.previousTestType === pt.id ? 'text-[#1C1C1E]' : 'text-[#8E8E93]')}>
                            {t(pt.labelKey)}
                          </p>
                        </OptionCard>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#8E8E93]">{t('onboarding.learningDuration')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {LEARNING_DURATIONS.map((ld) => (
                      <OptionCard
                        key={ld.id}
                        selected={data.learningDuration === ld.id}
                        onClick={() => updateData({ learningDuration: ld.id })}
                      >
                        <p className={classNames('font-medium', data.learningDuration === ld.id ? 'text-[#1C1C1E]' : 'text-[#8E8E93]')}>
                          {t(ld.labelKey)}
                        </p>\n                      </OptionCard>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Preferences */}
            {step === 4 && (
              <div className="flex-1 py-4 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1C1C1E]">{t('onboarding.prefTitle')}</h2>
                  <p className="text-xs text-[#8E8E93] mt-1">{t('onboarding.prefDesc')}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#8E8E93]">{t('onboarding.prefDuration')}</label>
                  <div className="flex gap-2">
                    {DURATION_OPTIONS.map((opt) => (
                      <OptionCard
                        key={opt.value}
                        selected={data.preferredDuration === opt.value}
                        onClick={() => updateData({ preferredDuration: opt.value })}
                      >
                        <p classCase={classNames('font-semibold', data.preferredDuration === opt.value ? 'text-[#007AFF]' : 'text-[#8E8E93]')}>
                          {t(opt.labelKey)}
                        </p>
                        <p className="text-[10px] text-[#8E8E93] mt-0.5">{t(opt.subKey)}</p>
                      </OptionCard>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#8E8E93]">{t('onboarding.prefMode')}</label>
                  <div className="flex gap-2">
                    <OptionCard
                      selected={data.practiceMode}
                      onClick={() => updateData({ practiceMode: true })}
                      icon={BookOpen}
                    >
                      <p className={classNames('font-semibold', data.practiceMode ? 'text-[#1C1C1E]' : 'text-[#8E8E93]')}>
                        {t('onboarding.practiceMode')}
                      </p>
                      <p className="text-[10px] text-[#8E8E93] mt-0.5">{t('onboarding.practiceModeSub')}</p>
                    </OptionCard>
                    <OptionCard
                      selected={!data.practiceMode}
                      onClick={() => updateData({ practiceMode: false })}
                      icon={Zap}
                    >
                      <p className={classNames('font-semibold', !data.practiceMode ? 'text-[#1C1C1E]' : 'text-[#8E8E93]')}>
                        {t('onboarding.fullTest')}
                      </p>
                      <p className="text-[10px] text-[#8E8E93] mt-0.5">{t('onboarding.fullTestSub')}</p>
                    </OptionCard>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white border border-[#E5E5EA]">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-[#8E8E93]" />
                    <span className="text-xs text-[#8E8E93]">{t('onboarding.emailNotif')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateData({ emailNotifications: !data.emailNotifications })}
                    className={classNames(
                      'w-10 h-6 rounded-full transition-all relative',
                      data.emailNotifications ? 'bg-[#34C759]' : 'bg-[#C7C7CC]',
                    )}
                  >
                    <div className={classNames(
                      'w-4 h-4 rounded-full bg-white transition-all shadow-sm absolute top-1',
                      data.emailNotifications ? 'left-5' : 'left-1',
                    )} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Tech Check */}
            {step === 5 && (
              <div className="flex-1 py-4 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#1C1C1E]">{t('onboarding.techTitle')}</h2>
                  <p className="text-xs text-[#8E8E93] mt-1">{t('onboarding.techDesc')}</p>
                </div>

                <div className="p-5 rounded-xl bg-white border border-[#E5E5EA] shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={classNames(
                      'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                      mic.state === 'pass' ? 'bg-[#34C759]/10' :
                      mic.state === 'fail' ? 'bg-red-50' : 'bg-[#F2F2F7]',
                    )}>
                      <Mic className={classNames(
                        'w-5 h-5',
                        mic.state === 'pass' ? 'text-[#34C759]' :
                        mic.state === 'fail' ? 'text-red-500' : 'text-[#8E8E93]',
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#1C1C1E]">{t('onboarding.mic')}</p>
                      <p className="text-[10px] text-[#8E8E93]">{t('onboarding.micDesc')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={testMic}
                      disabled={mic.state === 'testing' || mic.state === 'pass'}
                      className={classNames(
                        'px-4 py-2 rounded-xl text-xs font-medium transition-all',
                        mic.state === 'pass' ? 'bg-[#34C759]/10 text-[#34C759] cursor-default' :
                        mic.state === 'fail' ? 'bg-red-50 text-red-500 hover:bg-red-100' :
                        'bg-[#F2F2F7] text-[#8E8E93] hover:bg-[#E5E5EA]',
                      )}
                    >
                      {mic.state === 'testing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                       mic.state === 'pass' ? t('common.success') :
                       mic.state === 'fail' ? t('common.retry') : t('common.test')}
                    </button>
                  </div>
                  {mic.state === 'pass' && (
                    <div className="flex items-center gap-1.5 text-[10px] text-[#34C759]">
                      <CheckCircle2 className="w-3 h-3" /> {t('onboarding.micPass')}
                    </div>
                  )}
                  {mic.state === 'fail' && (
                    <div className="text-[10px] text-red-500">{t('onboarding.micFail')}</div>
                  )}
                </div>

                <div className="p-5 rounded-xl bg-white border border-[#E5E5EA] shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={classNames(
                      'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                      speaker.state === 'pass' ? 'bg-[#34C759]/10' :
                      speaker.state === 'fail' ? 'bg-red-50' : 'bg-[#F2F2F7]',
                    )}>
                      <Headphones className={classNames(
                        'w-5 h-5',
                        speaker.state === 'pass' ? 'text-[#34C759]' :
                        speaker.state === 'fail' ? 'text-red-500' : 'text-[#8E8E93]',
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#1C1C1E]">{t('onboarding.speaker')}</p>
                      <p className="text-[10px] text-[#8E8E93]">{t('onboarding.speakerDesc')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={testSpeaker}
                      disabled={speaker.state === 'testing' || speaker.state === 'pass'}
                      className={classNames(
                        'px-4 py-2 rounded-xl text-xs font-medium transition-all',
                        speaker.state === 'pass' ? 'bg-[#34C759]/10 text-[#34C759] cursor-default' :
                        speaker.state === 'fail' ? 'bg-red-50 text-red-500 hover:bg-red-100' :
                        'bg-[#F2F2F7] text-[#8E8E93] hover:bg-[#E5E5EA]',
                      )}
                    >
                      {speaker.state === 'testing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                       speaker.state === 'pass' ? t('common.success') :
                       speaker.state === 'fail' ? t('common.retry') : t('common.test')}
                    </button>
                  </div>
                  {speaker.state === 'pass' && (
                    <div className="flex items-center gap-1.5 text-[10px] text-[#34C759]">
                      <CheckCircle2 className="w-3 h-3" /> {t('onboarding.speakerPass')}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E5E5EA]">
                  <div className="flex items-center gap-2.5">
                    <Monitor className="w-4 h-4 text-[#8E8E93]" />
                    <span className="text-xs text-[#8E8E93]">{t('onboarding.browserInfo')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Ready */}
            {step === 6 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF9500] to-[#E68A00] flex items-center justify-center mb-5 shadow-xl shadow-[#FF9500]/20">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-bold text-[#1C1C1E] mb-2">
                  {t('onboarding.readyTitle', { name: userName })}
                </h2>
                <p className="text-[#8E8E93] text-sm max-w-sm leading-relaxed mb-6">
                  {t('onboarding.readyDesc')}
                </p>

                <div className="w-full max-w-sm space-y-3 mb-8">
                  {[
                    { icon: User, label: t('onboarding.readySummary.0'), value: data.profession || t('common.filled') },
                    { icon: Target, label: t('onboarding.readySummary.1'), value: data.targetLevel || t('common.notYet') },
                    { icon: BarChart3, label: t('onboarding.readySummary.2'), value: `${data.testGoals.length} ${t('common.selected')}` },
                    { icon: Settings, label: t('onboarding.readySummary.3'), value: `${data.preferredDuration} ${t('common.minutes')}` },
                  ].map((item, i) => {
                    const Icon = item.icon
                    return (
                      <div key={i} className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-white border border-[#E5E5EA] shadow-sm">
                        <Icon className="w-4 h-4 text-[#8E8E93] flex-shrink-0" />
                        <span className="text-xs text-[#8E8E93] flex-1 text-left">{item.label}</span>
                        <span className="text-xs text-[#1C1C1E] font-medium">{item.value}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="w-full max-w-sm space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#007AFF] to-[#0062CC] text-white text-sm font-semibold shadow-lg shadow-[#007AFF]/20 hover:shadow-[#007AFF]/30 hover:translate-y-[-1px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {saving ? t('onboarding.preparing') : t('onboarding.startTest')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { updateData({ practiceMode: true }); handleSave(true) }}
                    disabled={saving}
                    className="w-full py-3 rounded-xl bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#8E8E93] text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    {t('onboarding.startPractice')}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="flex-shrink-0 border-t border-[#E5E5EA] bg-white/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {data.micTested && (
              <div className="w-2 h-2 rounded-full bg-[#34C759]" />
            )}
            {data.speakerTested && (
              <div className="w-2 h-2 rounded-full bg-[#34C759]" />
            )}
            {data.testGoals.length > 0 && (
              <div className="w-2 h-2 rounded-full bg-[#007AFF]" />
            )}
          </div>
          <div className="flex items-center gap-3">
            {step < STEPS.length - 1 && (
              <button
                type="button"
                onClick={() => { if (canProceed) setStep(step + 1) }}
                disabled={!canProceed}
                className={classNames(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                  canProceed
                    ? 'bg-gradient-to-r from-[#007AFF] to-[#0062CC] text-white shadow-lg shadow-[#007AFF]/20 hover:shadow-[#007AFF]/30 hover:translate-y-[-1px] active:translate-y-0'
                    : 'bg-[#F2F2F7] text-[#C7C7CC] cursor-not-allowed',
                )}
              >
                {step === STEPS.length - 2 ? t('common.finish') : t('common.next')}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
