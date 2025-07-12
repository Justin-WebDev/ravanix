import {
  startOfWeek,
  addDays,
  eachHourOfInterval,
  startOfDay,
  format,
} from 'date-fns';

/**
 * Generates an array of Date objects for each day of the week for a given date.
 * @param date - The date to get the week for.
 * @returns An array of 7 Date objects, starting from Sunday.
 */
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 0 }); // 0 = Sunday
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(start, i));
  }
  return weekDays;
}

/**
 * Generates an array of time slots for a 24-hour period.
 * @returns An array of objects, each with a `time` (Date) and a `label` (string).
 */
export function getDayTimeSlots(): { time: Date; label: string }[] {
  const today = new Date();
  const start = startOfDay(today);
  const end = addDays(start, 1);

  const hours = eachHourOfInterval({ start, end });

  // We only want the 24 hours of the day.
  return hours.slice(0, 24).map(hour => ({
    time: hour,
    label: format(hour, 'h a'), // e.g., "12 AM", "1 PM"
  }));
}
