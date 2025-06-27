
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { StatusReaction } from '@/lib/types';
import { MessageSquare, Smile } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatusReactionsListProps {
  reactions: StatusReaction[];
}

export function StatusReactionsList({ reactions }: StatusReactionsListProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Smile className="text-primary" />
            {t('reactions_on_your_status')}
        </CardTitle>
        <CardDescription>{t('reactions_on_your_status_desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {reactions.length > 0 ? (
          <ScrollArea className="h-72">
            <div className="space-y-4 pe-4">
              {reactions.map((reaction) => (
                <div key={reaction.id} className="flex items-start gap-3 p-2 rounded-md bg-muted/50">
                  <Avatar>
                    <AvatarImage src={reaction.userImageUrl} alt={reaction.userName} data-ai-hint="person avatar" />
                    <AvatarFallback>{reaction.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{reaction.userName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {reaction.emoji && <span className="text-2xl">{reaction.emoji}</span>}
                      {reaction.message && (
                        <p className="text-sm text-foreground italic bg-background p-2 rounded-md shadow-sm">
                          "{reaction.message}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">{t('no_reactions_yet')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('no_reactions_yet_desc')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
