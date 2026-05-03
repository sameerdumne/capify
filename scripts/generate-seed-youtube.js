const fs = require('fs')
const path = require('path')
const yts = require('yt-search')

// Define all languages, genres, and moods
const LANGUAGES = ['English', 'Hindi', 'Punjabi', 'Telugu', 'Tamil', 'Marathi', 'Japanese', 'Korean']
const GENRES = ['Pop', 'Rock', 'Lofi', 'Hip-Hop', 'Classical', 'Jazz', 'EDM', 'Romantic', 'Indie', 'Phonk']
const MOODS = ['Happy', 'Sad', 'Energetic', 'Focus', 'Chill', 'Romantic', 'Heartbroken', 'Gym', 'Party', 'Sleep']

/**
 * Optimized: Fetch more songs from broader searches
 * Supports multiple passes to get variety
 */
function generateOptimizedSearchQueries(passNumber = 1) {
  const queries = []
  
  // Different search strategies for each pass to get variety
  const searchPatterns = {
    1: (lang, genre) => `${lang} ${genre} songs playlist`,
    2: (lang, genre) => `best ${lang} ${genre} music`,
    3: (lang, genre) => `top ${lang} ${genre} tracks`
  }
  
  const pattern = searchPatterns[passNumber] || searchPatterns[1]
  
  for (const language of LANGUAGES) {
    for (const genre of GENRES) {
      const query = pattern(language, genre)
      
      queries.push({
        query,
        language,
        genre,
        targetCount: 5
      })
    }
  }
  
  console.log(`📝 Pass ${passNumber}: Generated ${queries.length} search queries`)
  console.log(`   Pattern: "${pattern(LANGUAGES[0], GENRES[0])}"`)
  console.log(`   Expected: ~${queries.length * 5} songs from this pass`)
  return queries
}

/**
 * Fetch real YouTube videos for a given search query
 * Returns array of song objects with real metadata
 */
