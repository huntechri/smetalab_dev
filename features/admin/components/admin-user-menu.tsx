'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { Home, LogOut } from 'lucide-react';

import { signOut } from '@/app/(login)/actions';
import { AdminHeaderTextLink } from '@/shared/ui/admin-surface';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { FormLayout } from '@/shared/ui/form-layout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import type { AppUserWithPermissions } from '@/shared/types/session';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AdminUserMenu() {
  const { data: user } = useSWR<AppUserWithPermissions>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <Link href="/pricing">
          <AdminHeaderTextLink>Pricing</AdminHeaderTextLink>
        </Link>
        <Button asChild variant="brand" size="default">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarFallback>
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/app" className="flex w-full items-center">
            <Home />
            <span>Приложение</span>
          </Link>
        </DropdownMenuItem>
        <FormLayout action={handleSignOut} className="w-full">
          <Button type="submit" variant="ghost" size="default">
            <LogOut />
            <span>Sign out</span>
          </Button>
        </FormLayout>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
