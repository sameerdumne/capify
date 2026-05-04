"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      setLoading(false)
      return
    }

    try {
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Get current user
      const getUser = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          setUser(user)
        } catch (err) {
          console.error('Failed to get user:', err)
        } finally {
          setLoading(false)
        }
      }

      getUser()

      // Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null)
      })

      return () => subscription?.unsubscribe()
    } catch (err) {
      console.error('Supabase initialization failed:', err)
      setLoading(false)
    }
  }, [])

  const handleLogout = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/70 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo/Home */}
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-neon to-accent bg-clip-text text-transparent">
          🎵 Capify
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link href="/discover" className="text-slate-300 hover:text-white transition">
            Discover
          </Link>
          
          {user && (
            <Link href="/history" className="text-slate-300 hover:text-white transition">
              History
            </Link>
          )}

          {/* Auth Section */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 transition text-sm font-semibold"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-slate-300 hover:text-white transition text-sm"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-full bg-gradient-to-r from-neon to-accent text-black font-semibold text-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
