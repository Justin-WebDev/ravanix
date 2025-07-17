// lib/safe-action.ts
'use server';

import { z } from 'zod/v4';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export type SafeActionResult<TInput, TOutput> = {
  data?: TOutput;
  serverError?: string;
  validationErrors?: Partial<Record<keyof TInput, string[]>>;
};

/**
 * A helper function to execute server-side logic with authentication and validation.
 * This is NOT a higher-order function. It's called directly inside a Server Action.
 *
 * @param schema The Zod schema for input validation.
 * @param input The raw input data from the client.
 * @param handler The function containing the core logic to execute.
 * @returns A structured result object.
 */
export async function executeSafeAction<TInput, TOutput>(
  schema: z.Schema<TInput>,
  input: TInput,
  handler: (
    validatedData: TInput,
    ctx: { userId: string }
  ) => Promise<SafeActionResult<TInput, TOutput>>
): Promise<SafeActionResult<TInput, TOutput>> {
  // 1. Authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // 2. Validation
  const validationResult = schema.safeParse(input);
  if (!validationResult.success) {
    return {
      validationErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  // 3. Execution
  try {
    return await handler(validationResult.data, { userId });
  } catch (e) {
    console.error('Unhandled action error:', e);
    return { serverError: 'An unexpected server error occurred.' };
  }
}
