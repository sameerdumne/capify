const fs = require('fs')
const path = require('path')

/**
 * Combine multiple seed files and deduplicate
 */
async function combineSeeds() {
  const seedDir = path.join(__dirname, '..', 'supabase')
  
  // Read all seed files
  const files = fs.readdirSync(seedDir).filter(f => f.match(/seed_\d+\.sql$/))
  
  if (files.length === 0) {
    console.log('❌ No seed files found')
    return
  }
  
  console.log(`📂 Found ${files.length} seed files:`)
  files.forEach(f => console.log(`   - ${f}`))
  
  const allSongs = []
  const processed = {}
  
  // Parse and combine all seeds
  for (const file of files) {
    const filePath = path.join(seedDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // Extract INSERT statements
    const lines = content.split('\n')
    for (const line of lines) {
      // Look for lines with gen_random_uuid() - these are song inserts
      if (line.includes('gen_random_uuid()')) {
        // Extract video ID (rough parsing)
        const videoIdMatch = line.match(/'([a-zA-Z0-9_-]{11})'/g)
        if (videoIdMatch && videoIdMatch.length >= 8) {
          const videoId = videoIdMatch[7].replace(/'/g, '')
          
          if (!processed[videoId]) {
            allSongs.push(line.trim())
            processed[videoId] = true
          }
        }
      }
    }
  }
  
  console.log(`\n📊 Total unique songs: ${allSongs.length}`)
  console.log(`📈 Coverage: ${(allSongs.length / 800 * 100).toFixed(1)}% of ideal`)
  
  // Generate combined SQL
  const sqlLines = []
  sqlLines.push('-- Combined seed from multiple generations')
  sqlLines.push(`-- Total songs: ${allSongs.length}`)
  sqlLines.push('-- Deduplicated across multiple seed files')
  sqlLines.push('')
  sqlLines.push('insert into songs (id, title, artist, language, genre, mood, youtube_url, youtube_video_id, thumbnail_url, duration) values')
  
  const songValues = allSongs.map(line => {
    // Remove the insert statement and get just the values
    return line.split('values')[1] || line
  }).filter(Boolean)
  
  if (songValues.length > 0) {
    sqlLines.push(songValues.join(',\n') + ';')
  } else {
    // Fallback: use the original parsing method
    sqlLines.push(allSongs.join(',\n') + ';')
  }
  
  const output = sqlLines.join('\n')
  const outfile = `seed_${allSongs.length}_combined.sql`
  fs.writeFileSync(path.join(seedDir, outfile), output)
  
  console.log(`\n✅ Generated ${outfile}`)
  console.log(`📁 Location: supabase/${outfile}`)
  console.log('\n📝 To use:')
  console.log(`   1. Delete old songs: DELETE FROM songs;`)
  console.log(`   2. Copy contents of supabase/${outfile}`)
  console.log(`   3. Paste into Supabase SQL Editor and run`)
}

combineSeeds().catch(console.error)
