'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface TestHistory {
  id: string
  startedAt: string
  overallLevel: string
  overallScore: number
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('')
  const [lastResult] = useState<{ overallLevel: string; overallScore: number } | null>(null)
  const [history] = useState<TestHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.name) {
        setUserName(user.user_metadata.name)
      } else if (user?.email) {
        setUserName(user.email.split('@')[0])
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Memuat...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#0B1F3A]">
          Selamat datang, {userName}!
        </h1>
        <p className="text-[#6B7280] mt-1">Lanjutkan perjalanan kemahiran Bahasa Indonesia Anda.</p>
      </div>

      {lastResult ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Level Terakhir Anda</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="text-center">
              <Badge className="bg-[#C8102E] text-white text-2xl px-6 py-3 font-bold">
                {lastResult.overallLevel}
              </Badge>
              <p className="text-sm text-[#6B7280] mt-2">Skor: {lastResult.overallScore.toFixed(1)}%</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#6B7280]">
                Anda berada di level <strong className="text-[#0B1F3A]">{lastResult.overallLevel}</strong>.
                Terus tingkatkan kemampuan Anda!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-[#0B1F3A] to-[#1a3a5c] text-white border-0">
          <CardContent className="py-10 text-center">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-3">
              Mulai Test Pertama Anda
            </h2>
            <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
              Ukur kemahiran Bahasa Indonesia Anda dalam 6 dimensi dan dapatkan level CEFR Anda.
            </p>
            <Link href="/test">
              <Button className="bg-[#C8102E] hover:bg-red-800 text-white px-8">
                Mulai Test Sekarang
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold text-[#0B1F3A] mb-4">Riwayat Test</h2>
        {history.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Tanggal</th>
                    <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Level</th>
                    <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Skor</th>
                    <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 px-4">{new Date(item.startedAt).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="border-[#C8102E] text-[#C8102E]">
                          {item.overallLevel}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{item.overallScore.toFixed(1)}%</td>
                      <td className="py-3 px-4">
                        <Link href={`/test/${item.id}/result`} className="text-[#C8102E] hover:underline text-sm">
                          Lihat Hasil
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : (
          <p className="text-[#6B7280] text-sm">Belum ada riwayat test. Mulai test pertama Anda!</p>
        )}
      </div>
    </div>
  )
}
