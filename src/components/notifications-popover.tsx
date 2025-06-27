
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/context/notification-context';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { ScrollArea } from './ui/scroll-area';
import { useTranslation } from 'react-i18next';
import { dateLocales } from './language-manager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function NotificationsPopover() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { notificationsForUser, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState('unread');

  useEffect(() => {
    const savedTab = localStorage.getItem('notifications_active_tab');
    if (savedTab && (savedTab === 'read' || savedTab === 'unread')) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('notifications_active_tab', value);
  };
  
  if (!user) {
    return null;
  }
  
  const userNotifications = notificationsForUser(user.id);
  const unreadNotifications = userNotifications.filter(n => !n.isRead);
  const readNotifications = userNotifications.filter(n => n.isRead);
  const userUnreadCount = unreadCount(user.id);
  
  const renderNotificationList = (notifications: typeof userNotifications) => (
    notifications.length > 0 ? (
      <div className="divide-y">
        {notifications.map((notification) => (
          <Link
            key={notification.id}
            href={notification.link}
            className={cn("block p-4 hover:bg-muted/50", !notification.isRead && "bg-primary/5")}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex items-start gap-3">
              {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>}
              <div className={cn("flex-grow", notification.isRead && "ps-5")}>
                <p className="font-semibold text-sm">{t(notification.titleKey, notification.params)}</p>
                <p className="text-sm text-muted-foreground">{t(notification.messageKey, notification.params)}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: dateLocales[i18n.language] })}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
        <Bell className="h-8 w-8 mb-2" />
        <p>{t('no_new_notifications')}</p>
      </div>
    )
  );


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10">
          <Bell className="h-5 w-5" />
          {userUnreadCount > 0 && (
            <span className="absolute top-2 end-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">{t('notifications')}</h3>
          {userUnreadCount > 0 && (
             <button onClick={() => markAllAsRead(user.id)} className="text-xs text-primary hover:underline flex items-center gap-1">
                {t('mark_all_as_read')}
                <CheckCheck className="h-3 w-3"/>
             </button>
          )}
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                <TabsTrigger value="unread" className="rounded-none">{t('unread')} ({unreadNotifications.length})</TabsTrigger>
                <TabsTrigger value="read" className="rounded-none">{t('read')}</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[350px]">
                <TabsContent value="unread" className="m-0">
                    {renderNotificationList(unreadNotifications)}
                </TabsContent>
                <TabsContent value="read" className="m-0">
                    {renderNotificationList(readNotifications)}
                </TabsContent>
            </ScrollArea>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
