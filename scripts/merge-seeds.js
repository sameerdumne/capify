const fs = require('fs')
const path = require('path')

/**
 * Merge seed_326.sql and seed_643.sql into one file
 * Deduplicates by video ID to avoid duplicates
 */
function mergeSeedFiles() {
  console.log('🎵 Merging seed files...\n')

  const seedDir = path.join(__dirname, '..', 'supabase')
  const file326 = path.join(seedDir, 'seed_326.sql')
  const file643 = path.join(seedDir, 'seed_643.sql')

  // Check both files exist
  if (!fs.existsSync(file326)) {
    console.error('❌ seed_326.sql not found')
    return
  }
  if (!fs.existsSync(file643)) {
    console.error('❌ seed_643.sql not found')
    return
  }

  console.log('📂 Reading seed files...')
  const content326 = fs.readFileSync(file326, 'utf-8')
  const content643 = fs.readFileSync(file643, 'utf-8')

  // Extract all INSERT value tuples
  const allValues = []
  const processedIds = {}

  // Process both files
  for (const content of [content326, content643]) {
    const lines = content.split('\n')
    for (const line of lines) {
      // Look for lines with gen_random_uuid()
      if (line.includes('gen_random_uuid()') && line.includes("('")) {
        // Extract video ID to check for duplicates
        const videoIdMatch = line.match(/'([a-zA-Z0-9_-]{11})'/g)
        
        if (videoIdMatch && videoIdMatch.length >= 8) {
          // The 8th quoted string is typically the video ID
          const videoId = videoIdMatch[7].replace(/'/g, '')
          
          if (!processedIds[videoId]) {
            processedIds[videoId] = true
            
            // Extract just the values part (without "insert into..." or newline)
            const valueMatch = line.match(/\((gen_random_uuid\(\),.*)\),?$/)
            if (valueMatch) {
              allValues.push(`(${valueMatch[1]})`)
            }
          }
        }
      }
    }
  }

  console.log(`✅ File 1: seed_326.sql`)
  console.log(`✅ File 2: seed_643.sql`)
  console.log(`📊 Total unique songs (deduplicated): ${allValues.length}\n`)

  // Generate merged SQL
  const sqlLines = []
  sqlLines.push('-- Merged seed file combining seed_326.sql and seed_643.sql')
  sqlLines.push(`-- Total unique songs: ${allValues.length}`)
  sqlLines.push('-- Deduplicated by video ID')
  sqlLines.push(`-- Coverage: ${(allValues.length / 800 * 100).toFixed(1)}% of ideal (1 song per combination)`)
  sqlLines.push('')
  sqlLines.push('insert into songs (id, title, artist, language, genre, mood, youtube_url, youtube_video_id, thumbnail_url, duration) values')
  sqlLines.push(allValues.join(',\n') + ';')

  const output = sqlLines.join('\n')
  const outfile = `seed_${allValues.length}_merged.sql`
  fs.writeFileSync(path.join(seedDir, outfile), output)

  console.log(`✨ Generated: ${outfile}`)
  console.log(`📊 File size: ${(output.length / 1024).toFixed(1)}KB`)
  console.log(`📈 Coverage: ${(allValues.length / 800 * 100).toFixed(1)}% of 800 combinations`)
  console.log(`\n📝 To use this merged file:`)
  console.log(`   1. Go to Supabase SQL Editor`)
  console.log(`   2. Run: DELETE FROM songs;`)
  console.log(`   3. Copy contents of supabase/${outfile}`)
  console.log(`   4. Paste and run in Supabase SQL Editor`)
  console.log(`   5. Run: npm run dev`)
  console.log('')
  console.log(`✅ Both old and new songs will be kept!`)
}

mergeSeedFiles()
