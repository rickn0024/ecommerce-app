'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/lib/actions/users.action';
import { USER_ROLES } from '@/lib/constants';
import { updateUserSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import React from 'react';
import { ControllerRenderProps, useForm } from 'react-hook-form';
import { z } from 'zod';

export default function UpdateUserForm({
  user,
}: {
  user: z.infer<typeof updateUserSchema>;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: user,
  });

  const onSubmit = async (values: z.infer<typeof updateUserSchema>) => {
    try {
      const res = await updateUser({ ...values, id: user.id });

      if (!res.success) {
        return toast({
          title: 'Error',
          description: res.message,
          variant: 'destructive',
        });
      }

      toast({
        title: 'Success',
        description: res.message,
        variant: 'default',
      });
      form.reset();
      router.push('/admin/users');
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form method="post" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Email */}
        <div className="flex flex-col gap-4">
          <div>
            <FormField
              control={form.control}
              name="email"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof updateUserSchema>,
                  'email'
                >;
              }) => (
                <FormItem className="w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={true}
                      {...field}
                      placeholder="Enter Email Address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Name */}
          <div>
            <FormField
              control={form.control}
              name="name"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof updateUserSchema>,
                  'name'
                >;
              }) => (
                <FormItem className="w-full">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter User's Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Role */}
          <div>
            <FormField
              control={form.control}
              name="role"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  z.infer<typeof updateUserSchema>,
                  'role'
                >;
              }) => (
                <FormItem className="w-full">
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USER_ROLES.map(role => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-between">
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Submitting...' : 'Update User'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
