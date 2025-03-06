import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PomodoroProfile, PomodoroSettings, TimerType } from './pomodoro.model';

@Injectable({
  providedIn: 'root',
})
export class PomodoroStateService {
  // Default settings
  readonly DEFAULT_WORK_TIME = 25 * 60; // 25 minutes in seconds
  readonly DEFAULT_BREAK_TIME = 5 * 60; // 5 minutes in seconds

  // Default profiles
  readonly DEFAULT_PROFILES: PomodoroProfile[] = [
    { id: 1, name: 'Profile1', workTime: 25 * 60, breakTime: 5 * 60, repeatEnabled: false, repeatCount: 0 },
    { id: 2, name: 'Profile2', workTime: 50 * 60, breakTime: 10 * 60, repeatEnabled: false, repeatCount: 0 },
    { id: 3, name: 'Profile3', workTime: 15 * 60, breakTime: 3 * 60, repeatEnabled: true, repeatCount: 4 },
  ];

  // Observable subjects
  public timerActiveSubject = new BehaviorSubject<boolean>(false);
  public timerActive$: Observable<boolean> = this.timerActiveSubject.asObservable();

  public timerTypeSubject = new BehaviorSubject<TimerType>(TimerType.WORK);
  public timerType$: Observable<TimerType> = this.timerTypeSubject.asObservable();

  public settingsSubject = new BehaviorSubject<PomodoroSettings>({
    workTime: this.DEFAULT_WORK_TIME,
    breakTime: this.DEFAULT_BREAK_TIME,
    repeatEnabled: false,
    repeatCount: 0,
  });
  public settings$: Observable<PomodoroSettings> = this.settingsSubject.asObservable();

  public profilesSubject = new BehaviorSubject<PomodoroProfile[]>(this.loadProfiles());
  public profiles$: Observable<PomodoroProfile[]> = this.profilesSubject.asObservable();

  constructor() {
    // Initialize profiles if they don't exist in localStorage
    if (!localStorage.getItem('pomodoroProfiles')) {
      this.saveProfiles(this.DEFAULT_PROFILES);
    }
  }

  // Timer control methods
  startTimer(): void {
    this.timerActiveSubject.next(true);
  }

  stopTimer(): void {
    this.timerActiveSubject.next(false);
  }

  isTimerActive(): boolean {
    return this.timerActiveSubject.getValue();
  }

  setTimerType(type: TimerType): void {
    this.timerTypeSubject.next(type);
  }

  getTimerType(): TimerType {
    return this.timerTypeSubject.getValue();
  }

  // Settings methods
  updateSettings(settings: PomodoroSettings): void {
    this.settingsSubject.next(settings);
    this.saveSettings(settings);
  }

  getSettings(): PomodoroSettings {
    return this.settingsSubject.getValue();
  }

  // Profile methods
  getProfiles(): PomodoroProfile[] {
    return this.profilesSubject.getValue();
  }

  updateProfile(profile: PomodoroProfile): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === profile.id);

    if (index !== -1) {
      profiles[index] = profile;
      this.profilesSubject.next([...profiles]);
      this.saveProfiles(profiles);
    }
  }

  applyProfile(profileId: number): void {
    const profiles = this.getProfiles();
    const profile = profiles.find(p => p.id === profileId);

    if (profile) {
      const settings: PomodoroSettings = {
        workTime: profile.workTime,
        breakTime: profile.breakTime,
        repeatEnabled: profile.repeatEnabled,
        repeatCount: profile.repeatCount,
        activeProfileId: profile.id,
      };

      this.updateSettings(settings);
    }
  }

  renameProfile(profileId: number, newName: string): void {
    const profiles = this.getProfiles();
    const profile = profiles.find(p => p.id === profileId);

    if (profile) {
      profile.name = newName;
      this.profilesSubject.next([...profiles]);
      this.saveProfiles(profiles);
    }
  }

  // Helper methods for localStorage
  private saveSettings(settings: PomodoroSettings): void {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }

  private loadSettings(): PomodoroSettings {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings) as PomodoroSettings;
    }

    return {
      workTime: this.DEFAULT_WORK_TIME,
      breakTime: this.DEFAULT_BREAK_TIME,
      repeatEnabled: false,
      repeatCount: 0,
    };
  }

  private saveProfiles(profiles: PomodoroProfile[]): void {
    localStorage.setItem('pomodoroProfiles', JSON.stringify(profiles));
  }

  private loadProfiles(): PomodoroProfile[] {
    const savedProfiles = localStorage.getItem('pomodoroProfiles');
    if (savedProfiles) {
      return JSON.parse(savedProfiles) as PomodoroProfile[];
    }

    return this.DEFAULT_PROFILES;
  }
}
