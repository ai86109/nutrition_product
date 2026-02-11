'use client';

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button"
import { redirect } from 'next/navigation'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import ConditionalContent from "@/components/conditional-content";
import { Skeleton } from "@/components/ui/skeleton"

export default function Navigation() {
  const { session, loading } = useAuth();
  const user = session?.user || null;
  const { name: userName, avatar_url: avatarUrl} = user?.user_metadata || {};

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
        <Button className="cursor-pointer" onClick={() => redirect('/auth')}>{user ? "登出" : "註冊 / 登入"}</Button>
      </ConditionalContent>
    </nav>
  )
}