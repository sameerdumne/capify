"use client"

import { useState, useEffect } from 'react'

interface Props {
  videoId: string
  title?: string
}

export default function YouTubeEmbed({ videoId, title = 'YouTube video' }: Props) {
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    // Simple lazy mount after first paint — replace with IntersectionObserver later
    const id = setTimeout(() => setIsInView(true), 200)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
      {isInView ? (
        <iframe
          title={title}
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full"
          allowFullScreen
          loading="lazy"
          frameBorder={0}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">Loading preview…</div>
      )}
    </div>
  )
}
