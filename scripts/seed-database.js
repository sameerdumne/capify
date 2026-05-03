#!/usr/bin/env node
/**
 * Supabase Database Seeding Script for Capify
 *
 * Usage:
 *   node scripts/seed-database.js
 *
 * Requires environment variables in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */

const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables.')
  console.error('   Please ensure .env.local contains:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runSQL(sql, description) {
  try {
    console.log(`  ⏳ ${description}...`)
    const { error, data } = await supabase.rpc('exec_sql', { sql })
    if (error) throw error
    console.log(`  ✓ ${description}`)
    return data
  } catch (err) {
    console.error(`  ❌ ${description}: ${err.message}`)
    return null
  }
}

async function seed() {
  console.log('\n🌱 Capify Database Seeding Script\n')

  // Read schema and seed files
  const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql')
  const seedPath = path.join(__dirname, '..', 'supabase', 'seed_100.sql')

  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema file not found: ${schemaPath}`)
    process.exit(1)
  }

  if (!fs.existsSync(seedPath)) {
    console.error(`❌ Seed file not found: ${seedPath}`)
    process.exit(1)
  }

  const schema = fs.readFileSync(schemaPath, 'utf-8')
  const seedData = fs.readFileSync(seedPath, 'utf-8')

  console.log('📝 Schema and seed files loaded\n')

  // Step 1: Create schema
  console.log('1️⃣  Creating database schema...')
  const schemaResult = await runSQL(schema, 'Create tables (songs, saved_songs, roles)')

  if (!schemaResult) {
    console.log('   (Tables may already exist, continuing to seed...)\n')
  } else {
    console.log()
  }

  // Step 2: Seed data
  console.log('2️⃣  Inserting 100 sample songs...')
  const seedResult = await runSQL(seedData, 'Insert song records')

  if (!seedResult) {
    console.error('\n❌ Seeding failed. Check your credentials and network.')
    process.exit(1)
  }

  console.log()

  // Step 3: Verify
  console.log('3️⃣  Verifying data...')
  try {
    const { count, error } = await supabase
      .from('songs')
      .select('id', { count: 'exact' })
      .limit(0)

    if (error) throw error

    if (count === 100) {
      console.log(`  ✓ Found ${count} songs in database\n`)
      console.log('✅ Seeding complete!\n')
      console.log('Next steps:')
      console.log('  1. Start the dev server: npm run dev')
      console.log('  2. Visit http://localhost:3000/discover')
      console.log('  3. Select language, genre, and mood to see recommendations\n')
      process.exit(0)
    } else {
      console.log(`  ⚠️  Expected 100 songs, found ${count}`)
      console.log('     (Some rows may have been inserted before)\n')
      process.exit(0)
    }
  } catch (err) {
    console.error(`  ❌ Verification failed: ${err.message}`)
    console.log('\n⚠️  Seeding may have completed, but verification failed.')
    console.log('    Check your Supabase dashboard to confirm.\n')
    process.exit(1)
  }
}

// Alternative: Direct insert without SQL function (if rpc doesn't work)
async function seedDirect() {
  console.log('\n🌱 Capify Database Seeding (Direct Insert)\n')

  const seedPath = path.join(__dirname, '..', 'supabase', 'seed_100.sql')
  if (!fs.existsSync(seedPath)) {
    console.error(`❌ Seed file not found: ${seedPath}`)
    process.exit(1)
  }

  const seedData = fs.readFileSync(seedPath, 'utf-8')

  // Parse INSERT statements manually (simplified)
  const lines = seedData.split('\n').filter(l => l.trim().startsWith('(gen_random_uuid'))

  console.log(`📝 Loaded ${lines.length} song records\n`)
  console.log('⏳ Note: Direct seeding requires manual SQL execution via Supabase dashboard.')
  console.log('   Please use SEEDING.md for step-by-step instructions.\n')

  process.exit(1)
}

seed().catch(err => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
