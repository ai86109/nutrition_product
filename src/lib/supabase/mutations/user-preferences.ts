import { createClient } from '@/utils/supabase/client'

export async function upsertUserPreferences(userId, preferences) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        ...preferences
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('Error upserting user preferences:', error)
    throw error
  }

  return data
}

export async function updateUserPreferences(userId, preferences) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_preferences')
    .update(preferences)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user preferences:', error)
    throw error
  }

  return data
}