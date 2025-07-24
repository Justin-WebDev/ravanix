// src/components/nav-employees.tsx
'use client';

import { ChevronRight, UserCircle2 } from 'lucide-react';
import React, { Suspense, useEffect, useState } from 'react';
import { usePresence, usePresenceListener, useAbly } from 'ably/react';
import Link from 'next/link';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

// --- NEW IMPORT ---
import { type Employee } from '@/(features)/employees/employee.types';
import { AblyReactProvider } from '@/(features)/ably/ably-provider';

// The local Employee type definition has been REMOVED.

type CurrentUser = {
  id: string;
};

type NavEmployeesProps = {
  employees: Employee[]; // Now uses the imported Employee type
  businessId: string | null;
  currentUser: CurrentUser;
};

// Sub-component for rendering a single employee
const EmployeeListItem = ({
  employee,
  isOnline,
  isCurrentUser,
}: {
  employee: Employee; // Uses the imported Employee type
  isOnline: boolean;
  isCurrentUser?: boolean;
}) => (
  // ... JSX for this component remains unchanged
  <SidebarMenuSubItem>
    <SidebarMenuSubButton
      asChild
      className={cn(
        'justify-start py-5',
        !isOnline && 'text-muted-foreground hover:text-accent-foreground'
      )}
    >
      <Link href={`/dashboard/employees/${employee.id}`}>
        <div className='relative'>
          <Avatar className='relative -z-10 size-7'>
            <AvatarImage src={employee.imageUrl ?? undefined} />
            <AvatarFallback>
              <UserCircle2 className='size-7' />
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className='absolute -bottom-0.5 -right-0.5 z-20 rounded-full bg-green-500 p-1.5 ring-2 ring-sidebar-accent' />
          )}
        </div>
        <span className={cn(isCurrentUser && 'font-bold text-primary')}>
          {`${employee.firstName || ''} ${employee.lastName || ''}`.trim()}
          {isCurrentUser && ' (me)'}
        </span>
      </Link>
    </SidebarMenuSubButton>
  </SidebarMenuSubItem>
);

// Sub-component for rendering a collapsible list of employees
const EmployeeList = ({
  title,
  employees,
  isOpen,
  onOpenChange,
  isOnline,
  currentUser,
}: {
  title: string;
  employees: Employee[]; // Uses the imported Employee type
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isOnline: boolean;
  currentUser: CurrentUser;
}) => (
  // ... JSX for this component remains unchanged
  <Collapsible asChild open={isOpen} onOpenChange={onOpenChange}>
    <SidebarMenuItem className='flex flex-col items-start'>
      <CollapsibleTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='w-full justify-between pr-2 font-semibold'
        >
          {title} ({employees.length})
          <ChevronRight
            className={cn('size-4 transition-transform', isOpen && 'rotate-90')}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <SidebarMenuSub className='w-full'>
          {employees.length > 0 ? (
            employees.map(employee => (
              <EmployeeListItem
                key={employee.id}
                employee={employee}
                isOnline={isOnline}
                isCurrentUser={employee.clerkId === currentUser.id}
              />
            ))
          ) : (
            <div className='px-2 py-1 text-xs text-muted-foreground'>
              {isOnline
                ? 'No employees are online.'
                : 'All employees are offline.'}
            </div>
          )}
        </SidebarMenuSub>
      </CollapsibleContent>
    </SidebarMenuItem>
  </Collapsible>
);

export function NavEmployees({
  employees,
  businessId,
  currentUser,
}: NavEmployeesProps) {
  return (
    <Suspense>
      <AblyReactProvider businessId={businessId!}>
        <EmployeePresenceList
          employees={employees}
          currentUser={currentUser}
          businessId={businessId}
        />
      </AblyReactProvider>
    </Suspense>
  );
}

function EmployeePresenceList({
  employees,
  currentUser,
  businessId,
}: NavEmployeesProps) {
  const client = useAbly();
  //@ts-expect-error
  usePresence({ status: `${currentUser.id} signed in` });
  //@ts-expect-error
  const { presenceData } = usePresenceListener();

  useEffect(() => {
    return () => {
      client.connection.close();
    };
  }, []);

  const onlineEmployeeIds = new Set(
    presenceData.map(member => member.clientId)
  );

  const onlineEmployees = employees
    .filter(e => onlineEmployeeIds.has(e.clerkId))
    .sort((a, b) => {
      if (a.clerkId === currentUser.id) return 1;
      if (b.clerkId === currentUser.id) return -1;
      return (a.firstName || '').localeCompare(b.firstName || '');
    });

  const offlineEmployees = employees.filter(
    e => !onlineEmployeeIds.has(e.clerkId)
  );

  const [onlineOpen, setOnlineOpen] = useState(true);
  const [offlineOpen, setOfflineOpen] = useState(false);

  if (!businessId) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Employees</SidebarGroupLabel>
      <SidebarMenu>
        <EmployeeList
          key='online-employees'
          title='Online'
          employees={onlineEmployees}
          isOpen={onlineOpen}
          onOpenChange={setOnlineOpen}
          isOnline={true}
          currentUser={currentUser}
        />
        <EmployeeList
          key='offline-employees'
          title='Offline'
          employees={offlineEmployees}
          isOpen={offlineOpen}
          onOpenChange={setOfflineOpen}
          isOnline={false}
          currentUser={currentUser}
        />
      </SidebarMenu>
    </SidebarGroup>
  );
}
