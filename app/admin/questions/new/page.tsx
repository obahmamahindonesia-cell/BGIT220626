'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

const DIMENSIONS = ['LISTENING', 'READING', 'SPEAKING', 'WRITING', 'MEDIATION', 'INTEGRATED']
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const TYPES = ['MCQ', 'SHORT_ANSWER', 'ESSAY', 'AUDIO_RESPONSE', 'INTEGRATED_TASK']

export default function NewQuestionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    dimension: 'READING',
    skill: 'reading_comprehension',
    subskill: '',
    type: 'MCQ',
    level: 'B1',
    difficulty: 3,
    points: 10,
    prompt: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    tags: '',
    rubric: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const content: any = { prompt: formData.prompt }
      
      if (formData.type === 'MCQ') {
        content.options = formData.options.filter(o => o.trim())
        content.correctAnswer = formData.correctAnswer
      }

      const body = {
        dimension: formData.dimension,
        skill: formData.skill,
        subskill: formData.subskill || null,
        type: formData.type,
        level: formData.level,
        difficulty: formData.difficulty,
        points: formData.points,
        content,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        rubric: formData.rubric ? JSON.parse(formData.rubric) : null,
      }

      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Failed to create question')

      router.push('/admin/questions')
    } catch (err) {
      console.error('Error creating question:', err)
      alert('Failed to create question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/questions" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to Item Bank
        </Link>
        <h1 className="text-3xl font-bold text-[#0B1F3A] mt-4 mb-2">Create New Question</h1>
        <p className="text-gray-600">Add a new question to the item bank</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Dimension</Label>
                <select
                  value={formData.dimension}
                  onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {DIMENSIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Level</Label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {LEVELS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Type</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Skill</Label>
                <Input
                  value={formData.skill}
                  onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                  placeholder="e.g., reading_comprehension"
                />
              </div>

              <div>
                <Label>Subskill (optional)</Label>
                <Input
                  value={formData.subskill}
                  onChange={(e) => setFormData({ ...formData, subskill: e.target.value })}
                  placeholder="e.g., inference"
                />
              </div>

              <div>
                <Label>Difficulty (1-5)</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label>Points</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., grammar, vocabulary"
                />
              </div>
            </div>

            <div>
              <Label>Prompt</Label>
              <Textarea
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Enter the question prompt..."
                rows={4}
                required
              />
            </div>

            {formData.type === 'MCQ' && (
              <div className="space-y-3">
                <Label>Options</Label>
                {formData.options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...formData.options]
                        newOptions[i] = e.target.value
                        setFormData({ ...formData, options: newOptions })
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    />
                  </div>
                ))}
                <div>
                  <Label>Correct Answer (A, B, C, or D)</Label>
                  <Input
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value.toUpperCase() })}
                    placeholder="A"
                    maxLength={1}
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Rubric (JSON, optional)</Label>
              <Textarea
                value={formData.rubric}
                onChange={(e) => setFormData({ ...formData, rubric: e.target.value })}
                placeholder='{"criteria": "clarity", "weight": 1.0}'
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#C8102E] hover:bg-red-800 text-white"
              >
                {loading ? 'Creating...' : 'Create Question'}
              </Button>
              <Link href="/admin/questions">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
