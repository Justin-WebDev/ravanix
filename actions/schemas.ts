import { z } from 'zod/v4';

export const UserSignUpSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required.'),
    lastName: z.string().min(1, 'Last name is required.'),
    email: z
      // .string()
      .email('Please enter a valid email address.')
      .min(1, 'Email is required'),

    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' }),
    confirmPassword: z.string().min(8, { message: 'Passwords do not match' }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type UserSignUpData = z.infer<typeof UserSignUpSchema>;
