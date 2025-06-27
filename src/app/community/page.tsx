
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/auth-context';
import { useChat } from '@/context/chat-context';
import { ChatMessageCard } from '@/components/chat-message-card';
import { Send, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function CommunityPage() {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth();
    const { messages, sendMessage, loading: chatLoading } = useChat();
    const router = useRouter();
    const { toast } = useToast();
    const [newMessage, setNewMessage] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const loading = authLoading || chatLoading;

    useEffect(() => {
        if (!loading && (!user || user.role !== 'customer')) {
            router.push('/login');
        }
    }, [user, loading, router]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            try {
                await sendMessage(newMessage);
                setNewMessage('');
            } catch (error: any) {
                 toast({
                    variant: 'destructive',
                    title: t('error'),
                    description: error.message || t('failed_to_send_message'),
                });
            }
        }
    };
    
    if (loading || !user) {
        return (
            <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
                <Skeleton className="h-12 w-1/2 mb-4" />
                <Skeleton className="h-8 w-3/4 mb-8" />
                <div className="border rounded-lg h-[60vh] flex flex-col">
                    <Skeleton className="flex-grow p-4" />
                    <Skeleton className="h-12 border-t p-4" />
                </div>
            </div>
        );
    }
    
    if (user.role !== 'customer') {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold">{t('access_denied')}</h1>
                <p>{t('must_be_customer_to_chat')}</p>
                <Button onClick={() => router.push('/')} className="mt-4">{t('back_to_home')}</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl text-primary flex items-center gap-2">
                        <MessageSquare />
                        {t('community_chat_title')}
                    </CardTitle>
                    <CardDescription>{t('community_chat_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg h-[60vh] flex flex-col">
                        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                            {messages.length > 0 ? (
                                <div className="space-y-4">
                                    {messages.map((msg) => (
                                        <ChatMessageCard key={msg.id} message={msg} isOwnMessage={msg.userId === user.id} />
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    <p>{t('no_messages_yet')}</p>
                                </div>
                            )}
                        </ScrollArea>
                        <div className="border-t p-4 bg-muted/50">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={t('type_your_message')}
                                    autoComplete="off"
                                />
                                <Button type="submit" size="icon">
                                    <Send className="h-4 w-4" />
                                    <span className="sr-only">{t('send_message')}</span>
                                </Button>
                            </form>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
