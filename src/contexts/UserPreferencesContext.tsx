'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserPreferences } from '@/lib/supabase/queries/user-preferences'
import {
  DEFAULT_CALORIE_SETTINGS,
  DEFAULT_TDEE_SETTINGS,
  DEFAULT_PROTEIN_SETTINGS,
  DEFAULT_HISTORY_SETTINGS,
  DEFAULT_FAVORITE_SETTINGS,
  DEFAULT_NOTE_TEMPLATES_SETTINGS,
} from '@/utils/constants'

type CalorieFactors = typeof DEFAULT_CALORIE_SETTINGS
type TdeeFactors = typeof DEFAULT_TDEE_SETTINGS
type ProteinFactors = typeof DEFAULT_PROTEIN_SETTINGS
type HistoryList = typeof DEFAULT_HISTORY_SETTINGS
type FavoriteList = typeof DEFAULT_FAVORITE_SETTINGS
type NoteTemplateList = typeof DEFAULT_NOTE_TEMPLATES_SETTINGS

type UserPreferencesContextValue = {
  calorieFactors: CalorieFactors
  tdeeFactors: TdeeFactors
  proteinFactors: ProteinFactors
  history: HistoryList
  favorites: FavoriteList
  noteTemplates: NoteTemplateList
  refresh: () => Promise<void>
}

const UserPreferencesContext = createContext<UserPreferencesContextValue | undefined>(undefined)

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth()
  const { id: userId } = session?.user || {}
  const [calorieFactors, setCalorieFactors] = useState(DEFAULT_CALORIE_SETTINGS)
  const [tdeeFactors, setTdeeFactors] = useState(DEFAULT_TDEE_SETTINGS)
  const [proteinFactors, setProteinFactors] = useState(DEFAULT_PROTEIN_SETTINGS)
  const [history, setHistory] = useState(DEFAULT_HISTORY_SETTINGS)
  const [favorites, setFavorites] = useState(DEFAULT_FAVORITE_SETTINGS)
  const [noteTemplates, setNoteTemplates] = useState<NoteTemplateList>(DEFAULT_NOTE_TEMPLATES_SETTINGS)

  const loadUserPreferences = useCallback( async () => {
    if (!userId) {
      setCalorieFactors(DEFAULT_CALORIE_SETTINGS)
      setTdeeFactors(DEFAULT_TDEE_SETTINGS)
      setProteinFactors(DEFAULT_PROTEIN_SETTINGS)
      setHistory(DEFAULT_HISTORY_SETTINGS)
      setFavorites(DEFAULT_FAVORITE_SETTINGS)
      setNoteTemplates(DEFAULT_NOTE_TEMPLATES_SETTINGS)
      return
    }

    try {
      const data = await getUserPreferences(userId)
      if (data) {
        setCalorieFactors(data.calorie_factors || DEFAULT_CALORIE_SETTINGS)
        setTdeeFactors(data.tdee_factors || DEFAULT_TDEE_SETTINGS)
        setProteinFactors(data.protein_factors || DEFAULT_PROTEIN_SETTINGS)
        setHistory(data.search_history || DEFAULT_HISTORY_SETTINGS)
        setFavorites(data.favorites || DEFAULT_FAVORITE_SETTINGS)
        setNoteTemplates(data.note_templates || DEFAULT_NOTE_TEMPLATES_SETTINGS)
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
      history,
      favorites,
      noteTemplates,
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
