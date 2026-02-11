"use server"

import { createClientForServer } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

const signInWith = provider => async () => {
  const supabase = await createClientForServer()
  const auth_callback_url = `${process.env.SITE_URL}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { 
      redirectTo: auth_callback_url,
    },
  })

  if (error) {
    console.error('Error during sign-in:', error)
    throw error
  }

  redirect(data.url)
}

export const signInWithGoogle = signInWith('google')

export const signOut = async () => {
  const supabase = await createClientForServer()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error during sign-out:', error)
    throw error
  }
}