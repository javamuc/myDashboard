import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Habit } from './habit.model';
import { HabitService } from './habit.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'jhi-habit-tracker',
  templateUrl: './habit-tracker.component.html',
  styleUrls: ['./habit-tracker.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
})
export class HabitTrackerComponent implements OnInit {
  activeHabits = signal<Habit[]>([]);
  private destroyRef = inject(DestroyRef);

  constructor(private habitService: HabitService) {}

  ngOnInit(): void {
    this.loadActiveHabits();
  }

  loadActiveHabits(): void {
    this.habitService
      .queryActive()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(habits => {
        this.activeHabits.set(habits);
      });
  }

  recordHabitCompletion(habit: Habit, event: Event): void {
    event.preventDefault();
    if (habit.id) {
      this.habitService
        .createRecord(habit.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          // Optionally refresh the habits list or update UI
          this.loadActiveHabits();
        });
    }
  }
}
