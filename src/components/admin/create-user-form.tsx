
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import type { UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PasswordInput } from '../password-input';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface CreateUserFormProps {
  onFinished?: () => void;
}

export function CreateUserForm({ onFinished }: CreateUserFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { createUserByAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    role: z.enum(['customer', 'chef', 'delivery'], { required_error: t('role_is_required', 'Role is required') }),
    name: z.string().min(1, t('full_name_required', 'Full name is required')),
    email: z.string().email(t('validation_email_invalid_format', 'Invalid email format')),
    password: z.string().min(8, t('password_req_length', 'Password must be at least 8 characters')),
    phone: z.string().optional(),
    // Role-specific fields
    specialty: z.string().optional(),
    address: z.string().optional(),
    vehicleType: z.enum(['Motorcycle', 'Car', 'Bicycle']).optional(),
    licensePlate: z.string().optional(),
  }).refine(data => {
      if (data.role === 'chef') return !!data.specialty;
      return true;
  }, { message: t('specialty_is_required', 'Specialty is required for chefs'), path: ['specialty']})
  .refine(data => {
      if (data.role === 'customer') return !!data.address;
      return true;
  }, { message: t('address_is_required', 'Address is required for customers'), path: ['address']})
  .refine(data => {
      if (data.role === 'delivery') return !!data.vehicleType;
      return true;
  }, { message: t('vehicle_type_is_required', 'Vehicle type is required for delivery drivers'), path: ['vehicleType']});

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      specialty: '',
      address: '',
      licensePlate: '',
    },
  });
  
  const selectedRole = form.watch('role');

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
        await createUserByAdmin(data);
        toast({
            title: t('user_created_successfully', 'User Created Successfully'),
            description: t('user_created_successfully_desc', { name: data.name, role: t(data.role) }),
        });
        onFinished?.();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: t('error_creating_user', 'Error Creating User'),
            description: error.message || t('something_went_wrong'),
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('create_new_user', 'Create New User')}</DialogTitle>
        <DialogDescription>{t('create_new_user_desc', 'Create accounts for customers, chefs, or delivery drivers.')}</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pe-2">
            <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('role')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder={t('select_a_role', 'Select a role')} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="customer">{t('customer')}</SelectItem>
                            <SelectItem value="chef">{t('chef')}</SelectItem>
                            <SelectItem value="delivery">{t('delivery_person', 'Delivery Driver')}</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>{t('full_name')}</FormLabel><FormControl><Input placeholder={t('full_name_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>{t('email')}</FormLabel><FormControl><Input type="email" placeholder={t('email_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>{t('phone_number')}</FormLabel><FormControl><Input type="tel" placeholder={t('phone_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>{t('password')}</FormLabel><FormControl><PasswordInput showStrength {...field} /></FormControl><FormMessage /></FormItem>
            )}/>

            {selectedRole === 'customer' && (
                 <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>{t('address')}</FormLabel><FormControl><Input placeholder={t('address_placeholder_customer')} {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            )}

            {selectedRole === 'chef' && (
                 <FormField control={form.control} name="specialty" render={({ field }) => (
                    <FormItem><FormLabel>{t('kitchen_specialty')}</FormLabel><FormControl><Input placeholder={t('kitchen_specialty_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            )}

            {selectedRole === 'delivery' && (
                <>
                 <FormField control={form.control} name="vehicleType" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('vehicle_type')}</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={t('select_vehicle_type', 'Select vehicle type')} /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Motorcycle">{t('motorcycle', 'Motorcycle')}</SelectItem>
                            <SelectItem value="Car">{t('car', 'Car')}</SelectItem>
                            <SelectItem value="Bicycle">{t('bicycle', 'Bicycle')}</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                 )}/>
                 <FormField control={form.control} name="licensePlate" render={({ field }) => (
                    <FormItem><FormLabel>{t('license_plate', 'License Plate (if applicable)')}</FormLabel><FormControl><Input placeholder={t('license_plate_placeholder', 'e.g., ABC 1234')} {...field} /></FormControl><FormMessage /></FormItem>
                 )}/>
                </>
            )}

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t('create_user', 'Create User')}
            </Button>
            <DialogClose asChild>
                <Button type="button" variant="secondary">{t('cancel')}</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