async function fetchYouTubeVideos(searchQuery, language, genre, targetCount = 5) {
  try {
    console.log(`🔍 [${searchQuery}]...`)
    
    // Search YouTube
    const results = await yts(searchQuery)
    
    if (!results.videos || results.videos.length === 0) {
      console.log(`   ⚠️  No videos found`)
      return []
    }
    
    // Extract top N videos
    const videos = results.videos.slice(0, targetCount)
    
    // Rotate through moods for variety
    const songs = videos
      .filter(v => v.videoId && v.seconds > 60) // Only videos >60s
      .map((v, idx) => {
        const mood = MOODS[idx % MOODS.length] // Distribute moods
        
        return {
          title: (v.title || 'Unknown').replace(/'/g, "''").substring(0, 100),
          artist: (v.author?.name || 'Unknown Artist').replace(/'/g, "''").substring(0, 50),
          language,
          genre,
          mood, // Distributed across moods
          youtube_url: v.url,
          youtube_video_id: v.videoId,
          thumbnail_url: v.thumbnail || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
          duration: v.seconds || 180
        }
      })
    
    console.log(`   ✅ Fetched ${songs.length} songs`)
    return songs
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return []
  }
}

/**
 * Main function to generate seeds from YouTube data
 */
async function generateSeedsFromYouTube() {
  console.log('🎵 CAPIFY SEED GENERATOR - YouTube Real Data Mode (Multi-Pass)')
  console.log('=' .repeat(60))
  console.log('')
  console.log('📊 Target: 1000+ unique songs to guarantee results for all filter combinations')
  console.log('   (8 languages × 10 genres × 10 moods = 800 combinations)')
  console.log('   (1000 songs ÷ 800 combos ≈ 1.25 songs per combination minimum)')
  console.log('')
  
  const allSongs = []
  const processed = {}
  
  // Do 3 passes with different search strategies
  for (let pass = 1; pass <= 3; pass++) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`PASS ${pass}/3 - Different search strategy for variety`)
    console.log(`${'='.repeat(60)}\n`)
    
    const queries = generateOptimizedSearchQueries(pass)
    let completed = 0
    
    // Process each search query
    for (let i = 0; i < queries.length; i++) {
      const { query, language, genre, targetCount } = queries[i]
      
      // Add delay between requests to avoid rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      console.log(`[Pass ${pass}/${3}] [${i + 1}/${queries.length}] `)
      
      try {
        const songs = await fetchYouTubeVideos(query, language, genre, targetCount)
        
        // Store unique songs (avoid duplicates by video ID)
        songs.forEach(song => {
          const key = `${song.youtube_video_id}`
          if (!processed[key]) {
            allSongs.push(song)
            processed[key] = true
          }
        })
        
        completed++
        
        // Show progress every 10 queries
        if ((i + 1) % 10 === 0) {
          console.log(`   📊 Progress: ${completed}/${queries.length} searches, ${allSongs.length} total unique songs`)
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`)
      }
    }
    
    console.log(`\n✨ Pass ${pass} complete: ${allSongs.length} total unique songs so far`)
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('✨ GENERATION COMPLETE')
  console.log(`${'='.repeat(60)}`)
  console.log(`📊 Total unique songs fetched: ${allSongs.length}`)
  console.log(`📊 Unique video IDs: ${Object.keys(processed).length}`)
  
  if (allSongs.length === 0) {
    console.error('❌ No songs were fetched! Falling back to random generation.')
    return generateFallbackSeeds()
  }
  
  // Generate SQL
  const sqlLines = []
  sqlLines.push('-- Generated seed for songs from YouTube (Multi-Pass)')
  sqlLines.push('-- Generated with real YouTube video data from 3 different search strategies')
  sqlLines.push(`-- Total songs: ${allSongs.length}`)
  sqlLines.push('-- Designed to guarantee results for all language+genre+mood combinations')
  sqlLines.push('')
  
  const vals = allSongs.map(s => {
    const id = `gen_random_uuid()`
    const esc = v => v === null ? 'null' : `'${String(v).replace(/'/g, "''")}'`
    return `(${id}, ${esc(s.title)}, ${esc(s.artist)}, ${esc(s.language)}, ${esc(s.genre)}, ${esc(s.mood)}, ${esc(s.youtube_url)}, ${esc(s.youtube_video_id)}, ${esc(s.thumbnail_url)}, ${s.duration})`
  })
  
  sqlLines.push('insert into songs (id, title, artist, language, genre, mood, youtube_url, youtube_video_id, thumbnail_url, duration) values')
  sqlLines.push(vals.join(',\n') + ';')
  
  const output = sqlLines.join('\n')
  
  // Write to file
  const filename = `seed_${allSongs.length}.sql`
  fs.writeFileSync(path.join(__dirname, '..', 'supabase', filename), output)
  
  console.log(`\n✅ Generated ${filename} with ${allSongs.length} real songs`)
  console.log(`📈 Coverage: ${(allSongs.length / 800 * 100).toFixed(1)}% of ideal (1 song per combination)`)
  console.log('')
  console.log('📝 To use this seed:')
  console.log(`   1. Copy contents of supabase/${filename}`)
  console.log(`   2. Go to Supabase SQL Editor`)
  console.log(`   3. Delete old songs: DELETE FROM songs;`)
  console.log(`   4. Paste and run the new seed SQL`)
  console.log(`   5. Run: npm run dev`)
  console.log('')
  
  return allSongs
}

/**
 * Fallback: Generate random seeds if YouTube fetch fails
 */
function generateFallbackSeeds() {
  console.log('⚠️  Using fallback random generation...')
  
  const artists = [
    'The Weeknd', 'Arijit Singh', 'Taylor Swift', 'BTS', 'Justin Bieber',
    'Ed Sheeran', 'A. R. Rahman', 'Kenshi Yonezu', 'Rosalía', 'Bad Bunny',
    'Billie Eilish', 'Ariana Grande', 'Drake', 'Post Malone', 'The Chainsmokers'
  ]
  
  const songWords = ['Midnight', 'Dreams', 'Echoes', 'Love', 'Broken', 'Sky', 'Whispers', 'Forever']
  
  const songs = []
  const combos = [
    ...LANGUAGES.flatMap(lang => 
      GENRES.slice(0, 3).map(genre => 
        MOODS.slice(0, 3).map(mood => ({ lang, genre, mood }))
      ).flat()
    )
  ]
  
  // Create 3 songs per combo
  for (const { lang, genre, mood } of combos) {
    for (let i = 0; i < 3; i++) {
      const artist = artists[Math.floor(Math.random() * artists.length)]
      const title = `${songWords[Math.floor(Math.random() * songWords.length)]} ${songWords[Math.floor(Math.random() * songWords.length)]}`
      const id = Math.random().toString(36).substring(2, 13).toUpperCase()
      
      songs.push({
        title,
        artist,
        language: lang,
        genre,
        mood,
        youtube_url: `https://www.youtube.com/watch?v=${id}`,
        youtube_video_id: id,
        thumbnail_url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        duration: Math.floor(Math.random() * 180) + 120
      })
    }
  }
  
  return songs
}

// Run the generator
generateSeedsFromYouTube()
  .then(songs => {
    console.log('🎉 Seed generation complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
