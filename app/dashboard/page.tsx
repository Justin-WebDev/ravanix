import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { PanelLeft } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

export default async function Dashboard() {
  try {
    const user = await currentUser();

    return (
      <main className='flex flex-1 flex-col gap-4 p-4 sm:py-4'>
        <header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background sm:static sm:h-auto sm:border-0 sm:bg-transparent'>
          <SidebarTrigger>
            <PanelLeft className='size-4' />
          </SidebarTrigger>
          <Breadcrumb className='hidden md:flex'>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <a href='#'>Building Your Application</a>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome, {user?.firstName}</p>
          <p>Your email is {user?.primaryEmailAddress?.emailAddress}</p>
        </div>
        <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
          <Card className='aspect-video'>
            <CardHeader>
              <CardTitle>Card 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card content</p>
            </CardContent>
          </Card>
          <Card className='aspect-video'>
            <CardHeader>
              <CardTitle>Card 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card content</p>
            </CardContent>
          </Card>
          <Card className='aspect-video'>
            <CardHeader>
              <CardTitle>Card 3</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card content</p>
            </CardContent>
          </Card>
        </div>
        {/* <div className='min-h-[100vh] flex-1 md:min-h-min'> */}
        <Card className='min-h-[100vh] flex-1 md:min-h-min'>
          <CardHeader>
            <CardTitle>Large Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Large card content</p>
          </CardContent>
        </Card>
      </main>
    );
  } catch (err: any) {
    const errorMessage =
      err.errors?.[0]?.longMessage || 'An unexpected error occurred.';
    toast.error(errorMessage);
    redirect('/sign-in');
  }
}
