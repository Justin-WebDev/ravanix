'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  BookOpen,
  Command,
  Component,
  HelpCircle,
  MessageCircle,
  PlaySquare,
  Settings2,
  Clock,
  Send,
  MoreHorizontal,
  Hash,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
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
import { ChannelProvider, usePresence } from 'ably/react';
import Link from 'next/link';

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

// Static navigation data can be defined outside the component
const navMainItems = [
  {
    title: 'Playground',
    url: '#',
    icon: PlaySquare,
    isActive: true,
    items: [
      { title: 'History', url: '#' },
      { title: 'Starred', url: '#' },
      { title: 'Settings', url: '#' },
    ],
  },
  {
    title: 'Models',
    url: '#',
    icon: Component,
    items: [
      { title: 'Genesis', url: '#' },
      { title: 'Explorer', url: '#' },
      { title: 'Quantum', url: '#' },
    ],
  },
  {
    title: 'Documentation',
    url: '#',
    icon: BookOpen,
    items: [
      { title: 'Introduction', url: '#' },
      { title: 'Get Started', url: '#' },
      { title: 'Tutorials', url: '#' },
      { title: 'Changelog', url: '#' },
    ],
  },
  {
    title: 'Settings',
    url: '#',
    icon: Settings2,
    items: [
      { title: 'General', url: '#' },
      { title: 'Team', url: '#' },
      { title: 'Billing', url: '#' },
      { title: 'Limits', url: '#' },
    ],
  },
];

const navSecondaryItems = [
  { title: 'Support', url: '#', icon: HelpCircle },
  { title: 'Feedback', url: '#', icon: MessageCircle },
];

const projectItems = [
  { name: 'Design Engineering', url: '#', icon: Hash },
  { name: 'Sales & Marketing', url: '#', icon: Clock },
  { name: 'Travel', url: '#', icon: Send },
  { name: 'More', url: '#', icon: MoreHorizontal },
];

export function AppSidebar({
  isNavDisabled,
  business,
  user,
  employees,
  businessId,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  isNavDisabled?: boolean;
  business: BusinessInfo;
  user: UserInfo & { id: string };
  employees: Employee[];
  businessId: string | null;
}) {
  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href={`/dashboard${business?.name}`}>
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
        {businessId && (
          // <ChannelProvider channelName={`${businessId}`}>
          <NavEmployees
            employees={employees}
            businessId={businessId}
            currentUser={{
              id: user.id,
            }}
          />
          // </ChannelProvider>
        )}
        {/* <NavProjects projects={projectItems} isDisabled={isNavDisabled} /> */}
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
