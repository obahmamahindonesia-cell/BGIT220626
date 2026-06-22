'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

const LEVELS = [
  { code: 'A1', color: '#6B7280', label: 'Pemula' },
  { code: 'A2', color: '#6B7280', label: 'Dasar' },
  { code: 'B1', color: '#378ADD', label: 'Madya' },
  { code: 'B2', color: '#378ADD', label: 'Madya Atas' },
  { code: 'C1', color: '#E11D48', label: 'Mahir' },
  { code: 'C2', color: '#F59E0B', label: 'Sangat Mahir' },
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
    <section className="bg-gradient-to-br from-[#0B3D91] via-[#0B3D91] to-[#1e4a8f] text-white pt-28 pb-20 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <Image
              src="/logo_BIGT.png"
              alt="BIGT Logo"
              width={200}
              height={60}
              className="h-16 w-auto"
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] text-xs font-medium tracking-wider px-4 py-1.5 rounded-full uppercase mb-6">
          Standar Kemahiran Bahasa Indonesia untuk Dunia
        </div>

        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
          Bahasa Indonesia<br />
          Global Test<span className="text-[#F59E0B]">.</span>
        </h1>

        <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          BIGT adalah sistem asesmen kemahiran Bahasa Indonesia generasi baru berbasis kecerdasan buatan, adaptive testing, dan kerangka AKSI yang dirancang untuk mendukung internasionalisasi Bahasa Indonesia.
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
              <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-300 ${i <= activeStep ? 'text-white/90' : 'text-white/40'}`}>
                {level.code}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/register">
            <Button className="bg-[#E11D48] hover:bg-[#E11D48]/90 text-white px-7 py-3 text-sm font-semibold shadow-lg">
              Gabung Waitlist
            </Button>
          </Link>
          <Link href="/framework">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-7 py-3 text-sm font-medium">
              Lihat Framework
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
