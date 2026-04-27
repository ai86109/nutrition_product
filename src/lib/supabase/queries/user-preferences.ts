import { createClient } from '@/utils/supabase/client'

export async function getUserPreferences(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching user preferences from Supabase:', error)
    return []
  }

  return data[0]
}