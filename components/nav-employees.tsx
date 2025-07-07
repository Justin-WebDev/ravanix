'use client';

import { ChevronRight, UserCircle2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
import { useSocket } from '@/hooks/use-socket';

type Employee = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};

type NavEmployeesProps = {
  initialOnline: Employee[];
  initialOffline: Employee[];
  businessId: string | null;
};

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
      <a href='#'>
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
      </a>
    </SidebarMenuSubButton>
  </SidebarMenuSubItem>
);

export function NavEmployees({
  initialOnline,
  initialOffline,
  businessId,
}: NavEmployeesProps) {
  const [online, setOnline] = useState(initialOnline);
  const [offline, setOffline] = useState(initialOffline);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !businessId) return;

    socket.emit('join_business_room', businessId);

    const handleUserOnline = (user: Employee) => {
      setOffline(prev => prev.filter(u => u.id !== user.id));
      setOnline(prev => [...prev.filter(u => u.id !== user.id), user]);
    };

    const handleUserOffline = (user: { id: string }) => {
      setOnline(prev => {
        const userToMove = prev.find(u => u.id === user.id);
        if (userToMove) {
          setOffline(o => [...o, userToMove]);
        }
        return prev.filter(u => u.id !== user.id);
      });
    };

    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    return () => {
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, [socket, businessId]);

  const [onlineOpen, setOnlineOpen] = React.useState(true);
  const [offlineOpen, setOfflineOpen] = React.useState(false);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Employees</SidebarGroupLabel>
      <SidebarMenu>
        {/* Online Employees */}
        <Collapsible asChild open={onlineOpen} onOpenChange={setOnlineOpen}>
          <SidebarMenuItem className='flex flex-col items-start'>
            <CollapsibleTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='w-full justify-between pr-2 font-semibold'
              >
                Online
                <ChevronRight
                  className={cn(
                    'size-4 transition-transform',
                    onlineOpen && 'rotate-90'
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent asChild>
              <SidebarMenuSub className='w-full'>
                {online.length > 0 ? (
                  online.map(employee => (
                    <EmployeeListItem
                      key={employee.id}
                      employee={employee}
                      isOnline
                    />
                  ))
                ) : (
                  <div className='px-2 py-1 text-xs text-muted-foreground'>
                    No employees are online.
                  </div>
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        {/* Offline Employees */}
        <Collapsible asChild open={offlineOpen} onOpenChange={setOfflineOpen}>
          <SidebarMenuItem className='flex flex-col items-start'>
            <CollapsibleTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='w-full justify-between pr-2 font-semibold'
              >
                Offline
                <ChevronRight
                  className={cn(
                    'size-4 transition-transform',
                    offlineOpen && 'rotate-90'
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent asChild>
              <SidebarMenuSub className='w-full'>
                {offline.length > 0 ? (
                  offline.map(employee => (
                    <EmployeeListItem
                      key={employee.id}
                      employee={employee}
                      isOnline={false}
                    />
                  ))
                ) : (
                  <div className='px-2 py-1 text-xs text-muted-foreground'>
                    All employees are online.
                  </div>
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
