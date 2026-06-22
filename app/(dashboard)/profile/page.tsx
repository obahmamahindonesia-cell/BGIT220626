'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string } } | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setName(user?.user_metadata?.name || '')
      setLoading(false)
    }
    loadUser()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ data: { name } })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Profil berhasil diperbarui')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Memuat...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#0B1F3A]">
          Profil
        </h1>
        <p className="text-[#6B7280] mt-1">Kelola informasi akun Anda.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap Anda"
              />
            </div>
            <Button type="submit" className="bg-[#C8102E] hover:bg-red-800 text-white">
              Simpan Perubahan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
