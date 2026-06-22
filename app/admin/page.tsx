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
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B1F3A] mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of BIGT platform statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0B1F3A]">{stats.totalQuestions}</div>
            <p className="text-xs text-gray-500 mt-1">In item bank</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0B1F3A]">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Test Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0B1F3A]">{stats.totalSessions}</div>
            <p className="text-xs text-gray-500 mt-1">Completed tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Waitlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#0B1F3A]">{stats.waitlistCount}</div>
            <p className="text-xs text-gray-500 mt-1">Pending invitations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/admin/questions/new"
              className="block p-4 bg-[#F8F6F1] rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-semibold text-[#0B1F3A]">Add New Question</div>
              <div className="text-sm text-gray-600">Create a new question for the item bank</div>
            </a>
            <a
              href="/admin/waitlist"
              className="block p-4 bg-[#F8F6F1] rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-semibold text-[#0B1F3A]">Manage Waitlist</div>
              <div className="text-sm text-gray-600">Review and invite waitlist members</div>
            </a>
            <a
              href="/admin/certificates"
              className="block p-4 bg-[#F8F6F1] rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="font-semibold text-[#0B1F3A]">View Certificates</div>
              <div className="text-sm text-gray-600">Manage issued certificates</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No recent activity to display</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
