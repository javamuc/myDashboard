export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type ScheduleType = 'DAILY' | 'SELECTED_DAYS';
export type DayScheduleType = 'ANYTIME' | 'SPECIFIC';

export interface HabitSpecificTime {
  id?: number;
  hour: number;
  minute: number;
  dayScheduleId?: number;
}

export interface HabitDaySchedule {
  id?: number;
  dayOfWeek: DayOfWeek;
  scheduleType: DayScheduleType;
  repetitions?: number;
  specificTimes: HabitSpecificTime[];
  habitId?: number;
}

export interface HabitRecord {
  id?: number;
  habitId: number;
  recordDate: string;
  createdDate?: string;
}

export interface Habit {
  id?: number;
  name: string;
  description?: string;
  active: boolean;
  scheduleType: ScheduleType;
  daySchedules: HabitDaySchedule[];
  createdDate?: string;
  lastModifiedDate?: string;
}
