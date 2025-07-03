'use client';
import { useTranslation } from 'react-i18next';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useTranslation();
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4 pt-24 md:pt-16">
      {children}
    </div>
  );
}
