// src/features/vehicles/components/SubmitButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type SubmitButtonProps = {
  isEditing: boolean;
  pending: boolean;
  disabled?: boolean;
};

export function SubmitButton({
  isEditing,
  pending,
  disabled,
}: SubmitButtonProps) {
  const getButtonText = () => {
    if (pending) {
      return isEditing ? 'Saving...' : 'Adding...';
    }
    if (disabled) {
      return 'Loading...';
    }
    return isEditing ? 'Save Vehicle' : 'Add Vehicle';
  };

  return (
    <Button
      type='submit'
      disabled={pending || disabled}
      className='ml-auto min-w-[120px]'
    >
      {(pending || disabled) && (
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      )}
      {getButtonText()}
    </Button>
  );
}
