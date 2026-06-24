'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileText, Check, AlertCircle, ChevronLeft } from 'lucide-react'
import { useQuestionStorage } from '@/hooks/useQuestionStorage'

const DIMENSIONS = [
  { value: 'LISTENING', label: 'Menyimak' },
  { value: 'READING', label: 'Membaca' },
  { value: 'SPEAKING', label: 'Berbicara' },
  { value: 'WRITING', label: 'Menulis' },
  { value: 'MEDIATION', label: 'Mediasi' },
  { value: 'INTEGRATED', label: 'Terintegrasi' },
]

const CEFR_LEVELS = [
  { value: 'A1', label: 'A1 - Pemula' },
  { value: 'A2', label: 'A2 - Dasar' },
  { value: 'B1', label: 'B1 - Madya' },
  { value: 'B2', label: 'B2 - Madya Atas' },
  { value: 'C1', label: 'C1 - Mahir' },
  { value: 'C2', label: 'C2 - Sangat Mahir' },
]

const DIFFICULTIES = [1, 2, 3, 4, 5]

interface ExistingQuestion {
  id: string
  title: string
  dimension: string
  cefrLevel: string
  difficulty: number
  isActive: boolean
  tags: string[]
  createdAt: string
}

export default function UploadQuestionPage() {
  const router = useRouter()
  const { uploadPdf, uploading, error: uploadError } = useQuestionStorage()

  const [dimension, setDimension] = useState('READING')
  const [cefrLevel, setCefrLevel] = useState('B1')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState(3)
  const [tags, setTags] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [existing, setExisting] = useState<ExistingQuestion[]>([])
  const [loadingList, setLoadingList] = useState(true)

  useEffect(() => {
    fetch('/api/questions')
      .then(r => r.json())
      .then(d => { if (d.success) setExisting(d.data) })
      .catch(() => {})
      .finally(() => setLoadingList(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(null)

    if (!file) return

    const fd = new FormData()
    fd.append('file', file)
    fd.append('dimension', dimension)
    fd.append('cefrLevel', cefrLevel)
    fd.append('title', title)
    fd.append('description', description)
    fd.append('difficulty', String(difficulty))
    fd.append('tags', tags)

    const result = await uploadPdf(fd)
    if (result) {
      setSuccess(`"${title}" berhasil diunggah!`)
      setTitle('')
      setDescription('')
      setFile(null)
      setTags('')
      setExisting(prev => [{
        id: result.id,
        title: result.title,
        dimension: result.dimension,
        cefrLevel: result.cefrLevel,
        difficulty: result.difficulty,
        isActive: result.isActive,
        tags: result.tags,
        createdAt: result.createdAt,
      }, ...prev])
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/admin/questions')} className="text-[#64748B] hover:text-[#0B3D91]">
          <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#0B3D91]">Unggah Soal PDF</h1>
          <p className="text-sm text-[#64748B] mt-1">Tambahkan soal latihan dalam format PDF</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E5EAF2] p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#0B3D91]">Dimensi</Label>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="w-full rounded-xl border border-[#E5EAF2] h-11 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
            >
              {DIMENSIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#0B3D91]">Level CEFR</Label>
            <select
              value={cefrLevel}
              onChange={(e) => setCefrLevel(e.target.value)}
              className="w-full rounded-xl border border-[#E5EAF2] h-11 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
            >
              {CEFR_LEVELS.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-sm font-medium text-[#0B3D91]">Judul Soal</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Reading Comprehension B1"
            required
            className="rounded-xl border-[#E5EAF2] h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="desc" className="text-sm font-medium text-[#0B3D91]">Deskripsi (opsional)</Label>
          <Input
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi singkat tentang soal"
            className="rounded-xl border-[#E5EAF2] h-11"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#0B3D91]">Tingkat Kesulitan</Label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`w-10 h-10 rounded-xl border-2 text-sm font-medium transition-all ${
                    difficulty === d
                      ? 'bg-[#0B3D91] text-white border-[#0B3D91]'
                      : 'bg-white text-[#64748B] border-[#E5EAF2] hover:border-[#0B3D91]/30'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags" className="text-sm font-medium text-[#0B3D91]">Tag (opsional, pisahkan dengan koma)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="reading, pemahaman, teks"
              className="rounded-xl border-[#E5EAF2] h-11"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#0B3D91]">File PDF</Label>
          <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
            file ? 'border-[#34C759] bg-[#34C759]/5' : 'border-[#E5EAF2] hover:border-[#0B3D91]/30'
          }`}>
            {file ? (
              <div className="space-y-2">
                <FileText className="w-10 h-10 text-[#34C759] mx-auto" />
                <p className="text-sm font-medium text-[#1C1C1E]">{file.name}</p>
                <p className="text-xs text-[#64748B]">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-xs text-[#FF3B30] hover:underline mt-2"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <label className="cursor-pointer space-y-2">
                <Upload className="w-10 h-10 text-[#64748B] mx-auto" />
                <p className="text-sm text-[#64748B]">
                  Klik untuk pilih file PDF
                </p>
                <p className="text-xs text-[#64748B]">Maks 10 MB</p>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {uploadError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{uploadError}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/questions')}
            className="rounded-xl px-6 h-11 border-[#E5EAF2]"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={uploading || !file || !title}
            className="rounded-xl px-8 h-11 bg-[#0B3D91] hover:bg-[#0B3D91]/90 text-white font-semibold shadow-lg shadow-[#0B3D91]/20"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mengunggah...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Unggah Soal
              </span>
            )}
          </Button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6">
        <h2 className="text-lg font-semibold text-[#0B3D91] mb-4">Soal yang Sudah Diunggah</h2>
        {loadingList ? (
          <div className="flex items-center gap-2 py-8 justify-center">
            <span className="w-4 h-4 border-2 border-[#0B3D91] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[#64748B]">Memuat...</span>
          </div>
        ) : existing.length === 0 ? (
          <p className="text-sm text-[#64748B] text-center py-8">Belum ada soal yang diunggah.</p>
        ) : (
          <div className="space-y-2">
            {existing.map((q) => (
              <div key={q.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E5EAF2]">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-[#0B3D91] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1C1C1E] truncate">{q.title}</p>
                    <p className="text-xs text-[#64748B]">
                      {DIMENSIONS.find(d => d.value === q.dimension)?.label || q.dimension} · {q.cefrLevel} · Kesulitan {q.difficulty}/5
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${
                  q.isActive ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-[#E5EAF2] text-[#64748B]'
                }`}>
                  {q.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
