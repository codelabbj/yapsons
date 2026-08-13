'use client';

import React, { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import i18n from '../../i18n';
import { SettingsProvider } from '@/lib/settings-context';
import NotificationChannelDialog from '@/components/NotificationChannelDialog';

function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Set language from localStorage or default to 'fr'
    const lang = localStorage.getItem('i18nextLng') || 'fr';
    i18n.changeLanguage(lang);

    // Update HTML lang attribute
    document.documentElement.lang = lang;
  }, [pathname, searchParams]);

  return (
    <SettingsProvider>
      {children}
      <NotificationChannelDialog />
    </SettingsProvider>
  );
}

export default ClientLayout;
