import React from 'react';
import { Metadata } from 'next';
import { getMyOrders } from '@/lib/actions/order.actions';
import Link from 'next/link';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SquareCheckBig, XSquareIcon } from 'lucide-react';
import Pagination from '@/components/shared/pagination/pagination';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Your orders',
};

export default async function UserOrdersPage(props: {
  searchParams: Promise<{ page: string }>;
}) {
  const { page } = await props.searchParams;
  const orders = await getMyOrders({ page: Number(page) || 1 });

  return (
    <div className="space-y-2">
      <h2 className="h2-bold">Orders</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Date</TableHead>
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
                  <Link href={`/order/${order.id}`}>
                    <span className="px-2 py-1 bg-primary rounded-sm text-white text-sm cursor-pointer">
                      Details
                    </span>
                  </Link>
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
