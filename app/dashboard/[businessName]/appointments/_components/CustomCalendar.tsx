'use client';

import { useState, useEffect, useRef } from 'react';
import {
  format,
  isToday,
  addDays,
  setHours,
  setMinutes,
  isWithinInterval,
  addMinutes,
  isSameDay,
  parseISO,
  getHours,
  getMinutes,
  differenceInMinutes,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { getDayTimeSlots, getWeekDays } from '@/lib/calendarUtils';

// --- Type Definitions ---
type Appointment = {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  client: { name: string } | null;
  items: { description: string | null; service: { name: string } | null }[];
};

type CustomCalendarProps = {
  appointmentsData: Appointment[];
};

// --- Sub-Components ---
function AppointmentEvent({ app }: { app: Appointment }) {
  const PIXELS_PER_HOUR = 80;

  const startTime = parseISO(app.startTime);
  const endTime = parseISO(app.endTime);

  const top =
    (getHours(startTime) + getMinutes(startTime) / 60) * PIXELS_PER_HOUR;
  const durationInMinutes = differenceInMinutes(endTime, startTime);
  const height = (durationInMinutes / 60) * PIXELS_PER_HOUR;

  const displayHeight = Math.max(height, 20);

  const title = app.client?.name || 'Appointment';
  const description =
    app.items?.[0]?.description || app.items?.[0]?.service?.name || 'Service';

  return (
    <Link
      href={`/dashboard/appointments/${app.id}/edit`}
      className='absolute left-0 right-8 p-2 rounded-lg overflow-hidden bg-primary/80 text-primary-foreground hover:bg-primary transition-all shadow-md cursor-pointer pointer-events-auto'
      style={{
        top: `${top}px`,
        height: `${displayHeight}px`,
      }}
      title={`${title} - ${description}\n${format(startTime, 'p')} - ${format(
        endTime,
        'p'
      )}`}
    >
      <p className='text-xs opacity-80 truncate'>{`${format(
        startTime,
        'p'
      )} - ${format(endTime, 'p')}`}</p>
      <p className='font-bold text-xs truncate'>{title}</p>
      <p className='text-xs opacity-80 truncate'>{description}</p>
    </Link>
  );
}

// --- Main Calendar Component ---
export default function CustomCalendar({
  appointmentsData,
}: CustomCalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const weekDays = getWeekDays(currentDate);
  const timeSlots = getDayTimeSlots();

  const getSlotDate = (day: Date, time: Date, isHalfHour: boolean): Date => {
    let slotTime = setHours(day, time.getHours());
    slotTime = setMinutes(slotTime, isHalfHour ? 30 : 0);
    return slotTime;
  };

  const handleStartSelection = (slotDate: Date) => {
    if (slotDate < new Date()) {
      toast.error('Cannot schedule in the past.');
      return;
    }
    setIsSelecting(true);
    setSelection({ start: slotDate, end: slotDate });
  };

  const handleMoveSelection = (slotDate: Date) => {
    if (isSelecting && selection.start && slotDate >= selection.start) {
      setSelection(prev => ({ ...prev, end: slotDate }));
    }
  };

  const handleEndSelection = () => {
    if (
      isSelecting &&
      selection.start &&
      selection.end &&
      selection.end >= selection.start
    ) {
      const startTime = selection.start.toISOString();
      const endTime = addMinutes(selection.end, 30).toISOString();
      router.push(
        `/dashboard/appointments/new?start=${startTime}&end=${endTime}`
      );
    }
    setIsSelecting(false);
    setSelection({ start: null, end: null });
  };

  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (isSelecting) {
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.getAttribute('data-slot-date')) {
          const slotDateISO = element.getAttribute('data-slot-date');
          if (slotDateISO) {
            const slotDate = parseISO(slotDateISO);
            handleMoveSelection(slotDate);
          }
        }
      }
    };

    scrollEl.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      scrollEl.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isSelecting, handleMoveSelection]);

  const isSlotSelected = (slotDate: Date) => {
    if (!isSelecting || !selection.start || !selection.end) return false;
    const start = selection.start;
    const end = selection.end;
    const interval = { start, end };
    return isWithinInterval(slotDate, interval);
  };

  const goToPreviousWeek = () => setCurrentDate(prev => addDays(prev, -7));
  const goToNextWeek = () => setCurrentDate(prev => addDays(prev, 7));
  const goToToday = () => setCurrentDate(new Date());

  const dayColumnWidth = 'w-full min-w-[10rem] max-w-[16rem]';

  return (
    <div className='flex flex-col h-full bg-card'>
      <header className='flex items-center justify-between flex-shrink-0 px-4 py-3 border-b border-border'>
        <div className='flex items-center gap-x-2'>
          <Button size='sm' variant='outline' onClick={goToToday}>
            Today
          </Button>
          <div className='flex items-center'>
            <Button size='icon' variant='ghost' onClick={goToPreviousWeek}>
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button size='icon' variant='ghost' onClick={goToNextWeek}>
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
        <div className='text-lg font-semibold text-foreground'>
          {format(currentDate, 'MMMM yyyy')}
        </div>
        <div className='w-[124px]'></div>
      </header>
      <div className='flex-1 relative'>
        <div
          className='absolute inset-0 overflow-auto no-scrollbar'
          ref={scrollContainerRef}
        >
          <div className='min-w-[calc(4rem+7*10rem)]'>
            <div className='grid grid-cols-[auto_1fr] grid-rows-[auto_1fr]'>
              <div className='sticky top-0 left-0 z-20 bg-card'></div>
              <div className='sticky top-0 z-10 grid grid-cols-7 bg-card'>
                {weekDays.map((day: any) => (
                  <div
                    key={day.toISOString()}
                    className='flex-1 min-w-[150px] text-center p-2 border-l border-border'
                  >
                    <p className='text-xs font-semibold text-muted-foreground'>
                      {format(day, 'EEE')}
                    </p>
                    <div
                      className={cn(
                        'text-2xl font-bold mt-1 w-10 h-10 mx-auto flex items-center justify-center rounded-full',
                        isToday(day) && 'bg-primary text-primary-foreground'
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>
              <div className='row-start-2 sticky left-0 z-10 bg-card mt-5'>
                {timeSlots.map(({ time, label }: any) => (
                  <div
                    key={time.toISOString()}
                    className='h-[80px] flex justify-end items-start pr-3 pt-0 border-r border-border'
                  >
                    <span className='relative -top-2.5 bg-card px-1 text-sm text-muted-foreground'>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <div className='row-start-2 col-start-2 grid grid-cols-7 mt-5'>
                {weekDays.map((day: any) => {
                  const appointmentsForDay = appointmentsData.filter(app =>
                    isSameDay(parseISO(app.startTime), day)
                  );
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'relative border-l border-border',
                        dayColumnWidth,
                        isToday(day) && 'bg-primary/5'
                      )}
                    >
                      {timeSlots.map(({ time }: any) => (
                        <div
                          key={time.toISOString()}
                          className='h-[80px] border-t border-border'
                        >
                          {[0, 1].map(halfHour => {
                            const slotDate = getSlotDate(
                              day,
                              time,
                              halfHour === 1
                            );
                            return (
                              <div
                                key={halfHour}
                                data-slot-date={slotDate.toISOString()}
                                className={cn(
                                  'h-1/2 cursor-pointer',
                                  halfHour === 0 &&
                                    'border-b border-dotted border-border/60',
                                  isSlotSelected(slotDate) && 'bg-primary/20'
                                )}
                                onMouseDown={() =>
                                  handleStartSelection(slotDate)
                                }
                                onMouseOver={() =>
                                  handleMoveSelection(slotDate)
                                }
                                onMouseUp={handleEndSelection}
                                onTouchStart={e => {
                                  e.preventDefault();
                                  handleStartSelection(slotDate);
                                }}
                                onTouchEnd={handleEndSelection}
                              ></div>
                            );
                          })}
                        </div>
                      ))}
                      <div className='absolute inset-0 pointer-events-none'>
                        {appointmentsForDay.map(app => (
                          <AppointmentEvent key={app.id} app={app} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
