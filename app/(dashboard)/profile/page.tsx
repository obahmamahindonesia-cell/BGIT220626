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
  Flag,
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
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Profil berhasil diperbarui')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#0B3D91]">
          Profil
        </h1>
        <p className="text-muted-foreground mt-1">Kelola informasi akun dan preferensi Anda.</p>
      </div>

      <Card className="border-0 premium-shadow-md rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0B3D91] to-[#1a4a8a] px-8 py-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center border-2 border-white/30">
              <UserCircle className="w-10 h-10 text-white" />
            </div>
            <div className="text-white">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">{name || 'Pengguna BIGT'}</h2>
              <p className="text-white/70 text-sm mt-1 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
              <div className="flex gap-2 mt-3">
                {country && <Badge className="bg-white/15 text-white border-0 text-[10px] flex items-center gap-1"><MapPin className="w-3 h-3" />{country}</Badge>}
                {nativeLanguage && <Badge className="bg-white/15 text-white border-0 text-[10px] flex items-center gap-1"><Globe className="w-3 h-3" />{nativeLanguage}</Badge>}
                {targetLevel && <Badge className="bg-[#D4AF37] text-white border-0 text-[10px] flex items-center gap-1"><Target className="w-3 h-3" />Target: {targetLevel}</Badge>}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 premium-shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-[#0B3D91]" />
                Informasi Pribadi
              </CardTitle>
              <CardDescription className="text-xs">Informasi dasar akun BIGT Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Nama Lengkap</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama lengkap Anda"
                      className="rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Email</Label>
                    <Input value={user?.email || ''} disabled className="rounded-xl bg-gray-50 border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Negara</Label>
                    <Input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Indonesia"
                      className="rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Bahasa Pertama</Label>
                    <Input
                      value={nativeLanguage}
                      onChange={(e) => setNativeLanguage(e.target.value)}
                      placeholder="Bahasa Indonesia"
                      className="rounded-xl border-gray-200"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={saving} className="bg-[#0B3D91] hover:bg-[#0B3D91]/90 text-white rounded-xl">
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-0 premium-shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Preferensi Belajar
              </CardTitle>
              <CardDescription className="text-xs">Target dan preferensi pembelajaran Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-medium flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-[#0B3D91]" />
                    Target Level BIGT
                  </Label>
                  <div className="grid grid-cols-6 gap-2">
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setTargetLevel(targetLevel === level ? '' : level)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          targetLevel === level
                            ? 'border-[#0B3D91] bg-[#0B3D91]/5 text-[#0B3D91]'
                            : 'border-gray-200 hover:border-gray-300 text-gray-500'
                        }`}
                      >
                        <div className="text-sm font-bold">{level}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleUpdate} disabled={saving} className="bg-[#0B3D91] hover:bg-[#0B3D91]/90 text-white rounded-xl">
                  Simpan Target
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 premium-shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0B3D91]" />
                Keamanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-between rounded-xl">
                <span className="flex items-center gap-2 text-xs"><Lock className="w-3.5 h-3.5" />Ubah Password</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" className="w-full justify-between rounded-xl">
                <span className="flex items-center gap-2 text-xs"><Clock className="w-3.5 h-3.5" />Riwayat Login</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 premium-shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                Sertifikat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-[#D4AF37]" />
                  <div>
                    <p className="text-sm font-medium text-[#0B3D91]">BIGT Level B1</p>
                    <p className="text-[10px] text-muted-foreground">Diterbitkan 15 Jun 2026</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full rounded-xl text-xs">
                Lihat Semua Sertifikat
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 premium-shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-[#0B3D91]" />
                Prestasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#F8FAFC] text-center">
                  <BookOpen className="w-5 h-5 text-[#0B3D91] mx-auto mb-1" />
                  <p className="text-[10px] font-medium text-[#0B3D91]">First Test</p>
                  <p className="text-[8px] text-muted-foreground">Selesaikan tes pertama</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] text-center">
                  <Award className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                  <p className="text-[10px] font-medium text-[#0B3D91]">Level Up</p>
                  <p className="text-[8px] text-muted-foreground">Naik ke level B1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
