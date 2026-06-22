'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PenSquare, BookOpen, BarChart3, Clock, ShieldCheck, Sparkles } from 'lucide-react'

const TEST_PRODUCTS = [
  { id: 'academic', name: 'BIGT Academic', description: 'Untuk keperluan akademik dan studi lanjut', duration: '120 menit', questions: 50 },
  { id: 'professional', name: 'BIGT Professional', description: 'Untuk keperluan karier dan profesional', duration: '90 menit', questions: 40 },
  { id: 'placement', name: 'BIGT Placement', description: 'Untuk penempatan level dan diagnosis awal', duration: '45 menit', questions: 25 },
  { id: 'practice', name: 'BIGT Practice', description: 'Latihan mandiri dengan feedback instan', duration: '30 menit', questions: 15 },
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
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#0B3D91]">
          Pusat Tes
        </h1>
        <p className="text-muted-foreground mt-1">Pilih jenis tes atau lanjutkan sesi yang tertunda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TEST_PRODUCTS.map((product) => (
          <Card key={product.id} className="card-hover hover:border-[#0B3D91]/30 cursor-pointer" onClick={() => handleStartTest(product)}>
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-lg bg-[#0B3D91]/10 flex items-center justify-center mb-2">
                {product.id === 'practice' ? <PenSquare className="w-5 h-5 text-[#0B3D91]" /> :
                 product.id === 'placement' ? <BarChart3 className="w-5 h-5 text-[#0B3D91]" /> :
                 <BookOpen className="w-5 h-5 text-[#0B3D91]" />}
              </div>
              <CardTitle className="text-base">{product.name}</CardTitle>
              <CardDescription className="text-xs">{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{product.duration}</span>
              <span className="flex items-center gap-1"><PenSquare className="w-3 h-3" />{product.questions} soal</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0B3D91]" />
            Sesi Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-[#0B3D91]">
                      {new Date(session.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {session.status === 'completed' ? 'Selesai' : session.status === 'in_progress' ? 'Sedang berjalan' : 'Belum dimulai'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {session.status === 'completed' ? (
                      <Badge className="bg-green-100 text-green-700 border-0">{session.overallLevel || '-'}</Badge>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => router.push(`/test/${session.id}`)}>
                        Lanjutkan
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Belum ada sesi tes. Mulai tes pertama Anda!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-[#0B3D91] to-[#1a4a8a] rounded-2xl p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-2">Tes Berbasis AI</h3>
            <p className="text-white/70 text-sm leading-relaxed max-w-xl">
              Tes BIGT menggunakan AI untuk menilai kemampuan writing dan speaking secara otomatis,
              memberikan feedback detail dan rekomendasi belajar yang dipersonalisasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
