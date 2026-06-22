'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PenSquare, BookOpen, BarChart3, Clock, ShieldCheck, Sparkles, ArrowRight, UserCircle } from 'lucide-react'

const TEST_PRODUCTS = [
  { id: 'academic', name: 'BIGT Academic', description: 'Untuk keperluan akademik dan studi lanjut', duration: '120 menit', questions: 50, color: '#0B1F3A' },
  { id: 'professional', name: 'BIGT Professional', description: 'Untuk keperluan karier dan profesional', duration: '90 menit', questions: 40, color: '#123E7C' },
  { id: 'placement', name: 'BIGT Placement', description: 'Untuk penempatan level dan diagnosis awal', duration: '45 menit', questions: 25, color: '#C9A227' },
  { id: 'practice', name: 'BIGT Practice', description: 'Latihan mandiri dengan feedback instan', duration: '30 menit', questions: 15, color: '#D7193F' },
]

export default function TestHubPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [recentSessions, setRecentSessions] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)
      if (data) setRecentSessions(data)
    }
    load()
  }, [])

  const handleStartTest = (product: typeof TEST_PRODUCTS[0]) => {
    setLoading(true)
    router.push(`/test/start?product=${product.id}`)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-[#0B1F3A]">
          Pusat Tes BIGT
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          Pilih jenis tes atau lanjutkan sesi yang tertunda.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {TEST_PRODUCTS.map((product) => (
          <Card key={product.id}
            className="border border-[#E5EAF2] premium-shadow-sm rounded-xl card-hover cursor-pointer"
            onClick={() => handleStartTest(product)}>
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2.5"
                style={{ backgroundColor: product.color + '12' }}>
                <PenSquare className="w-5 h-5" style={{ color: product.color }} />
              </div>
              <CardTitle className="text-sm text-[#0B1F3A]">{product.name}</CardTitle>
              <CardDescription className="text-xs text-[#64748B] leading-relaxed">{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 text-xs text-[#64748B] mb-3">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{product.duration}</span>
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{product.questions} soal</span>
              </div>
              <Button size="sm" className="w-full rounded-lg text-xs h-9 bg-[#D7193F] hover:bg-[#D7193F]/90 text-white">
                Mulai Tes <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-[#E5EAF2] premium-shadow-sm rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
            <BarChart3 className="w-4 h-4" />
            Sesi Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-[#F7F9FC] border border-[#E5EAF2]">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0B1F3A] truncate">
                      {new Date(session.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {session.status === 'completed' ? 'Selesai' : session.status === 'in_progress' ? 'Sedang berjalan' : 'Belum dimulai'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {session.status === 'completed' ? (
                      <Badge className="bg-green-50 text-green-700 border-0 text-xs">{session.overallLevel || '-'}</Badge>
                    ) : session.status === 'in_progress' ? (
                      <Button size="sm" variant="outline" className="rounded-lg border-[#E5EAF2] text-xs h-9 text-[#0B1F3A]"
                        onClick={() => router.push(`/test/${session.id}`)}>
                        Lanjutkan
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <ShieldCheck className="w-12 h-12 text-[#E5EAF2] mx-auto mb-3" />
              <p className="text-sm text-[#64748B]">Belum ada sesi tes. Mulai tes pertama Anda!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-[#0B1F3A] to-[#123E7C] rounded-xl p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-white mb-1">Tes Berbasis AI</h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-xl">
              Tes BIGT menggunakan AI untuk menilai kemampuan writing dan speaking secara otomatis,
              memberikan feedback detail dan rekomendasi belajar yang dipersonalisasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
