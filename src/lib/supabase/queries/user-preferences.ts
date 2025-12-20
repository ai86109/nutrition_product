import { createClient } from '@/utils/supabase/client'

export async function getUserPreferences(userId: string) {
  const supabse = createClient()
  const { data, error } = await supabse
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching user preferences from Supabase:', error)
    return []
  }

  return data[0]
}