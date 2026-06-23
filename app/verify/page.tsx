'use client'

import { useState } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, Search, Award, Calendar, Hash, CheckCircle, XCircle, Sparkles } from 'lucide-react'

interface VerifyResult {
  found: boolean; name?: string; level?: string; product?: string; date?: string; certificateId?: string
}

export default function VerifyPage() {
  const [certId, setCertId] = useState('')
  const [name, setName] = useState('')
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleVerify = () => {
    if (!certId.trim() || !name.trim()) return
    setLoading(true)
    setTimeout(() => {
      if (certId.trim().toUpperCase() === 'BIGT-2026-001234' && name.trim().toLowerCase().includes('sari')) {
        setResult({ found: true, name: 'Ni Putu Sari', level: 'B2', product: 'BIGT Akademik', date: '15 Juni 2026', certificateId: 'BIGT-2026-001234' })
      } else {
        setResult({ found: false, certificateId: certId.trim().toUpperCase() })
      }
      setLoading(false)
    }, 800)
  }

  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#123E7C] text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#C9A227] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Verifikasi Sertifikat
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold leading-tight mb-6">Verifikasi <span className="text-[#C9A227]">Sertifikat BIGT</span></h1>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">Masukkan Certificate ID atau scan QR code untuk memvalidasi keaslian sertifikat BIGT secara instan.</p>
        </div>
      </section>

      <section className="py-16 px-6 max-w-lg mx-auto">
        <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0B1F3A] flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" />Certificate ID</label>
              <Input value={certId} onChange={e => setCertId(e.target.value)} placeholder="Contoh: BIGT-2026-001234" className="rounded-lg border-[#E5EAF2] h-11 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0B1F3A] flex items-center gap-1.5"><Award className="w-3.5 h-3.5" />Nama Peserta</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nama lengkap peserta" className="rounded-lg border-[#E5EAF2] h-11 text-sm" />
            </div>
            <Button onClick={handleVerify} disabled={loading || !certId.trim() || !name.trim()}
              className="w-full bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white rounded-lg h-11 text-sm">
              <Search className="w-4 h-4 mr-2" /> {loading ? 'Memverifikasi...' : 'Verifikasi'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className={`mt-6 border rounded-xl ${result.found ? 'border-green-200' : 'border-red-200'}`}>
            <CardContent className="p-6">
              {result.found ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-5 h-5" /><span className="font-semibold text-sm">Sertifikat Valid</span></div>
                  <div className="border-t border-[#E5EAF2] pt-4 space-y-2">
                    {[{ icon: Award, label: 'Nama', value: result.name }, { icon: ShieldCheck, label: 'Level', value: result.level }, { icon: Hash, label: 'ID', value: result.certificateId }, { icon: Calendar, label: 'Tanggal', value: result.date }].map((item, i) => {
                      const Icon = item.icon
                      return (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <Icon className="w-4 h-4 text-[#64748B] flex-shrink-0" />
                          <span className="text-[#64748B]">{item.label}:</span>
                          <span className="font-medium text-[#0B1F3A]">{item.value}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="font-semibold text-[#0B1F3A] mb-1">Sertifikat Tidak Ditemukan</p>
                  <p className="text-sm text-[#64748B]">Certificate ID "{result.certificateId}" tidak ditemukan. Periksa kembali ID yang dimasukkan.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </section>
    </PublicLayout>
  )
}
