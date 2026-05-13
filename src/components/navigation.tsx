'use client';

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from 'next/navigation'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import ConditionalContent from "@/components/conditional-content";
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, BookOpen, Menu } from "lucide-react"
import WishPoolButton from "@/components/wish-pool-button"
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function Navigation() {
  const { session, loading, role } = useAuth();
  const isAdmin = role === 'admin';
  const user = session?.user || null;
  const { name: userName, avatar_url: avatarUrl} = user?.user_metadata || {};
  const router = useRouter();
  const pathname = usePathname();
  const isOnPatientsPage = pathname?.startsWith('/patients') ?? false;
  const isOnAdminPage = pathname?.startsWith('/admin') ?? false;
  const [sheetOpen, setSheetOpen] = useState(false);

  // Desktop 版的 patients 按鈕：在 /patients 時是「返回首頁」，其他頁面是「病人追蹤」
  const patientsButtonDesktop = user && (
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
  );

  // Mobile 漢堡內的 patients 按鈕：只保留前往功能，返回按鈕已移到左上角
  const patientsButtonMobile = user && !isOnPatientsPage && (
    <Button variant="outline" className="cursor-pointer" onClick={() => router.push('/patients')}>
      病人追蹤
    </Button>
  );

  // Mobile 左上角的返回按鈕：只在非 admin 頁面顯示
  const showMobileBackButton = !isOnAdminPage && isOnPatientsPage;

  const gettingStartedButton = (
    <Button variant="outline" className="cursor-pointer" onClick={() => router.push('/getting-started')}>
      <BookOpen className="size-4" />
      新手上路
    </Button>
  );

  const adminButton = isAdmin && (
    <Button variant="outline" className="cursor-pointer" onClick={() => router.push('/admin')}>
      管理後台
    </Button>
  );

  const authButton = (
    <Button className="cursor-pointer" onClick={() => router.push('/auth')}>
      {user ? "登出" : "註冊 / 登入"}
    </Button>
  );

  return (
    <nav className="flex items-center gap-2 px-4 pt-2">
      {/* Mobile 左上角返回按鈕（非 admin 頁面）*/}
      {showMobileBackButton && (
        <Button
          variant="outline"
          className="md:hidden cursor-pointer"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="size-4" />
          返回
        </Button>
      )}

      <ConditionalContent condition={!loading} fallback={
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
      }>
        {/* Desktop: inline buttons (md+) */}
        <div className="ml-auto hidden md:flex items-center gap-2">
          {userName && <div>Hi! {userName}</div>}
          {avatarUrl && (
            <Avatar>
              <AvatarImage src={avatarUrl} alt="avatar" />
            </Avatar>
          )}
          {gettingStartedButton}
          {patientsButtonDesktop}
          {adminButton}
          <WishPoolButton />
          {authButton}
        </div>

        {/* Mobile: hamburger menu (<md) */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden cursor-pointer ml-auto" aria-label="開啟選單">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>選單</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 px-4 pb-4">
              {(avatarUrl || userName) && (
                <div className="flex items-center gap-3 pb-2">
                  {avatarUrl && (
                    <Avatar>
                      <AvatarImage src={avatarUrl} alt="avatar" />
                    </Avatar>
                  )}
                  {userName && <div>Hi! {userName}</div>}
                </div>
              )}
              <SheetClose asChild>{gettingStartedButton}</SheetClose>
              {patientsButtonMobile && (
                <SheetClose asChild>{patientsButtonMobile}</SheetClose>
              )}
              {adminButton && (
                <SheetClose asChild>{adminButton}</SheetClose>
              )}
              <WishPoolButton />
              <SheetClose asChild>{authButton}</SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </ConditionalContent>
    </nav>
  )
}