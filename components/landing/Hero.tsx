'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const LEVELS = [
  { code: 'A1', color: '#6B7280', label: 'Pemula' },
  { code: 'A2', color: '#6B7280', label: 'Dasar' },
  { code: 'B1', color: '#378ADD', label: 'Madya' },
  { code: 'B2', color: '#378ADD', label: 'Madya Atas' },
  { code: 'C1', color: '#C8102E', label: 'Mahir' },
  { code: 'C2', color: '#C9A84C', label: 'Sangat Mahir' },
]

export default function Hero() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % (LEVELS.length + 1))
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="bg-[#0B1F3A] text-[#F8F6F1] pt-28 pb-20 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
          Standar Kemahiran Bahasa Indonesia untuk Dunia
        </div>

        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
          Bahasa Global<br />
          Indonesia Test<span className="text-[#C9A84C]">.</span>
        </h1>

        <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          BGIT adalah sistem asesmen kemahiran Bahasa Indonesia modern berbasis AI, CEFR-aligned, adaptive testing, diagnostic report, dan sertifikasi digital. Dirancang untuk disejajarkan dengan standar global.
        </p>

        <div className="flex items-center justify-center gap-2 max-w-lg mx-auto mb-8">
          {LEVELS.map((level, i) => (
            <div key={level.code} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: level.color,
                  opacity: i <= activeStep ? 1 : 0.2,
                }}
              />
              <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-300 ${i <= activeStep ? 'text-white/80' : 'text-white/30'}`}>
                {level.code}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/register">
            <Button className="bg-[#C8102E] hover:bg-red-800 text-white px-7 py-3 text-sm font-semibold">
              Gabung Waitlist
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-7 py-3 text-sm font-medium">
              Lihat Produk Test
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
