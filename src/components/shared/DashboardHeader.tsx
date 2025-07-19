// src/components/shared/DashboardHeader.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import the client-side hook
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { PanelLeft } from 'lucide-react';

export function DashboardHeader() {
  const pathname = usePathname(); // This hook will re-render the component on URL change
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length < 2) {
    // Render a minimal header or nothing if we're not in a business context
    return (
      <header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-0'>
        <SidebarTrigger>
          <PanelLeft className='size-4' />
        </SidebarTrigger>
      </header>
    );
  }

  const businessNameSegment = segments[1];
  const businessName = decodeURIComponent(
    businessNameSegment.replace(/-/g, ' ')
  );
  const currentPageSegment = segments.length > 2 ? segments[2] : '';

  return (
    <header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-0'>
      <SidebarTrigger>
        <PanelLeft className='size-4' />
      </SidebarTrigger>
      <Breadcrumb className='hidden md:flex'>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/dashboard'>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {currentPageSegment ? (
              <BreadcrumbLink asChild>
                <Link
                  href={`/dashboard/${businessNameSegment}`}
                  className='capitalize'
                >
                  {businessName}
                </Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage className='capitalize'>
                {businessName}
              </BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {currentPageSegment && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className='capitalize'>
                  {currentPageSegment}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
