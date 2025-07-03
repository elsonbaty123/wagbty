/* eslint-disable @next/next/no-img-element */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { getDeliveryZones, updateDeliveryZones } from '@/lib/db';

const deliveryZoneSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  deliveryFee: z.coerce.number().min(0, 'Delivery fee must be a positive number'),
  coordinates: z.string().optional(),
});

const deliveryZonesFormSchema = z.object({
  zones: z.array(deliveryZoneSchema),
});

type DeliveryZonesFormValues = z.infer<typeof deliveryZonesFormSchema>;

export default function DeliveryZonesPage() {
  const [loading, setLoading] = useState(true);
  const form = useForm<DeliveryZonesFormValues>({
    resolver: zodResolver(deliveryZonesFormSchema),
    defaultValues: {
      zones: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'zones',
  });

  useEffect(() => {
    async function fetchDeliveryZones() {
      try {
        const zones = await getDeliveryZones();
        form.reset({ zones });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch delivery zones.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchDeliveryZones();
  }, [form]);

  async function onSubmit(data: DeliveryZonesFormValues) {
    try {
      await updateDeliveryZones(data.zones);
      toast({
        title: 'Success',
        description: 'Delivery zones updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update delivery zones.',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Delivery Zones Management</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {fields.map((field, index) => (
            <div key={field.id} className="border p-4 rounded-md space-y-4">
              <FormField
                control={form.control}
                name={`zones.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`zones.${index}.deliveryFee`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Fee</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="button" variant="destructive" onClick={() => remove(index)}>
                Remove Zone
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() =>
              append({ id: new Date().toISOString(), name: '', deliveryFee: 0 })
            }
          >
            Add New Zone
          </Button>
          <Button type="submit">Save Changes</Button>
        </form>
      </Form>
    </div>
  );
}