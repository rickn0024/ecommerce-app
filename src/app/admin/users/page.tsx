import React from 'react';
import { Metadata } from 'next';
import { deleteUser, getAllUsers } from '@/lib/actions/users.action';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DeleteDialog from '@/components/shared/delete-dialog';
import Pagination from '@/components/shared/pagination/pagination';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Admin Users',
  description: 'Admin Users Page',
};

export default async function AdminUserPage(props: {
  searchParams: Promise<{ page: string; query: string }>;
}) {
  const { page = '1', query: searchText } = await props.searchParams;

  const users = await getAllUsers({ page: Number(page), query: searchText });

  console.log(users);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h1 className="h2-bold">Users</h1>
        {searchText && (
          <div className="flex items-center gap-2">
            <span>
              Filtered by <i>&quot;{searchText}&quot;</i>
            </span>
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                Remove Filter
              </Button>
            </Link>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.data.map(user => (
              <TableRow key={user.id}>
                <TableCell>{formatId(user.id)}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === 'user' ? (
                    <Badge variant="secondary">User</Badge>
                  ) : (
                    <Badge variant="default">Admin</Badge>
                  )}
                </TableCell>

                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/users/${user.id}`}>Edit</Link>
                  </Button>
                  <DeleteDialog id={user.id} action={deleteUser} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {
          // Pagination
          users.totalPages > 1 && (
            <Pagination
              page={Number(page) || 1}
              totalPages={users?.totalPages}
            />
          )
        }
      </div>
    </div>
  );
}
