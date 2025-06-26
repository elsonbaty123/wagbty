
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
import { useTranslation } from "react-i18next"

export function Header() {
  const { t } = useTranslation();
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
            <ThemeToggleButton />
            <LanguageSwitcher />
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
                <DropdownMenuLabel className="font-normal">
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
                    <span>{user.role === 'chef' ? t('dashboard') : t('my_orders')}</span>
                    <User className="me-2 h-4 w-4" />
                </Link>
                </DropdownMenuItem>
                {user.role === 'chef' && (
                <DropdownMenuItem asChild>
                    <Link href="/chef/menu">
                        <span>{t('manage_menu')}</span>
                        <BookOpenCheck className="me-2 h-4 w-4" />
                    </Link>
                </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link href="/settings">
                        <span>{t('settings')}</span>
                        <Settings className="me-2 h-4 w-4" />
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <span>{t('logout')}</span>
                    <LogOut className="me-2 h-4 w-4" />
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
          <Link href="/login">{t('login')}</Link>
        </Button>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/signup">{t('signup')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="hidden items-center gap-4 md:flex">
          {renderAuthControls()}
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/" className="transition-colors hover:text-primary">
            {t('home')}
          </Link>
        </nav>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold font-headline text-primary">{t('app_name')}</span>
          <UtensilsCrossed className="h-6 w-6 text-primary" />
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">{t('toggle_nav')}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="grid gap-4 py-6">
              <Link href="/" className="flex items-center gap-2">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold font-headline text-primary">{t('app_name')}</span>
              </Link>
              <nav className="grid gap-2 text-lg font-medium">
                 <Link href="/" className="transition-colors hover:text-primary">
                    {t('home')}
                 </Link>
              </nav>
              <div className="flex flex-col gap-2">
                {loading ? (
                    <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                ) : user ? (
                    <>
                    <Button variant="ghost" asChild>
                        <Link href={getDashboardLink()}>{user.role === 'chef' ? t('dashboard') : t('my_orders')}</Link>
                    </Button>
                     <Button variant="ghost" asChild>
                        <Link href="/settings">{t('settings')}</Link>
                     </Button>
                    <Button onClick={logout} variant="outline">{t('logout')}</Button>
                    </>
                ) : (
                    <>
                    <Button variant="ghost" asChild>
                        <Link href="/login">{t('login')}</Link>
                    </Button>
                    <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link href="/signup">{t('signup')}</Link>
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
