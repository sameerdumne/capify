import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        { error: 'Database credentials missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all songs
    const { data: allSongs, error } = await supabase
      .from('songs')
      .select('*')
      .limit(1000)

    if (error) {
      console.error('Error fetching songs:', error)
      return Response.json(
        { error: 'Failed to fetch songs' },
        { status: 500 }
      )
    }

    if (!allSongs || allSongs.length === 0) {
      return Response.json(
        { error: 'No songs available' },
        { status: 404 }
      )
    }

    // Get random song
    const randomIndex = Math.floor(Math.random() * allSongs.length)
    const randomSong = allSongs[randomIndex]

    return Response.json({ song: randomSong })
  } catch (error) {
    console.error('API error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
