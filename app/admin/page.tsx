'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalUsers: 0,
    totalSessions: 0,
    waitlistCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching stats:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]"></div>
        <p className="mt-4 text-gray-600">Memuat dasbor...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B1F3A] mb-2">Dasbor</h1>
        <p className="text-gray-600">Ringkasan statistik platform BIGT</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Soal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0B1F3A]">{stats.totalQuestions}</div>
            <p className="text-xs text-gray-500 mt-1">Di bank soal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pengguna</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0B1F3A]">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Pengguna terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Sesi Tes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0B1F3A]">{stats.totalSessions}</div>
            <p className="text-xs text-gray-500 mt-1">Tes selesai</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Daftar Tunggu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0B1F3A]">{stats.waitlistCount}</div>
            <p className="text-xs text-gray-500 mt-1">Undangan tertunda</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tindakan Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/admin/questions/new"
              className="block p-4 bg-[#F8F6F1] rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-semibold text-[#0B1F3A]">Tambah Soal Baru</div>
              <div className="text-sm text-gray-600">Buat soal baru untuk bank soal</div>
            </a>
            <a
              href="/admin/waitlist"
              className="block p-4 bg-[#F8F6F1] rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-semibold text-[#0B1F3A]">Kelola Daftar Tunggu</div>
              <div className="text-sm text-gray-600">Tinjau dan undang anggota daftar tunggu</div>
            </a>
            <a
              href="/admin/certificates"
              className="block p-4 bg-[#F8F6F1] rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-semibold text-[#0B1F3A]">Lihat Sertifikat</div>
              <div className="text-sm text-gray-600">Kelola sertifikat yang diterbitkan</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Belum ada aktivitas terbaru</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
