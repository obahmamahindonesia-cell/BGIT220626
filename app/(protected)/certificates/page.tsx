'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FileText, GraduationCap, Loader2, AlertCircle, Download, Award, ChevronRight, ExternalLink, RotateCcw, Play } from 'lucide-react'

interface CertificateResult {
  overallLevel: string
  overallScore: number
  listeningScore: number
  readingScore: number
  speakingScore: number
  writingScore: number
  mediationScore: number
  integratedScore: number
}

interface CertificateItem {
  id: string
  certificateId: string
  overallLevel: string
  overallScore: number
  issuedAt: string
  qrCodeUrl: string | null
  pdfUrl: string | null
  isActive: boolean
  result: CertificateResult | null
}

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-blue-50 text-blue-700 border-blue-200',
  A2: 'bg-green-50 text-green-700 border-green-200',
  B1: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  B2: 'bg-orange-50 text-orange-700 border-orange-200',
  C1: 'bg-red-50 text-red-700 border-red-200',
  C2: 'bg-purple-50 text-purple-700 border-purple-200',
}

const SKILL_LABELS: Record<string, string> = {
  listeningScore: 'Menyimak',
  readingScore: 'Membaca',
  speakingScore: 'Berbicara',
  writingScore: 'Menulis',
  mediationScore: 'Mediasi',
  integratedScore: 'Terpadu',
}

export default function CertificatesPage() {
  const router = useRouter()
  const [certificates, setCertificates] = useState<CertificateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCertificates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/certificates')
      if (res.status === 401) { router.replace('/login'); return }
      const json = await res.json()
      if (!json.success) { setError(json.error || 'Gagal memuat sertifikat.'); setLoading(false); return }
      setCertificates(json.data)
    } catch {
      setError('Terjadi kesalahan saat memuat data.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchCertificates() }, [fetchCertificates])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-72 bg-gray-200 rounded" />
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-[#E5E5EA] p-6">
              <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-48 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-red-700 mb-2">Gagal Memuat Data</h2>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Button onClick={fetchCertificates} variant="outline" className="rounded-xl">
            <RotateCcw className="w-4 h-4 mr-2" /> Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Sertifikat Saya</h1>
        <p className="text-sm text-[#8E8E93] mt-1">
          {certificates.length > 0
            ? `${certificates.length} sertifikat yang telah diterbitkan`
            : 'Selesaikan tes BIGT untuk memperoleh sertifikat digital'}
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center">
          <Award className="w-16 h-16 text-[#C7C7CC] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1C1C1E] mb-2">Belum Ada Sertifikat</h3>
          <p className="text-sm text-[#8E8E93] mb-6 max-w-sm mx-auto">
            Selesaikan tes BIGT dan dapatkan sertifikat digital yang dapat diverifikasi untuk menunjukkan kemampuan bahasa Indonesiamu.
          </p>
          <Button onClick={() => router.push('/test/start')} className="rounded-xl bg-[#007AFF] hover:bg-[#0066CC] h-11 px-6">
            <Play className="w-4 h-4 mr-2" /> Mulai Tes
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map(cert => (
            <div key={cert.id} className="bg-white rounded-2xl border border-[#E5E5EA] p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C9A227] to-[#E8C84A] flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#1C1C1E]">Sertifikat BIGT</h3>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${LEVEL_COLORS[cert.overallLevel] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {cert.overallLevel}
                      </span>
                    </div>
                    <p className="text-xs text-[#8E8E93] mt-0.5">
                      ID: {cert.certificateId} &middot; Terbit: {new Date(cert.issuedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/verify/${cert.certificateId}`, '_blank')}
                    className="rounded-xl h-9 text-xs border-[#E5E5EA]"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" /> Verifikasi
                  </Button>
                  <ChevronRight className="w-5 h-5 text-[#C7C7CC]" />
                </div>
              </div>

              {cert.result && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {Object.entries(SKILL_LABELS).map(([key, label]) => {
                    const score = cert.result![key as keyof CertificateResult] as number
                    return (
                      <div key={key} className="bg-[#F2F2F7] rounded-xl px-3 py-2 text-center">
                        <p className="text-[10px] text-[#8E8E93] uppercase tracking-wide">{label}</p>
                        <p className="text-sm font-bold text-[#1C1C1E] mt-0.5">{Math.round(score)}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
