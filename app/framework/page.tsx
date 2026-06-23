'use client'

import { useEffect, useState } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/context'
import { Headphones, BookOpen, Mic, PenSquare, RefreshCw, Puzzle, Sparkles, Loader2 } from 'lucide-react'

interface CanDoDescriptor {
  id: string; level: string; skill: string; category: string | null; descriptor: string
}
interface LevelData {
  code: string; name: string; description: string; descriptorsBySkill: Record<string, CanDoDescriptor[]>
}

const SKILL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LISTENING: Headphones, READING: BookOpen, SPEAKING: Mic, WRITING: PenSquare, MEDIATION: RefreshCw, INTEGRATED: Puzzle,
}
const SKILL_COLORS: Record<string, string> = {
  LISTENING: '#0B1F3A', READING: '#123E7C', SPEAKING: '#C9A227', WRITING: '#D7193F', MEDIATION: '#64748B', INTEGRATED: '#64748B',
}

const REGISTERS = [
  { nameKey: 'framework.registers.0.name', descKey: 'framework.registers.0.desc', examplesKey: 'framework.registers.0.examples' },
  { nameKey: 'framework.registers.1.name', descKey: 'framework.registers.1.desc', examplesKey: 'framework.registers.1.examples' },
  { nameKey: 'framework.registers.2.name', descKey: 'framework.registers.2.desc', examplesKey: 'framework.registers.2.examples' },
  { nameKey: 'framework.registers.3.name', descKey: 'framework.registers.3.desc', examplesKey: 'framework.registers.3.examples' },
]

const PRINCIPLES = [
  { titleKey: 'framework.principles.0.title', descKey: 'framework.principles.0.desc' },
  { titleKey: 'framework.principles.1.title', descKey: 'framework.principles.1.desc' },
  { titleKey: 'framework.principles.2.title', descKey: 'framework.principles.2.desc' },
  { titleKey: 'framework.principles.3.title', descKey: 'framework.principles.3.desc' },
]

const LEVEL_COLORS: Record<string, string> = { A1: '#64748B', A2: '#64748B', B1: '#0B1F3A', B2: '#123E7C', C1: '#D7193F', C2: '#C9A227' }

export default function FrameworkPage() {
  const { t } = useI18n()
  const [levels, setLevels] = useState<LevelData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState('A1')

  useEffect(() => {
    fetch('/api/framework').then(res => res.json()).then(data => { setLevels(data.levels); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const currentLevel = levels.find(l => l.code === selectedLevel)
  const levelColor = LEVEL_COLORS[selectedLevel] || '#64748B'

  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#123E7C] text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#C9A227] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> {t('framework.heroBadge')}
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold leading-tight mb-6">{t('framework.heroTitle')}</h1>
          <p className="text-white/40 text-sm mb-2 tracking-wide">{t('framework.heroAksi')}</p>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">{t('framework.heroDesc')}</p>
        </div>
      </section>

      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#0B1F3A]/10 text-[#0B1F3A] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" /> {t('framework.principlesBadge')}
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-8">{t('framework.principlesTitle')}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {PRINCIPLES.map(p => (
            <div key={p.titleKey} className="bg-white border border-[#E5EAF2] premium-shadow-sm rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">{t(p.titleKey)}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">{t(p.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6 bg-[#F7F9FC]">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#0B1F3A]/10 text-[#0B1F3A] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" /> {t('framework.cefrBadge')}
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-4">{t('framework.cefrTitle')}</h2>
          <p className="text-[#64748B] text-sm leading-relaxed mb-8">{t('framework.cefrDesc')}</p>
          {loading ? (
            <div className="text-center py-12"><Loader2 className="inline-block animate-spin h-10 w-10 text-[#0B1F3A]" /><p className="mt-3 text-[#64748B] text-sm">{t('framework.loading')}</p></div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                {levels.map(level => (
                  <button key={level.code} onClick={() => setSelectedLevel(level.code)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedLevel === level.code ? 'bg-[#0B1F3A] text-white shadow-md' : 'bg-white text-[#0B1F3A] hover:bg-gray-100 border border-[#E5EAF2]'
                    }`}>{level.code} - {level.name}</button>
                ))}
              </div>
              {currentLevel && (
                <div>
                  <div className="bg-white border border-[#E5EAF2] premium-shadow-sm rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: levelColor + '15' }}>
                        <span className="text-xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: levelColor }}>{currentLevel.code}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#0B1F3A] mb-1">{currentLevel.name}</h3>
                        <p className="text-sm text-[#64748B] leading-relaxed">{currentLevel.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(SKILL_ICONS).map(skillCode => {
                      const Icon = SKILL_ICONS[skillCode]
                      const color = SKILL_COLORS[skillCode]
                      const descriptors = currentLevel.descriptorsBySkill[skillCode] || []
                      return (
                        <div key={skillCode} className="bg-white border border-[#E5EAF2] premium-shadow-sm rounded-xl p-5">
                          <h4 className="text-sm font-semibold text-[#0B1F3A] mb-3 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            {t('framework.skillNames.' + skillCode)}
                          </h4>
                          {descriptors.length > 0 ? (
                            <ul className="space-y-2">
                              {descriptors.map(desc => (
                                <li key={desc.id} className="text-sm text-[#64748B] leading-relaxed">
                                  {desc.category && <span className="inline-block bg-[#C9A227]/10 text-[#C9A227] text-xs font-semibold px-2 py-0.5 rounded mr-1.5">{desc.category}</span>}
                                  {desc.descriptor}
                                </li>
                              ))}
                            </ul>
                          ) : <p className="text-sm text-[#64748B] italic">{t('framework.noDescriptors')}</p>}
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

      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#0B1F3A]/10 text-[#0B1F3A] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" /> {t('framework.registersBadge')}
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-[#0B1F3A] mb-4">{t('framework.registersTitle')}</h2>
        <p className="text-[#64748B] text-sm leading-relaxed mb-8">{t('framework.registersDesc')}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {REGISTERS.map(r => (
            <div key={r.nameKey} className="bg-white border border-[#E5EAF2] premium-shadow-sm rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[#0B1F3A] mb-2">{t(r.nameKey)}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed mb-2">{t(r.descKey)}</p>
              <div className="text-[10px] text-[#C9A227] font-medium tracking-wider uppercase">{t(r.examplesKey)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#0B1F3A] to-[#123E7C] py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-semibold text-white mb-4">{t('framework.ctaTitle')}</h2>
          <p className="text-white/50 text-sm mb-8">{t('framework.ctaDesc')}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/levels"><Button className="bg-[#D7193F] hover:bg-[#D7193F]/90 text-white px-7 py-3 text-sm font-semibold rounded-lg">{t('framework.ctaLevels')}</Button></Link>
            <Link href="/products"><Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-7 py-3 text-sm font-medium rounded-lg">{t('framework.ctaProducts')}</Button></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
