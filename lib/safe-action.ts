// lib/safe-action.ts
'use server';

import { z } from 'zod/v4';
import { auth } from '@clerk/nextjs/server';

/**
 * Defines the structured result for every safe action.
 * This ensures that the client-side hooks always receive a consistent
 * object shape, making it easy to handle success, validation errors,
 * and general server errors.
 */
export type SafeActionResult<TInput, TOutput> = {
  data?: TOutput;
  serverError?: string;
  validationErrors?: Partial<Record<keyof TInput, string[]>>;
};

/**
 * This is our higher-order function for creating type-safe server actions.
 *
 * @param schema A Zod schema to validate the action's input.
 * @param handler The server-side function that executes the action's logic.
 * @returns A new function that is our type-safe Server Action.
 */
export const createSafeAction = async <TInput, TOutput>(
  schema: z.Schema<TInput>,
  handler: (
    validatedData: TInput,
    ctx: { userId: string }
  ) => Promise<SafeActionResult<TInput, TOutput>>
) => {
  // This is the actual Server Action that will be exported and used.
  return async (
    prevState: SafeActionResult<TInput, TOutput> | undefined,
    input: TInput
  ): Promise<SafeActionResult<TInput, TOutput>> => {
    // 1. Authentication Check
    // We use Clerk's auth() helper to ensure a user is logged in.
    const { userId } = await auth();
    if (!userId) {
      return { serverError: 'You must be signed in to perform this action.' };
    }

    // 2. Input Validation
    // We parse the input against the provided Zod schema.
    const validationResult = schema.safeParse(input);

    // If validation fails, we return a structured validation error object.
    if (!validationResult.success) {
      return {
        validationErrors: validationResult.error.flatten()
          .fieldErrors as Partial<Record<keyof TInput, string[]>>,
      };
    }

    // 3. Action Execution
    // If authentication and validation pass, we execute the handler
    // with the validated data and the user's ID.
    try {
      return await handler(validationResult.data, { userId });
    } catch (e) {
      // For any unexpected errors during handler execution, we log them
      // and return a generic server error message.
      console.error('Unhandled action error:', e);
      return { serverError: 'An unexpected server error occurred.' };
    }
  };
};
