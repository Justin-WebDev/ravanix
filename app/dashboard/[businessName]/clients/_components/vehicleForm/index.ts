export default function SubmitButton({ isEditing, disabled, pending }) {
  return (
    <Button
      type='submit'
      disabled={pending || disabled}
      className='ml-auto min-w-[120px]'
    >
      {(pending || disabled) && (
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      )}
      {pending
        ? isEditing
          ? 'Saving...'
          : 'Adding...'
        : disabled
          ? 'Loading...'
          : isEditing
            ? 'Save Vehicle'
            : 'Add Vehicle'}
    </Button>
  );
};