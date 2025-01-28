import React from 'react';
import { auth } from '@/auth';
import { deleteOrder, getAllOrders } from '@/lib/actions/order.actions';
import { Metadata } from 'next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { SquareCheckBig, XSquareIcon } from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/shared/pagination/pagination';
import { Button } from '@/components/ui/button';
import DeleteDialog from '@/components/shared/delete-dialog';

export const metadata: Metadata = {
  title: 'Admin Orders',
  description: 'Admin Orders',
};

export default async function AdminOrdersPage(props: {
  searchParams: Promise<{ page: string; query: string }>;
}) {
  const { page = '1', query: searchText } = await props.searchParams;

  const session = await auth();

  if (session?.user?.role !== 'admin') {
    throw new Error('User is not authorized');
  }

  const orders = await getAllOrders({ page: Number(page), query: searchText });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h1 className="h2-bold">Orders</h1>
        {searchText && (
          <div className="flex items-center gap-2">
            <span>
              Filtered by <i>&quot;{searchText}&quot;</i>
            </span>
            <Link href="/admin/orders">
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
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map(order => (
              <TableRow key={order.id}>
                <TableCell>{formatId(order.id)}</TableCell>
                <TableCell>
                  {formatDateTime(order.createdAt).dateTime}
                </TableCell>
                <TableCell>{order.user.name}</TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  {order.isPaid && order.paidAt ? (
                    <span className="flex items-center gap-2">
                      <SquareCheckBig className="h-4 w-4 text-green-500" />{' '}
                      {formatDateTime(order.paidAt).dateTime}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <XSquareIcon className="h-4 w-4 text-red-500" /> Not Paid
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {order.isDelivered && order.deliveredAt ? (
                    <span className="flex items-center gap-2">
                      <SquareCheckBig className="h-4 w-4 text-green-500" />{' '}
                      {formatDateTime(order.deliveredAt).dateTime}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <XSquareIcon className="h-4 w-4 text-red-500" /> Not
                      Delivered
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/order/${order.id}`}>Details</Link>
                  </Button>
                  <DeleteDialog id={order.id} action={deleteOrder} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {
          // Pagination
          orders.totalPages > 1 && (
            <Pagination
              page={Number(page) || 1}
              totalPages={orders?.totalPages}
            />
          )
        }
      </div>
    </div>
  );
}
