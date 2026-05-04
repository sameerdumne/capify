"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import SongCard from '../../components/SongCard'
import type { Song } from '../../types'

interface HistoryEntry {
  id: string
  song: Song
  played_at: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Check if user is logged in
        const { data: { user: currentUser } } = await supabase.auth.getUser()

        if (!currentUser) {
          router.push('/login')
          return
        }

        // Fetch user's history with song details
        const { data, error: fetchError } = await supabase
          .from('song_history')
          .select(`
            id,
            played_at,
            song:song_id (
              id,
              title,
              artist,
              language,
              genre,
              mood,
              youtube_url,
              youtube_video_id,
              thumbnail_url,
              duration
            )
          `)
          .eq('user_id', currentUser.id)
          .order('played_at', { ascending: false })

        if (fetchError) {
          setError(fetchError.message)
          return
        }

        // Transform data
        const transformedHistory = data.map((entry: any) => ({
          id: entry.id,
          song: entry.song,
          played_at: entry.played_at
        }))

        setHistory(transformedHistory)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch history')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [router, supabase])

  const clearHistory = async () => {
    if (!confirm('Are you sure you want to clear your history?')) return

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      const { error } = await supabase
        .from('song_history')
        .delete()
        .eq('user_id', currentUser.id)

      if (error) {
        setError(error.message)
        return
      }

      setHistory([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear history')
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Music History</h1>
            <p className="text-slate-400">
              {history.length === 0 ? 'No songs played yet' : `${history.length} song${history.length !== 1 ? 's' : ''} played`}
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-6 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold transition"
            >
              Clear History
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neon" />
            <p className="text-slate-400 mt-4">Loading your history...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 mb-6">
            Error: {error}
          </div>
        )}

        {!loading && history.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">Your listening history will appear here</p>
            <p className="text-slate-500 mt-2">Start discovering songs to build your history</p>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((entry) => (
              <div key={entry.id} className="relative">
                <SongCard song={entry.song} />
                <div className="text-xs text-slate-400 mt-2 text-center">
                  Played {new Date(entry.played_at).toLocaleDateString()} at{' '}
                  {new Date(entry.played_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
