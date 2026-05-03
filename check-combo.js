const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://zkcjqusxcwcsfukzdsxd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprY2pxdXN4Y3djc2Z1a3pkc3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3Mzg2OTksImV4cCI6MjA5MzMxNDY5OX0.Zy7wOzZf_Sx1z2zDdEQwCqNXUn8QccPahxeECWiYF2Q'
)

async function check() {
  console.log('🔍 Checking Hindi + Classical + Chill\n')

  const { data: songs } = await supabase.from('songs').select('*').eq('language', 'Hindi').limit(100)
  
  console.log(`Hindi songs: ${songs?.length}`)
  
  let classical = songs?.filter(s => s.genre === 'Classical') || []
  console.log(`Hindi + Classical: ${classical.length}`)
  
  let chill = classical.filter(s => s.mood === 'Chill')
  console.log(`Hindi + Classical + Chill: ${chill.length}`)

  if (chill.length > 0) {
    console.log('\n✅ Found songs:')
    chill.forEach(s => console.log(`- "${s.title}" (${s.mood})`))
  } else {
    console.log('\n❌ No matches found!')
    console.log('\nGenre distribution in Hindi songs:')
    const genres = {}
    songs?.forEach(s => {
      genres[s.genre] = (genres[s.genre] || 0) + 1
    })
    Object.entries(genres).forEach(([g, c]) => console.log(`  ${g}: ${c}`))
    
    console.log('\nMood distribution in Hindi Classical songs:')
    const moods = {}
    classical.forEach(s => {
      moods[s.mood] = (moods[s.mood] || 0) + 1
    })
    Object.entries(moods).forEach(([m, c]) => console.log(`  ${m}: ${c}`))
  }
}

check().catch(console.error)
