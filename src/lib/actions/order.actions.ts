'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { convertToPlainObject, formatErrors } from '../utils';
import { auth } from '@/auth';
import { getMyCart } from './cart.actions';
import { getUserById } from './users.action';
import { insertOrderSchema } from '../validators';
import { prisma } from '@/db/prisma';
import { CartItem, PaymentResult } from '@/types';
import { paypal } from '../paypal';
import { revalidatePath } from 'next/cache';
import { PAGE_SIZE } from '../constants';
import { Prisma } from '@prisma/client';

// Create order and create the order items
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error('User not authenticated');

    const cart = await getMyCart();

    const userId = session?.user?.id;
    if (!userId) throw new Error('User not found');

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: 'Cart is empty',
        redirectTo: '/cart',
      };
    }

    if (!user.address) {
      return {
        success: false,
        message: 'Shipping address not found',
        redirectTo: '/shipping-address',
      };
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: 'Payment method not found',
        redirectTo: '/payment-method',
      };
    }

    // Create order object
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    // Create a transaction to create order and order items in database
    const insertedOrderId = await prisma.$transaction(async tx => {
      // Create order
      const insertedOrder = await tx.order.create({ data: order });

      // Create order items from cart items
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }

      // Clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error('Failed to create order');

    return {
      success: true,
      message: 'Order created successfully',
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// Get order by ID
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });
  return convertToPlainObject(data);
}

// Create new paypal order
export const createPaypalOrder = async (orderId: string) => {
  try {
    // get order from database
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (order) {
      // create paypal order
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

      // update order with paypal order id
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            email: '',
            status: '',
            pricePaid: 0,
          },
        },
      });

      return {
        success: true,
        message: 'Item order created successfully',
        data: paypalOrder.id,
      };
    } else {
      throw new Error('Order not found');
    }
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
};

// Approve paypal order and update order status to isPaid
export async function approvePaypalOrder(
  orderId: string,
  data: { orderID: string },
) {
  try {
    // get order from database
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // capture payment data
    const captureData = await paypal.capturePayment(data.orderID);

    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== 'COMPLETED'
    ) {
      throw new Error('Error in PayPal payment');
    }

    // update order status to isPaid
    updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        email_address: captureData.payer.email_address,
        status: captureData.status,
        price_paid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Order paid successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// Update order status to isPaid
async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  // get order from database
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: { orderItems: true },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.isPaid === true) {
    throw new Error('Order already paid');
  }

  // Transaction to update order status to isPaid and account for product stock
  await prisma.$transaction(async tx => {
    // update product stock
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: -item.quantity,
          },
        },
      });
    }

    // update order status to isPaid
    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult: paymentResult,
      },
    });
  });

  // get updated order after transaction
  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!updatedOrder) {
    throw new Error('Order not found');
  }
}

// Get user's orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();
  if (!session) throw new Error('User not authenticated');

  const userId = session?.user?.id;
  if (!userId) throw new Error('User not found');

  const data = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.order.count({ where: { userId } });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

type SaleDataType = Array<{ month: string; totalSales: number }>;

// Get sales data and order summary
export async function getOrderSummary() {
  // Get counts for each resource
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  // Calculate total sales
  const totalSales = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  });

  // Get monthly sales data
  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData: SaleDataType = salesDataRaw.map(entry => ({
    month: entry.month,
    totalSales: Number(entry.totalSales),
  }));

  // Get the latest sales data
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true },
      },
    },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    salesData,
    latestSales,
  };
}

// Get all orders
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const queryFilter: Prisma.OrderWhereInput =
    query && query !== 'all'
      ? {
          user: {
            name: {
              contains: query,
              mode: 'insensitive',
            } as Prisma.StringFilter,
          },
        }
      : {};

  const data = await prisma.order.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.order.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete order by ID
export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });

    revalidatePath('/admin/orders');

    return {
      success: true,
      message: 'Order deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// Update COD order status to isPaid
export async function updateOrderToPaidCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });

    revalidatePath(`/order/${orderId}`);
    return {
      success: true,
      message: 'Order successfully marked as paid',
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// Update COD order status to isDelivered
export async function deliverOrder(orderId: string) {
  try {
    // get order from database
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.isPaid) {
      throw new Error('Order not paid');
    }

    // update order status to isDelivered
    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Order succeessfully marked as delivered',
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}
