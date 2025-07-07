import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const performSafeAction = async (schema, action: any) => {
  return async (prevState, formData) => {
    const { userId } = await auth();
    if (!userId) {
      redirect('/sign-in');
    }

    try {
      const data = Object.fromEntries(formData);
    } catch (e) {
      console.error(e);
      return {
        error: 'Something went wrong',
      };
    }
  };
};
