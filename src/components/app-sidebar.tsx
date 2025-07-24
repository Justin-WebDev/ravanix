'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Command,
  LayoutDashboard,
  Calendar,
  Users,
  Settings2,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavEmployees } from './nav-employees';
import { ComponentProps } from 'react';
import dynamic from 'next/dynamic';
import { AblyProvider } from 'ably/react';
import { AblyReactProvider } from '@/(features)/ably/ably-provider';

// const AblyProvider = dynamic(
//   () =>
//     import('@/(features)/ably/ably-provider').then(
//       mod => mod.AblyReactProvider
//     ),
//   { ssr: false }
// );

type BusinessInfo = {
  name: string;
  logoUrl: string | null;
} | null;

type UserInfo = {
  name: string;
  email: string;
  avatar: string;
  role: string;
};

type Employee = {
  id: string;
  clerkId: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};

const navSecondaryItems = [
  { title: 'Support', url: '#', icon: HelpCircle },
  { title: 'Feedback', url: '#', icon: MessageCircle },
];

export function AppSidebar({
  isNavDisabled,
  business,
  user,
  employees,
  businessId,
  ...props
}: ComponentProps<typeof Sidebar> & {
  isNavDisabled?: boolean;
  business: BusinessInfo;
  user: UserInfo & { id: string };
  employees: Employee[];
  businessId: string | null;
}) {
  const pathname = usePathname();

  // Create a URL-friendly slug from the business name
  const businessSlug = business?.name
    ? encodeURIComponent(business.name.toLowerCase().replace(/\s+/g, '-'))
    : '';

  // --- NEW: Dynamic Navigation Items ---
  const navMainItems = [
    {
      title: 'Dashboard',
      url: `/dashboard/${businessSlug}`,
      icon: LayoutDashboard,
      isActive: pathname === `/dashboard/${businessSlug}`,
    },
    {
      title: 'Appointments',
      url: `/dashboard/${businessSlug}/appointments`,
      icon: Calendar,
      isActive: pathname.startsWith(`/dashboard/${businessSlug}/appointments`),
    },
    {
      title: 'Clients',
      url: `/dashboard/${businessSlug}/clients`,
      icon: Users,
      isActive: pathname.startsWith(`/dashboard/${businessSlug}/clients`),
    },
    // You can add more features here as you build them
    // {
    //   title: 'Services',
    //   url: `/dashboard/${businessSlug}/services`,
    //   icon: Wrench,
    //   isActive: pathname.startsWith(`/dashboard/${businessSlug}/services`),
    // },
    {
      title: 'Settings',
      url: `/dashboard/${businessSlug}/settings`,
      icon: Settings2,
      isActive: pathname.startsWith(`/dashboard/${businessSlug}/settings`),
    },
  ];

  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href={`/dashboard/${businessSlug}`}>
                <div className='bg-sidebar-primary flex aspect-square size-10 items-center justify-center rounded-md'>
                  {business?.logoUrl ? (
                    <Image
                      src={business.logoUrl}
                      alt={business.name}
                      width={32}
                      height={32}
                      className='h-full w-full rounded-md object-cover'
                    />
                  ) : (
                    <Command className='size-4 text-sidebar-primary-foreground' />
                  )}
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-bold'>
                    {business?.name ?? 'No Business'}
                  </span>
                  <span className='truncate text-xs capitalize'>
                    {user.role}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} isDisabled={isNavDisabled} />

        {businessSlug ? (
          <NavEmployees
            employees={employees}
            businessId={businessId}
            currentUser={{
              id: user.id,
            }}
          />
        ) : null}

        <NavSecondary
          items={navSecondaryItems}
          className='mt-auto'
          isDisabled={isNavDisabled}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
