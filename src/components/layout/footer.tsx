import Link from "next/link"
import { UtensilsCrossed } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold font-headline text-primary">اكل بيتي</span>
          </Link>
          <p className="text-sm text-muted-foreground">&copy; 2024 اكل بيتي. جميع الحقوق محفوظة.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm hover:underline underline-offset-4">
              شروط الخدمة
            </Link>
            <Link href="#" className="text-sm hover:underline underline-offset-4">
              الخصوصية
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
