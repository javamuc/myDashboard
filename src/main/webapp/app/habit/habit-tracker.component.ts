import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Habit, HabitSpecificTime } from './habit.model';
import { HabitService } from './habit.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { interval, timer } from 'rxjs';

interface HabitProgress {
  habit: Habit;
  completedCount: number;
  targetCount: number;
  progress: number;
  canAddRecord: boolean;
}

@Component({
  selector: 'jhi-habit-tracker',
  templateUrl: './habit-tracker.component.html',
  styleUrls: ['./habit-tracker.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, NgbProgressbarModule],
})
export class HabitTrackerComponent implements OnInit {
  habitProgress = signal<HabitProgress[]>([]);
  private destroyRef = inject(DestroyRef);
  private readonly THIRTY_MINUTES = 30 * 60 * 1000; // 30 minutes in milliseconds

  constructor(private habitService: HabitService) {}

  ngOnInit(): void {
    this.loadHabitsAndRecords();
    this.setupAutoRefresh();
  }

  loadHabitsAndRecords(): void {
    const today = new Date().toISOString().split('T')[0];
    this.habitService
      .queryActive()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(habits => {
        this.habitService
          .getHabitRecords(today)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(records => {
            const progress = habits.map(habit => {
              const habitRecords = records.filter(record => record.habitId === habit.id);
              const targetCount = this.calculateTargetCount(habit);
              return {
                habit,
                completedCount: habitRecords.length,
                targetCount,
                progress: (habitRecords.length / targetCount) * 100,
                canAddRecord: habitRecords.length < targetCount,
              };
            });
            this.habitProgress.set(progress);
          });
      });
  }

  recordHabitCompletion(habitProgress: HabitProgress, event: Event): void {
    event.preventDefault();
    if (habitProgress.habit.id && habitProgress.canAddRecord) {
      this.habitService
        .createRecord(habitProgress.habit.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.loadHabitsAndRecords();
        });
    }
  }

  private setupAutoRefresh(): void {
    // Calculate time until next 30-minute mark
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    // Calculate delay until next 30-minute mark
    const nextMinute = minutes <= 29 ? 30 : 60;
    const delay = ((nextMinute - minutes) * 60 - seconds) * 1000 - milliseconds;

    // Start timer with initial delay, then repeat every 30 minutes
    timer(delay)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadHabitsAndRecords();
        // Set up recurring updates every 30 minutes
        interval(this.THIRTY_MINUTES)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.loadHabitsAndRecords());
      });
  }

  private calculateTargetCount(habit: Habit): number {
    const schedule = habit.daySchedules.find(s => {
      const today = new Date().getDay();
      const dayIndex = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      return s.dayOfWeek === dayIndex[today];
    });

    if (!schedule) {
      return 0;
    }

    if (schedule.scheduleType === 'ANYTIME') {
      return schedule.repetitions ?? 0;
    }

    // For specific times, count how many times have passed
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    return schedule.specificTimes.filter(time => this.hasTimePassed(time, currentHour, currentMinute)).length;
  }

  private hasTimePassed(time: HabitSpecificTime, currentHour: number, currentMinute: number): boolean {
    return time.hour < currentHour || (time.hour === currentHour && time.minute <= currentMinute);
  }
}
