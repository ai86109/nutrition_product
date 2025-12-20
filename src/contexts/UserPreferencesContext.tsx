'use client'

import { createClient } from '@/utils/supabase/client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserPreferences } from '@/lib/supabase/queries/user-preferences'
import { DEFAULT_TDEE_SETTINGS } from '@/utils/constants'

const UserPreferencesContext = createContext(undefined)

export function UserPreferencesProvider({ children }) {
  const supabase = createClient()
  const { session } = useAuth()
  const { id: userId } = session?.user || {}
  const [calorieFactors, setCalorieFactors] = useState([])
  const [tdeeFactors, setTdeeFactors] = useState(DEFAULT_TDEE_SETTINGS)
  const [proteinFactors, setProteinFactors] = useState([])

  const loadUserPreferences = useCallback( async () => {
    if (!userId) {
      // 給預設值
      setTdeeFactors(DEFAULT_TDEE_SETTINGS)
      return 
    }

    try {
      const data = await getUserPreferences(userId)
      if (data) {
        setCalorieFactors(data.calorie_factors || [])
        setTdeeFactors(data.tdee_factors || DEFAULT_TDEE_SETTINGS)
        setProteinFactors(data.protein_factors || [])
      }
    } catch (error) {
      console.error('Error loading user preferences:', error)
    }
  }, [userId])

  useEffect(() => {
    loadUserPreferences()
  }, [loadUserPreferences])

  return (
    <UserPreferencesContext.Provider value={{
      calorieFactors,
      tdeeFactors,
      proteinFactors,
      refresh: loadUserPreferences,
    }}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }
  return context
}