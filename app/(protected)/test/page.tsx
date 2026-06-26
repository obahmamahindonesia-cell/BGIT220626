'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import {
  BookOpen, Headphones, Clock, ArrowRight,
  BarChart3, Home, Sparkles, ShieldCheck,
} from 'lucide-react'

const QUICK_LINKS = [
  {
    id: 'test-start',
    label: 'Mulai Ujian BIGT',
    description: 'Pilih level dan mulai ujian otomatis',
    icon: BookOpen,
    color: '#D7193F',
    href: '/test/start',
  },
  {
    id: 'history',
    label: 'Riwayat Tes',
    description: 'Lihat hasil tes sebelumnya',
    icon: BarChart3,
    color: '#123E7C',
    href: '/test/history',
  },
]

export default function TestHubPage() {
  const router = useRouter()
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const res = await fetch('/api/test/history?limit=3')
        const json = await res.json()
        if (json.success) setRecentSessions(json.data || [])
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-[#0B1F3A]">
          Tes BIGT
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          Pilih ujian, sistem akan otomatis menyusun soal sesuai level Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon
          return (
            <Card
              key={link.id}
              className="border border-[#E5EAF2] rounded-2xl shadow-sm cursor-pointer card-hover"
              onClick={() => router.push(link.href)}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: link.color + '12' }}
                >
                  <Icon className="w-6 h-6" style={{ color: link.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0B1F3A]">{link.label}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{link.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#64748B] flex-shrink-0" />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[#0B1F3A] mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Sesi Terakhir
        </h2>
        <Card className="border border-[#E5EAF2] rounded-2xl shadow-sm">
          <CardContent className="p-5">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse mx-auto mb-2" />
                <p className="text-xs text-[#64748B]">Memuat...</p>
              </div>
            ) : recentSessions.length > 0 ? (
              <div className="space-y-2">
                {recentSessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#F7F9FC] border border-[#E5EAF2] cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      if (session.status === 'IN_PROGRESS') {
                        router.push(`/test/${session.id}`)
                      } else {
                        router.push(`/test/${session.id}/results`)
                      }
                    }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0B1F3A] truncate">
                        {session.product || 'Tes'}
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {new Date(session.startedAt).toLocaleDateString('id-ID', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {session.status === 'COMPLETED' ? (
                        <Badge className="bg-[#123E7C]/10 text-[#123E7C] border-0 text-xs">
                          {session.cefrLevel || '-'}
                        </Badge>
                      ) : session.status === 'IN_PROGRESS' ? (
                        <Button size="sm" variant="outline" className="rounded-lg border-[#E5EAF2] text-xs h-9 text-[#0B1F3A]">
                          Lanjutkan
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShieldCheck className="w-10 h-10 text-[#E5EAF2] mx-auto mb-2" />
                <p className="text-sm text-[#64748B]">Belum ada sesi tes</p>
                <Button
                  size="sm"
                  className="mt-3 bg-[#D7193F] hover:bg-[#D7193F]/90 text-white rounded-xl text-xs"
                  onClick={() => router.push('/test/start')}
                >
                  Mulai Ujian <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-[#E5EAF2] rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0B1F3A] to-[#123E7C] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-white mb-1">
                Ujian Otomatis Berbasis Level
              </h3>
              <p className="text-white/60 text-sm leading-relaxed max-w-xl">
                Cukup pilih level ujian yang ingin diikuti. Sistem akan otomatis menyusun jumlah soal,
                memilih Reading dan Listening, serta menyesuaikan tingkat kesulitan sesuai blueprint resmi BIGT.
                Writing dan Speaking akan hadir di versi berikutnya.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
