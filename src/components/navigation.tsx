'use client';

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext";
import { useUnread } from "@/contexts/UnreadContext";
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from 'next/navigation'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import ConditionalContent from "@/components/conditional-content";
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, BookOpen, CircleUser, Menu } from "lucide-react"
import WishPoolButton from "@/components/wish-pool-button"
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

/** 包一層 div + 右上角紅點數字。給 nav 上的按鈕用。 */
function WithUnreadBadge({ count, children }: { count: number; children: React.ReactNode }) {
  if (count <= 0) return <>{children}</>
  return (
    <div className="relative inline-block">
      {children}
      <span
        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-[18px] text-center pointer-events-none"
        aria-label={`${count} 則未讀`}
      >
        {count > 99 ? "99+" : count}
      </span>
    </div>
  )
}

export default function Navigation() {
  const { session, loading, role } = useAuth();
  const { myUnread } = useUnread();
  const isAdmin = role === 'admin';
  const user = session?.user || null;
  const { name: userName, avatar_url: avatarUrl} = user?.user_metadata || {};
  const router = useRouter();
  const pathname = usePathname();
  const isOnPatientsPage = pathname?.startsWith('/patients') ?? false;
  const isOnAdminPage = pathname?.startsWith('/admin') ?? false;
  const isOnProfilePage = pathname?.startsWith('/profile') ?? false;
  const [sheetOpen, setSheetOpen] = useState(false);

  // Desktop 版的 patients 按鈕：在 /patients 時隱藏（返回首頁已移到左上角），其他頁面顯示「病人追蹤」
  const patientsButtonDesktop = user && !isOnPatientsPage && (
    <Button variant="outline" className="cursor-pointer" onClick={() => router.push('/patients')}>
      病人追蹤
    </Button>
  );

  // Mobile 漢堡內的 patients 按鈕：只保留前往功能，返回按鈕已移到左上角
  const patientsButtonMobile = user && !isOnPatientsPage && (
    <Button variant="outline" className="cursor-pointer" onClick={() => router.push('/patients')}>
      病人追蹤
    </Button>
  );

  // 左上角的返回首頁按鈕：桌機 + 手機統一顯示，只在非 admin 的子頁面（病人追蹤 / 個人中心）
  const showBackButton = !isOnAdminPage && (isOnPatientsPage || isOnProfilePage);

  const gettingStartedButton = (
    <Button variant="outline" className="cursor-pointer" onClick={() => router.push('/getting-started')}>
      <BookOpen className="size-4" />
      新手上路
    </Button>
  );

  // 桌機版：在 /profile 時隱藏（返回首頁已移到左上角），其他頁面顯示「個人中心」（含未讀紅點）。
  const profileButtonDesktop = user && !isOnProfilePage && (
    <WithUnreadBadge count={myUnread}>
      <Button variant="outline" className="cursor-pointer" onClick={() => router.push('/profile')}>
        <CircleUser className="size-4" />
        個人中心
      </Button>
    </WithUnreadBadge>
  );

  // 手機 sheet 內的「個人中心」：在 /profile 時隱藏（手機左上角已有返回按鈕）。
  // 紅點直接 absolute 在 Button 內，避免被 WithUnreadBadge 包成 inline-block 後寬度只到 content。
  const profileButtonMobile = user && !isOnProfilePage && (
    <Button
      variant="outline"
      className="cursor-pointer relative"
      onClick={() => router.push('/profile')}
    >
      <CircleUser className="size-4" />
      個人中心
      {myUnread > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-[18px] text-center pointer-events-none"
          aria-label={`${myUnread} 則未讀`}
        >
          {myUnread > 99 ? "99+" : myUnread}
        </span>
      )}
    </Button>
  );

  // 手機漢堡按鈕本身要顯示的紅點數：只算個人中心未讀（admin 後台不顯示紅點）
  const mobileTotalUnread = myUnread;

  // 管理後台按鈕：不再顯示紅點（admin 自己進後台會看到各 ticket 上的紅點）
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
      {/* 左上角返回首頁按鈕：桌機 + 手機統一（非 admin 子頁面）*/}
      {showBackButton && (
        <Button
          variant="outline"
          className="cursor-pointer"
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
          {profileButtonDesktop}
          {gettingStartedButton}
          {patientsButtonDesktop}
          {adminButton}
          <WishPoolButton />
          {authButton}
        </div>

        {/* Mobile: hamburger menu (<md) */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <div className="md:hidden ml-auto relative inline-block">
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="cursor-pointer" aria-label="開啟選單">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            {mobileTotalUnread > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-[18px] text-center pointer-events-none"
                aria-label={`${mobileTotalUnread} 則未讀`}
              >
                {mobileTotalUnread > 99 ? "99+" : mobileTotalUnread}
              </span>
            )}
          </div>
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
              {profileButtonMobile && (
                <SheetClose asChild>{profileButtonMobile}</SheetClose>
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