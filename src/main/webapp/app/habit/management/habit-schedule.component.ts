import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Habit, DayOfWeek, ScheduleType, HabitDaySchedule, DayScheduleType } from '../habit.model';
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

  readonly weekDays: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  setScheduleType(type: ScheduleType): void {
    const newHabit = {
      ...this.habit,
      scheduleType: type,
      daySchedules: type === 'DAILY' ? this.createDefaultDaySchedules() : [],
    };
    this.habitChange.emit(newHabit);
  }

  isDaySelected(day: DayOfWeek): boolean {
    return this.habit.scheduleType === 'DAILY' || this.habit.daySchedules.some(schedule => schedule.dayOfWeek === day);
  }

  toggleDay(day: DayOfWeek): void {
    const newHabit = { ...this.habit };
    if (this.isDaySelected(day)) {
      newHabit.daySchedules = newHabit.daySchedules.filter(schedule => schedule.dayOfWeek !== day);
    } else {
      newHabit.daySchedules = [...newHabit.daySchedules, this.createDefaultDaySchedule(day)];
    }
    this.habitChange.emit(newHabit);
  }

  getSelectedDays(): DayOfWeek[] {
    if (this.habit.scheduleType === 'DAILY') {
      return this.weekDays;
    }
    return this.habit.daySchedules.map(schedule => schedule.dayOfWeek);
  }

  getDaySchedule(day: DayOfWeek): HabitDaySchedule | undefined {
    return this.habit.daySchedules.find(schedule => schedule.dayOfWeek === day);
  }

  updateDaySchedule(day: DayOfWeek, updatedSchedule: HabitDaySchedule): void {
    const newHabit = { ...this.habit };

    if (this.habit.scheduleType === 'DAILY') {
      // For daily habits, update all day schedules with the same settings
      newHabit.daySchedules = this.weekDays.map(weekDay => ({
        ...updatedSchedule,
        dayOfWeek: weekDay,
        id: this.getDaySchedule(weekDay)?.id, // Preserve existing IDs
      }));
    } else {
      // For selected days, update only the specific day
      newHabit.daySchedules = this.habit.daySchedules.map(schedule =>
        schedule.dayOfWeek === day ? { ...updatedSchedule, dayOfWeek: day } : schedule,
      );
    }

    this.habitChange.emit(newHabit);
  }

  private createDefaultDaySchedules(): HabitDaySchedule[] {
    return this.weekDays.map(day => this.createDefaultDaySchedule(day));
  }

  private createDefaultDaySchedule(day: DayOfWeek): HabitDaySchedule {
    return {
      dayOfWeek: day,
      scheduleType: 'ANYTIME',
      repetitions: 1,
      specificTimes: [],
    };
  }
}
