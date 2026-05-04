import Link from 'next/link'
import MoodHistoryPieChart from '../components/MoodHistoryPieChart'
import RandomSongWidget from '../components/RandomSongWidget'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-6 py-12">
      <section className="max-w-5xl w-full">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl p-10 glass mb-12">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/30 via-[#0b1220]/20 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Capify</h1>
            <p className="text-lg text-slate-300 mb-6">Discover songs by language, genre and mood — curated for you.</p>
            <Link href="/discover" className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-neon to-accent text-black font-semibold">Discover Songs</Link>
          </div>
        </div>

        <MoodHistoryPieChart />

        {/* Random Song Section */}
        <div className="glass rounded-3xl p-10">
          <RandomSongWidget />
        </div>
      </section>
    </div>
  )
}
