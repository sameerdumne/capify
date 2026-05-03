#!/usr/bin/env python3
"""
Merge seed_326.sql and seed_643.sql
Deduplicates by video ID to get unique songs
"""

import re
import os

def extract_songs_from_file(filepath):
    """Extract song tuples from a seed file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    songs = []
    # Find all lines with gen_random_uuid()
    for line in content.split('\n'):
        if 'gen_random_uuid()' in line and "('" in line:
            # Keep the full line with the values
            songs.append(line.strip())
    
    return songs

def extract_video_id(song_line):
    """Extract video ID from a song line"""
    # Video IDs are usually at position 8 (after title, artist, lang, genre, mood, url, then video_id)
    matches = re.findall(r"'([a-zA-Z0-9_-]{11})'", song_line)
    if len(matches) >= 8:
        return matches[7]  # The 8th quoted string is the video ID
    return None

def merge_seeds(file1, file2, output_file):
    """Merge two seed files, deduplicating by video ID"""
    print(f"📂 Reading {os.path.basename(file1)}...")
    songs1 = extract_songs_from_file(file1)
    print(f"   Found {len(songs1)} songs")
    
    print(f"📂 Reading {os.path.basename(file2)}...")
    songs2 = extract_songs_from_file(file2)
    print(f"   Found {len(songs2)} songs")
    
    # Merge and deduplicate
    processed_ids = {}
    all_songs = []
    
    for songs in [songs1, songs2]:
        for song_line in songs:
            video_id = extract_video_id(song_line)
            if video_id and video_id not in processed_ids:
                processed_ids[video_id] = True
                all_songs.append(song_line)
    
    print(f"\n📊 Total unique songs: {len(all_songs)}")
    print(f"📈 Coverage: {(len(all_songs) / 800 * 100):.1f}% of 800 combinations")
    
    # Generate SQL
    sql_lines = [
        "-- Merged seed file: seed_326.sql + seed_643.sql",
        "-- Combines both datasets and deduplicates by video ID",
        f"-- Total unique songs: {len(all_songs)}",
        f"-- Coverage: {(len(all_songs) / 800 * 100):.1f}% of ideal (1 song per combination)",
        "",
        "insert into songs (id, title, artist, language, genre, mood, youtube_url, youtube_video_id, thumbnail_url, duration) values"
    ]
    
    # Clean up the song lines (remove trailing comma if exists)
    cleaned_songs = []
    for song in all_songs:
        song = song.rstrip(',')
        if song.endswith(');'):
            song = song[:-2]
        cleaned_songs.append(song)
    
    sql_lines.append(',\n'.join(cleaned_songs) + ';')
    
    # Write output
    output_content = '\n'.join(sql_lines)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(output_content)
    
    print(f"\n✅ Generated {os.path.basename(output_file)}")
    print(f"   File size: {len(output_content) / 1024:.1f}KB")
    print(f"   Location: {output_file}")
    
    print(f"\n📝 To use:")
    print(f"   1. Go to Supabase SQL Editor")
    print(f"   2. Run: DELETE FROM songs;")
    print(f"   3. Copy contents of supabase/{os.path.basename(output_file)}")
    print(f"   4. Paste into Supabase and run")
    print(f"   5. npm run dev")
    print(f"\n✨ This file contains BOTH the original 326 songs + new 643 songs!")

if __name__ == '__main__':
    file1 = '/Users/sameerdumne/Documents/capify/supabase/seed_326.sql'
    file2 = '/Users/sameerdumne/Documents/capify/supabase/seed_643.sql'
    output = '/Users/sameerdumne/Documents/capify/supabase/seed_merged.sql'
    
    merge_seeds(file1, file2, output)
