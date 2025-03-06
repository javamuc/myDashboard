export interface PomodoroProfile {
  id: number;
  name: string;
  workTime: number; // in seconds
  breakTime: number; // in seconds
  repeatEnabled: boolean;
  repeatCount: number; // 0 means indefinite
}

export interface PomodoroSettings {
  workTime: number; // in seconds
  breakTime: number; // in seconds
  repeatEnabled: boolean;
  repeatCount: number; // 0 means indefinite
  activeProfileId?: number;
}

export enum TimerType {
  WORK = 'work',
  BREAK = 'break',
}
