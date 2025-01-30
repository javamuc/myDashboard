import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Habit, WeekDay, DaySchedule } from './habit.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DayScheduleComponent } from './day-schedule.component';

@Component({
  selector: 'jhi-habit-schedule',
  templateUrl: './habit-schedule.component.html',
  styleUrls: ['./habit-schedule.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, DayScheduleComponent],
})
export class HabitScheduleComponent {
  @Input() habit!: Habit;
  @Output() habitChange = new EventEmitter<Habit>();

  readonly weekDays: WeekDay[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  setScheduleType(type: 'DAILY' | 'SELECTED_DAYS'): void {
    const newSchedule = {
      ...this.habit,
      schedule: {
        type,
        schedule: type === 'DAILY' ? this.createDefaultDaySchedule() : {},
      },
    };
    this.habitChange.emit(newSchedule);
  }

  isDaySelected(day: WeekDay): boolean {
    return this.habit.schedule.type === 'DAILY' || !!this.habit.schedule.schedule[day];
  }

  toggleDay(day: WeekDay): void {
    const newSchedule = { ...this.habit };
    if (this.isDaySelected(day)) {
      // delete newSchedule.schedule.schedule[day];
      newSchedule.schedule.schedule[day] = undefined;
    } else {
      newSchedule.schedule.schedule[day] = this.createDefaultDaySchedule();
    }
    this.habitChange.emit(newSchedule);
  }

  getSelectedDays(): WeekDay[] {
    if (this.habit.schedule.type === 'DAILY') {
      return this.weekDays;
    }
    return this.weekDays.filter(day => !!this.habit.schedule.schedule[day]);
  }

  getDailySchedule(): DaySchedule {
    // For daily schedule, we use the first day's schedule as the template
    const firstDay = this.weekDays.find(day => !!this.habit.schedule.schedule[day]);
    return firstDay ? this.habit.schedule.schedule[firstDay]! : this.createDefaultDaySchedule();
  }

  updateDailySchedule(schedule: DaySchedule): void {
    const newSchedule = {
      ...this.habit,
      schedule: {
        ...this.habit.schedule,
        schedule: this.weekDays.reduce(
          (acc, day) => ({
            ...acc,
            [day]: schedule,
          }),
          {},
        ),
      },
    };
    this.habitChange.emit(newSchedule);
  }

  updateDaySchedule(day: WeekDay, schedule: DaySchedule): void {
    const newSchedule = {
      ...this.habit,
      schedule: {
        ...this.habit.schedule,
        schedule: {
          ...this.habit.schedule.schedule,
          [day]: schedule,
        },
      },
    };
    this.habitChange.emit(newSchedule);
  }

  private createDefaultDaySchedule(): DaySchedule {
    return {
      type: 'ANYTIME',
      repetitions: 1,
    };
  }
}
