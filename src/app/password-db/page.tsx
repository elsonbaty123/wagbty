
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";


export default function PasswordDbPage() {
    const { t } = useTranslation();
    const { users, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
                <Skeleton className="h-12 w-1/2 mb-4" />
                <Skeleton className="h-8 w-3/4 mb-8" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <Card>
            <CardHeader>
                <CardTitle>{t('password_db_title')}</CardTitle>
                <CardDescription>{t('password_db_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>{t('user_id')}</TableHead>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('role')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-mono">{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}
