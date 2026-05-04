"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

interface MoodHistoryRow {
  song: { mood: string } | { mood: string }[] | null
}

interface MoodSlice {
  mood: string
  count: number
  color: string
}

const MOOD_COLORS = [
  '#7C3AED',
  '#00E5FF',
  '#22C55E',
  '#F97316',
  '#EC4899',
  '#EAB308',
  '#38BDF8',
  '#F43F5E',
  '#A3E635',
  '#C084FC'
]

const RADIUS = 44
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function MoodHistoryPieChart() {
  const [moods, setMoods] = useState<MoodSlice[]>([])
  const [loading, setLoading] = useState(true)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  ), [])

  useEffect(() => {
    const fetchMoodHistory = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setIsSignedIn(false)
          setMoods([])
          return
        }

        setIsSignedIn(true)

        const since = new Date()
        since.setMonth(since.getMonth() - 1)

        const { data, error: fetchError } = await supabase
          .from('song_history')
          .select(`
            song:song_id (
              mood
            )
          `)
          .eq('user_id', user.id)
          .gte('played_at', since.toISOString())

        if (fetchError) {
          setError(fetchError.message)
          return
        }

        const counts = new Map<string, number>()
        const rows = (data ?? []) as unknown as MoodHistoryRow[]

        rows.forEach((entry) => {
          const song = Array.isArray(entry.song) ? entry.song[0] : entry.song
          const mood = song?.mood

          if (mood) {
            counts.set(mood, (counts.get(mood) ?? 0) + 1)
          }
        })

        const chartData = Array.from(counts.entries())
          .map(([mood, count], index) => ({
            mood,
            count,
            color: MOOD_COLORS[index % MOOD_COLORS.length]
          }))
          .sort((a, b) => b.count - a.count)

        setMoods(chartData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mood history')
      } finally {
        setLoading(false)
      }
    }

    fetchMoodHistory()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchMoodHistory()
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const total = moods.reduce((sum, mood) => sum + mood.count, 0)
  let offset = 0

  return (
    <section className="glass rounded-3xl p-6 md:p-8 mb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold">Mood History</h2>
          <p className="text-slate-400 mt-1">Songs listened to in the past month</p>
        </div>

        {total > 0 && (
          <div className="text-sm text-slate-300">
            <span className="text-2xl font-bold text-white">{total}</span> plays tracked
          </div>
        )}
      </div>

      <div className="mt-8">
        {loading && (
          <div className="flex items-center justify-center min-h-64 text-slate-400">
            Loading mood chart...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && !isSignedIn && (
          <div className="flex flex-col items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-slate-300">Log in to see your personal mood chart.</p>
            <Link href="/login" className="px-5 py-2 rounded-full bg-neon text-black font-semibold">
              Login
            </Link>
          </div>
        )}

        {!loading && !error && isSignedIn && total === 0 && (
          <div className="flex flex-col items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-slate-300">No songs played in the past month yet.</p>
            <Link href="/discover" className="px-5 py-2 rounded-full bg-neon text-black font-semibold">
              Discover Songs
            </Link>
          </div>
        )}

        {!loading && !error && total > 0 && (
          <div className="grid gap-8 md:grid-cols-[260px_1fr] md:items-center">
            <div className="relative mx-auto size-64">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                {moods.map((slice) => {
                  const percentage = slice.count / total
                  const dash = percentage * CIRCUMFERENCE
                  const circle = (
                    <circle
                      key={slice.mood}
                      cx="50"
                      cy="50"
                      r={RADIUS}
                      fill="none"
                      stroke={slice.color}
                      strokeWidth="12"
                      strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                      strokeDashoffset={-offset}
                    />
                  )

                  offset += dash
                  return circle
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold">{moods[0].mood}</span>
                <span className="text-sm text-slate-400">top mood</span>
              </div>
            </div>

            <div className="grid gap-3">
              {moods.map((slice) => {
                const percentage = Math.round((slice.count / total) * 100)

                return (
                  <div key={slice.mood} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                    <span className="size-3 rounded-full" style={{ backgroundColor: slice.color }} />
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{slice.mood}</span>
                        <span className="text-sm text-slate-400">{percentage}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${percentage}%`, backgroundColor: slice.color }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-slate-400">{slice.count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
