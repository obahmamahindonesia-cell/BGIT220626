'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PenSquare, BookOpen, BarChart3, Clock, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

const TEST_PRODUCTS = [
  { id: 'academic', name: 'BIGT Akademik', description: 'Untuk keperluan akademik dan studi lanjut', duration: '120 menit', questions: 50, color: '#0B1F3A' },
  { id: 'professional', name: 'BIGT Profesional', description: 'Untuk keperluan karier dan lingkungan kerja', duration: '90 menit', questions: 40, color: '#123E7C' },
  { id: 'placement', name: 'BIGT Penempatan', description: 'Untuk diagnosis awal dan penempatan level', duration: '45 menit', questions: 25, color: '#C9A227' },
  { id: 'practice', name: 'BIGT Latihan', description: 'Latihan mandiri dengan umpan balik instan', duration: '30 menit', questions: 15, color: '#D7193F' },
]

export default function TestHubPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { t } = useI18n()
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
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-[#0B1F3A]">
          {t('testHub.title')}
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          {t('testHub.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {TEST_PRODUCTS.map((product, index) => (
          <Card key={product.id}
            className="border border-[#E5EAF2] rounded-2xl shadow-sm card-hover cursor-pointer flex flex-col"
            onClick={() => handleStartTest(product)}>
            <CardHeader className="pb-4 px-6 pt-6">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: product.color + '12' }}>
                <PenSquare className="w-[22px] h-[22px]" style={{ color: product.color }} />
              </div>
              <CardTitle className="text-sm font-semibold text-[#0B1F3A]">{t(`testHub.products.${index}.name`)}</CardTitle>
              <CardDescription className="text-xs text-[#64748B] leading-relaxed mt-1">{t(`testHub.products.${index}.desc`)}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-between flex-1 px-6 pb-6">
              <div className="flex items-center gap-4 text-xs text-[#64748B] mb-5">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{product.duration}</span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{product.questions} soal</span>
              </div>
              <Button size="sm" className="w-full rounded-xl text-xs h-10 bg-[#D7193F] hover:bg-[#D7193F]/90 text-white mt-auto font-medium">
                {t('testHub.startTest')} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-[#E5EAF2] rounded-2xl shadow-sm">
        <CardHeader className="pb-5 px-6 pt-6">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B1F3A]">
            <BarChart3 className="w-4 h-4" />
            {t('testHub.lastSession')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-[#F7F9FC] border border-[#E5EAF2]">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0B1F3A] truncate">
                      {new Date(session.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {session.status === 'completed' ? t('common.done') : session.status === 'in_progress' ? t('common.inProgress') : t('common.notStarted')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {session.status === 'completed' ? (
                      <Badge className="bg-[#123E7C]/10 text-[#123E7C] border-0 text-xs">{session.overallLevel || '-'}</Badge>
                    ) : session.status === 'in_progress' ? (
                      <Button size="sm" variant="outline" className="rounded-lg border-[#E5EAF2] text-xs h-9 text-[#0B1F3A]"
                        onClick={() => router.push(`/test/${session.id}`)}>
                        {t('testHub.resume')}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShieldCheck className="w-12 h-12 text-[#E5EAF2] mx-auto mb-3" />
              <p className="text-sm text-[#64748B]">{t('testHub.noSessions')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-[#E5EAF2] rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#0B1F3A] to-[#123E7C] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-white mb-1">{t('testHub.aiTitle')}</h3>
              <p className="text-white/60 text-sm leading-relaxed max-w-xl">
                {t('testHub.aiDesc')}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
