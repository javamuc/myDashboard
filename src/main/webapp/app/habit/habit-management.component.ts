import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Habit } from './habit.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HabitScheduleComponent } from './habit-schedule.component';

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

  ngOnInit(): void {
    console.warn('HabitManagementComponent ngOnInit');
  }

  addHabit(): void {
    const newHabit: Habit = {
      name: '',
      active: true,
      schedule: {
        type: 'DAILY',
        schedule: {},
      },
    };
    this.habits.update(habits => [...habits, newHabit]);
    this.selectedHabit.set(newHabit);
    this.editingHabit.set(newHabit);
    // Focus will be handled by the template change detection
  }

  deleteHabit(habit: Habit): void {
    this.habits.update(habits => habits.filter(h => h !== habit));
    if (this.selectedHabit() === habit) {
      this.selectedHabit.set(null);
    }
    if (this.editingHabit() === habit) {
      this.editingHabit.set(null);
    }
  }

  selectHabit(habit: Habit): void {
    this.selectedHabit.set(habit);
  }

  updateHabit(updatedHabit: Habit): void {
    this.habits.update(habits =>
      habits.map(h => {
        if (h === this.selectedHabit()) {
          return updatedHabit;
        }
        return h;
      }),
    );
    this.selectedHabit.set(updatedHabit);
  }

  startEditing(habit: Habit, event?: MouseEvent): void {
    event?.stopPropagation();
    this.editingHabit.set(habit);
    // Focus will be handled by the template change detection
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
}
