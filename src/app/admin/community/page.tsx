
'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/context/chat-context';
import { ChatMessageCard } from '@/components/chat-message-card';
import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCommunityPage() {
    const { t } = useTranslation();
    const { messages, loading: chatLoading } = useChat();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
        }
    }, [messages]);

    if (chatLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg h-[60vh] flex flex-col">
                        <Skeleton className="flex-grow p-4" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-primary flex items-center gap-2">
                    <MessageSquare />
                    {t('community_chat_monitoring', 'Community Chat Monitoring')}
                </CardTitle>
                <CardDescription>{t('community_chat_monitoring_desc', 'Monitor the live community chat.')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg h-[60vh] flex flex-col">
                    <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                        {messages.length > 0 ? (
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <ChatMessageCard key={msg.id} message={msg} isOwnMessage={false} />
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                <p>{t('no_messages_yet', 'No messages yet.')}</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}
