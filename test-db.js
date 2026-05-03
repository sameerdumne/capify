const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zkcjqusxcwcsfukzdsxd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprY2pxdXN4Y3djc2Z1a3pkc3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3Mzg2OTksImV4cCI6MjA5MzMxNDY5OX0.Zy7wOzZf_Sx1z2zDdEQwCqNXUn8QccPahxeECWiYF2Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('🔍 Checking database...\n')

  // Check total count
  const { data: allSongs, error: countError } = await supabase
    .from('songs')
    .select('*', { count: 'exact' })

  if (countError) {
    console.error('❌ Error:', countError)
    return
  }

  console.log(`📊 Total songs in database: ${allSongs?.length || 0}`)

  if (allSongs && allSongs.length > 0) {
    console.log('\n✅ Sample songs:')
    allSongs.slice(0, 3).forEach((s, i) => {
      console.log(`\n${i + 1}. "${s.title}"`)
      console.log(`   Artist: ${s.artist}`)
      console.log(`   Language: ${s.language}`)
      console.log(`   Genre: ${s.genre}`)
      console.log(`   Mood: ${s.mood}`)
      console.log(`   Video ID: ${s.youtube_video_id}`)
    })

    // Check language distribution
    const languages = {}
    allSongs.forEach(s => {
      languages[s.language] = (languages[s.language] || 0) + 1
    })
    
    console.log('\n📈 Language distribution:')
    Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .forEach(([lang, count]) => {
        console.log(`   ${lang}: ${count}`)
      })
  } else {
    console.log('❌ No songs found in database!')
    console.log('   This means the seed_326.sql was not loaded into Supabase')
  }
}

checkDatabase().catch(console.error)
