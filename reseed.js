const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Read .env.local
const envContent = fs.readFileSync('.env.local', 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function reseed() {
  try {
    console.log('🗑️  Deleting old songs...')
    const { error: deleteError } = await supabase
      .from('songs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (deleteError) {
      console.error('Delete error:', deleteError)
      return
    }
    console.log('✅ Old songs deleted')
    
    // Parse the seed SQL file to extract song data
    const seedSQL = fs.readFileSync('supabase/seed_100.sql', 'utf8')
    
    // Split by ) to get individual records
    const valueLines = seedSQL.split('\n').slice(2) // Skip comment and VALUES line
    
    const songs = []
    let buffer = ''
    
    // Rebuild the values part
    for (const line of valueLines) {
      if (line.includes('values')) continue
      buffer += line + '\n'
    }
    
    // Now split by ), ( to get each record
    const records = buffer.split(/\),\s*\(/g)
    
    for (const record of records) {
      const clean = record.replace(/^\(/, '').replace(/\);?$/, '')
      
      // Simple value extraction: split by comma, but be careful with quoted strings
      const values = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < clean.length; i++) {
        const char = clean[i]
        if (char === "'" && (i === 0 || clean[i-1] !== '\\')) {
          inQuotes = !inQuotes
        }
        if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      if (current) values.push(current.trim())
      
      if (values.length >= 9) {
        // Extract values (skip gen_random_uuid())
        const unquote = (str) => {
          if (str === 'gen_random_uuid()') return undefined
          if (str.startsWith("'") && str.endsWith("'")) {
            return str.slice(1, -1).replace(/''/g, "'")
          }
          return str
        }
        
        const song = {
          title: unquote(values[1]),
          artist: unquote(values[2]),
          language: unquote(values[3]),
          genre: unquote(values[4]),
          mood: unquote(values[5]),
          youtube_url: unquote(values[6]),
          youtube_video_id: unquote(values[7]),
          thumbnail_url: unquote(values[8]),
          duration: parseInt(values[9])
        }
        
        if (song.title && song.artist) {
          songs.push(song)
        }
      }
    }
    
    console.log(`\n📝 Inserting ${songs.length} new songs...`)
    
    // Insert in batches of 10
    for (let i = 0; i < songs.length; i += 10) {
      const batch = songs.slice(i, i + 10)
      const { error: insertError } = await supabase
        .from('songs')
        .insert(batch)
      
      if (insertError) {
        console.error(`Error inserting batch ${i/10 + 1}:`, insertError)
      } else {
        console.log(`✅ Inserted songs ${i + 1}-${Math.min(i + 10, songs.length)}`)
      }
    }
    
    console.log(`\n✨ Done! Inserted ${songs.length} songs`)
  } catch (error) {
    console.error('Error:', error.message)
  }
}

reseed()

