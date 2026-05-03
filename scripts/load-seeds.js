const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function loadSeedsIntoSupabase() {
  console.log('🚀 Loading 643 songs into Supabase...\n')

  const supabase = createClient(
    'https://zkcjqusxcwcsfukzdsxd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprY2pxdXN4Y3djc2Z1a3pkc3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3Mzg2OTksImV4cCI6MjA5MzMxNDY5OX0.Zy7wOzZf_Sx1z2zDdEQwCqNXUn8QccPahxeECWiYF2Q'
  )

  // Step 1: Delete old songs
  console.log('📋 Step 1: Deleting old songs...')
  const { error: deleteError, count: deletedCount } = await supabase
    .from('songs')
    .delete()
    .neq('id', '')  // Delete all rows

  if (deleteError) {
    console.error('❌ Failed to delete old songs:', deleteError)
    return
  }

  console.log(`✅ Deleted old songs (if any existed)`)

  // Step 2: Read seed file
  console.log('\n📂 Step 2: Reading seed file...')
  const seedPath = path.join(__dirname, '..', 'supabase', 'seed_643.sql')
  
  if (!fs.existsSync(seedPath)) {
    console.error(`❌ Seed file not found: ${seedPath}`)
    console.log('   Available seed files:')
    const seedDir = path.join(__dirname, '..', 'supabase')
    fs.readdirSync(seedDir)
      .filter(f => f.match(/seed_\d+\.sql$/))
      .forEach(f => console.log(`   - ${f}`))
    return
  }

  const seedContent = fs.readFileSync(seedPath, 'utf-8')
  console.log(`✅ Read seed file (${seedContent.length} bytes)`)

  // Step 3: Parse INSERT statements
  console.log('\n🔍 Step 3: Parsing songs...')
  const songs = []
  const lines = seedContent.split('\n')
  
  for (const line of lines) {
    if (line.includes('gen_random_uuid()') && line.includes("('") ) {
      try {
        // Extract the tuple content between the parentheses
        const match = line.match(/\((gen_random_uuid\(\),\s*'.*?',\s*'.*?',\s*'.*?',\s*'.*?',\s*'.*?',\s*'.*?',\s*'.*?',\s*'.*?',\s*\d+)\)/)
        
        if (match) {
          // Parse individual fields from the INSERT
          const content = match[1]
          
          // Extract values manually (better approach)
          const parts = line.split("(gen_random_uuid(), ")[1].split("),")[0]
          
          if (parts) {
            // Split by comma but respect quoted strings
            const fields = []
            let current = ''
            let inQuote = false
            
            for (let i = 0; i < parts.length; i++) {
              const char = parts[i]
              if (char === "'" && parts[i-1] !== '\\') {
                inQuote = !inQuote
              }
              if (char === ',' && !inQuote) {
                fields.push(current.trim().replace(/^'|'$/g, ''))
                current = ''
              } else {
                current += char
              }
            }
            fields.push(current.trim().replace(/^'|'$/g, ''))
            
            if (fields.length >= 9) {
              songs.push({
                title: fields[0],
                artist: fields[1],
                language: fields[2],
                genre: fields[3],
                mood: fields[4],
                youtube_url: fields[5],
                youtube_video_id: fields[6],
                thumbnail_url: fields[7],
                duration: parseInt(fields[8])
              })
            }
          }
        }
      } catch (e) {
        // Skip parse errors
      }
    }
  }

  console.log(`✅ Parsed ${songs.length} songs`)

  if (songs.length === 0) {
    console.error('❌ No songs parsed! The seed file format may be incorrect.')
    console.log('   Please load the seed file manually through Supabase SQL Editor.')
    return
  }

  // Step 4: Insert into database
  console.log(`\n⚙️  Step 4: Inserting ${songs.length} songs into database...`)
  
  // Insert in batches of 100
  const batchSize = 100
  for (let i = 0; i < songs.length; i += batchSize) {
    const batch = songs.slice(i, i + batchSize)
    
    const { error: insertError, data } = await supabase
      .from('songs')
      .insert(batch)
    
    if (insertError) {
      console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, insertError)
      console.log(`   Please try loading manually through Supabase SQL Editor`)
      return
    }
    
    const progress = Math.min(i + batchSize, songs.length)
    console.log(`   Inserted ${progress}/${songs.length} songs...`)
  }

  // Step 5: Verify
  console.log('\n✅ Step 5: Verifying...')
  const { data: allSongs, error: countError } = await supabase
    .from('songs')
    .select('COUNT()', { count: 'exact' })

  if (countError) {
    console.error('❌ Verification failed:', countError)
    return
  }

  const finalCount = allSongs?.length || 0
  console.log(`✅ Successfully loaded ${finalCount} songs into Supabase!`)

  console.log(`\n${'='.repeat(60)}`)
  console.log('🎉 COMPLETE!')
  console.log(`${'='.repeat(60)}`)
  console.log(`📊 Total songs: ${finalCount}`)
  console.log(`📈 Coverage: ${(finalCount / 800 * 100).toFixed(1)}% of 800 combinations`)
  console.log('\n✨ Next steps:')
  console.log('   1. npm run dev')
  console.log('   2. Open http://localhost:3000')
  console.log('   3. Try the discovery flow!')
}

loadSeedsIntoSupabase().catch(console.error)
