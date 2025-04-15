
export type EntryType = 'bill' | 'paycheck';

export type Frequency = 'weekly' | 'bi-weekly' | 'monthly' | 'one-time';

export interface FinancialEntry {
  id: string;
  type: EntryType;
  name: string;
  amount: number;
  date: Date;
  frequency: Frequency;
}

export interface DailyReserve {
  date: Date;
  reserve: number;
  entries: FinancialEntry[];
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
}
