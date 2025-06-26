'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t('change_language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('ar')} disabled={i18n.language === 'ar'}>
          العربية
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
