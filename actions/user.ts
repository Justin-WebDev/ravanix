'use server';

import prisma from '@/lib/prisma';
import { performSafeAction } from '@/lib/safe-action';
import { redirect } from 'next/navigation';
import { UserSignUpSchema, type UserSignUpData } from './schemas';

export type ActionResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
};

// const createUserAction = async (data: UserSignUpData) => {
//   await prisma.service.create({
//     data: { ...data, userId },
//   });
//   redirect('/onboarding');
// };

// export const createUser = performSafeAction(UserSchema, createUserAction);
