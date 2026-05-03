#!/bin/bash

# Supabase credentials
SUPABASE_URL="https://zkcjqusxcwcsfukzdsxd.supabase.co"
ANON_KEY=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local | cut -d'=' -f2)

# Delete all existing songs
echo "Deleting old songs..."
curl -s -X DELETE \
  "$SUPABASE_URL/rest/v1/songs?id=neq.NULL" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json"

echo "✅ Deleted old songs"

# Now we'll insert new songs using the Node script approach
echo "Inserting new songs..."
node insert-songs.js
