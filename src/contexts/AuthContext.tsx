'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => setSession(session))
      .catch((error) => console.error('Error fetching session:', error))
      .finally(() => setLoading(false))

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, setSession, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}