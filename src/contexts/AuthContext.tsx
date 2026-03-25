'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getUserRole } from '@/lib/supabase/queries/user-roles'
import type { UserRole } from '@/lib/supabase/queries/user-roles'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<UserRole | null>(null)
  const isLoggedIn = !!session
  const supabase = useMemo(() => createClient(), [])

  const fetchRole = useCallback(async (userId: string) => {
    const userRole = await getUserRole(userId)
    setRole(userRole)
  }, [])

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        if (session?.user?.id) {
          fetchRole(session.user.id)
        }
      })
      .catch((error) => console.error('Error fetching session:', error))
      .finally(() => setLoading(false))

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (session?.user?.id) {
        fetchRole(session.user.id)
      } else {
        setRole(null)
      }
    })

    return () => data.subscription.unsubscribe()
  }, [supabase.auth, fetchRole])

  const clearAuth = useCallback(() => {
    setSession(null)
    setRole(null)
  }, [])

  return (
    <AuthContext.Provider value={{ session, setSession, loading, isLoggedIn, role, clearAuth }}>
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