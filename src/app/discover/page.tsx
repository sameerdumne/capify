'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Language, Genre, Mood } from '../../types'
import { supabase } from '../../lib/supabaseClient'

const LANGUAGES: Language[] = ['English','Hindi','Japanese','Korean','Punjabi','Marathi','Tamil','Telugu']
const GENRES: Genre[] = ['Pop','Rock','Lofi','Hip-Hop','Classical','Jazz','EDM','Romantic','Indie','Phonk']
const MOODS: Mood[] = ['Happy','Sad','Energetic','Focus','Chill','Romantic','Heartbroken','Gym','Party','Sleep']

interface SongCombination {
  language: string
  genre: string
  mood: string
}

export default function Discover() {
  const [step, setStep] = useState(1)
  const [language, setLanguage] = useState<Language | ''>('')
  const [genre, setGenre] = useState<Genre | ''>('')
  const [mood, setMood] = useState<Mood | ''>('')
  const [songs, setSongs] = useState<SongCombination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCombinations = async () => {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('songs')
        .select('language, genre, mood')
        .limit(5000)

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      setSongs(data ?? [])
      setLoading(false)
    }

    fetchCombinations()
  }, [])

  const countMatches = (filters: Partial<SongCombination>) => {
    return songs.filter(song => {
      return (!filters.language || song.language === filters.language)
        && (!filters.genre || song.genre === filters.genre)
        && (!filters.mood || song.mood === filters.mood)
    }).length
  }

  const chooseLanguage = (nextLanguage: Language) => {
    if (countMatches({ language: nextLanguage }) === 0) return
    setLanguage(nextLanguage)
    setMood('')
    setGenre('')
    setStep(2)
  }

  const chooseMood = (nextMood: Mood) => {
    if (!language || countMatches({ language, mood: nextMood }) === 0) return
    setMood(nextMood)
    setGenre('')
    setStep(3)
  }

  const chooseGenre = (nextGenre: Genre) => {
    if (!language || !mood || countMatches({ language, mood, genre: nextGenre }) === 0) return
    setGenre(nextGenre)
    setStep(4)
  }

  const resetFrom = (targetStep: number) => {
    if (targetStep <= 1) {
      setLanguage('')
      setMood('')
      setGenre('')
    }

    if (targetStep <= 2) {
      setMood('')
      setGenre('')
    }

    if (targetStep <= 3) {
      setGenre('')
    }

    setStep(targetStep)
  }

  const finalCount = language && mood && genre
    ? countMatches({ language, mood, genre })
    : 0

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Discover</h2>

        {loading && (
          <div className="text-slate-400">Loading available song combinations...</div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="mb-6 flex flex-wrap gap-3 text-sm">
            {language && (
              <button onClick={() => resetFrom(1)} className="rounded-full bg-white/5 px-3 py-2 text-slate-300">
                Language: {language}
              </button>
            )}
            {mood && (
              <button onClick={() => resetFrom(2)} className="rounded-full bg-white/5 px-3 py-2 text-slate-300">
                Mood: {mood}
              </button>
            )}
            {genre && (
              <button onClick={() => resetFrom(3)} className="rounded-full bg-white/5 px-3 py-2 text-slate-300">
                Genre: {genre}
              </button>
            )}
          </div>
        )}

        {!loading && !error && step === 1 && (
          <section>
            <p className="mb-4">Select language</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LANGUAGES.map(l => {
                const count = countMatches({ language: l })
                const disabled = count === 0

                return (
                  <button
                    key={l}
                    onClick={() => chooseLanguage(l)}
                    disabled={disabled}
                    className="rounded-lg bg-white/5 p-3 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <span className="block font-semibold">{l}</span>
                    <span className="text-xs text-slate-400">{count} songs</span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {!loading && !error && step === 2 && (
          <section>
            <p className="mb-4">Select mood</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MOODS.map(m => {
                const count = language ? countMatches({ language, mood: m }) : 0
                const disabled = count === 0

                return (
                  <button
                    key={m}
                    onClick={() => chooseMood(m)}
                    disabled={disabled}
                    className="rounded-lg bg-white/5 p-3 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <span className="block font-semibold">{m}</span>
                    <span className="text-xs text-slate-400">{disabled ? 'No songs' : `${count} songs`}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {!loading && !error && step === 3 && (
          <section>
            <p className="mb-4">Select genre</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GENRES.map(g => {
                const count = language && mood ? countMatches({ language, mood, genre: g }) : 0
                const disabled = count === 0

                return (
                  <button
                    key={g}
                    onClick={() => chooseGenre(g)}
                    disabled={disabled}
                    className="rounded-lg bg-white/5 p-3 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <span className="block font-semibold">{g}</span>
                    <span className="text-xs text-slate-400">{disabled ? 'No songs' : `${count} songs`}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {!loading && !error && step === 4 && (
          <section className="mt-6">
            <h3 className="text-lg font-semibold">Ready to explore</h3>
            <p className="text-sm text-slate-400">Language: {language} • Mood: {mood} • Genre: {genre}</p>
            <p className="mt-2 text-sm text-slate-400">{finalCount} songs match this combination</p>
            <div className="mt-4">
              <Link href={`/results?language=${language}&genre=${genre}&mood=${mood}`} className="inline-block px-5 py-3 rounded-full bg-neon text-black font-semibold">Show songs</Link>
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
