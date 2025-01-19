import React from 'react';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { getUserById } from '@/lib/actions/users.action';
import PaymentMethodForm from './_components/payment-method-form';
import CheckoutSteps from '@/components/shared/checkout-steps';

export const metadata: Metadata = {
  title: 'Payment Method',
  description: 'Select Payment Method',
};

export default async function PaymentMethodPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error('User not found');

  const user = await getUserById(userId);

  return (
    <div>
      <CheckoutSteps current={2} />
      <PaymentMethodForm preferredPaymentMethod={user.paymentMethod} />
    </div>
  );
}
