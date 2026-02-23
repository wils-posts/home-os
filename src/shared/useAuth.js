import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

// status: 'loading' | 'unauthenticated' | 'allowed' | 'blocked'
export function useAuth() {
  const [status, setStatus] = useState('loading')
  const [session, setSession] = useState(null)

  async function checkAllowlist(userEmail) {
    const { data, error } = await supabase
      .from('allowed_users')
      .select('email')
      .eq('email', userEmail)
      .maybeSingle()

    if (error || !data) {
      setStatus('blocked')
    } else {
      setStatus('allowed')
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        checkAllowlist(session.user.email)
      } else {
        setStatus('unauthenticated')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        checkAllowlist(session.user.email)
      } else {
        setStatus('unauthenticated')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function sendOtp(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    if (error) throw error
  }

  async function verifyOtp(email, token) {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (error) throw error
    // onAuthStateChange fires after this and triggers checkAllowlist
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { status, session, sendOtp, verifyOtp, signOut }
}
