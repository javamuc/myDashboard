import { Component, OnInit, signal, ViewChild, ElementRef, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Habit, HabitDaySchedule, DayOfWeek, DayScheduleType } from './habit.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HabitScheduleComponent } from './habit-schedule.component';
import { HabitService } from './habit.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'jhi-habit-management',
  templateUrl: './habit-management.component.html',
  styleUrls: ['./habit-management.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, HabitScheduleComponent],
})
export class HabitManagementComponent implements OnInit {
  habits = signal<Habit[]>([]);
  selectedHabit = signal<Habit | null>(null);
  editingHabit = signal<Habit | null>(null);
  @ViewChild('habitInput') habitInput?: ElementRef<HTMLInputElement>;
  private destroyRef = inject(DestroyRef);

  constructor(private habitService: HabitService) {}

  ngOnInit(): void {
    this.loadHabits();
  }

  loadHabits(): void {
    this.habitService
      .query()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(habits => {
        this.habits.set(habits);
      });
  }

  addHabit(): void {
    const newHabit: Habit = {
      name: '',
      active: true,
      scheduleType: 'DAILY',
      daySchedules: this.createDefaultDaySchedules(),
    };

    this.habitService
      .create(newHabit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(createdHabit => {
        this.habits.update(habits => [...habits, createdHabit]);
        this.selectedHabit.set(createdHabit);
        this.editingHabit.set(createdHabit);
      });
  }

  deleteHabit(habit: Habit): void {
    if (habit.id) {
      this.habitService
        .delete(habit.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.habits.update(habits => habits.filter(h => h !== habit));
          if (this.selectedHabit() === habit) {
            this.selectedHabit.set(null);
          }
          if (this.editingHabit() === habit) {
            this.editingHabit.set(null);
          }
        });
    }
  }

  selectHabit(habit: Habit): void {
    this.selectedHabit.set(habit);
  }

  updateHabit(updatedHabit: Habit): void {
    if (updatedHabit.id) {
      this.habitService
        .update(updatedHabit)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(savedHabit => {
          this.habits.update(habits =>
            habits.map(h => {
              if (h.id === savedHabit.id) {
                return savedHabit;
              }
              return h;
            }),
          );
          this.selectedHabit.set(savedHabit);
        });
    }
  }

  startEditing(habit: Habit, event?: MouseEvent): void {
    event?.stopPropagation();
    this.editingHabit.set(habit);
  }

  finishEditing(habit: Habit, event?: Event): void {
    event?.stopPropagation();
    this.editingHabit.set(null);
    if (habit.name.trim() === '') {
      habit.name = 'New Habit';
    }
    this.updateHabit({ ...habit });
  }

  onKeyDown(event: KeyboardEvent, habit: Habit): void {
    if (event.key === 'Enter') {
      this.finishEditing(habit, event);
    }
  }

  private createDefaultDaySchedules(): HabitDaySchedule[] {
    const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    return days.map(day => ({
      dayOfWeek: day,
      scheduleType: 'ANYTIME' as DayScheduleType,
      repetitions: 1,
      specificTimes: [],
    }));
  }
}
