
"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, UtensilsCrossed, User, LogOut, ClipboardList, BookOpenCheck, Settings } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationsPopover } from "../notifications-popover"
import { ThemeToggleButton } from "../theme-toggle-button"
import { LanguageSwitcher } from "../language-switcher"

export function Header() {
  const { user, logout, loading } = useAuth()

  const getDashboardLink = () => {
    if (!user) return "/login";
    return user.role === 'chef' ? '/chef/dashboard' : '/profile';
  }

  const renderAuthControls = () => {
    if (loading) {
      return <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />;
    }
    if (user) {
      return (
        <div className="flex items-center gap-2">
            <NotificationsPopover />
            <Link href="/settings">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">الإعدادات</span>
                </Button>
            </Link>
            <LanguageSwitcher />
            <ThemeToggleButton />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.imageUrl || ''} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal text-right">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                <Link href={getDashboardLink()}>
                    <User className="ml-2 h-4 w-4" />
                    <span>{user.role === 'chef' ? 'لوحة التحكم' : 'طلباتي'}</span>
                </Link>
                </DropdownMenuItem>
                {user.role === 'chef' && (
                <DropdownMenuItem asChild>
                    <Link href="/chef/menu">
                    <BookOpenCheck className="ml-2 h-4 w-4" />
                    <span>إدارة القائمة</span>
                    </Link>
                </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link href="/settings">
                        <Settings className="ml-2 h-4 w-4" />
                        <span>الإعدادات</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                <LogOut className="ml-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggleButton />
        <Button variant="ghost" asChild>
          <Link href="/login">تسجيل الدخول</Link>
        </Button>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/signup">إنشاء حساب</Link>
        </Button>
      </div>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold font-headline text-primary">اكل بيتي</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/" className="transition-colors hover:text-primary">
            الرئيسية
          </Link>
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          {renderAuthControls()}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">تبديل قائمة التنقل</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="grid gap-4 py-6">
              <Link href="/" className="flex items-center gap-2">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold font-headline text-primary">اكل بيتي</span>
              </Link>
              <nav className="grid gap-2 text-lg font-medium">
                 <Link href="/" className="transition-colors hover:text-primary">
                    الرئيسية
                 </Link>
              </nav>
              <div className="flex flex-col gap-2">
                {loading ? (
                    <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                ) : user ? (
                    <>
                    <Button variant="ghost" asChild>
                        <Link href={getDashboardLink()}>{user.role === 'chef' ? 'لوحة التحكم' : 'طلباتي'}</Link>
                    </Button>
                     <Button variant="ghost" asChild>
                        <Link href="/settings">الإعدادات</Link>
                     </Button>
                    <Button onClick={logout} variant="outline">تسجيل الخروج</Button>
                    </>
                ) : (
                    <>
                    <Button variant="ghost" asChild>
                        <Link href="/login">تسجيل الدخول</Link>
                    </Button>
                    <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link href="/signup">إنشاء حساب</Link>
                    </Button>
                    </>
                )}
              </div>
              <div className="mt-6 flex justify-center gap-4 border-t pt-6">
                <LanguageSwitcher />
                <ThemeToggleButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
