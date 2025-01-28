import React from 'react';
import { Metadata } from 'next';
import { getOrderById } from '@/lib/actions/order.actions';
import { notFound } from 'next/navigation';
import OrderDetailsTable from './_components/order-details-table';
import { ShippingAddress } from '@/types';
import { auth } from '@/auth';
import Stripe from 'stripe';

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

  // Client secret for stripe
  let client_secret = null;

  // Check if not paid and using stripe
  if (order.paymentMethod === 'CreditCard' && !order.isPaid) {
    // Create a new instance of stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    // Get the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: 'usd',
      metadata: { orderId: order.id },
    });
    client_secret = paymentIntent.client_secret;
  }

  return (
    <div>
      <OrderDetailsTable
        order={{
          ...order,
          orderItems: order.orderItems,
          shippingAddress: order.shippingAddress as ShippingAddress,
        }}
        stripeClientSecret={client_secret}
        paypalClientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'}
        isAdmin={session?.user?.role === 'admin' || false}
      />
    </div>
  );
}
