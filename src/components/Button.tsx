"use client"

import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export default function Button({ children, className = '', onClick }: Props) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-full font-semibold ${className}`}>
      {children}
    </button>
  )
}
