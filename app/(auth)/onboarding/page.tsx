'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  Sparkles, BookOpen, Target, BarChart3, Settings, CheckCircle2,
  Mic, Monitor, ChevronLeft, ChevronRight, User, GraduationCap,
  Globe, Zap, ShieldCheck, ArrowRight, Loader2, Headphones,
} from 'lucide-react'

const STEPS = [
  { id: 0, label: 'Selamat Datang', icon: Sparkles },
  { id: 1, label: 'Data Diri', icon: User },
  { id: 2, label: 'Tujuan Tes', icon: Target },
  { id: 3, label: 'Pengalaman', icon: BookOpen },
  { id: 4, label: 'Preferensi', icon: Settings },
  { id: 5, label: 'Cek Teknis', icon: Mic },
  { id: 6, label: 'Siap Mulai', icon: Zap },
]

const PROFESI = ['Mahasiswa', 'Profesional', 'Guru', 'Pelajar BIPA', 'Umum', 'Lainnya']
const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const GOALS = [
  'Sertifikasi resmi BIGT',
  'Kuliah di Indonesia / luar negeri',
  'Kerja / promosi karier',
  'Mengajar Bahasa Indonesia',
  'Pengembangan diri',
  'Keperluan BIPA',
  'Migrasi / naturalisasi',
]
const LEARNING_DURATIONS = [
  'Kurang dari 6 bulan',
  '6–12 bulan',
  '1–2 tahun',
  '3–5 tahun',
  'Lebih dari 5 tahun',
  'Penutur asli',
]
const PREVIOUS_TESTS = ['UKBI', 'Tes BIPA lain', 'TOEFL/IELTS (bahasa lain)', 'Belum pernah']

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userName, setUserName] = useState('')

  const [form, setForm] = useState({
    age: '',
    profession: '',
    targetLevel: '',
    testGoals: [] as string[],
    hasPreviousTest: false,
    previousTestType: '',
    learningDuration: '',
    estimatedLevel: '',
    preferredDuration: 60,
    practiceMode: true,
    emailNotifications: true,
    micTested: false,
    speakerTested: false,
  })

  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [micState, setMicState] = useState<'idle' | 'testing' | 'pass' | 'fail'>('idle')
  const [speakerState, setSpeakerState] = useState<'idle' | 'testing' | 'pass' | 'fail'>('idle')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Pengguna')

      const res = await fetch('/api/user/onboarding')
      const data = await res.json()
      if (!data.needsOnboarding) {
        router.push('/dashboard')
        return
      }
      if (data.profile) {
        setForm(prev => ({
          ...prev,
          age: data.profile.age?.toString() || '',
          profession: data.profile.profession || '',
          targetLevel: data.profile.targetLevel || '',
          testGoals: data.profile.testGoals || [],
          hasPreviousTest: data.profile.hasPreviousTest || false,
          previousTestType: data.profile.previousTestType || '',
          learningDuration: data.profile.learningDuration || '',
          estimatedLevel: data.profile.estimatedLevel || '',
          preferredDuration: data.profile.preferredDuration || 60,
          practiceMode: data.profile.practiceMode ?? true,
          emailNotifications: data.profile.emailNotifications ?? true,
        }))
      }
      setLoading(false)
    }
    init()
  }, [router])

  const update = useCallback((field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: false }))
  }, [])

  const toggleGoal = useCallback((goal: string) => {
    setForm(prev => ({
      ...prev,
      testGoals: prev.testGoals.includes(goal)
        ? prev.testGoals.filter(g => g !== goal)
        : [...prev.testGoals, goal],
    }))
  }, [])

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, boolean> = {}
    if (step === 1) {
      if (!form.profession) newErrors.profession = true
    }
    if (step === 2) {
      if (form.testGoals.length === 0) newErrors.testGoals = true
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
    }
  }, [currentStep, validateStep])

  const handlePrev = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }, [])

  const handleSave = useCallback(async (completed = false) => {
    setSaving(true)
    try {
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: form.age ? parseInt(form.age) : null,
          profession: form.profession || null,
          targetLevel: form.targetLevel || null,
          testGoals: form.testGoals,
          hasPreviousTest: form.hasPreviousTest,
          previousTestType: form.previousTestType || null,
          learningDuration: form.learningDuration || null,
          estimatedLevel: form.estimatedLevel || null,
          preferredDuration: form.preferredDuration,
          practiceMode: form.practiceMode,
          emailNotifications: form.emailNotifications,
          technicalCheckPassed: form.micTested && form.speakerTested,
          onboardingCompleted: completed,
        }),
      })
      if (completed) router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }, [form, router])

  const testMic = useCallback(async () => {
    setMicState('testing')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
      setMicState('pass')
      update('micTested', true)
    } catch {
      setMicState('fail')
    }
  }, [update])

  const testSpeaker = useCallback(() => {
    setSpeakerState('testing')
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
      setSpeakerState('pass')
      update('speakerTested', true)
    }, 1000)
  }, [update])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A1428] via-[#0D1B34] to-[#0A1428] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center mx-auto animate-pulse shadow-lg shadow-[#10B981]/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <p className="text-white/40 text-sm">Memuat...</p>
        </div>
      </div>
    )
  }

  const totalSteps = STEPS.length
  const progressPct = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1428] via-[#0D1B34] to-[#0A1428] flex flex-col">
      <header className="flex items-center justify-between px-6 h-16 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg shadow-[#10B981]/20">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-[family-name:var(--font-playfair)] text-sm font-bold text-white/60">BIGT</span>
        </div>
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <button onClick={handlePrev} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/40 text-xs transition-colors">
              <ChevronLeft className="w-3 h-3" /> Kembali
            </button>
          )}
          <button onClick={() => { if (confirm('Lewati proses onboarding?')) handleSave(false) }} className="text-[11px] text-white/20 hover:text-white/40 transition-colors">
            Lewati
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-8 md:py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'bg-[#10B981] w-6' :
                  i < currentStep ? 'bg-[#10B981]/50' : 'bg-white/[0.08]'
                }`} />
              ))}
            </div>
            <span className="text-[11px] text-white/30 tabular-nums">
              Langkah {currentStep + 1} dari {totalSteps}
            </span>
          </div>
          <div className="w-full h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            {currentStep === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center mb-6 shadow-xl shadow-[#10B981]/20">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-white mb-2">
                  Selamat datang di BIGT, {userName}!
                </h1>
                <p className="text-white/40 text-sm md:text-base max-w-md leading-relaxed">
                  Tes kemahiran Bahasa Indonesia berbasis AI yang adaptif dan sesuai
                  standar internasional CEFR. Selesaikan 6 langkah singkat untuk memulai.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-sm">
                  {[
                    { icon: Zap, label: 'Adaptif & AI', sub: 'Soal menyesuaikan level Anda' },
                    { icon: Globe, label: 'Standar CEFR', sub: 'A1 hingga C2' },
                    { icon: BarChart3, label: '6 Dimensi', sub: 'Laporan detail per aspek' },
                    { icon: ShieldCheck, label: 'Sertifikat', sub: 'Verifikasi QR digital' },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left">
                        <Icon className="w-4 h-4 text-[#10B981] mb-1.5" />
                        <p className="text-xs font-semibold text-white/70">{item.label}</p>
                        <p className="text-[10px] text-white/30">{item.sub}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="flex-1 py-4">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white/90">Data Diri</h2>
                  <p className="text-xs text-white/40 mt-1">Bantu kami mengenal Anda lebih baik.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-white/50 block mb-1.5">Nama Lengkap</label>
                    <input value={userName} disabled
                      className="w-full py-3 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 text-sm cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/50 block mb-1.5">Usia</label>
                    <div className="flex gap-2">
                      {['<18', '18-24', '25-34', '35-44', '45+'].map(age => (
                        <button key={age} onClick={() => update('age', age)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                            form.age === age
                              ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                              : 'border-white/[0.06] bg-white/[0.03] text-white/40 hover:bg-white/[0.06]'
                          }`}>
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/50 block mb-1.5">Profesi / Tujuan Utama</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PROFESI.map(p => (
                        <button key={p} onClick={() => update('profession', p)}
                          className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                            form.profession === p
                              ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                              : 'border-white/[0.06] bg-white/[0.03] text-white/40 hover:bg-white/[0.06]'
                          }`}>
                          {p}
                        </button>
                      ))}
                    </div>
                    {errors.profession && <p className="text-red-400 text-[10px] mt-1">Pilih profesi Anda</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/50 block mb-1.5">Target Level CEFR</label>
                    <div className="flex gap-1.5">
                      {CEFR_LEVELS.map(l => (
                        <button key={l} onClick={() => update('targetLevel', form.targetLevel === l ? '' : l)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            form.targetLevel === l
                              ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]'
                              : 'border-white/[0.06] bg-white/[0.03] text-white/30 hover:bg-white/[0.06]'
                          }`}>
                          {l}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-white/20 mt-1.5">Kosongkan jika belum tahu target Anda</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex-1 py-4">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white/90">Tujuan Tes</h2>
                  <p className="text-xs text-white/40 mt-1">Pilih satu atau lebih tujuan Anda mengikuti tes BIGT.</p>
                </div>
                <div className="space-y-2">
                  {GOALS.map(goal => (
                    <button key={goal} onClick={() => toggleGoal(goal)}
                      className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl border transition-all text-left ${
                        form.testGoals.includes(goal)
                          ? 'border-[#10B981] bg-[#10B981]/[0.06]'
                          : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all flex-shrink-0 ${
                        form.testGoals.includes(goal)
                          ? 'bg-[#10B981] border-[#10B981]'
                          : 'border-white/[0.15]'
                      }`}>
                        {form.testGoals.includes(goal) && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <span className={`text-sm ${form.testGoals.includes(goal) ? 'text-white/80' : 'text-white/40'}`}>
                        {goal}
                      </span>
                    </button>
                  ))}
                  {errors.testGoals && <p className="text-red-400 text-[10px]">Pilih minimal satu tujuan</p>}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex-1 py-4">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white/90">Pengalaman Belajar</h2>
                  <p className="text-xs text-white/40 mt-1">Ceritakan pengalaman Anda dengan Bahasa Indonesia.</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-medium text-white/50 block mb-2">Pernah mengikuti tes Bahasa Indonesia sebelumnya?</label>
                    <div className="flex gap-2">
                      <button onClick={() => update('hasPreviousTest', true)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          form.hasPreviousTest
                            ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                            : 'border-white/[0.06] bg-white/[0.03] text-white/40'
                        }`}>Ya</button>
                      <button onClick={() => { update('hasPreviousTest', false); update('previousTestType', '') }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          !form.hasPreviousTest
                            ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                            : 'border-white/[0.06] bg-white/[0.03] text-white/40'
                        }`}>Belum</button>
                    </div>
                  </div>
                  {form.hasPreviousTest && (
                    <div>
                      <label className="text-xs font-medium text-white/50 block mb-2">Jenis tes sebelumnya</label>
                      <div className="grid grid-cols-2 gap-2">
                        {PREVIOUS_TESTS.map(t => (
                          <button key={t} onClick={() => update('previousTestType', t)}
                            className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                              form.previousTestType === t
                                ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                                : 'border-white/[0.06] bg-white/[0.03] text-white/40'
                            }`}>{t}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-white/50 block mb-2">Lama belajar Bahasa Indonesia</label>
                    <div className="grid grid-cols-2 gap-2">
                      {LEARNING_DURATIONS.map(d => (
                        <button key={d} onClick={() => update('learningDuration', d)}
                          className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                            form.learningDuration === d
                              ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                              : 'border-white/[0.06] bg-white/[0.03] text-white/40'
                          }`}>{d}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="flex-1 py-4">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white/90">Preferensi Tes</h2>
                  <p className="text-xs text-white/40 mt-1">Sesuaikan pengalaman tes sesuai keinginan Anda.</p>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-medium text-white/50 block mb-2">Durasi tes yang diinginkan</label>
                    <div className="flex gap-2">
                      {[
                        { value: 30, label: '30 menit', sub: 'Cepat' },
                        { value: 60, label: '60 menit', sub: 'Standar' },
                        { value: 90, label: '90 menit', sub: 'Lengkap' },
                      ].map(opt => (
                        <button key={opt.value} onClick={() => update('preferredDuration', opt.value)}
                          className={`flex-1 py-3 rounded-xl border transition-all ${
                            form.preferredDuration === opt.value
                              ? 'border-[#10B981] bg-[#10B981]/10'
                              : 'border-white/[0.06] bg-white/[0.03]'
                          }`}>
                          <p className={`text-sm font-semibold ${form.preferredDuration === opt.value ? 'text-[#10B981]' : 'text-white/60'}`}>
                            {opt.label}
                          </p>
                          <p className="text-[10px] text-white/30 mt-0.5">{opt.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/50 block mb-2">Mode awal</label>
                    <div className="flex gap-2">
                      <button onClick={() => update('practiceMode', true)}
                        className={`flex-1 py-3 rounded-xl border transition-all ${
                          form.practiceMode
                            ? 'border-[#10B981] bg-[#10B981]/10'
                            : 'border-white/[0.06] bg-white/[0.03]'
                        }`}>
                        <BookOpen className={`w-4 h-4 mx-auto mb-1 ${form.practiceMode ? 'text-[#10B981]' : 'text-white/30'}`} />
                        <p className={`text-sm font-semibold ${form.practiceMode ? 'text-[#10B981]' : 'text-white/60'}`}>Practice Mode</p>
                        <p className="text-[10px] text-white/30 mt-0.5">Latihan dulu</p>
                      </button>
                      <button onClick={() => update('practiceMode', false)}
                        className={`flex-1 py-3 rounded-xl border transition-all ${
                          !form.practiceMode
                            ? 'border-[#10B981] bg-[#10B981]/10'
                            : 'border-white/[0.06] bg-white/[0.03]'
                        }`}>
                        <Zap className={`w-4 h-4 mx-auto mb-1 ${!form.practiceMode ? 'text-[#10B981]' : 'text-white/30'}`} />
                        <p className={`text-sm font-semibold ${!form.practiceMode ? 'text-[#10B981]' : 'text-white/60'}`}>Full Test</p>
                        <p className="text-[10px] text-white/30 mt-0.5">Langsung ujian</p>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-white/30" />
                      <span className="text-xs text-white/50">Notifikasi hasil via email</span>
                    </div>
                    <button onClick={() => update('emailNotifications', !form.emailNotifications)}
                      className={`w-10 h-6 rounded-full transition-all ${
                        form.emailNotifications ? 'bg-[#10B981]' : 'bg-white/[0.1]'
                      }`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                        form.emailNotifications ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="flex-1 py-4">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white/90">Cek Perangkat</h2>
                  <p className="text-xs text-white/40 mt-1">Pastikan perangkat Anda siap sebelum memulai tes.</p>
                </div>
                <div className="space-y-4">
                  <div className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        micState === 'pass' ? 'bg-[#10B981]/10' :
                        micState === 'fail' ? 'bg-red-500/10' :
                        'bg-white/[0.06]'
                      }`}>
                        <Mic className={`w-5 h-5 ${
                          micState === 'pass' ? 'text-[#10B981]' :
                          micState === 'fail' ? 'text-red-400' :
                          'text-white/30'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white/70">Mikrofon</p>
                        <p className="text-[10px] text-white/30">Untuk sesi berbicara (Speaking)</p>
                      </div>
                      <button onClick={testMic} disabled={micState === 'testing' || micState === 'pass'}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                          micState === 'pass'
                            ? 'bg-[#10B981]/10 text-[#10B981] cursor-default'
                            : micState === 'fail'
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'bg-white/[0.08] text-white/50 hover:bg-white/[0.12]'
                        }`}>
                        {micState === 'testing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                         micState === 'pass' ? 'Berhasil' :
                         micState === 'fail' ? 'Coba Lagi' : 'Uji'}
                      </button>
                    </div>
                    {micState === 'pass' && (
                      <div className="flex items-center gap-1.5 text-[10px] text-[#10B981]">
                        <CheckCircle2 className="w-3 h-3" /> Mikrofon terdeteksi
                      </div>
                    )}
                    {micState === 'fail' && (
                      <div className="text-[10px] text-red-400">Izinkan akses mikrofon di browser Anda</div>
                    )}
                  </div>

                  <div className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        speakerState === 'pass' ? 'bg-[#10B981]/10' :
                        speakerState === 'fail' ? 'bg-red-500/10' :
                        'bg-white/[0.06]'
                      }`}>
                        <Headphones className={`w-5 h-5 ${
                          speakerState === 'pass' ? 'text-[#10B981]' :
                          speakerState === 'fail' ? 'text-red-400' :
                          'text-white/30'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white/70">Speaker / Headphone</p>
                        <p className="text-[10px] text-white/30">Untuk sesi menyimak (Listening)</p>
                      </div>
                      <button onClick={testSpeaker} disabled={speakerState === 'testing' || speakerState === 'pass'}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                          speakerState === 'pass'
                            ? 'bg-[#10B981]/10 text-[#10B981] cursor-default'
                            : speakerState === 'fail'
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'bg-white/[0.08] text-white/50 hover:bg-white/[0.12]'
                        }`}>
                        {speakerState === 'testing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                         speakerState === 'pass' ? 'Berhasil' :
                         speakerState === 'fail' ? 'Coba Lagi' : 'Uji'}
                      </button>
                    </div>
                    {speakerState === 'pass' && (
                      <div className="flex items-center gap-1.5 text-[10px] text-[#10B981]">
                        <CheckCircle2 className="w-3 h-3" /> Suara uji diputar
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <Monitor className="w-4 h-4 text-white/30" />
                      <span className="text-xs text-white/50">Browser: Chrome / Firefox / Edge (direkomendasikan)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center mb-5 shadow-xl shadow-[#F59E0B]/20">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-bold text-white mb-2">
                  Siap Memulai, {userName}!
                </h2>
                <p className="text-white/40 text-sm max-w-sm leading-relaxed mb-6">
                  Anda akan mengikuti tes adaptif yang mencakup 6 dimensi kemahiran
                  Bahasa Indonesia dengan standar CEFR internasional.
                </p>

                <div className="w-full max-w-sm space-y-3 mb-8">
                  {[
                    { icon: User, label: 'Profil', value: form.profession || 'Terisi' },
                    { icon: Target, label: 'Target Level', value: form.targetLevel || 'Belum ditentukan' },
                    { icon: BarChart3, label: 'Tujuan', value: `${form.testGoals.length} dipilih` },
                    { icon: Settings, label: 'Durasi', value: `${form.preferredDuration} menit` },
                  ].map(item => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <Icon className="w-4 h-4 text-white/30 flex-shrink-0" />
                        <span className="text-xs text-white/40 flex-1 text-left">{item.label}</span>
                        <span className="text-xs text-white/70 font-medium">{item.value}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="w-full max-w-sm space-y-3">
                  <button onClick={() => handleSave(true)}
                    disabled={saving}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-sm font-semibold shadow-lg shadow-[#10B981]/20 hover:shadow-[#10B981]/30 hover:translate-y-[-1px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {saving ? 'Menyiapkan...' : 'Mulai Tes BIGT Sekarang'}
                  </button>
                  <button onClick={() => { update('practiceMode', true); handleSave(true) }}
                    className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/50 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Mulai Practice Mode Dulu
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-[10px] text-white/20">
            <div className={`w-2 h-2 rounded-full ${form.micTested ? 'bg-[#10B981]' : 'bg-white/[0.06]'}`} />
            <div className={`w-2 h-2 rounded-full ${form.speakerTested ? 'bg-[#10B981]' : 'bg-white/[0.06]'}`} />
            {form.testGoals.length > 0 && <div className="w-2 h-2 rounded-full bg-[#10B981]" />}
          </div>
          <div className="flex items-center gap-3">
            {currentStep < STEPS.length - 1 && (
              <button onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-semibold shadow-lg shadow-[#10B981]/20 hover:shadow-[#10B981]/30 hover:translate-y-[-1px] active:translate-y-0 transition-all"
              >
                Lanjut <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
