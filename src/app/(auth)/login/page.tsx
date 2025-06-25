'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LoginPage() {
  return (
    <Tabs defaultValue="customer" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="customer">Customer</TabsTrigger>
        <TabsTrigger value="chef">Chef</TabsTrigger>
      </TabsList>
      <TabsContent value="customer">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Customer Login</CardTitle>
            <CardDescription>Welcome back! Please enter your details to order your next meal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input id="customer-email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-password">Password</Label>
              <Input id="customer-password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Log in
            </Button>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline text-accent">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="chef">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Chef Login</CardTitle>
            <CardDescription>Access your dashboard to manage orders and your menu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chef-email">Email</Label>
              <Input id="chef-email" type="email" placeholder="chef@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chef-password">Password</Label>
              <Input id="chef-password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Log in
            </Button>
            <div className="mt-4 text-center text-sm">
              Not a chef with us yet?{' '}
              <Link href="/signup" className="underline text-accent">
                Join now
              </Link>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
