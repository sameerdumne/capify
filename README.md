# Capify

A modern music discovery web app built with Next.js (App Router), TypeScript, Tailwind CSS, Supabase, and YouTube embeds. Discover songs based on language, genre, and mood with a beautiful, responsive UI.

**Status: ✅ Working! Discovery flow is fully functional with 100 seeded songs.**

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local`
3. Fill in your Supabase URL and anon key from Project Settings > API

### 3. Create Database Schema & Seed Data

See [SEEDING.md](./SEEDING.md) for detailed instructions.

**Quick path:**
- Go to Supabase SQL Editor
- Run `supabase/schema.sql` (create tables)
- Run `supabase/seed_100.sql` (insert 100 songs)

### 4. Start Dev Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the app.

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages & layouts
├── components/       # Reusable React components
├── lib/             # Supabase client & helpers
├── types/           # TypeScript interfaces
├── utils/           # Utility functions
└── app/globals.css  # Global styles (Tailwind)

supabase/
├── schema.sql       # Database tables schema
├── seed_100.sql     # 100 sample song records

scripts/
├── generate-seed.js # Generate seed file
└── seed-database.js # Auto-seed via Node.js
```

## 🗄️ Database

### Tables

- **songs**: Title, artist, language, genre, mood, YouTube URL/ID, thumbnail, duration
- **saved_songs**: User favorites (references songs & auth.users)
- **roles**: User roles (optional, for admin access)

## 🔑 Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For Netlify, add the same variables in **Site configuration → Environment variables**.

## 🚢 Deploy to Netlify

This repo includes `netlify.toml` and a Netlify Function for `/api/random-song`.

Netlify build settings:

```
Build command: npm run build
Publish directory: .next
Functions directory: netlify/functions
```

The `/api/random-song` route is proxied to `/.netlify/functions/random-song`, so existing frontend calls keep working after deployment.

## 📚 Scripts

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run typecheck # Run TypeScript typecheck
```

## ✅ Completed Features

- [x] Next.js App Router scaffold
- [x] Tailwind CSS & dark mode
- [x] Database schema (songs, saved_songs, roles)
- [x] 100 seed songs (mixed languages, genres, moods)
- [x] Landing page layout
- [x] Discovery flow (language → genre → mood stepper)
- [x] Results page (server component)
- [x] Song cards with YouTube embeds
- [x] Responsive grid layout
- [x] TypeScript strict mode
- [x] ESLint & code quality

## 🔄 In Progress / TODO

- [ ] Supabase Auth (Google, GitHub, Email)
- [ ] Session persistence & protected routes
- [ ] Save/unsave songs feature
- [ ] Saved songs dashboard
- [ ] Advanced search & filters
- [ ] Admin panel (song CRUD)
- [ ] Framer Motion animations
- [ ] Lucide icons integration
- [ ] Sonner toast notifications
- [ ] Image optimization
- [ ] Lazy loading & skeletons
- [ ] Accessibility (ARIA, keyboard nav)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS 3
- **Backend**: Supabase (PostgreSQL, Auth)
- **Libraries**: Framer Motion, Lucide, Sonner
- **Deployment**: Netlify

## 📖 Learning Resources

- [SEEDING.md](./SEEDING.md) — Database setup guide
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
