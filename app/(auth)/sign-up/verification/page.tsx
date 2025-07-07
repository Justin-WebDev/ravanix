import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { VerificationForm } from './_components/VerificationForm';

export default function VerificationPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>Check your email</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerificationForm />
        </CardContent>
      </Card>
    </div>
  );
}
