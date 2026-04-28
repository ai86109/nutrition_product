'use client';

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from 'next/navigation'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import ConditionalContent from "@/components/conditional-content";
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"

export default function Navigation() {
  const { session, loading, role } = useAuth();
  const isAdmin = role === 'admin';
  const user = session?.user || null;
  const { name: userName, avatar_url: avatarUrl} = user?.user_metadata || {};
  const router = useRouter();
  const pathname = usePathname();
  const isOnPatientsPage = pathname?.startsWith('/patients') ?? false;

  return (
    <nav className="flex items-center gap-2 justify-end px-4 pt-2">
      <ConditionalContent condition={!loading} fallback={
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
      }>
        {userName && <div>Hi! {userName}</div>}
        {avatarUrl && (
          <Avatar>
            <AvatarImage src={avatarUrl} alt="avatar" />
          </Avatar>
        )}
        {user && (
          isOnPatientsPage ? (
            <Button variant="outline" className="cursor-pointer" onClick={() => router.push('/')}>
              <ArrowLeft className="size-4" />
              返回首頁
            </Button>
          ) : (
            <Button variant="outline" className="cursor-pointer" onClick={() => router.push('/patients')}>
              病人追蹤
            </Button>
          )
        )}
        {isAdmin && (
          <Button variant="outline" className="cursor-pointer" onClick={() => router.push('/admin')}>
            管理後台
          </Button>
        )}
        <Button className="cursor-pointer" onClick={() => router.push('/auth')}>{user ? "登出" : "註冊 / 登入"}</Button>
      </ConditionalContent>
    </nav>
  )
}