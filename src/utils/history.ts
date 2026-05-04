import { createClient } from '@supabase/supabase-js'

/**
 * Log a song play to the user's history
 * @param songId - The UUID of the song played
 * @returns true if successful, false otherwise
 */
export async function logSongPlay(songId: string): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('User not authenticated - skipping history log')
      return false
    }

    // Insert into song_history
    const { error } = await supabase
      .from('song_history')
      .insert([
        {
          user_id: user.id,
          song_id: songId,
          played_at: new Date().toISOString()
        }
      ])

    if (error) {
      console.error('Failed to log song play:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error logging song play:', err)
    return false
  }
}
