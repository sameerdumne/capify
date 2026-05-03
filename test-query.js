const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zkcjqusxcwcsfukzdsxd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprY2pxdXN4Y3djc2Z1a3pkc3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3Mzg2OTksImV4cCI6MjA5MzMxNDY5OX0.Zy7wOzZf_Sx1z2zDdEQwCqNXUn8QccPahxeECWiYF2Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
  console.log('🔍 Testing query with English + Pop + Happy\n')

  const { data: enSongs } = await supabase.from('songs').select('*').eq('language', 'English').limit(50)
  console.log(`1️⃣ English songs: ${enSongs?.length || 0}`)
  
  let filtered = enSongs || []
  filtered = filtered.filter(s => s.genre === 'Pop')
  console.log(`2️⃣ English + Pop: ${filtered.length}`)
  
  filtered = filtered.filter(s => s.mood === 'Happy')
  console.log(`3️⃣ English + Pop + Happy: ${filtered.length}`)
  
  if (filtered.length > 0) {
    console.log('\n✅ Success! Songs found:')
    filtered.slice(0, 2).forEach((s, i) => {
      console.log(`${i + 1}. "${s.title}" - ${s.artist}`)
    })
  }
}

testQuery().catch(console.error)
