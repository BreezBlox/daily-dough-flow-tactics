
import { DailyReserve, FinancialEntry, Frequency } from "@/types";

// Get the number of days in a month
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Get the first day of the month
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// Format date as YYYY-MM-DD
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse a YYYY-MM-DD string as a local date (not UTC!)
export function parseLocalDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}


// Format date as Month D, YYYY
export function formatDateToMonthDayYear(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString(undefined, options);
}

// Get days between two dates
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay));
  return diffDays;
}

// Calculate the next occurrence of a recurring entry
export function getNextOccurrence(entry: FinancialEntry, currentDate: Date): Date | null {
  if (entry.frequency === 'one-time') {
    return new Date(entry.date);
  }
  
  const entryDate = new Date(entry.date);
  let nextDate = new Date(entryDate);
  
  while (nextDate < currentDate) {
    switch (entry.frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'bi-weekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }
  }
  
  return nextDate;
}

// Calculate all occurrences of recurring entries within a date range
export function calculateRecurringEntries(
  entries: FinancialEntry[],
  startDate: Date,
  endDate: Date
): FinancialEntry[] {
  const allEntries: FinancialEntry[] = [];
  
  entries.forEach(entry => {
    let currentDate = new Date(entry.date);
    
    // For one-time entries, only include if they fall within the range
    if (entry.frequency === 'one-time') {
      if (currentDate >= startDate && currentDate <= endDate) {
        allEntries.push({ ...entry });
      }
      return;
    }
    
    // For recurring entries, calculate all occurrences within range
    while (currentDate <= endDate) {
      if (currentDate >= startDate) {
        allEntries.push({
          ...entry,
          id: `${entry.id}-${formatDateToYYYYMMDD(currentDate)}`,
          date: new Date(currentDate)
        });
      }
      
      // Advance to the next occurrence
      switch (entry.frequency) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'bi-weekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }
  });
  
  return allEntries;
}

// Calculate daily reserves based on all entries
export function calculateDailyReserves(
  entries: FinancialEntry[],
  startDate: Date,
  endDate: Date
): DailyReserve[] {
  const dailyReserves: DailyReserve[] = [];
  let currentDate = new Date(startDate);
  let cumulativeReserve = 0;
  
  // Create a map of entries by date
  const entriesByDate: Record<string, FinancialEntry[]> = {};
  entries.forEach(entry => {
    const dateKey = formatDateToYYYYMMDD(new Date(entry.date));
    if (!entriesByDate[dateKey]) {
      entriesByDate[dateKey] = [];
    }
    entriesByDate[dateKey].push(entry);
  });
  
  // Calculate reserve for each day
  while (currentDate <= endDate) {
    const dateKey = formatDateToYYYYMMDD(new Date(currentDate));
    const dayEntries = entriesByDate[dateKey] || [];
    
    // Update cumulative reserve based on the day's entries
    dayEntries.forEach(entry => {
      if (entry.type === 'paycheck') {
        cumulativeReserve += entry.amount;
      } else if (entry.type === 'bill') {
        cumulativeReserve -= entry.amount;
      }
    });
    
    dailyReserves.push({
      date: new Date(currentDate),
      reserve: cumulativeReserve,
      entries: dayEntries
    });
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dailyReserves;
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
}
