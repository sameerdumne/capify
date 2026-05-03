-- Seed sample songs for Capify

insert into songs (title, artist, language, genre, mood, youtube_url, youtube_video_id, thumbnail_url, duration)
values
('Blinding Lights', 'The Weeknd', 'English', 'Pop', 'Energetic', 'https://www.youtube.com/watch?v=4NRXx6U8ABQ', '4NRXx6U8ABQ', 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg', 200),
('Tum Hi Ho', 'Arijit Singh', 'Hindi', 'Romantic', 'Romantic', 'https://www.youtube.com/watch?v=V2uN8N3J-4k', 'V2uN8N3J-4k', 'https://i.ytimg.com/vi/V2uN8N3J-4k/hqdefault.jpg', 245),
('Naatu Naatu', 'Rahul Sipligunj', 'Telugu', 'EDM', 'Energetic', 'https://www.youtube.com/watch?v=4Qf2I3tKQW4', '4Qf2I3tKQW4', 'https://i.ytimg.com/vi/4Qf2I3tKQW4/hqdefault.jpg', 180)
;

-- NOTE: Add more rows to reach 100 mixed entries when seeding in production.
