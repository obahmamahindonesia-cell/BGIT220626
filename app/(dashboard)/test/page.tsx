'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function TestCatalogPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleStartTest = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/test/start', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal memulai test')
      }
      const { sessionId } = await res.json()
      router.push(`/test/${sessionId}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#0B1F3A]">
          Katalog Test
        </h1>
        <p className="text-[#6B7280] mt-1">Pilih dan mulai test kemahiran Bahasa Indonesia Anda.</p>
      </div>

      <Card className="border-2 border-[#C9A84C]/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl">BGIT Standard Test</CardTitle>
            <Badge className="bg-[#C9A84C] text-[#0B1F3A] text-xs font-bold">MVP</Badge>
          </div>
          <CardDescription className="text-base">
            Test komprehensif mengukur 6 dimensi kemahiran Bahasa Indonesia dengan standar CEFR.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-[#F8F6F1] rounded-lg">
              <div className="text-2xl font-bold text-[#0B1F3A]">30</div>
              <div className="text-xs text-[#6B7280]">Soal</div>
            </div>
            <div className="text-center p-3 bg-[#F8F6F1] rounded-lg">
              <div className="text-2xl font-bold text-[#0B1F3A]">~30</div>
              <div className="text-xs text-[#6B7280]">Menit</div>
            </div>
            <div className="text-center p-3 bg-[#F8F6F1] rounded-lg">
              <div className="text-2xl font-bold text-[#0B1F3A]">6</div>
              <div className="text-xs text-[#6B7280]">Dimensi</div>
            </div>
            <div className="text-center p-3 bg-[#F8F6F1] rounded-lg">
              <div className="text-2xl font-bold text-[#0B1F3A]">A1-C2</div>
              <div className="text-xs text-[#6B7280]">CEFR</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Menyimak', 'Membaca', 'Berbicara', 'Menulis', 'Mediasi', 'Terintegrasi'].map((dim) => (
              <Badge key={dim} variant="outline" className="text-xs">
                {dim}
              </Badge>
            ))}
          </div>
          <Button
            onClick={handleStartTest}
            disabled={loading}
            className="w-full bg-[#C8102E] hover:bg-red-800 text-white py-3 text-base font-semibold"
          >
            {loading ? 'Memulai...' : 'Mulai Test'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
