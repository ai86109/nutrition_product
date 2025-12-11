'use client'

import AuthForm from "@/components/auth-form";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle, signOut } from "@/utils/supabase/auth"

export default function Page() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {user ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      )}
    </div>
  );
}