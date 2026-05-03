const fs = require('fs')
const path = require('path')

const LANGUAGES = ['English','Hindi','Japanese','Korean','Punjabi','Marathi','Tamil','Telugu']
const GENRES = ['Pop','Rock','Lofi','Hip-Hop','Classical','Jazz','EDM','Romantic','Indie','Phonk']
const MOODS = ['Happy','Sad','Energetic','Focus','Chill','Romantic','Heartbroken','Gym','Party','Sleep']
const ARTISTS = ['The Weeknd','Arijit Singh','Taylor Swift','BTS','Justin Bieber','Ed Sheeran','A. R. Rahman','Kenshi Yonezu','Rosalía','Bad Bunny','Sia','Coldplay','Imagine Dragons','Alan Walker','Billie Eilish']

function randomChoice(arr){ return arr[Math.floor(Math.random()*arr.length)] }
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min }
function fakeYouTubeId(){ const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'; let s=''; for(let i=0;i<11;i++) s+=chars[Math.floor(Math.random()*chars.length)]; return s }

function makeTitle(genre){
  const words = ['Midnight','Echoes','Dreams','Sunset','Love','Broken','Sky','Whispers','Run','Forever','Heartbeat','Rendezvous','Neon','Waves','Horizon']
  return `${randomChoice(words)} ${randomChoice(words)}`
}

const rows = []

// First, ensure we have songs for common filter combinations (guarantee user can find results)
const guaranteedCombos = [
  { language: 'English', genre: 'Pop', mood: 'Happy' },
  { language: 'English', genre: 'Pop', mood: 'Party' },
  { language: 'English', genre: 'Rock', mood: 'Energetic' },
  { language: 'English', genre: 'Hip-Hop', mood: 'Gym' },
  { language: 'Hindi', genre: 'Romantic', mood: 'Romantic' },
  { language: 'Hindi', genre: 'Pop', mood: 'Happy' },
  { language: 'Punjabi', genre: 'Hip-Hop', mood: 'Party' },
  { language: 'Japanese', genre: 'Lofi', mood: 'Chill' },
  { language: 'Korean', genre: 'Pop', mood: 'Happy' },
  { language: 'Tamil', genre: 'Classical', mood: 'Focus' },
  { language: 'Telugu', genre: 'Pop', mood: 'Party' },
  { language: 'Marathi', genre: 'Jazz', mood: 'Chill' }
]

// Create 2-3 songs for each guaranteed combo
guaranteedCombos.forEach(combo => {
  for (let j = 0; j < (Math.random() > 0.5 ? 3 : 2); j++) {
    const artist = randomChoice(ARTISTS)
    const title = makeTitle(combo.genre)
    const id = fakeYouTubeId()
    const url = `https://www.youtube.com/watch?v=${id}`
    const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    const duration = randInt(120,320)

    rows.push({ 
      title, artist, 
      language: combo.language, 
      genre: combo.genre, 
      mood: combo.mood,
      youtube_url: url, 
      youtube_video_id: id, 
      thumbnail_url: thumb, 
      duration 
    })
  }
})

// Fill rest with random combinations until we hit 100
while (rows.length < 100) {
  const genre = randomChoice(GENRES)
  const mood = randomChoice(MOODS)
  const language = randomChoice(LANGUAGES)
  const artist = randomChoice(ARTISTS)
  const title = makeTitle(genre)
  const id = fakeYouTubeId()
  const url = `https://www.youtube.com/watch?v=${id}`
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  const duration = randInt(120,320)

  rows.push({ title, artist, language, genre, mood, youtube_url: url, youtube_video_id: id, thumbnail_url: thumb, duration })
}

const sqlLines = []
sqlLines.push('-- Generated seed for 100 songs')
sqlLines.push('insert into songs (id, title, artist, language, genre, mood, youtube_url, youtube_video_id, thumbnail_url, duration) values')

const vals = rows.map(r => {
  const id = `gen_random_uuid()`
  const esc = v => v === null ? 'null' : `'${String(v).replace(/'/g, "''")}'`
  return `(${id}, ${esc(r.title)}, ${esc(r.artist)}, ${esc(r.language)}, ${esc(r.genre)}, ${esc(r.mood)}, ${esc(r.youtube_url)}, ${esc(r.youtube_video_id)}, ${esc(r.thumbnail_url)}, ${r.duration})`
})

sqlLines.push(vals.join(',\n') + ';')

const out = sqlLines.join('\n')
fs.writeFileSync(path.join(__dirname,'..','supabase','seed_100.sql'), out)
console.log('Wrote supabase/seed_100.sql with 100 rows')
