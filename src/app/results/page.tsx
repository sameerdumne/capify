import { createClient } from '@supabase/supabase-js'
import SongCard from '../../components/SongCard'
import type { Song } from '../../types'

interface Props {
  searchParams: { [key: string]: string | undefined }
}

export default async function Results({ searchParams }: Props) {
  const language = searchParams.language?.trim()
  const genre = searchParams.genre?.trim()
  const mood = searchParams.mood?.trim()

  console.log('📋 Results page params:', { language, genre, mood })

  // Create a fresh Supabase client in this component
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const supabase = createClient(supabaseUrl!, supabaseKey!)

  // Query songs - note: we filter in memory because multiple .eq() chaining had issues
  let baseQuery = supabase.from('songs').select('*')
  if (language) baseQuery = baseQuery.eq('language', language)
  
  const { data: baseSongs } = await baseQuery.limit(500)  // Increased from 50 to get all songs in a language
  console.log(`🎵 Base songs found: ${baseSongs?.length || 0}`)

  // Filter in memory for genre and mood
  let songs: Song[] = baseSongs || []
  
  if (genre) {
    songs = songs.filter(s => s.genre === genre)
    console.log(`  After genre filter (${genre}): ${songs.length}`)
  }
  
  if (mood) {
    songs = songs.filter(s => s.mood === mood)
    console.log(`  After mood filter (${mood}): ${songs.length}`)
  }

  console.log('Final result count:', songs.length)

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Recommendations</h2>
        {(!songs || songs.length === 0) ? (
          <div className="text-slate-400">No songs found. Try different filters.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {songs.map((s: Song) => (
              <SongCard key={s.id} song={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
