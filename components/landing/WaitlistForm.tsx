'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

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
    <section className="bg-[#0B1F3A] py-16 px-6 text-center">
      <div className="max-w-xl mx-auto">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#F8F6F1] font-semibold mb-3">
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
            className="bg-white/8 border-white/20 text-white placeholder:text-white/30 min-w-[140px] flex-1"
          />
          <Input
            type="email"
            placeholder="Email kamu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/8 border-white/20 text-white placeholder:text-white/30 min-w-[200px] flex-1"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#C8102E] hover:bg-red-800 text-white px-6 whitespace-nowrap"
          >
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </Button>
        </form>
      </div>
    </section>
  )
}
