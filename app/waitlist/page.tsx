'use client'

import { useState } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PageMeta from '@/components/PageMeta'
import { Mail, Sparkles, Users, Zap, CheckCircle } from 'lucide-react'

export default function WaitlistPage() {
  const [formData, setFormData] = useState({ name: '', email: '', institution: '', role: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
      })
      if (res.ok) setSubmitted(true)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  return (
    <PublicLayout>
      <PageMeta title="Gabung Waitlist BIGT" description="Gabung waitlist BIGT dan jadilah bagian awal dari standar kemahiran Bahasa Indonesia untuk dunia." />
      <section className="bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#123E7C] text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#C9A227] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Early Access
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold leading-tight mb-6">Gabung <span className="text-[#C9A227]">Waitlist BIGT</span></h1>
          <p className="text-white/50 text-base md:text-lg max-w-lg mx-auto">Dapatkan akses awal ke platform asesmen Bahasa Indonesia berbasis AI generasi baru.</p>
        </div>
      </section>

      <section className="py-16 px-6 max-w-4xl mx-auto">
        {submitted ? (
          <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#0B1F3A] mb-2">Anda Terdaftar!</h2>
              <p className="text-[#64748B] text-sm">Kami akan mengirimkan update ke {formData.email}.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3">
              <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl">
                <CardHeader className="pb-4"><CardTitle className="text-base text-[#0B1F3A]">Form Pendaftaran</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="text-xs font-medium text-[#0B1F3A] block mb-1">Nama Lengkap</label>
                      <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nama lengkap Anda" required className="rounded-lg border-[#E5EAF2] h-11 text-sm" /></div>
                    <div><label className="text-xs font-medium text-[#0B1F3A] block mb-1">Email</label>
                      <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="nama@email.com" required className="rounded-lg border-[#E5EAF2] h-11 text-sm" /></div>
                    <div><label className="text-xs font-medium text-[#0B1F3A] block mb-1">Institusi (Opsional)</label>
                      <Input value={formData.institution} onChange={e => setFormData({ ...formData, institution: e.target.value })} placeholder="Nama universitas/sekolah/instansi" className="rounded-lg border-[#E5EAF2] h-11 text-sm" /></div>
                    <div><label className="text-xs font-medium text-[#0B1F3A] block mb-1">Peran (Opsional)</label>
                      <Input value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="Mahasiswa, pengajar, profesional, dll." className="rounded-lg border-[#E5EAF2] h-11 text-sm" /></div>
                    <Button type="submit" disabled={loading} className="w-full bg-[#D7193F] hover:bg-[#D7193F]/90 text-white rounded-lg h-11 text-sm">
                      {loading ? 'Memproses...' : 'Daftar Sekarang'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2 space-y-4">
              {[
                { icon: Zap, title: 'Akses Awal', desc: 'Jadi yang pertama mencoba platform BIGT.', color: '#0B1F3A', bg: 'bg-[#0B1F3A]/5' },
                { icon: Users, title: 'Harga Spesial', desc: 'Dapatkan penawaran khusus untuk member waitlist.', color: '#C9A227', bg: 'bg-[#C9A227]/10' },
                { icon: Mail, title: 'Update Berkala', desc: 'Dapatkan informasi terbaru tentang perkembangan BIGT.', color: '#D7193F', bg: 'bg-[#D7193F]/5' },
              ].map(item => {
                const Icon = item.icon
                return (
                  <Card key={item.title} className="border border-[#E5EAF2] premium-shadow-sm rounded-xl card-hover">
                    <CardContent className="p-5">
                      <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <h3 className="text-sm font-semibold text-[#0B1F3A] mb-1">{item.title}</h3>
                      <p className="text-xs text-[#64748B]">{item.desc}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </section>
    </PublicLayout>
  )
}
