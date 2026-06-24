'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Moon, Sun, Monitor, Bell, Globe, Clock, AlertTriangle, Loader2, ChevronRight, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#1C1C1E]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#F2F2F7] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#007AFF]" />
        </div>
        <h2 className="text-sm font-semibold text-[#1C1C1E]">{title}</h2>
      </div>
      {children}
    </div>
  )
}

const TIMEZONE_OPTIONS = Intl.supportedValuesOf?.('timeZone')?.map(tz => ({ value: tz, label: tz })) || [
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta (WIB)' },
  { value: 'Asia/Makassar', label: 'Asia/Makassar (WITA)' },
  { value: 'Asia/Jayapura', label: 'Asia/Jayapura (WIT)' },
]

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [productUpdates, setProductUpdates] = useState(true)
  const [preferredLanguage, setPreferredLanguage] = useState('id')
  const [timezone, setTimezone] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
  }

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/profile')
      const json = await res.json()
      if (json.success && json.data) {
        setEmailNotifications(json.data.emailNotifications ?? true)
        setProductUpdates(json.data.productUpdates ?? true)
        setPreferredLanguage(json.data.preferredLanguage || 'id')
        setTimezone(json.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta')
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSaveNotifications = async () => {
    setSaving('notifications')
    try {
      const res = await fetch('/api/profile/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailNotifications, productUpdates }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      showToast('success', 'Pengaturan notifikasi berhasil disimpan.')
    } catch {
      showToast('error', 'Gagal menyimpan pengaturan.')
    } finally { setSaving(null) }
  }

  const handleSavePreferences = async () => {
    setSaving('preferences')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredLanguage, timezone }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      showToast('success', 'Pengaturan bahasa dan zona waktu berhasil disimpan.')
    } catch {
      showToast('error', 'Gagal menyimpan pengaturan.')
    } finally { setSaving(null) }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'HAPUS') return
    setSaving('delete')
    try {
      const res = await fetch('/api/profile/delete-account', { method: 'POST' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch {
      showToast('error', 'Gagal menghapus akun. Hubungi dukungan.')
    } finally { setSaving(null) }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
              <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
              <div className="h-10 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-[#34C759] text-white' : 'bg-[#FF3B30] text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Pengaturan</h1>
        <p className="text-sm text-[#8E8E93] mt-1">Sesuaikan pengalaman aplikasi sesuai preferensimu</p>
      </div>

      <div className="space-y-6">
        <SectionCard title="Tampilan" icon={theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor}>
          <div className="space-y-2">
            {[
              { value: 'light', label: 'Terang', icon: Sun },
              { value: 'dark', label: 'Gelap', icon: Moon },
              { value: 'system', label: 'Sistem', icon: Monitor },
            ].map(opt => {
              const Icon = opt.icon
              const active = theme === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                    active ? 'bg-[#F2F2F7]' : 'hover:bg-[#F2F2F7]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`} />
                    <span className={`text-sm ${active ? 'text-[#007AFF] font-medium' : 'text-[#1C1C1E]'}`}>{opt.label}</span>
                  </div>
                  {active && <div className="w-2 h-2 rounded-full bg-[#007AFF]" />}
                </button>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard title="Notifikasi" icon={Bell}>
          <div className="space-y-3">
            <Toggle value={emailNotifications} onChange={setEmailNotifications} label="Email notifikasi" />
            <Toggle value={productUpdates} onChange={setProductUpdates} label="Pembaruan produk" />
            <div className="pt-2">
              <Button onClick={handleSaveNotifications} disabled={saving === 'notifications'} className="w-full rounded-xl bg-[#007AFF] hover:bg-[#0066CC] h-10 text-xs">
                {saving === 'notifications' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Simpan Pengaturan Notifikasi
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Bahasa & Wilayah" icon={Globe}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#8E8E93]">Bahasa Aplikasi</Label>
              <select
                value={preferredLanguage}
                onChange={e => setPreferredLanguage(e.target.value)}
                className="w-full h-11 rounded-xl border border-[#E5E5EA] bg-white px-3 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF] appearance-none"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#8E8E93]">Zona Waktu</Label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full h-11 rounded-xl border border-[#E5E5EA] bg-white px-3 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF] appearance-none"
              >
                {TIMEZONE_OPTIONS.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSavePreferences} disabled={saving === 'preferences'} className="rounded-xl bg-[#007AFF] hover:bg-[#0066CC] h-10 px-5 text-xs">
                {saving === 'preferences' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Simpan
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Zona Berbahaya" icon={AlertTriangle}>
          <p className="text-xs text-[#8E8E93] mb-3">Menghapus akun akan menghilangkan semua data dan sertifikatmu secara permanen. Tindakan ini tidak dapat dibatalkan.</p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#FF3B30]">Ketik "HAPUS" untuk konfirmasi</Label>
              <input
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="HAPUS"
                className="w-full h-11 rounded-xl border border-[#E5E5EA] bg-white px-3 text-sm text-[#1C1C1E] outline-none focus:border-[#FF3B30]"
              />
            </div>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== 'HAPUS' || saving === 'delete'}
              className="w-full rounded-xl bg-[#FF3B30] hover:bg-[#D70015] h-10 text-xs text-white disabled:opacity-50"
            >
              {saving === 'delete' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Hapus Akun Saya
            </Button>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
