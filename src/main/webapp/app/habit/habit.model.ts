export type WeekDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export type DayScheduleType = 'ANYTIME' | 'SPECIFIC';
export type TimePreference = 'MORNING' | 'MIDDAY' | 'AFTERNOON' | 'EVENING' | 'SPECIFIC_TIMES';

export interface FixedTime {
  hour: number;
  minute: number;
}

export interface DaySchedule {
  type: DayScheduleType;
  repetitions?: number;
  timePreferences?: TimePreference[];
  specificTimes?: FixedTime[];
}

export interface HabitSchedule {
  type: 'DAILY' | 'SELECTED_DAYS';
  schedule: {
    [key in WeekDay]?: DaySchedule;
  };
}

export interface Habit {
  id?: number;
  name: string;
  description?: string;
  active: boolean;
  schedule: HabitSchedule;
  createdDate?: Date;
  lastModifiedDate?: Date;
}
