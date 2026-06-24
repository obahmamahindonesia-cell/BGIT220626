'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'full' | 'mark'
  invert?: boolean
  className?: string
  priority?: boolean
}

const LOGO_RATIOS = {
  full: { src: '/logo_BIGT.png', width: 378, height: 189, alt: 'Logo BIGT — Bahasa Indonesia Global Test' },
  mark: { src: '/icon_BIGT.png', width: 200, height: 200, alt: 'Logo BIGT — Bahasa Indonesia Global Test' },
} as const

export default function Logo({ variant = 'full', invert = false, className, priority = false }: LogoProps) {
  const config = LOGO_RATIOS[variant]

  return (
    <Image
      src={config.src}
      alt={config.alt}
      width={config.width}
      height={config.height}
      priority={priority}
      className={cn(
        'w-auto h-auto',
        invert && 'brightness-0 invert',
        className,
      )}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    />
  )
}
