'use client'

import { signInWithGoogle } from "@/utils/supabase/auth"

export default function AuthForm() {
  return (
    <form>
      <button className="btn" formAction={signInWithGoogle}>Sign in with Google</button>
    </form>
  )
}