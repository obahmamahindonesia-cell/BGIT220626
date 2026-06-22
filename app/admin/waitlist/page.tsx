'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface WaitlistEntry {
  id: string
  name: string
  email: string
  institution: string | null
  role: string | null
  status: string
  createdAt: string
  invitedAt: string | null
}

export default function AdminWaitlistPage() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWaitlist()
  }, [])

  const fetchWaitlist = async () => {
    try {
      const res = await fetch('/api/admin/waitlist')
      const data = await res.json()
      setWaitlist(data.waitlist)
    } catch (err) {
      console.error('Error fetching waitlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (id: string) => {
    if (!confirm('Send invitation to this user?')) return

    try {
      await fetch(`/api/admin/waitlist/${id}/invite`, { method: 'POST' })
      fetchWaitlist()
    } catch (err) {
      console.error('Error sending invitation:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'INVITED': return 'bg-blue-100 text-blue-800'
      case 'REGISTERED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]"></div>
        <p className="mt-4 text-gray-600">Loading waitlist...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B1F3A] mb-2">Waitlist Management</h1>
        <p className="text-gray-600">Manage waitlist entries and send invitations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Waitlist Entries ({waitlist.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {waitlist.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No waitlist entries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitlist.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#0B1F3A]">{entry.name}</h3>
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{entry.email}</p>
                      {entry.institution && (
                        <p className="text-xs text-gray-500">
                          {entry.institution} {entry.role && `• ${entry.role}`}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Joined {new Date(entry.createdAt).toLocaleDateString('id-ID')}
                        {entry.invitedAt && ` • Invited ${new Date(entry.invitedAt).toLocaleDateString('id-ID')}`}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {entry.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => handleInvite(entry.id)}
                          className="bg-[#C8102E] hover:bg-red-800 text-white"
                        >
                          Send Invite
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
