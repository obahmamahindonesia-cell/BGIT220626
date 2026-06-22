'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Headphones, BookOpen, Mic, PenSquare, RefreshCw, Puzzle, Sparkles, Loader2 } from 'lucide-react'

interface CanDoDescriptor {
  id: string
  level: string
  skill: string
  category: string | null
  descriptor: string
}

interface LevelData {
  code: string
  name: string
  description: string
  descriptorsBySkill: Record<string, CanDoDescriptor[]>
}

interface SkillData {
  code: string
  name: string
}

const SKILL_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  LISTENING: Headphones,
  READING: BookOpen,
  SPEAKING: Mic,
  WRITING: PenSquare,
  MEDIATION: RefreshCw,
  INTEGRATED: Puzzle,
}

const SKILL_COLORS: Record<string, string> = {
  LISTENING: '#378ADD',
  READING: '#10B981',
  SPEAKING: '#F59E0B',
  WRITING: '#8B5CF6',
  MEDIATION: '#EC4899',
  INTEGRATED: '#06B6D4',
}

const REGISTERS = [
  {
    name: 'Formal',
    desc: 'Bahasa resmi untuk konteks pemerintahan, hukum, dan upacara kenegaraan.',
    examples: 'Pidato kenegaraan, surat resmi, dokumen legal',
  },
  {
    name: 'Informal',
    desc: 'Bahasa percakapan sehari-hari yang luwes dan ekspresif.',
    examples: 'Percakapan santai, media sosial, pesan singkat',
  },
  {
    name: 'Akademik',
    desc: 'Bahasa ilmiah untuk konteks pendidikan tinggi dan publikasi penelitian.',
    examples: 'Jurnal ilmiah, presentasi akademik, esai argumentatif',
  },
  {
    name: 'Profesional',
    desc: 'Bahasa dunia kerja yang efisien, tepat, dan berorientasi hasil.',
    examples: 'Laporan bisnis, email korporat, negosiasi',
  },
]

const PRINCIPLES = [
  {
    title: 'Pendekatan Berorientasi Tindakan',
    desc: 'BIGT mengukur apa yang bisa dilakukan peserta dengan bahasa Indonesia — bukan sekadar apa yang mereka ketahui. Setiap tugas mencerminkan aktivitas komunikatif nyata.',
  },
  {
    title: 'Kompetensi Mediasi',
    desc: 'Kemampuan menjembatani komunikasi lintas bahasa, budaya, dan register. Peserta diuji dalam memfasilitasi pemahaman, memproses informasi, dan mengelola interaksi.',
  },
  {
    title: 'Tugas Terintegrasi',
    desc: 'Tugas-tugas BIGT menggabungkan beberapa keterampilan sekaligus — membaca, menyimak, menulis, dan berbicara — sebagaimana terjadi dalam komunikasi nyata.',
  },
  {
    title: 'Kompetensi Plurilingual',
    desc: 'Pengakuan bahwa pengguna bahasa memiliki repertoar linguistik yang kaya. BIGT mempertimbangkan kemampuan peserta dalam memanfaatkan seluruh sumber daya kebahasaan mereka.',
  },
]

const LEVEL_COLORS: Record<string, string> = {
  A1: '#6B7280',
  A2: '#6B7280',
  B1: '#378ADD',
  B2: '#378ADD',
  C1: '#E11D48',
  C2: '#D4AF37',
}

