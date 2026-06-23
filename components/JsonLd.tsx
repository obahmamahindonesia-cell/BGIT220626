'use client'

import { useEffect } from 'react'

export default function JsonLd() {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'json-ld'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          name: 'BIGT — Bahasa Indonesia Global Test',
          url: 'https://bahasacerdas.site',
          description: 'Standar Kemahiran Bahasa Indonesia untuk Dunia.',
          logo: 'https://bahasacerdas.site/icon-512.png',
          foundingDate: '2026',
        },
        {
          '@type': 'WebSite',
          name: 'BIGT',
          url: 'https://bahasacerdas.site',
          inLanguage: 'id-ID',
          description: 'Sistem asesmen kemahiran Bahasa Indonesia berbasis kecerdasan buatan, Kerangka AKSI, dan standar global.',
        },
      ],
    })
    document.head.appendChild(script)
    return () => {
      const el = document.getElementById('json-ld')
      if (el) el.remove()
    }
  }, [])

  return null
}
