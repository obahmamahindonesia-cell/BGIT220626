'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Mail, Sparkles } from 'lucide-react'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal mendaftar')
      }

      toast.success('Berhasil mendaftar waitlist! Kami akan menghubungi Anda.')
      setEmail('')
      setName('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-[#0B3D91] py-20 px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/30 rounded-full" />
      </div>
      <div className="max-w-xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Early Access
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-white font-semibold mb-3">
          Jadilah yang pertama tahu
        </h2>
        <p className="text-white/50 text-sm mb-8">
          Untuk institusi, pendidik, dan individu yang siap menyambut era baru penilaian Bahasa Indonesia.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto flex-wrap justify-center">
          <Input
            type="text"
            placeholder="Nama Anda"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/30 min-w-[140px] flex-1 rounded-xl"
          />
          <Input
            type="email"
            placeholder="Email kamu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/10 border-white/20 text-white placeholder:text-white/30 min-w-[200px] flex-1 rounded-xl"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#E11D48] hover:bg-[#E11D48]/90 text-white px-6 whitespace-nowrap rounded-xl"
          >
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </Button>
        </form>
      </div>
    </section>
  )
}
