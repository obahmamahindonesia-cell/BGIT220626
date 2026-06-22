'use client'

interface SectionContainerProps {
  children: React.ReactNode
  className?: string
}

export default function SectionContainer({ children, className = '' }: SectionContainerProps) {
  return (
    <div className={`space-y-6 lg:space-y-8 ${className}`}>
      {children}
    </div>
  )
}
