'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  User, Mail, Camera, Trash2, Target,
  GraduationCap, Briefcase, Building2, Lock,
  FileText, Bell, Download, AlertTriangle, Clock,
  LogOut, ChevronRight, Check, X, Loader2, Shield,
} from 'lucide-react'

const CEFR_LEVELS = [
  { value: 'A1', label: 'A1 - Pemula' },
  { value: 'A2', label: 'A2 - Dasar' },
  { value: 'B1', label: 'B1 - Madya' },
  { value: 'B2', label: 'B2 - Madya Atas' },
  { value: 'C1', label: 'C1 - Mahir' },
  { value: 'C2', label: 'C2 - Sangat Mahir' },
]

const GOAL_OPTIONS = [
  { value: 'akademik', label: 'Akademik' },
  { value: 'profesional', label: 'Profesional' },
  { value: 'penempatan', label: 'Penempatan Level' },
  { value: 'bipa', label: 'Sertifikasi BIPA' },
  { value: 'studi', label: 'Persiapan Studi' },
  { value: 'lainnya', label: 'Lainnya' },
]

const SKILL_OPTIONS = [
  { value: 'LISTENING', label: 'Menyimak' },
  { value: 'READING', label: 'Membaca' },
  { value: 'SPEAKING', label: 'Berbicara' },
  { value: 'WRITING', label: 'Menulis' },
  { value: 'MEDIATION', label: 'Mediasi' },
  { value: 'INTEGRATED', label: 'Tugas Terintegrasi' },
]

const DURATION_OPTIONS = [
  { value: 15, label: '15 menit - Sangat Singkat' },
  { value: 30, label: '30 menit - Singkat' },
  { value: 45, label: '45 menit - Sedang' },
  { value: 60, label: '60 menit - Standar' },
  { value: 90, label: '90 menit - Intensif' },
  { value: 120, label: '120 menit - Lengkap' },
]

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Pribadi' },
  { value: 'link_only', label: 'Hanya melalui tautan verifikasi' },
  { value: 'public', label: 'Publik' },
]