export default function FrameworkPage() {
  const [levels, setLevels] = useState<LevelData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>('A1')

  useEffect(() => {
    fetch('/api/framework')
      .then(res => res.json())
      .then(data => {
        setLevels(data.levels)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching framework:', err)
        setLoading(false)
      })
  }, [])

  const currentLevel = levels.find(l => l.code === selectedLevel)
  const levelColor = LEVEL_COLORS[selectedLevel] || '#6B7280'

  return (
    <main>
      <Navbar />

      <section className="bg-gradient-to-br from-[#0B3D91] via-[#0B3D91] to-[#1e4a8f] text-white pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Kerangka Kerja
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold leading-tight mb-6">
            Kerangka <span className="text-[#D4AF37]">AKSI</span>
          </h1>
          <p className="text-white/50 text-sm mb-2 tracking-wide">
            Asesmen Kecakapan dan Sertifikasi Indonesia
          </p>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Kerangka kerja komprehensif yang menyelaraskan asesmen kemahiran bahasa Indonesia dengan standar CEFR — mengukur kompetensi komunikatif secara holistik dan bermakna.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Prinsip Utama
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B3D91] mb-8 leading-tight">
            Pendekatan action-oriented
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-6 premium-shadow-md">
                <h3 className="text-sm font-semibold text-[#0B3D91] mb-2">{p.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Penyelarasan CEFR
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B3D91] mb-4 leading-tight">
            Can-do descriptors untuk setiap level
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Setiap level BIGT dipetakan secara langsung ke CEFR dengan deskriptor can-do yang jelas — sehingga peserta, institusi, dan pemberi kerja memahami persis apa yang mampu dilakukan.
          </p>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="inline-block animate-spin h-12 w-12 text-[#0B3D91]" />
              <p className="mt-4 text-muted-foreground">Memuat data framework...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                {levels.map(level => (
                  <button
                    key={level.code}
                    onClick={() => setSelectedLevel(level.code)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      selectedLevel === level.code
                        ? 'bg-[#0B3D91] text-white shadow-md'
                        : 'bg-white text-[#0B3D91] hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {level.code} - {level.name}
                  </button>
                ))}
              </div>

              {currentLevel && (
                <div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 premium-shadow-md">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${levelColor}15` }}>
                        <span className="text-2xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: levelColor }}>
                          {currentLevel.code}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#0B3D91] mb-2">{currentLevel.name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{currentLevel.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(SKILL_ICONS).map(skillCode => {
                      const Icon = SKILL_ICONS[skillCode]
                      const color = SKILL_COLORS[skillCode]
                      const descriptors = currentLevel.descriptorsBySkill[skillCode] || []
                      const skillName = skillCode === 'LISTENING' ? 'Menyimak' :
                        skillCode === 'READING' ? 'Membaca' :
                        skillCode === 'SPEAKING' ? 'Berbicara' :
                        skillCode === 'WRITING' ? 'Menulis' :
                        skillCode === 'MEDIATION' ? 'Mediasi' : 'Tugas Terintegrasi'

                      return (
                        <div key={skillCode} className="bg-white border border-gray-100 rounded-2xl p-5 premium-shadow-md">
                          <h4 className="text-base font-semibold text-[#0B3D91] mb-3 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                              <Icon className="w-4 h-4" style={{ color }} />
                            </div>
                            {skillName}
                          </h4>
                          {descriptors.length > 0 ? (
                            <ul className="space-y-2">
                              {descriptors.map(desc => (
                                <li key={desc.id} className="text-sm text-muted-foreground leading-relaxed">
                                  {desc.category && (
                                    <span className="inline-block bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-semibold px-2 py-0.5 rounded mr-2">
                                      {desc.category}
                                    </span>
                                  )}
                                  {desc.descriptor}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">Belum ada deskriptor untuk skill ini</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#0B3D91]/10 text-[#0B3D91] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Register Bahasa
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B3D91] mb-4 leading-tight">
            Empat register, satu standar
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            BIGT mengukur kemampuan peserta dalam menggunakan bahasa Indonesia di berbagai konteks — dari percakapan sehari-hari hingga komunikasi profesional tingkat tinggi.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {REGISTERS.map((r) => (
              <div key={r.name} className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-6 premium-shadow-md">
                <h3 className="text-sm font-semibold text-[#0B3D91] mb-2">{r.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{r.desc}</p>
                <div className="text-[10px] text-[#D4AF37] font-medium tracking-wider uppercase">{r.examples}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#0B3D91] to-[#1a4a8a] py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-white mb-4">
            Lihat detail setiap level
          </h2>
          <p className="text-white/50 text-sm mb-8">
            Pahami deskripsi lengkap dan contoh kemampuan untuk setiap level BIGT.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/levels">
              <Button className="bg-[#E11D48] hover:bg-[#E11D48]/90 text-white px-7 py-3 text-sm font-semibold rounded-xl">
                Lihat Level
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-7 py-3 text-sm font-medium rounded-xl">
                Produk Tes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
