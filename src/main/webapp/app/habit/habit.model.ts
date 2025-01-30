export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type ScheduleType = 'DAILY' | 'SELECTED_DAYS';
export type DayScheduleType = 'ANYTIME' | 'SPECIFIC';
export type TimePreference = 'MORNING' | 'MIDDAY' | 'AFTERNOON' | 'EVENING' | 'SPECIFIC_TIMES';

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
  timePreference?: TimePreference;
  specificTimes: HabitSpecificTime[];
  habitId?: number;
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
