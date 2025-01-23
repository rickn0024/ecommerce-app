import React from 'react';
import { Metadata } from 'next';
import { getOrderById } from '@/lib/actions/order.actions';
import { notFound } from 'next/navigation';
import OrderDetailsTable from './_components/order-details-table';
import { ShippingAddress } from '@/types';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Order Details',
};

export default async function OrderDetailsPage(props: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await props.params;

  const order = await getOrderById(id);

  if (!order) {
    return notFound();
  }

  const session = await auth();

  return (
    <div>
      <OrderDetailsTable
        order={{
          ...order,
          orderItems: order.orderItems,
          shippingAddress: order.shippingAddress as ShippingAddress,
        }}
        paypalClientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'}
        isAdmin={session?.user?.role === 'admin' || false}
      />
    </div>
  );
}
