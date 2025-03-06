import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaviconService } from '../favicon/favicon.service';
import { PomodoroStateService } from './pomodoro-state.service';
import { PomodoroSettingsComponent } from './pomodoro-settings.component';
import { PomodoroProfile, TimerType } from './pomodoro.model';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'jhi-pomodoro',
  templateUrl: './pomodoro.component.html',
  styleUrls: ['./pomodoro.component.scss'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, PomodoroSettingsComponent, NgbDropdownModule],
})
export class PomodoroComponent implements OnDestroy {
  // UI state
  isFlipped = signal(false);

  // Timer state
  timeLeft = 0;
  breakTimeLeft = 0;
  isRunning = false;
  timerType = TimerType.WORK;
  repeatEnabled = false;
  repeatCount = 0;
  cyclesCompleted = 0;

  // Profiles
  profiles: PomodoroProfile[] = [];
  activeProfile: PomodoroProfile | null = null;

  private timer: any;
  private readonly faviconService = inject(FaviconService);
  private readonly pomodoroStateService = inject(PomodoroStateService);

  constructor() {
    // Initialize from settings
    const settings = this.pomodoroStateService.getSettings();
    this.timeLeft = settings.workTime;
    this.breakTimeLeft = settings.breakTime;
    this.repeatEnabled = settings.repeatEnabled;
    this.repeatCount = settings.repeatCount;

    // Load profiles
    this.profiles = this.pomodoroStateService.getProfiles();
    if (settings.activeProfileId) {
      this.activeProfile = this.profiles.find(p => p.id === settings.activeProfileId) ?? null;
    }

    // Subscribe to settings changes
    this.pomodoroStateService.settings$.pipe(takeUntilDestroyed()).subscribe(newSettings => {
      this.timeLeft = newSettings.workTime;
      this.breakTimeLeft = newSettings.breakTime;
      this.repeatEnabled = newSettings.repeatEnabled;
      this.repeatCount = newSettings.repeatCount;

      if (newSettings.activeProfileId) {
        this.activeProfile = this.profiles.find(p => p.id === newSettings.activeProfileId) ?? null;
      } else {
        this.activeProfile = null;
      }
    });

    // Subscribe to profile changes
    this.pomodoroStateService.profiles$.pipe(takeUntilDestroyed()).subscribe(profiles => {
      this.profiles = profiles;
      if (this.activeProfile) {
        this.activeProfile = profiles.find(p => p.id === this.activeProfile?.id) ?? null;
      }
    });

    // Subscribe to timer type changes
    this.pomodoroStateService.timerType$.pipe(takeUntilDestroyed()).subscribe(type => {
      this.timerType = type;
    });
  }

  startTimer(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.faviconService.setFocusMode(true);
      this.pomodoroStateService.startTimer();
      this.timer = setInterval(() => {
        if (this.timerType === TimerType.WORK) {
          if (this.timeLeft > 0) {
            this.timeLeft--;
          } else {
            this.handleWorkTimerComplete();
          }
        } else {
          if (this.breakTimeLeft > 0) {
            this.breakTimeLeft--;
          } else {
            this.handleBreakTimerComplete();
          }
        }
      }, 1000);
    }
  }

  resetTimer(): void {
    this.isRunning = false;
    this.faviconService.setFocusMode(false);
    this.pomodoroStateService.stopTimer();
    clearInterval(this.timer);

    const settings = this.pomodoroStateService.getSettings();
    this.timeLeft = settings.workTime;
    this.breakTimeLeft = settings.breakTime;
    this.timerType = TimerType.WORK;
    this.pomodoroStateService.setTimerType(TimerType.WORK);
    this.cyclesCompleted = 0;
  }

  handleWorkTimerComplete(): void {
    if (this.repeatEnabled) {
      // Switch to break timer
      this.timerType = TimerType.BREAK;
      this.pomodoroStateService.setTimerType(TimerType.BREAK);

      // Reset break timer
      const settings = this.pomodoroStateService.getSettings();
      this.breakTimeLeft = settings.breakTime;
    } else {
      this.resetTimer();
    }
  }

  handleBreakTimerComplete(): void {
    this.cyclesCompleted++;

    // Check if we've completed all cycles
    if (this.repeatCount > 0 && this.cyclesCompleted >= this.repeatCount) {
      this.resetTimer();
      return;
    }

    // Switch back to work timer
    this.timerType = TimerType.WORK;
    this.pomodoroStateService.setTimerType(TimerType.WORK);

    // Reset work timer
    const settings = this.pomodoroStateService.getSettings();
    this.timeLeft = settings.workTime;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  toggleSettings(): void {
    this.isFlipped.update(value => !value);
  }

  handleFlipBack(saved: boolean): void {
    this.isFlipped.set(false);
  }

  selectProfile(profileId: number): void {
    this.pomodoroStateService.applyProfile(profileId);
  }

  getActiveProfileName(): string {
    return this.activeProfile?.name ?? 'Profiles';
  }

  getTimerBackgroundClass(): string {
    if (!this.isRunning) {
      return '';
    }

    return this.timerType === TimerType.WORK ? 'work-active' : 'break-active';
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.faviconService.setFocusMode(false);
    this.pomodoroStateService.stopTimer();
  }
}
