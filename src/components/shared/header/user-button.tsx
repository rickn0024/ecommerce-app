import React from 'react';
import Link from 'next/link';
import { auth } from '@/auth';
import { signOutUser } from '@/lib/actions/users.action';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOutIcon, Shield, ShoppingBag, User, UserIcon } from 'lucide-react';

export default async function UserButton() {
  const session = await auth();
  if (!session) {
    return (
      <Button asChild>
        <Link href="/sign-in">
          <UserIcon /> Sign In
        </Link>
      </Button>
    );
  }

  const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center">
            <Button
              variant={'ghost'}
              className="relative w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-gray-200 dark:text-gray-900 hover:dark:text-muted-foreground"
            >
              {firstInitial}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="text-sm font-medium leading-none mb-2">
              {session.user?.name}
            </div>
            <div className="text-sm text-muted-foreground leading-none">
              {session.user?.email}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/user/orders" className="flex items-center gap-2">
              <ShoppingBag /> Order History
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/user/profile" className="flex items-center gap-2">
              <User /> User Profile
            </Link>
          </DropdownMenuItem>
          {session?.user?.role === 'admin' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link
                  href="/admin/overview"
                  className="flex items-center gap-2"
                >
                  <Shield /> Admin
                </Link>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem className="p-0 mb-1">
            <form action={signOutUser} className="w-full">
              <Button
                className="w-full py-4 px-2 h-4 justify-start"
                variant="ghost"
              >
                <LogOutIcon /> Sign Out
              </Button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
