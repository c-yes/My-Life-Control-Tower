import { format, getWeek, startOfWeek, endOfWeek, addDays } from 'date-fns';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd');
}

export function formatDateDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function getTodayString(): string {
  return formatDate(new Date());
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentWeek(): number {
  return getWeek(new Date(), { weekStartsOn: 1 });
}

export function getWeekForDate(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return getWeek(d, { weekStartsOn: 1 });
}

export function getWeekDateRange(year: number, week: number): { start: Date; end: Date } {
  const jan1 = new Date(year, 0, 1);
  const daysOffset = (week - 1) * 7;
  const weekStart = startOfWeek(addDays(jan1, daysOffset), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  return { start: weekStart, end: weekEnd };
}

export function getWeekDays(year: number, week: number): Date[] {
  const { start } = getWeekDateRange(year, week);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function calculateStreak(completions: string[], startDate: string): number {
  const today = getTodayString();
  const sortedCompletions = [...completions].sort().reverse();

  if (sortedCompletions.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date(today);

  while (true) {
    const dateStr = formatDate(currentDate);
    if (sortedCompletions.includes(dateStr)) {
      streak++;
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
    if (dateStr === startDate) break;
  }

  return streak;
}

export function getCompletionRate(completions: string[], startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const totalDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  if (totalDays <= 0) return 0;
  return Math.round((completions.length / Math.min(totalDays, 21)) * 100);
}

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DAYS_OF_WEEK_KO = ['월', '화', '수', '목', '금', '토', '일'];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MOOD_EMOJIS = ['😞', '😕', '😐', '😊', '😄'];

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
