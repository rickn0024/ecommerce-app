import React from 'react';
import { Metadata } from 'next';
import { getMyCart } from '@/lib/actions/cart.actions';
import { auth } from '@/auth';
import { getUserById } from '@/lib/actions/users.action';
import { redirect } from 'next/navigation';
import { ShippingAddress } from '@/types';
import CheckoutSteps from '@/components/shared/checkout-steps';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import PlaceOrderForm from './_components/place-order-form';

export const metadata: Metadata = {
  title: 'Place Order',
  description: 'Place Order Page',
};

export default async function PlaceOrderPage() {
  const cart = await getMyCart();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error('User not found');

  const user = await getUserById(userId);

  if (!cart || cart.items.length === 0) redirect('/cart');

  if (!user.address) redirect('/shipping-address');
  if (!user.paymentMethod) redirect('/payment-method');

  const userAddress = user.address as ShippingAddress;

  return (
    <div>
      <CheckoutSteps current={3} />
      <h1 className="py-4 text-2xl">Place Order</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="md:col-span-2 overflow-auto space-y-4">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4 font-semibold">Shipping Address</h2>
              <p>{userAddress.fullName}</p>
              <p>
                {userAddress.streetAddress}, {userAddress.city},{' '}
                {userAddress.state} {userAddress.postalCode}{' '}
                {userAddress.country}
              </p>
              <div className="mt-3">
                <Link href="/shipping-address">
                  <Button variant="outline">Edit Shipping Address</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4 font-semibold">Payment Method</h2>
              <p>{user.paymentMethod}</p>
              <div className="mt-3">
                <Link href="/payment-method">
                  <Button variant="outline">Edit Payment Method</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4 font-semibold">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map(item => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            height={50}
                            width={50}
                          />
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="px-2">{item.quantity}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(cart.itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(cart.taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(cart.shippingPrice)}</div>
              </div>
              <hr />
              <div className="flex justify-between font-bold">
                <div>Total</div>
                <div>{formatCurrency(cart.totalPrice)}</div>
              </div>
              <PlaceOrderForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
