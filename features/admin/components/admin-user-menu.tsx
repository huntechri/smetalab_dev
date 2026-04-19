'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { Home, LogOut } from 'lucide-react';

import { signOut } from '@/app/(login)/actions';
import { Button } from '@repo/ui';
import { Avatar, AvatarFallback } from '@repo/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui';
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
        <Link href="/pricing" className="text-sm font-medium text-gray-700 hover:text-gray-900">
          Pricing
        </Link>
        <Button asChild variant="brand">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="size-9 cursor-pointer">
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
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/app" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Приложение</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <Button type="submit" variant="ghost">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
