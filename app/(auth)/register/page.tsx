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

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } },
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Registrasi berhasil! Silakan cek email untuk verifikasi.')
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#0B1F3A] inline-block mb-4">BIGT</Link>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#0B1F3A]">Buat Akun</h1>
          <p className="text-[#64748B] text-sm mt-1">Mulai perjalanan kemahiran Bahasa Indonesia Anda</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium text-[#0B1F3A]">Nama Lengkap</Label>
            <Input id="name" type="text" placeholder="Nama lengkap Anda"
              value={name} onChange={(e) => setName(e.target.value)} required
              className="rounded-lg border-[#E5EAF2] h-11 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-[#0B1F3A]">Email</Label>
            <Input id="email" type="email" placeholder="nama@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required
              className="rounded-lg border-[#E5EAF2] h-11 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-[#0B1F3A]">Password</Label>
            <Input id="password" type="password" placeholder="Minimal 8 karakter"
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
              className="rounded-lg border-[#E5EAF2] h-11 text-sm" />
          </div>
          <Button type="submit" disabled={loading}
            className="w-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white rounded-lg h-11 text-sm">
            {loading ? 'Memproses...' : 'Daftar'}
          </Button>
        </form>
        <div className="mt-6 p-4 rounded-lg bg-[#0B1F3A]/5 border border-[#0B1F3A]/10 text-center">
          <p className="text-xs text-[#0B1F3A]/70">
            Dengan mendaftar, Anda bergabung dengan{' '}
            <span className="font-semibold">BIGT — Standar Kemahiran Bahasa Indonesia untuk Dunia</span>
          </p>
        </div>
        <p className="text-center text-sm text-[#64748B] mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-[#0B1F3A] hover:underline font-medium">Masuk di sini</Link>
        </p>
      </div>
    </div>
  )
}
