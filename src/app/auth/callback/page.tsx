'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const authError = searchParams.get('error_description') || hashParams.get('error_description')

      if (authError) {
        setMessage(authError)
        return
      }

      const code = searchParams.get('code')

      if (!code) {
        setMessage('Authentication link is missing a valid code. Please request a new sign-in link.')
        return
      }
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      )

      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        router.push('/')
      } else {
        setMessage(error.message)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="max-w-md px-6 text-center text-slate-400">{message}</p>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Processing authentication...</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
