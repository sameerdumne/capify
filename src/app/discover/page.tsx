'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Language, Genre, Mood } from '../../types'

const LANGUAGES: Language[] = ['English','Hindi','Japanese','Korean','Punjabi','Marathi','Tamil','Telugu']
const GENRES: Genre[] = ['Pop','Rock','Lofi','Hip-Hop','Classical','Jazz','EDM','Romantic','Indie','Phonk']
const MOODS: Mood[] = ['Happy','Sad','Energetic','Focus','Chill','Romantic','Heartbroken','Gym','Party','Sleep']

export default function Discover() {
  const [step, setStep] = useState(1)
  const [language, setLanguage] = useState<Language | ''>('')
  const [genre, setGenre] = useState<Genre | ''>('')
  const [mood, setMood] = useState<Mood | ''>('')

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Discover</h2>

        {step === 1 && (
          <section>
            <p className="mb-4">Select language</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LANGUAGES.map(l => (
                <button key={l} onClick={() => { setLanguage(l); setStep(2) }} className="p-3 rounded-lg bg-white/5">{l}</button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <p className="mb-4">Select genre</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GENRES.map(g => (
                <button key={g} onClick={() => { setGenre(g); setStep(3) }} className="p-3 rounded-lg bg-white/5">{g}</button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <p className="mb-4">Select mood</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MOODS.map(m => (
                <button key={m} onClick={() => { setMood(m); setStep(4) }} className="p-3 rounded-lg bg-white/5">{m}</button>
              ))}
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="mt-6">
            <h3 className="text-lg font-semibold">Ready to explore</h3>
            <p className="text-sm text-slate-400">Language: {language} • Genre: {genre} • Mood: {mood}</p>
            <div className="mt-4">
              <Link href={`/results?language=${language}&genre=${genre}&mood=${mood}`} className="inline-block px-5 py-3 rounded-full bg-neon text-black font-semibold">Show songs</Link>
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
