import { TimeElapsed } from '../types';

export function calculateTimeElapsed(startDateStr: string): TimeElapsed {
  const start = new Date(startDateStr);
  const now = new Date();

  // If invalid date, fallback to default date
  const targetDate = isNaN(start.getTime()) ? new Date('2025-09-24T17:00:00') : start;
  
  const isPast = now.getTime() >= targetDate.getTime();
  
  let earlier = isPast ? targetDate : now;
  let later = isPast ? now : targetDate;

  let years = later.getFullYear() - earlier.getFullYear();
  let months = later.getMonth() - earlier.getMonth();
  let days = later.getDate() - earlier.getDate();
  let hours = later.getHours() - earlier.getHours();
  let minutes = later.getMinutes() - earlier.getMinutes();
  let seconds = later.getSeconds() - earlier.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }

  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }

  if (hours < 0) {
    hours += 24;
    days -= 1;
  }

  if (days < 0) {
    const prevMonth = new Date(later.getFullYear(), later.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const totalMonths = Math.max(0, years * 12 + months);
  const diffMs = Math.abs(now.getTime() - targetDate.getTime());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));

  return {
    years: Math.max(0, years),
    months: totalMonths,
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    totalDays,
    totalHours,
  };
}

export function formatDateToPtBr(date: Date): string {
  const monthsPt = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  return `${date.getDate()} ${monthsPt[date.getMonth()]} ${date.getFullYear()}`;
}
