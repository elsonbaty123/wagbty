'use client';
import Link from "next/link"
import { UtensilsCrossed } from "lucide-react"
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold font-headline text-primary">{t('app_name')}</span>
          </Link>
          <p className="text-sm text-muted-foreground">{t('copyright')}</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm hover:underline underline-offset-4">
              {t('terms_of_service')}
            </Link>
            <Link href="#" className="text-sm hover:underline underline-offset-4">
              {t('privacy')}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
