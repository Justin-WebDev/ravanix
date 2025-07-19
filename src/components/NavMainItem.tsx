'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type NavMainItemProps = {
  item: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  };
  isDisabled?: boolean;
};

export function NavMainItem({ item, isDisabled }: NavMainItemProps) {
  return (
    <SidebarMenuItem>
      <Collapsible defaultOpen={item.isActive} className='space-y-1'>
        <div className='flex items-center justify-between'>
          <SidebarMenuButton
            asChild
            tooltip={item.title}
            className={cn('flex-1', isDisabled && 'text-muted-foreground')}
          >
            {isDisabled ? (
              <span className='cursor-not-allowed w-full'>
                <item.icon />
                <span>{item.title}</span>
              </span>
            ) : (
              <Link href={item.url} className='w-full'>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            )}
          </SidebarMenuButton>
          {item.items?.length ? (
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className='data-[state=open]:rotate-90'>
                <ChevronRight />
                <span className='sr-only'>Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
          ) : null}
        </div>
        {item.items?.length ? (
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items?.map(subItem => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    className={cn(isDisabled && 'text-muted-foreground')}
                  >
                    {isDisabled ? (
                      <span className='cursor-not-allowed'>
                        <span>{subItem.title}</span>
                      </span>
                    ) : (
                      <Link href={subItem.url}>
                        <span>{subItem.title}</span>
                      </Link>
                    )}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        ) : null}
      </Collapsible>
    </SidebarMenuItem>
  );
}
