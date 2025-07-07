'use client';

import { useSignUp } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { GalleryVerticalEnd } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  code: z
    .string()
    .min(6, { message: 'Verification code must be 6 characters.' }),
});

export function VerificationForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isLoaded) {
      return;
    }

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: values.code,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/');
      } else {
        console.log(result);
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className='flex flex-col items-center gap-2'>
        <a href='#' className='flex flex-col items-center gap-2 font-medium'>
          <div className='flex size-8 items-center justify-center rounded-md'>
            <GalleryVerticalEnd className='size-6' />
          </div>
          <span className='sr-only'>Acme Inc.</span>
        </a>
        <h1 className='text-xl font-bold'>Verify your email</h1>
        <p className='text-muted-foreground'>
          Enter the 6-digit code sent to your email address.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='code'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <div className='flex flex-col items-center gap-4'>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup className='gap-3'>
                        <InputOTPSlot
                          className='h-16 w-12 rounded-md border'
                          index={0}
                        />
                        <InputOTPSlot
                          className='h-16 w-12 rounded-md border'
                          index={1}
                        />
                        <InputOTPSlot
                          className='h-16 w-12 rounded-md border'
                          index={2}
                        />
                        <InputOTPSlot
                          className='h-16 w-12 rounded-md border'
                          index={3}
                        />
                        <InputOTPSlot
                          className='h-16 w-12 rounded-md border'
                          index={4}
                        />
                        <InputOTPSlot
                          className='h-16 w-12 rounded-md border'
                          index={5}
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <Button type='submit' className='w-full'>
            Verify
          </Button>
        </form>
      </Form>
    </div>
  );
}
