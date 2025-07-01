
'use client';

import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Order } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { dateLocales } from './language-manager';
import { Download, FileText, UtensilsCrossed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvoiceProps {
  order: Order;
  children: React.ReactNode;
}

const InvoiceDetails = React.forwardRef<HTMLDivElement, { order: Order }>(({ order }, ref) => {
    const { t, i18n } = useTranslation();
  
    return (
      <div ref={ref} className="bg-background p-6 rounded-lg text-foreground">
        <div className="flex justify-between items-center pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-primary font-headline">{t('invoice', 'Invoice')}</h2>
            <p className="text-sm text-muted-foreground">{t('order_#', { id: order.id.slice(-6) })}</p>
          </div>
          <UtensilsCrossed className="h-8 w-8 text-primary" />
        </div>
        <div className="grid grid-cols-2 gap-4 my-4">
          <div>
            <h3 className="font-semibold">{t('billed_to', 'Billed To')}</h3>
            <p>{order.customerName}</p>
            <p>{order.deliveryAddress}</p>
            <p>{order.customerPhone}</p>
          </div>
          <div className="text-end">
            <h3 className="font-semibold">{t('invoice_date', 'Invoice Date')}</h3>
            <p>{format(new Date(order.createdAt), 'd MMMM yyyy', { locale: dateLocales[i18n.language] })}</p>
          </div>
        </div>
        <Separator />
        <div className="mt-4">
          <div className="grid grid-cols-3 font-semibold">
            <div className="col-span-2">{t('description', 'Description')}</div>
            <div className="text-end">{t('amount', 'Amount')}</div>
          </div>
          <div className="grid grid-cols-3 mt-2">
            <div className="col-span-2">{order.dish.name} (x{order.quantity})</div>
            <div className="text-end">{order.subtotal.toFixed(2)} {t('currency_egp')}</div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('subtotal', 'Subtotal')}</span>
            <span>{order.subtotal.toFixed(2)} {t('currency_egp')}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="text-muted-foreground">{t('discount', 'Discount')} ({order.appliedCouponCode})</span>
              <span>- {order.discount.toFixed(2)} {t('currency_egp')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('delivery_fee', 'Delivery Fee')}</span>
            <span>{order.deliveryFee.toFixed(2)} {t('currency_egp')}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg text-primary">
            <span>{t('total', 'Total')}</span>
            <span>{order.total.toFixed(2)} {t('currency_egp')}</span>
          </div>
        </div>
      </div>
    );
});
InvoiceDetails.displayName = 'InvoiceDetails';

export function InvoiceDialog({ order, children }: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleDownload = async () => {
    if (!invoiceRef.current) return;
    try {
      const dataUrl = await toPng(invoiceRef.current, {
        backgroundColor: '#ffffff', // Set a solid background for the image
        pixelRatio: 2, // Increase resolution
        // Add a filter to exclude external font stylesheets which cause CORS issues.
        filter: (node: HTMLElement) => {
            if (
                node.tagName === 'LINK' &&
                node.getAttribute('rel') === 'stylesheet' &&
                (node as HTMLLinkElement).href.includes('fonts.googleapis.com')
            ) {
                return false;
            }
            return true;
        },
      });
      const link = document.createElement('a');
      link.download = `invoice-${order.id.slice(-6)}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: t('invoice_downloaded', 'Invoice Downloaded') });
    } catch (error) {
      console.error('Failed to download invoice:', error);
      toast({
        variant: 'destructive',
        title: t('download_failed', 'Download Failed'),
        description: t('could_not_generate_invoice', 'Could not generate invoice image.'),
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('invoice_details', 'Invoice Details')}</DialogTitle>
          <DialogDescription>
            {t('invoice_desc', 'Here are the details for your order.')}
          </DialogDescription>
        </DialogHeader>
        <InvoiceDetails ref={invoiceRef} order={order} />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">{t('close', 'Close')}</Button>
          </DialogClose>
          <Button onClick={handleDownload}>
            <Download className="me-2 h-4 w-4"/>
            {t('download_invoice', 'Download Invoice')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
