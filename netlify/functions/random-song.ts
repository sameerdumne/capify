import { createClient } from '@supabase/supabase-js'

type HandlerEvent = {
  httpMethod: string
}

type HandlerResponse = {
  statusCode: number
  headers?: Record<string, string>
  body: string
}

const json = (statusCode: number, body: unknown): HandlerResponse => ({
  statusCode,
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify(body),
})

export async function handler(event: HandlerEvent): Promise<HandlerResponse> {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' })
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return json(500, { error: 'Database credentials missing' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: allSongs, error } = await supabase
      .from('songs')
      .select('*')
      .limit(1000)

    if (error) {
      console.error('Error fetching songs:', error)
      return json(500, { error: 'Failed to fetch songs' })
    }

    if (!allSongs || allSongs.length === 0) {
      return json(404, { error: 'No songs available' })
    }

    const randomIndex = Math.floor(Math.random() * allSongs.length)

    return json(200, { song: allSongs[randomIndex] })
  } catch (error) {
    console.error('Function error:', error)
    return json(500, { error: 'Internal server error' })
  }
}
