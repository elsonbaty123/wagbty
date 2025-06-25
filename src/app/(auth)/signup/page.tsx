'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SignupPage() {
  return (
    <Tabs defaultValue="customer" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="customer">I'm a Customer</TabsTrigger>
        <TabsTrigger value="chef">I'm a Chef</TabsTrigger>
      </TabsList>
      <TabsContent value="customer">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Create a Customer Account</CardTitle>
            <CardDescription>Join our community of food lovers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Full Name</Label>
              <Input id="customer-name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input id="customer-email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-password">Password</Label>
              <Input id="customer-password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              Sign Up
            </Button>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline text-primary">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="chef">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Join as a Chef</CardTitle>
            <CardDescription>Share your culinary creations with the world.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="chef-name">Full Name</Label>
              <Input id="chef-name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chef-specialty">Cuisine Specialty</Label>
              <Input id="chef-specialty" placeholder="e.g., French, Italian, Vegan" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chef-email">Email</Label>
              <Input id="chef-email" type="email" placeholder="chef@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chef-password">Password</Label>
              <Input id="chef-password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              Apply to be a Chef
            </Button>
            <div className="mt-4 text-center text-sm">
              Already a member?{' '}
              <Link href="/login" className="underline text-primary">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
