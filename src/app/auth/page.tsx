'use client'

import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle, signOut } from "@/utils/supabase/auth"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import ConditionalContent from "@/components/conditional-content";
import { useRouter } from 'next/navigation'

export default function Page() {
  const { session, clearAuth, loading } = useAuth();
  const router = useRouter();
  const user = session?.user || null;

  const handleSignOut = async () => {
    await signOut();
    await clearAuth();
    router.push('/')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Card className="w-100 max-w-[370px] flex flex-col items-center justify-center">
        <CardHeader className="w-100 text-center">
          <ConditionalContent condition={!loading} fallback={<Skeleton className="h-8 w-[150px] mx-auto" />}>
            <CardTitle><p>{user ? "登出" : "建立 / 登入帳號"}</p></CardTitle>
          </ConditionalContent>
        </CardHeader>
        <CardContent>
          <ConditionalContent condition={!loading} fallback={<Skeleton className="h-8 w-[250px]" />}>
            {user ? (
              <Button className="cursor-pointer" onClick={handleSignOut}>Sign Out</Button>
            ) : (
              <Button className="cursor-pointer" onClick={signInWithGoogle}>
                <svg role="img" viewBox="0 0 24 24"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path></svg>
                Sign in with Google
              </Button>
            )}
          </ConditionalContent>
        </CardContent>
      </Card>
    </div>
  );
}