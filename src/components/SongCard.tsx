"use client"

import YouTubeEmbed from './YouTubeEmbed'
import { Song } from '../types'
import { useState, useEffect } from 'react'
import { logSongPlay } from '../utils/history'

interface Props {
  song: Song
  logPlay?: boolean
}

export default function SongCard({ song, logPlay = true }: Props) {
  const [liked, setLiked] = useState(false)
  const [hasLogged, setHasLogged] = useState(false)

  // Log song play when component mounts
  useEffect(() => {
    if (logPlay && !hasLogged) {
      logSongPlay(song.id).then(() => {
        setHasLogged(true)
      })
    }
  }, [song.id, hasLogged, logPlay])

  return (
    <article className="glass p-4 rounded-2xl shadow-md">
      <div className="mb-3">
        <YouTubeEmbed videoId={song.youtube_video_id} title={song.title} />
      </div>
      <h3 className="font-semibold text-lg">{song.title}</h3>
      <p className="text-sm text-slate-400">{song.artist}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs px-2 py-1 rounded-full bg-white/5">{song.language}</span>
        <span className="text-xs px-2 py-1 rounded-full bg-white/5">{song.genre}</span>
        <span className="text-xs px-2 py-1 rounded-full bg-white/5">{song.mood}</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-400">{song.duration ? `${song.duration}s` : ''}</div>
        <div className="flex items-center gap-2">
          <button aria-label="like" onClick={() => setLiked(!liked)} className="px-3 py-1 rounded-full bg-white/5">
            {liked ? '♥' : '♡'}
          </button>
          <button aria-label="save" className="px-3 py-1 rounded-full bg-white/5">Save</button>
        </div>
      </div>
    </article>
  )
}
