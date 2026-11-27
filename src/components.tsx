import type { ReactNode } from 'react'

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`page-container ${className}`}>{children}</div>
}

export function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return <h2 id={id} className="section-heading">{children}</h2>
}

export function ButtonLink({ href, children, variant = 'solid' }: {
  href: string
  children: ReactNode
  variant?: 'solid' | 'outline'
}) {
  return <a href={href} className={`button-link button-link--${variant}`}>{children}</a>
}