function SectionCard({ title, icon: Icon, children, className = '' }: { title: string; icon: any; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#E5E5EA]">
        <Icon className="w-5 h-5 text-[#007AFF]" />
        <h3 className="text-sm font-semibold text-[#1C1C1E]">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function PillSelect({ options, selected, onChange, label }: { options: { value: string; label: string }[]; selected: string[]; onChange: (v: string[]) => void; label?: string }) {
  const toggle = (value: string) => {
    if (selected.includes(value)) onChange(selected.filter(s => s !== value))
    else onChange([...selected, value])
  }
  return (
    <div>
      {label && <p className="text-xs font-medium text-[#8E8E93] mb-2">{label}</p>}
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const isOn = selected.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isOn ? 'bg-[#007AFF] text-white border-[#007AFF]' : 'bg-white text-[#1C1C1E] border-[#E5E5EA] hover:border-[#007AFF]'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <span className="text-sm text-[#1C1C1E]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  )
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1C1C1E]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-[#8E8E93]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-10 bg-gray-100 rounded-xl" />
            <div className="h-10 bg-gray-100 rounded-xl" />
            <div className="h-10 bg-gray-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [firstLanguage, setFirstLanguage] = useState('')
  const [bio, setBio] = useState('')
  const [targetLevel, setTargetLevel] = useState('')
  const [testGoals, setTestGoals] = useState<string[]>([])
  const [focusSkills, setFocusSkills] = useState<string[]>([])
  const [preferredDuration, setPreferredDuration] = useState(60)
  const [preferredLanguage, setPreferredLanguage] = useState('id')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [productUpdates, setProductUpdates] = useState(true)
  const [certificateVisibility, setCertificateVisibility] = useState('private')
  const [institution, setInstitution] = useState('')
  const [occupation, setOccupation] = useState('')

  const [passwordModal, setPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

  const [emailModal, setEmailModal] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)

  const [activity, setActivity] = useState<any>(null)
  const [activityLoading, setActivityLoading] = useState(true)
  const [certsLoading, setCertsLoading] = useState(true)
  const [certificateData, setCertificateData] = useState<any>(null)
  const [loginHistory, setLoginHistory] = useState<any[]>([])
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(true)
  const [loginHistoryModal, setLoginHistoryModal] = useState(false)

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
  }

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.status === 401) { window.location.href = '/login'; return }
      const json = await res.json()
      if (!json.success) { setError(json.error); return }
      const d = json.data
      setProfile(d)
      setName(d.name || '')
      setDisplayName(d.displayName || '')
      setCountry(d.country || '')
      setCity(d.city || '')
      setFirstLanguage(d.firstLanguage || '')
      setBio(d.bio || '')
      setTargetLevel(d.targetLevel || '')
      setTestGoals(d.testGoals || [])
      setFocusSkills(d.focusSkills || [])
      setPreferredDuration(d.preferredDuration || 60)
      setPreferredLanguage(d.preferredLanguage || 'id')
      setEmailNotifications(d.emailNotifications ?? true)
      setProductUpdates(d.productUpdates ?? true)
      setCertificateVisibility(d.certificateVisibility || 'private')
      setInstitution(d.institution || '')
      setOccupation(d.occupation || '')
    } catch {
      setError('Gagal memuat profil.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/profile/activity')
      const json = await res.json()
      if (json.success) setActivity(json.data)
    } catch { /* ignore */ }
    finally { setActivityLoading(false) }
  }, [])

  const fetchCertificates = useCallback(async () => {
    try {
      const res = await fetch('/api/test/result')
      const json = await res.json()
      if (json.success && json.certificates?.length > 0) {
        setCertificateData(json.certificates[0])
      }
    } catch { /* ignore */ }
    finally { setCertsLoading(false) }
  }, [])

  const fetchLoginHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/profile/login-history')
      const json = await res.json()
      if (json.success) setLoginHistory(json.data)
    } catch { /* ignore */ }
    finally { setLoginHistoryLoading(false) }
  }, [])

  useEffect(() => { fetchProfile(); fetchActivity(); fetchCertificates(); fetchLoginHistory() }, [fetchProfile, fetchActivity, fetchCertificates, fetchLoginHistory])

  const handleSaveProfile = async () => {
    setSaving('profile')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, displayName, country, city, firstLanguage, bio }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setProfile((p: any) => p ? { ...p, name, displayName, country, city, firstLanguage, bio } : p)
      showToast('success', 'Profil berhasil diperbarui.')
    } catch {
      showToast('error', 'Gagal memperbarui profil.')
    } finally {
      setSaving(null)
    }
  }

  const handleSavePreferences = async () => {
    setSaving('preferences')
    try {
      const res = await fetch('/api/profile/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLevel, testGoals, focusSkills, preferredDuration, preferredLanguage, emailNotifications, productUpdates, certificateVisibility }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      showToast('success', 'Preferensi berhasil disimpan.')
    } catch {
      showToast('error', 'Gagal menyimpan preferensi.')
    } finally {
      setSaving(null)
    }
  }

  const handleSaveAcademic = async () => {
    setSaving('academic')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institution, occupation }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      showToast('success', 'Data akademik berhasil diperbarui.')
    } catch {
      showToast('error', 'Gagal menyimpan data akademik.')
    } finally {
      setSaving(null)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    if (!file) return
    const MAX_SIZE = 2 * 1024 * 1024
    if (file.size > MAX_SIZE) { showToast('error', 'Ukuran foto maksimal 2 MB.'); return }
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
    if (!ALLOWED.includes(file.type)) { showToast('error', 'Format foto harus JPG, PNG, atau WEBP.'); return }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.success) {
        setProfile((p: any) => p ? { ...p, avatarUrl: json.avatarUrl } : p)
        showToast('success', 'Foto berhasil diperbarui.')
      } else {
        showToast('error', json.error || 'Gagal mengunggah foto.')
      }
    } catch {
      showToast('error', 'Gagal mengunggah foto.')
    } finally {
      setUploading(false)
    }
  }

  const handleAvatarDelete = async () => {
    setUploading(true)
    try {
      const res = await fetch('/api/profile/avatar', { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setProfile((p: any) => p ? { ...p, avatarUrl: null } : p)
        showToast('success', 'Foto berhasil dihapus.')
      }
    } catch {
      showToast('error', 'Gagal menghapus foto.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleAvatarUpload(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    if (password.length < 8) { setPasswordError('Kata sandi minimal 8 karakter.'); return }
    if (password !== passwordConfirm) { setPasswordError('Konfirmasi kata sandi tidak cocok.'); return }
    setPasswordSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) { setPasswordError(error.message); return }
      setPasswordModal(false)
      setPassword('')
      setPasswordConfirm('')
      showToast('success', 'Kata sandi berhasil diperbarui.')
    } catch {
      setPasswordError('Gagal memperbarui kata sandi.')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleChangeEmail = async () => {
    setEmailError('')
    if (!newEmail.includes('@')) { setEmailError('Format email tidak valid.'); return }
    setEmailSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) { setEmailError(error.message); return }
      setEmailModal(false)
      setNewEmail('')
      showToast('success', 'Tautan konfirmasi telah dikirim ke email baru Anda.')
    } catch {
      setEmailError('Gagal mengirim tautan konfirmasi.')
    } finally {
      setEmailSaving(false)
    }
  }

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/profile/export')
      const json = await res.json()
      if (json.success) {
        const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `bigt-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        showToast('success', 'Data berhasil diekspor.')
      }
    } catch {
      showToast('error', 'Gagal mengekspor data.')
    }
  }

  if (loading) return <LoadingSkeleton />
  if (error) return (
    <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <p className="text-red-600 font-medium mb-4">{error}</p>
      <Button onClick={fetchProfile} className="rounded-xl bg-[#007AFF] hover:bg-[#0066CC]">Coba Lagi</Button>
    </div>
  )

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-[#34C759] text-white' : 'bg-[#FF3B30] text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Profil</h1>
        <p className="text-sm text-[#8E8E93] mt-1">Kelola identitas, preferensi, dan keamanan akun BIGT Anda.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-[#F2F2F7] flex items-center justify-center border-2 border-[#E5E5EA]">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-[#8E8E93]" />
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex gap-1">
              <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center shadow-md hover:bg-[#0066CC] transition-colors" title="Ubah Foto">
                <Camera className="w-4 h-4 text-white" />
              </button>
              {profile?.avatarUrl && (
                <button onClick={handleAvatarDelete} className="w-8 h-8 rounded-full bg-[#FF3B30] flex items-center justify-center shadow-md hover:bg-[#D63031] transition-colors" title="Hapus Foto">
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-[#1C1C1E]">{name || 'Pengguna'}</h2>
            <p className="text-sm text-[#8E8E93] flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" /> {profile?.email || '-'}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
              {profile?.currentLevel && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#007AFF]/10 text-[#007AFF] text-xs font-semibold">
                  <GraduationCap className="w-3.5 h-3.5" /> {profile.currentLevel}
                </span>
              )}
              {profile?.targetLevel && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#34C759]/10 text-[#34C759] text-xs font-semibold">
                  <Target className="w-3.5 h-3.5" /> Target: {profile.targetLevel}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <SectionCard title="Informasi Pribadi" icon={User}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#8E8E93]">Nama Lengkap</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} className="h-11 rounded-xl border-[#E5E5EA]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#8E8E93]">Nama Tampilan</Label>
                  <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="h-11 rounded-xl border-[#E5E5EA]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[#8E8E93]">Email</Label>
                <div className="flex items-center gap-2 h-11 px-3 rounded-xl bg-[#F2F2F7] border border-[#E5E5EA]">
                  <Mail className="w-4 h-4 text-[#8E8E93]" />
                  <span className="text-sm text-[#1C1C1E]">{profile?.email}</span>
                </div>
                <p className="text-[11px] text-[#8E8E93]">Ubah email melalui menu Keamanan Akun.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#8E8E93]">Negara</Label>
                  <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="Indonesia" className="h-11 rounded-xl border-[#E5E5EA]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#8E8E93]">Kota</Label>
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Jakarta" className="h-11 rounded-xl border-[#E5E5EA]" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#8E8E93]">Bahasa Pertama</Label>
                  <Input value={firstLanguage} onChange={e => setFirstLanguage(e.target.value)} placeholder="Bahasa Indonesia" className="h-11 rounded-xl border-[#E5E5EA]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[#8E8E93]">Bio</Label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={160} rows={3} className="w-full rounded-xl border border-[#E5E5EA] bg-white px-3 py-2.5 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/20 resize-none" placeholder="Ceritakan sedikit tentang diri Anda..." />
                <p className="text-[11px] text-[#8E8E93] text-right">{bio.length}/160</p>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveProfile} disabled={saving === 'profile'} className="rounded-xl bg-[#007AFF] hover:bg-[#0066CC] h-11 px-6 text-sm">
                  {saving === 'profile' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Preferensi Tes dan Pembelajaran" icon={Target}>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[#8E8E93]">Target Level BIGT</Label>
                <select value={targetLevel} onChange={e => setTargetLevel(e.target.value)} className="w-full h-11 rounded-xl border border-[#E5E5EA] bg-white px-3 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/20 appearance-none">
                  <option value="">Pilih target level</option>
                  {CEFR_LEVELS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <PillSelect options={GOAL_OPTIONS} selected={testGoals} onChange={setTestGoals} label="Tujuan Mengikuti BIGT" />
              <PillSelect options={SKILL_OPTIONS} selected={focusSkills} onChange={setFocusSkills} label="Fokus Kemahiran" />
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[#8E8E93]">Durasi Tes yang Diinginkan</Label>
                <select value={preferredDuration} onChange={e => setPreferredDuration(Number(e.target.value))} className="w-full h-11 rounded-xl border border-[#E5E5EA] bg-white px-3 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/20 appearance-none">
                  {DURATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[#8E8E93]">Bahasa Tampilan</Label>
                <select value={preferredLanguage} onChange={e => setPreferredLanguage(e.target.value)} className="w-full h-11 rounded-xl border border-[#E5E5EA] bg-white px-3 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/20 appearance-none">
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">Bahasa Inggris</option>
                </select>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={handleSavePreferences} disabled={saving === 'preferences'} className="rounded-xl bg-[#007AFF] hover:bg-[#0066CC] h-11 px-6 text-sm">
                  {saving === 'preferences' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Simpan Preferensi
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Data Akademik / Profesional" icon={Briefcase}>
            <p className="text-xs text-[#8E8E93] mb-4">Bagian ini membantu BIGT memberikan rekomendasi tes dan pembelajaran yang lebih relevan.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#8E8E93]">Institusi</Label>
                  <Input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="Nama institusi/universitas" className="h-11 rounded-xl border-[#E5E5EA]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#8E8E93]">Pekerjaan / Peran</Label>
                  <Input value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="Mahasiswa, Guru, Profesional" className="h-11 rounded-xl border-[#E5E5EA]" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveAcademic} disabled={saving === 'academic'} className="rounded-xl bg-[#007AFF] hover:bg-[#0066CC] h-11 px-6 text-sm">
                  {saving === 'academic' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Simpan
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Keamanan Akun" icon={Lock}>
            <div className="space-y-1">
              <button onClick={() => setPasswordModal(true)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F2F2F7] transition-colors">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-[#8E8E93]" />
                  <span className="text-sm text-[#1C1C1E]">Ubah Kata Sandi</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#C7C7CC]" />
              </button>
              <button onClick={() => setEmailModal(true)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F2F2F7] transition-colors">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#8E8E93]" />
                  <span className="text-sm text-[#1C1C1E]">Ubah Email</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#C7C7CC]" />
              </button>
              <button onClick={() => setLoginHistoryModal(true)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F2F2F7] transition-colors">
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4 text-[#8E8E93]" />
                  <span className="text-sm text-[#1C1C1E]">Riwayat Masuk</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#8E8E93]">{loginHistoryLoading ? '...' : `${loginHistory.length} masuk`}</span>
                  <ChevronRight className="w-4 h-4 text-[#C7C7CC]" />
                </div>
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Sertifikat" icon={FileText}>
            {certsLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-48 bg-gray-200 rounded" />
              </div>
            ) : certificateData ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4 text-[#C9A227]" />
                  <span className="text-sm font-semibold text-[#1C1C1E]">Level {certificateData.overallLevel}</span>
                </div>
                <p className="text-xs text-[#8E8E93] mb-3">Terbit: {new Date(certificateData.issuedAt).toLocaleDateString('id-ID')}</p>
                <Button onClick={() => router.push('/certificates')} className="w-full rounded-xl bg-[#007AFF] hover:bg-[#0066CC] h-10 text-xs">Lihat Semua Sertifikat</Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <FileText className="w-8 h-8 text-[#8E8E93] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#1C1C1E]">Belum ada sertifikat</p>
                <p className="text-xs text-[#8E8E93] mt-1 mb-4">Selesaikan tes BIGT untuk memperoleh sertifikat digital.</p>
                <Button className="w-full rounded-xl bg-[#007AFF] hover:bg-[#0066CC] h-10 text-xs">Mulai Tes</Button>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Privasi" icon={Shield}>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-[#8E8E93]">Visibilitas Sertifikat</Label>
                <select value={certificateVisibility} onChange={e => setCertificateVisibility(e.target.value)} className="w-full h-10 rounded-xl border border-[#E5E5EA] bg-white px-3 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF] appearance-none">
                  {VISIBILITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <Toggle value={emailNotifications} onChange={setEmailNotifications} label="Notifikasi Email" />
              <Toggle value={productUpdates} onChange={setProductUpdates} label="Pembaruan produk" />
              <div className="pt-2 space-y-2">
                <Button onClick={handleSavePreferences} disabled={saving === 'preferences'} className="w-full rounded-xl bg-[#007AFF] hover:bg-[#0066CC] h-10 text-xs">
                  {saving === 'preferences' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Simpan Pengaturan
                </Button>
                <Button onClick={handleExportData} variant="outline" className="w-full rounded-xl h-10 text-xs border-[#E5E5EA]">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Ekspor Data Saya
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Aktivitas Akun" icon={Clock}>
            {activityLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-3 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
              </div>
            ) : activity ? (
              <div className="space-y-2.5 text-sm">
                {activity.lastTest && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E8E93]">Tes terakhir</span>
                    <span className="text-[#1C1C1E] font-medium">{new Date(activity.lastTest.startedAt).toLocaleDateString('id-ID')}</span>
                  </div>
                )}
                {activity.lastCertificate && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E8E93]">Sertifikat terakhir</span>
                    <span className="text-[#1C1C1E] font-medium">{new Date(activity.lastCertificate.issuedAt).toLocaleDateString('id-ID')}</span>
                  </div>
                )}
                {activity.lastLogin && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E8E93]">Login terakhir</span>
                    <span className="text-[#1C1C1E] font-medium">{new Date(activity.lastLogin).toLocaleDateString('id-ID')}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#8E8E93]">Bergabung sejak</span>
                  <span className="text-[#1C1C1E] font-medium">{new Date(activity.memberSince).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#8E8E93] text-center py-4">Belum ada aktivitas akun.</p>
            )}
          </SectionCard>
        </div>
      </div>

      <Modal open={passwordModal} onClose={() => { setPasswordModal(false); setPassword(''); setPasswordConfirm(''); setPasswordError('') }} title="Ubah Kata Sandi">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[#8E8E93]">Kata Sandi Baru</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 8 karakter" className="h-11 rounded-xl border-[#E5E5EA]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[#8E8E93]">Konfirmasi Kata Sandi</Label>
            <Input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="Masukkan ulang kata sandi" className="h-11 rounded-xl border-[#E5E5EA]" />
          </div>
          {passwordError && <p className="text-xs text-[#FF3B30]">{passwordError}</p>}
          <Button onClick={handleChangePassword} disabled={passwordSaving} className="w-full rounded-xl bg-[#007AFF] hover:bg-[#0066CC] h-11">
            {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Perbarui Kata Sandi
          </Button>
        </div>
      </Modal>

      <Modal open={emailModal} onClose={() => { setEmailModal(false); setNewEmail(''); setEmailError('') }} title="Ubah Email">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[#8E8E93]">Email Baru</Label>
            <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@contoh.com" className="h-11 rounded-xl border-[#E5E5EA]" />
          </div>
          {emailError && <p className="text-xs text-[#FF3B30]">{emailError}</p>}
          <Button onClick={handleChangeEmail} disabled={emailSaving} className="w-full rounded-xl bg-[#007AFF] hover:bg-[#0066CC] h-11">
            {emailSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Kirim Tautan Konfirmasi
          </Button>
        </div>
      </Modal>

      <Modal open={loginHistoryModal} onClose={() => setLoginHistoryModal(false)} title="Riwayat Masuk">
        {loginHistoryLoading ? (
          <div className="animate-pulse space-y-3 py-2">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
          </div>
        ) : loginHistory.length === 0 ? (
          <p className="text-sm text-[#8E8E93] text-center py-4">Belum ada riwayat masuk.</p>
        ) : (
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {loginHistory.map((h: any) => (
              <div key={h.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F2F2F7]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#34C759]" />
                  <span className="text-sm text-[#1C1C1E]">{new Date(h.createdAt).toLocaleString('id-ID')}</span>
                </div>
                {h.ipAddress && <span className="text-[11px] text-[#8E8E93]">{h.ipAddress}</span>}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
