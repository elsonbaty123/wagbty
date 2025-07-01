'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Trash2, Smile } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useStatus } from '@/context/status-context';
import { useToast } from '@/hooks/use-toast';
import { ChefStatusForm } from '@/components/chef-status-form';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { dateLocales } from '@/components/language-manager';
import { StatusReactionsList } from '@/components/status-reactions-list';

export default function ChefStatusPage() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const { getReactionsForStatus } = useStatus();
  const { toast } = useToast();
  const [isStatusFormOpen, setStatusFormOpen] = useState(false);
  
  const isStatusActive = user?.status && (new Date().getTime() - new Date(user.status.createdAt).getTime()) < 24 * 60 * 60 * 1000;
  const activeStatus = isStatusActive ? user.status : null;
  const statusReactions = useMemo(() => activeStatus ? getReactionsForStatus(activeStatus.id) : [], [activeStatus, getReactionsForStatus]);

  const handleDeleteStatus = async () => {
    if (!user || !user.status) return;
    try {
        await updateUser({ status: undefined });
        toast({ title: t('status_deleted') });
    } catch (error) {
        toast({ variant: 'destructive', title: t('error'), description: t('failed_to_delete_status') });
    }
  };

  return (
      <AlertDialog>
          <Dialog open={isStatusFormOpen} onOpenChange={setStatusFormOpen}>
              <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                      <CardHeader>
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                              <div>
                                  <CardTitle>{t('status_management')}</CardTitle>
                                  <CardDescription>{t('status_management_desc')}</CardDescription>
                              </div>
                              <Button onClick={() => setStatusFormOpen(true)}>
                                  <Camera className="me-2 h-4 w-4" />
                                  {activeStatus ? t('update_status') : t('add_status')}
                              </Button>
                          </div>
                      </CardHeader>
                      <CardContent>
                          {activeStatus ? (
                              <div className="relative group w-full max-w-sm mx-auto">
                                  <p className="text-sm text-muted-foreground mb-2">{t('current_active_status')}</p>
                                  <div className="aspect-video rounded-lg overflow-hidden relative">
                                      {activeStatus.type === 'video' ? (
                                          <video src={activeStatus.imageUrl} className="w-full h-full object-cover" controls />
                                      ) : (
                                          <Image src={activeStatus.imageUrl} layout="fill" objectFit="cover" alt={t('current_status')} />
                                      )}
                                      <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-4">
                                          {activeStatus.caption && <p className="text-white text-center font-semibold drop-shadow-md">{activeStatus.caption}</p>}
                                          <p className="text-xs text-neutral-200 mt-2">
                                              {t('posted')} {formatDistanceToNow(new Date(activeStatus.createdAt), { addSuffix: true, locale: dateLocales[i18n.language] })}
                                          </p>
                                      </div>
                                  </div>
                                  <div className="mt-2 flex justify-between items-center bg-muted/50 p-2 rounded-lg">
                                      <div className="flex items-center gap-2 text-primary font-semibold">
                                          <Smile className="h-5 w-5" />
                                          <span>{t('story_reactions', { count: statusReactions.length })}</span>
                                      </div>
                                      <AlertDialogTrigger asChild>
                                          <Button variant="destructive" size="sm">
                                              <Trash2 className="h-4 w-4 me-2" />
                                              {t('delete')}
                                          </Button>
                                      </AlertDialogTrigger>
                                  </div>
                              </div>
                          ) : (
                              <div className="text-center py-24 border-2 border-dashed rounded-lg">
                                  <Camera className="mx-auto h-16 w-16 text-muted-foreground" />
                                  <h3 className="mt-4 text-xl font-medium">{t('no_active_status')}</h3>
                                  <p className="mt-2 text-md text-muted-foreground">{t('no_active_status_desc')}</p>
                                  <Button onClick={() => setStatusFormOpen(true)} className="mt-6">
                                      <Camera className="me-2 h-4 w-4" />
                                      {t('add_your_first_status')}
                                  </Button>
                              </div>
                          )}
                      </CardContent>
                  </Card>

                  {activeStatus && <StatusReactionsList reactions={statusReactions} />}
              </div>
              <ChefStatusForm onFinished={() => setStatusFormOpen(false)} />
          </Dialog>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>{t('are_you_sure')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('delete_status_warning')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteStatus} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('delete')}</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
  );
}
