'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

const DIMENSIONS = ['LISTENING', 'READING', 'SPEAKING', 'WRITING', 'MEDIATION', 'INTEGRATED']
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const TYPES = ['MCQ', 'SHORT_ANSWER', 'ESSAY', 'AUDIO_RESPONSE', 'INTEGRATED_TASK']

export default function EditQuestionPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    dimension: 'READING',
    skill: '',
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
    isActive: true,
  })

  useEffect(() => {
    fetchQuestion()
  }, [params.id])

  const fetchQuestion = async () => {
    try {
      const res = await fetch(`/api/admin/questions/${params.id}`)
      const data = await res.json()
      const q = data.question

      setFormData({
        dimension: q.dimension,
        skill: q.skill,
        subskill: q.subskill || '',
        type: q.type,
        level: q.level,
        difficulty: q.difficulty,
        points: q.points,
        prompt: q.content?.prompt || '',
        options: q.content?.options || ['', '', '', ''],
        correctAnswer: q.content?.correctAnswer || '',
        tags: q.tags?.join(', ') || '',
        rubric: q.rubric ? JSON.stringify(q.rubric) : '',
        isActive: q.isActive,
      })
    } catch (err) {
      console.error('Gagal mengambil soal:', err)
    } finally {
      setFetching(false)
    }
  }

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
        isActive: formData.isActive,
      }

      const res = await fetch(`/api/admin/questions/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Gagal memperbarui soal')

      router.push('/admin/questions')
    } catch (err) {
      console.error('Gagal memperbarui soal:', err)
      alert('Gagal memperbarui soal')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]"></div>
        <p className="mt-4 text-gray-600">Memuat soal...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/questions" className="text-sm text-gray-600 hover:text-gray-900">
          ← Kembali ke Bank Soal
        </Link>
        <h1 className="text-3xl font-bold text-[#0B1F3A] mt-4 mb-2">Edit Soal</h1>
        <p className="text-gray-600">Perbarui detail soal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Soal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Dimensi</Label>
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
                <Label>Tipe</Label>
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
                  placeholder="mis: reading_comprehension"
                />
              </div>

              <div>
                <Label>Subskill (opsional)</Label>
                <Input
                  value={formData.subskill}
                  onChange={(e) => setFormData({ ...formData, subskill: e.target.value })}
                  placeholder="mis: inference"
                />
              </div>

              <div>
                <Label>Kesulitan (1-5)</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label>Poin</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label>Tag (pisahkan dengan koma)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="mis: grammar, vocabulary"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
            </div>

            <div>
              <Label>Prompt</Label>
              <Textarea
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Masukkan prompt soal..."
                rows={4}
                required
              />
            </div>

            {formData.type === 'MCQ' && (
              <div className="space-y-3">
                <Label>Opsi</Label>
                {formData.options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...formData.options]
                        newOptions[i] = e.target.value
                        setFormData({ ...formData, options: newOptions })
                      }}
                      placeholder={`Opsi ${String.fromCharCode(65 + i)}`}
                    />
                  </div>
                ))}
                <div>
                  <Label>Jawaban Benar (A, B, C, atau D)</Label>
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
              <Label>Rubrik (JSON, opsional)</Label>
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
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
              <Link href="/admin/questions">
                <Button variant="outline">Batal</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
