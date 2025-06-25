"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, UtensilsCrossed } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold font-headline text-primary">شيف كونكت</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/" className="transition-colors hover:text-primary">
            الرئيسية
          </Link>
          <Link href="/#featured-chefs" className="transition-colors hover:text-primary">
            الطهاة
          </Link>
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">تسجيل الدخول</Link>
          </Button>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/signup">إنشاء حساب</Link>
          </Button>
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
                <span className="text-xl font-bold font-headline text-primary">شيف كونكت</span>
              </Link>
              <nav className="grid gap-2 text-lg font-medium">
                 <Link href="/" className="transition-colors hover:text-primary">
                    الرئيسية
                 </Link>
                 <Link href="/#featured-chefs" className="transition-colors hover:text-primary">
                    الطهاة
                 </Link>
              </nav>
              <div className="flex flex-col gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">تسجيل الدخول</Link>
                </Button>
                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/signup">إنشاء حساب</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
