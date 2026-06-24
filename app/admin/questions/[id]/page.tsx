'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import Link from 'next/link'

const DIMENSIONS = ['LISTENING', 'READING', 'SPEAKING', 'WRITING', 'MEDIATION', 'INTEGRATED']
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const TYPES = ['MCQ', 'SHORT_ANSWER', 'ESSAY', 'AUDIO_RESPONSE', 'INTEGRATED_TASK']
const STATUSES = ['DRAFT', 'REVIEW', 'PILOT', 'ACTIVE', 'RETIRED']

export default function EditQuestionPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    code: '',
    dimension: 'READING',
    subskill: '',
    questionType: 'MCQ',
    level: 'B1',
    difficulty: 7,
    topic: '',
    prompt: '',
    instruction: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    estimatedTime: 60,
    tags: '',
    status: 'DRAFT',
  })

  useEffect(() => {
    fetchQuestion()
  }, [params.id])

  const fetchQuestion = async () => {
    try {
      const res = await fetch(`/api/admin/questions/${params.id}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Gagal memuat soal')
      const q = json.data

      setFormData({
        code: q.code || '',
        dimension: q.dimension,
        subskill: q.subskill || '',
        questionType: q.questionType,
        level: q.level,
        difficulty: q.difficulty,
        topic: q.topic || '',
        prompt: q.prompt || '',
        instruction: q.instruction || '',
        options: q.options?.length
          ? q.options.map((o: any) => o.text).concat(['', '', '', '']).slice(0, 4)
          : ['', '', '', ''],
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || '',
        estimatedTime: q.estimatedTime || 60,
        tags: q.tags?.join(', ') || '',
        status: q.status,
      })
    } catch (err) {
      console.error('Gagal mengambil soal:', err)
      toast.error('Gagal memuat soal')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const body: any = {
        code: formData.code || null,
        dimension: formData.dimension,
        subskill: formData.subskill || null,
        questionType: formData.questionType,
        level: formData.level,
        difficulty: formData.difficulty,
        topic: formData.topic || null,
        prompt: formData.prompt,
        instruction: formData.instruction || null,
        correctAnswer: formData.correctAnswer || null,
        explanation: formData.explanation || null,
        estimatedTime: formData.estimatedTime || null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        status: formData.status,
      }

      if (formData.questionType === 'MCQ') {
        body.options = formData.options
          .filter(o => o.trim())
          .map((text, i) => ({
            label: String.fromCharCode(65 + i),
            text,
            isCorrect: formData.correctAnswer === String.fromCharCode(65 + i),
          }))
      }

      const res = await fetch(`/api/admin/questions/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memperbarui soal')
      }

      toast.success('Soal berhasil diperbarui')
      router.push('/admin/questions')
    } catch (err: any) {
      console.error('Gagal memperbarui soal:', err)
      toast.error(err.message || 'Gagal memperbarui soal')
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Kode</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="mis: BIGT-RD-B1-001"
                />
              </div>
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
                <Label>Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
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
                <Label>Tipe Soal</Label>
                <select
                  value={formData.questionType}
                  onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Subskill</Label>
                <Input
                  value={formData.subskill}
                  onChange={(e) => setFormData({ ...formData, subskill: e.target.value })}
                  placeholder="mis: inference"
                />
              </div>
              <div>
                <Label>Kesulitan (1-18)</Label>
                <Input
                  type="number"
                  min="1"
                  max="18"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label>Topik</Label>
                <Input
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="mis: lingkungan"
                />
              </div>
              <div>
                <Label>Estimasi (detik)</Label>
                <Input
                  type="number"
                  min="10"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 60 })}
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

            <div>
              <Label>Instruksi</Label>
              <Textarea
                value={formData.instruction}
                onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
                placeholder="Instruksi pengerjaan soal..."
                rows={2}
              />
            </div>

            {formData.questionType === 'MCQ' && (
              <div className="space-y-3">
                <Label>Opsi Jawaban</Label>
                {formData.options.map((opt, i) => {
                  const label = String.fromCharCode(65 + i)
                  return (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="w-6 text-sm font-medium text-gray-500">{label}</span>
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...formData.options]
                          newOptions[i] = e.target.value
                          setFormData({ ...formData, options: newOptions })
                        }}
                        placeholder={`Opsi ${label}`}
                      />
                    </div>
                  )
                })}
                <div className="pt-2">
                  <Label>Jawaban Benar</Label>
                  <select
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">Pilih jawaban benar</option>
                    {formData.options.filter(o => o.trim()).map((_, i) => (
                      <option key={i} value={String.fromCharCode(65 + i)}>
                        {String.fromCharCode(65 + i)}. {formData.options[i]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {formData.questionType !== 'MCQ' && (
              <div>
                <Label>Kunci Jawaban</Label>
                <Textarea
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  placeholder="Kunci jawaban untuk soal ini"
                  rows={2}
                />
              </div>
            )}

            <div>
              <Label>Penjelasan</Label>
              <Textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Penjelasan jawaban..."
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
