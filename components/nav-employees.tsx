'use client';

import { ChevronRight, UserCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { usePresence, usePresenceListener } from 'ably/react';
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

type Employee = {
  id: string;
  clerkId: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};

type CurrentUser = {
  id: string;
  name: string;
  avatar: string;
};

type NavEmployeesProps = {
  allEmployees: Employee[];
  businessId: string | null;
  currentUser: CurrentUser;
};

// Sub-component for rendering a single employee
const EmployeeListItem = ({
  employee,
  isOnline,
}: {
  employee: Employee;
  isOnline: boolean;
}) => (
  <SidebarMenuSubItem>
    <SidebarMenuSubButton
      asChild
      className={cn(
        'justify-start',
        !isOnline && 'text-muted-foreground hover:text-accent-foreground'
      )}
    >
      <Link href={`/dashboard/employees/${employee.id}`}>
        <div className='relative'>
          <Avatar className='size-5'>
            <AvatarImage src={employee.imageUrl ?? undefined} />
            <AvatarFallback>
              <UserCircle2 className='size-4' />
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className='absolute -bottom-0.5 -right-0.5 rounded-full bg-green-500 p-0.5 ring-2 ring-sidebar-accent' />
          )}
        </div>
        <span>
          {`${employee.firstName || ''} ${employee.lastName || ''}`.trim()}
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
}: {
  title: string;
  employees: Employee[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isOnline: boolean;
}) => (
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
              />
            ))
          ) : (
            <div className='px-2 py-1 text-xs text-muted-foreground'>
              {isOnline
                ? 'No employees are online.'
                : 'All employees are online.'}
            </div>
          )}
        </SidebarMenuSub>
      </CollapsibleContent>
    </SidebarMenuItem>
  </Collapsible>
);

export function NavEmployees({
  allEmployees,
  businessId,
  currentUser,
}: NavEmployeesProps) {
  const channelName = `business:${businessId}`;

  const { presenceData } = usePresenceListener(channelName);

  const onlineEmployeeIds = new Set(presenceData.map(member => member.data.id));

  const onlineEmployees = allEmployees.filter(e =>
    onlineEmployeeIds.has(e.clerkId)
  );
  const offlineEmployees = allEmployees.filter(
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
          title='Online'
          employees={onlineEmployees}
          isOpen={onlineOpen}
          onOpenChange={setOnlineOpen}
          isOnline={true}
        />
        <EmployeeList
          title='Offline'
          employees={offlineEmployees}
          isOpen={offlineOpen}
          onOpenChange={setOfflineOpen}
          isOnline={false}
        />
      </SidebarMenu>
    </SidebarGroup>
  );
}
