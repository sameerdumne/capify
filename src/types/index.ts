export type Language = 'English' | 'Hindi' | 'Japanese' | 'Korean' | 'Punjabi' | 'Marathi' | 'Tamil' | 'Telugu'

export type Genre = 'Pop' | 'Rock' | 'Lofi' | 'Hip-Hop' | 'Classical' | 'Jazz' | 'EDM' | 'Romantic' | 'Indie' | 'Phonk'

export type Mood = 'Happy' | 'Sad' | 'Energetic' | 'Focus' | 'Chill' | 'Romantic' | 'Heartbroken' | 'Gym' | 'Party' | 'Sleep'

export interface Song {
  id: string
  title: string
  artist: string
  language: Language | string
  genre: Genre | string
  mood: Mood | string
  youtube_url: string
  youtube_video_id: string
  thumbnail_url?: string
  duration?: number
}
