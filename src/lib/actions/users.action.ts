'use server';
import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  updateUserSchema,
} from '../validators';
import { auth, signIn, signOut } from '@/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { hashSync } from 'bcrypt-ts-edge';
import { prisma } from '@/db/prisma';
import { formatErrors } from '../utils';
import { ShippingAddress } from '@/types';
import { paymentMethodSchema } from '../validators';
import { z } from 'zod';
import { PAGE_SIZE } from '../constants';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData,
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', user);

    return {
      success: true,
      message: 'Signed in successfully',
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      success: false,
      message: 'Invalid emnail or password',
    };
  }
}

// Sign out the user
export async function signOutUser() {
  await signOut();
}

// Sign up the user
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      email: formData.get('email'),
      name: formData.get('name'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    const plainPassword = user.password;

    // Check if email already exists
    // const existingUser = await prisma.user.findUnique({
    //   where: { email: user.email },
    // });

    // if (existingUser) {
    //   return {
    //     success: false,
    //     message: 'An account with this email already exists.',
    //   };
    // }

    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
      },
    });

    await signIn('credentials', {
      email: user.email,
      password: plainPassword,
    });

    return {
      success: true,
      message: 'Signed up successfully',
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// Get user by ID
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });
  if (!user) throw new Error('User not found');
  return user;
}

// Update user's address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user.id },
    });

    if (!currentUser) throw new Error('User not found');

    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        address,
      },
    });

    return {
      success: true,
      message: 'Address updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// Update user's payment method
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>,
) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) throw new Error('User not found');

    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        paymentMethod: paymentMethod.type,
      },
    });

    return {
      success: true,
      message: 'Payment method updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// Update user profile
export async function updateUserProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });
    if (!currentUser) throw new Error('User not found');

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: user.name,
        email: user.email,
      },
    });

    return {
      success: true,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// get all users
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const queryFilter: Prisma.UserWhereInput =
    query && query !== 'all'
      ? {
          name: {
            contains: query,
            mode: 'insensitive',
          } as Prisma.StringFilter,
        }
      : {};

  const data = await prisma.user.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.user.count();

  return { data, totalPages: Math.ceil(dataCount / limit) };
}

// Delete a user
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// Update user information
export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}
