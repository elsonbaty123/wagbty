
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface ChatMessageCardProps {
    message: ChatMessage;
    isOwnMessage: boolean;
}

export function ChatMessageCard({ message, isOwnMessage }: ChatMessageCardProps) {
    const { i18n } = useTranslation();
    const dateLocales: {[key: string]: Locale} = { ar, en: enUS };
    
    return (
        <div className={cn("flex items-start gap-3", isOwnMessage ? "flex-row-reverse" : "flex-row")}>
            <Avatar className="h-8 w-8">
                <AvatarImage src={message.userImageUrl} alt={message.userName} data-ai-hint="person avatar"/>
                <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col gap-1 max-w-[75%]", isOwnMessage ? "items-end" : "items-start")}>
                 <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{message.userName}</span>
                </div>
                <Card className={cn(
                    "rounded-xl px-4 py-2", 
                    isOwnMessage ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
                )}>
                   <p className="text-sm">{message.text}</p>
                </Card>
                <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: dateLocales[i18n.language] })}
                </span>
            </div>
        </div>
    );
}
