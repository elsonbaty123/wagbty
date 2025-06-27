
'use client';

import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { ar, enUS } from 'date-fns/locale';
import type { Locale } from 'date-fns';

export const dateLocales: {[key: string]: Locale} = {
    ar,
    en: enUS
}

export default function LanguageManager({ children }: { children: ReactNode }) {
    const { i18n } = useTranslation();

    useEffect(() => {
        document.documentElement.lang = i18n.language;
        document.documentElement.dir = i18n.dir(i18n.language);
    }, [i18n, i18n.language]);
    
    return <>{children}</>;
}
