'use client'

import { useEffect } from 'react'

interface PageMetaProps {
  title: string
  description?: string
}

export default function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    document.title = `${title} | BIGT`
    if (description) {
      let meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', description)
      meta = document.querySelector('meta[property="og:description"]')
      if (meta) meta.setAttribute('content', description)
      meta = document.querySelector('meta[name="twitter:description"]')
      if (meta) meta.setAttribute('content', description)
    }
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', `${title} | BIGT`)
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) twitterTitle.setAttribute('content', `${title} | BIGT`)
  }, [title, description])

  return null
}
