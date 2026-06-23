'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
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
        <div className="h-8 w-40 bg-gray-100 rounded-lg" />
        <div className="h-36 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-[#0B1F3A]">Profil</h1>
        <p className="text-[#64748B] text-sm mt-1">Kelola informasi akun dan preferensi Anda.</p>
      </div>

      <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0B1F3A] to-[#123E7C] px-6 md:px-8 py-6">
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
                {country && <Badge className="bg-white/10 text-white border-0 text-[10px] flex items-center gap-1 font-normal"><MapPin className="w-3 h-3" />{country}</Badge>}
                {nativeLanguage && <Badge className="bg-white/10 text-white border-0 text-[10px] flex items-center gap-1 font-normal"><Globe className="w-3 h-3" />{nativeLanguage}</Badge>}
                {targetLevel && <Badge className="bg-[#C9A227]/20 text-[#C9A227] border-0 text-[10px] flex items-center gap-1 font-medium"><Target className="w-3 h-3" />Target: {targetLevel}</Badge>}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
                <UserCircle className="w-4 h-4" />
                Informasi Pribadi
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B]">Informasi dasar akun BIGT Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#0B1F3A]">Nama Lengkap</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Nama lengkap Anda"
                      className="rounded-lg border-[#E5EAF2] h-11 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#0B1F3A]">Email</Label>
                    <Input value={user?.email || ''} disabled
                      className="rounded-lg bg-gray-50 border-[#E5EAF2] h-11 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#0B1F3A]">Negara</Label>
                    <Input value={country} onChange={(e) => setCountry(e.target.value)}
                      placeholder="Indonesia"
                      className="rounded-lg border-[#E5EAF2] h-11 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#0B1F3A]">Bahasa Pertama</Label>
                    <Input value={nativeLanguage} onChange={(e) => setNativeLanguage(e.target.value)}
                      placeholder="Bahasa Indonesia"
                      className="rounded-lg border-[#E5EAF2] h-11 text-sm" />
                  </div>
                </div>
                <Button type="submit" disabled={saving}
                  className="bg-[#D7193F] hover:bg-[#D7193F]/90 text-white rounded-lg h-10 text-sm">
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
                <Sparkles className="w-4 h-4 text-[#C9A227]" />
                Preferensi Belajar
              </CardTitle>
              <CardDescription className="text-xs text-[#64748B]">Target dan preferensi pembelajaran Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-[#0B1F3A] flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" />
                    Target Level BIGT
                  </Label>
                  <div className="grid grid-cols-6 gap-2">
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
                      <button key={level} type="button"
                        onClick={() => setTargetLevel(targetLevel === level ? '' : level)}
                        className={`p-2.5 rounded-lg border text-center transition-all text-xs font-bold ${
                          targetLevel === level
                            ? 'border-[#0B1F3A] bg-[#0B1F3A]/5 text-[#0B1F3A]'
                            : 'border-[#E5EAF2] hover:border-gray-300 text-[#64748B]'
                        }`}>
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleUpdate} disabled={saving}
                  className="bg-[#D7193F] hover:bg-[#D7193F]/90 text-white rounded-lg h-10 text-sm">
                  Simpan Target
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
                <Lock className="w-4 h-4" />
                Keamanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-between rounded-lg border-[#E5EAF2] h-10">
                <span className="flex items-center gap-2 text-xs text-[#0B1F3A]"><Lock className="w-3.5 h-3.5" />Ubah Kata Sandi</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
              </Button>
              <Button variant="outline" className="w-full justify-between rounded-lg border-[#E5EAF2] h-10">
                <span className="flex items-center gap-2 text-xs text-[#0B1F3A]"><Clock className="w-3.5 h-3.5" />Riwayat Masuk</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
                <Award className="w-4 h-4 text-[#C9A227]" />
                Sertifikat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-gradient-to-r from-[#C9A227]/5 to-yellow-50/50 border border-[#C9A227]/20 mb-3">
                <div className="flex items-center gap-3">
                  <Award className="w-7 h-7 text-[#C9A227] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0B1F3A]">BIGT Level B1</p>
                    <p className="text-[11px] text-[#64748B]">Diterbitkan 15 Jun 2026</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full rounded-lg border-[#E5EAF2] text-xs h-10 text-[#0B1F3A]">
                Lihat Semua Sertifikat
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
                <Award className="w-4 h-4" />
                Prestasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#F7F9FC] border border-[#E5EAF2] text-center">
                  <BookOpen className="w-5 h-5 text-[#0B1F3A] mx-auto mb-1.5" />
                  <p className="text-[11px] font-medium text-[#0B1F3A]">Tes Pertama</p>
                  <p className="text-[9px] text-[#64748B]">Selesaikan tes pertama</p>
                </div>
                <div className="p-3 rounded-lg bg-[#F7F9FC] border border-[#E5EAF2] text-center">
                  <Award className="w-5 h-5 text-[#C9A227] mx-auto mb-1.5" />
                  <p className="text-[11px] font-medium text-[#0B1F3A]">Naik Level</p>
                  <p className="text-[9px] text-[#64748B]">Naik ke level B1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
