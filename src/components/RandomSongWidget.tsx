"use client"

import { useState } from 'react'
import SongCard from './SongCard'
import type { Song } from '../types'

export default function RandomSongWidget() {
  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRandomSong = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/random-song')
      if (!response.ok) {
        throw new Error('Failed to fetch random song')
      }
      const data = await response.json()
      setSong(data.song)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSong(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Feeling Lucky?</h2>
        <button
          onClick={fetchRandomSong}
          disabled={loading}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-neon to-accent text-black font-semibold hover:shadow-lg hover:shadow-neon/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : '🎲 Random Song'}
        </button>
      </div>

      {error && (
        <div className="text-red-400 mb-4">Error: {error}</div>
      )}

      {song ? (
        <div className="max-w-md">
          <SongCard song={song} />
        </div>
      ) : !loading && (
        <div className="text-slate-400 italic">Click &quot;Random Song&quot; to discover something new!</div>
      )}
    </div>
  )
}
