'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Question {
  id: string
  dimension: string
  skill: string
  type: string
  level: string
  difficulty: number
  points: number
  isActive: boolean
  tags: string[]
  content: any
  createdAt: string
  _count?: { answers: number }
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  useEffect(() => {
    fetchQuestions()
  }, [page])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/questions?page=${page}&limit=${limit}`)
      const data = await res.json()
      setQuestions(data.questions)
      setTotal(data.pagination.total)
    } catch (err) {
      console.error('Error fetching questions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
      fetchQuestions()
    } catch (err) {
      console.error('Error deleting question:', err)
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]"></div>
        <p className="mt-4 text-gray-600">Loading questions...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3A] mb-2">Item Bank</h1>
          <p className="text-gray-600">Manage assessment questions</p>
        </div>
        <Link href="/admin/questions/new">
          <Button className="bg-[#C8102E] hover:bg-red-800 text-white">
            + Add Question
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No questions found. Create your first question to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {q.dimension}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {q.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {q.type}
                        </Badge>
                        {!q.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {q.content?.prompt || 'No prompt'}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Skill: {q.skill}</span>
                        <span>Difficulty: {q.difficulty}/5</span>
                        <span>Points: {q.points}</span>
                        {q._count && <span>Used: {q._count.answers}x</span>}
                      </div>
                      {q.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {q.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-[#C9A84C]/20 text-[#0B1F3A] px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link href={`/admin/questions/${q.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(q.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
