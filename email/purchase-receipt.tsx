import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { Order } from '@/types';
import React from 'react';
import { formatCurrency } from '@/lib/utils';
import sampleData from '@/db/sample-data';
import dotenv from 'dotenv';
dotenv.config();

PurchaseReceiptEmail.PreviewProps = {
  order: {
    id: crypto.randomUUID(),
    userId: '123',
    user: {
      name: 'John Doe',
      email: 'test@test.com',
    },
    paymentMethod: 'Stripe',
    shippingAddress: {
      fullName: 'John Doe',
      streetAddress: '123 Main st',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    },
    createdAt: new Date(),
    totalPrice: '100',
    taxPrice: '10',
    shippingPrice: '10',
    itemsPrice: '80',
    orderItems: sampleData.products.map(x => ({
      name: x.name,
      orderId: '123',
      productId: '123',
      slug: x.slug,
      quantity: x.stock,
      image: x.images[0],
      price: x.price.toString(),
    })),
    isDelivered: true,
    deliveredAt: new Date(),
    isPaid: true,
    paidAt: new Date(),
    paymentResult: {
      id: '123',
      status: 'succeeded',
      price_paid: '100',
      email_address: 'test@test.com',
    },
  },
} satisfies OrderInformationProps;

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

type OrderInformationProps = {
  order: Order;
};

export default function PurchaseReceiptEmail({ order }: OrderInformationProps) {
  return (
    <Html>
      <Preview>View order receipt</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Purchase order receipt</Heading>
            <Section>
              <Row>
                <Column>
                  <Text className="mb-0 mr-4 whitespace-nowrap text-nowrap">
                    Thank you for your purchase. Here are the details of your
                    order:
                  </Text>
                </Column>
              </Row>
            </Section>
            <Section>
              <Row>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-400 whitespace-nowrap text-nowrap">
                    ORDER ID
                  </Text>
                  <Text className="mb-0 mr-4 text-gray-900">
                    {order.id.toString()}
                  </Text>
                </Column>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-400 whitespace-nowrap text-nowrap">
                    Purchase Date
                  </Text>
                  <Text className="mb-0 mr-4 text-gray-900">
                    {dateFormatter.format(order.createdAt)}
                  </Text>
                </Column>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-400 whitespace-nowrap text-nowrap">
                    Price Paid
                  </Text>
                  <Text className="mb-0 mr-4 text-gray-900">
                    {formatCurrency(order.totalPrice)}
                  </Text>
                </Column>
              </Row>
            </Section>
            <Section className="bg-gray-50 rounded-lg p-4 md:p-6 my-4">
              {order.orderItems.map(item => (
                <Row key={item.productId} className="mt-8">
                  <Column className="w-20 pr-4">
                    <Img
                      src={
                        item.image.startsWith('/')
                          ? `${process.env.NEXT_PUBLIC_SERVER_URL}${item.image}`
                          : item.image
                      }
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-md"
                    />
                  </Column>
                  <Column className="align-middle">
                    {item.name} x {item.quantity}
                  </Column>
                  <Column align="right" className="align-middle">
                    {formatCurrency(item.price)}
                  </Column>
                </Row>
              ))}
              {[
                { name: 'Items', price: order.itemsPrice },
                { name: 'Tax', price: order.taxPrice },
                { name: 'Shipping', price: order.shippingPrice },
                { name: 'Total', price: order.totalPrice },
              ].map(({ name, price }) => (
                <Row key={name} className="py-1">
                  <Column align="right">{name}:</Column>
                  <Column align="right" width={70} className="align-top">
                    <Text className="m-0">{formatCurrency(price)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
