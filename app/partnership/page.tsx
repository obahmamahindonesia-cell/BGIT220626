'use client'

import { useState } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Building2, BarChart3, Award, HeadphonesIcon, PenSquare, CheckCircle, Mail, Send } from 'lucide-react'

const BENEFITS = [
  { icon: Building2, title: 'Branding Bersama', desc: 'Sertifikat dan laporan dengan co-branding institusi Anda alongside BIGT.' },
  { icon: BarChart3, title: 'Dashboard Institusi', desc: 'Akses dashboard khusus untuk memantau hasil peserta secara real-time.' },
  { icon: Award, title: 'Harga Institusional', desc: 'Skema harga khusus untuk volume besar dengan fleksibilitas penjadwalan.' },
  { icon: HeadphonesIcon, title: 'Dukungan Teknis Prioritas', desc: 'Tim dukungan khusus untuk partner institusi.' },
  { icon: PenSquare, title: 'Kustomisasi Asesmen', desc: 'Sesuaikan konteks soal dan register sesuai kebutuhan spesifik institusi.' },
  { icon: BarChart3, title: 'Laporan Analitik', desc: 'Data agregat dan insight untuk pengambilan keputusan berbasis bukti.' },
]

export default function PartnershipPage() {
  const [form, setForm] = useState({ name: '', email: '', institution: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#123E7C] text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#C9A227] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Kemitraan
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold leading-tight mb-6">Bermitra <span className="text-[#C9A227]">dengan BIGT</span></h1>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">Bergabunglah dengan jaringan institusi global yang telah mempercayai BIGT sebagai mitra asesmen bahasa Indonesia.</p>
        </div>
      </section>

      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#0B1F3A]/10 text-[#0B1F3A] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Keuntungan
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-8">Mengapa bermitra dengan BIGT?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map(b => {
            const Icon = b.icon
            return (
              <div key={b.title} className="bg-white border border-[#E5EAF2] premium-shadow-sm rounded-xl p-6 card-hover">
                <div className="w-10 h-10 rounded-lg bg-[#0B1F3A]/5 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#0B1F3A]" />
                </div>
                <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">{b.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{b.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#0B1F3A]/10 text-[#0B1F3A] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-4">
            <Mail className="w-3.5 h-3.5" /> Hubungi Kami
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-4">Diskusikan kebutuhan institusi Anda</h2>
              <p className="text-[#64748B] text-sm leading-relaxed mb-8">Tim kami akan menghubungi Anda dalam 1-2 hari kerja untuk mendiskusikan skema kemitraan yang sesuai.</p>
              <div className="space-y-4">
                {['Respon cepat dalam 1x24 jam', 'Konsultasi gratis tanpa kewajiban', 'Pendampingan teknis penuh'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-[#64748B]">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl p-6">
              {sent ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-[#0B1F3A] mb-2">Pesan Terkirim!</h3>
                  <p className="text-sm text-[#64748B]">Tim kami akan menghubungi Anda segera.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><label className="text-xs font-medium text-[#0B1F3A] block mb-1">Nama Lengkap</label>
                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Nama Anda" className="rounded-lg border-[#E5EAF2] h-10 text-sm" /></div>
                  <div><label className="text-xs font-medium text-[#0B1F3A] block mb-1">Email</label>
                    <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="nama@institusi.ac.id" className="rounded-lg border-[#E5EAF2] h-10 text-sm" /></div>
                  <div><label className="text-xs font-medium text-[#0B1F3A] block mb-1">Institusi</label>
                    <Input value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} required placeholder="Nama institusi" className="rounded-lg border-[#E5EAF2] h-10 text-sm" /></div>
                  <div><label className="text-xs font-medium text-[#0B1F3A] block mb-1">Pesan</label>
                    <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Ceritakan kebutuhan Anda" className="w-full rounded-lg border border-[#E5EAF2] p-3 text-sm resize-none" /></div>
                  <Button type="submit" className="w-full bg-[#D7193F] hover:bg-[#D7193F]/90 text-white rounded-lg h-10 text-sm">
                    <Send className="w-4 h-4 mr-2" /> Kirim Pesan
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
