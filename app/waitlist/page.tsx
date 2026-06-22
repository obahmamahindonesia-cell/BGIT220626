'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { Mail, Sparkles, Users, Zap, Clock, CheckCircle } from 'lucide-react'

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    role: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSubmitted(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Early Access
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-[#0B3D91] mb-3">
              Gabung Waitlist BIGT
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Dapatkan akses awal ke platform asesmen Bahasa Indonesia berbasis AI generasi baru.
            </p>
          </div>

          {submitted ? (
            <Card className="border-0 premium-shadow-lg rounded-2xl max-w-lg mx-auto">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#0B3D91] mb-2">
                  Anda Terdaftar!
                </h2>
                <p className="text-muted-foreground text-sm">
                  Kami akan mengirimkan update ke {formData.email}.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="md:col-span-3">
                <Card className="border-0 premium-shadow-md rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-base">Form Pendaftaran</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-[#0B3D91] mb-1.5 block">Nama Lengkap</label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Nama lengkap Anda"
                          required
                          className="rounded-xl border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#0B3D91] mb-1.5 block">Email</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="nama@email.com"
                          required
                          className="rounded-xl border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#0B3D91] mb-1.5 block">Institusi (Opsional)</label>
                        <Input
                          value={formData.institution}
                          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                          placeholder="Nama universitas/sekolah/instansi"
                          className="rounded-xl border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#0B3D91] mb-1.5 block">Peran (Opsional)</label>
                        <Input
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          placeholder="Mahasiswa, pengajar, profesional, dll."
                          className="rounded-xl border-gray-200"
                        />
                      </div>
                      <Button type="submit" disabled={loading} className="w-full bg-[#0B3D91] hover:bg-[#0B3D91]/90 text-white rounded-xl h-11">
                        {loading ? 'Memproses...' : 'Daftar Sekarang'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2 space-y-4">
                <Card className="border-0 premium-shadow-md rounded-2xl card-hover">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 rounded-xl bg-[#0B3D91]/10 flex items-center justify-center mb-3">
                      <Zap className="w-5 h-5 text-[#0B3D91]" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#0B3D91] mb-1">Akses Awal</h3>
                    <p className="text-xs text-muted-foreground">Jadi yang pertama mencoba platform BIGT.</p>
                  </CardContent>
                </Card>

                <Card className="border-0 premium-shadow-md rounded-2xl card-hover">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#0B3D91] mb-1">Harga Spesial</h3>
                    <p className="text-xs text-muted-foreground">Dapatkan penawaran khusus untuk member waitlist.</p>
                  </CardContent>
                </Card>

                <Card className="border-0 premium-shadow-md rounded-2xl card-hover">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#0B3D91] mb-1">Update Berkala</h3>
                    <p className="text-xs text-muted-foreground">Dapatkan informasi terbaru tentang perkembangan BIGT.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
