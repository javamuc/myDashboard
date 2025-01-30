import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitDaySchedule, TimePreference, HabitSpecificTime, DayScheduleType } from './habit.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'jhi-day-schedule',
  templateUrl: './day-schedule.component.html',
  styleUrl: './day-schedule.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
})
export class DayScheduleComponent {
  @Input() schedule!: HabitDaySchedule;
  @Output() scheduleChange = new EventEmitter<HabitDaySchedule>();

  readonly timePreferences: TimePreference[] = ['MORNING', 'MIDDAY', 'AFTERNOON', 'EVENING', 'SPECIFIC_TIMES'];

  setScheduleType(type: DayScheduleType): void {
    const newSchedule: HabitDaySchedule = {
      ...this.schedule,
      scheduleType: type,
      repetitions: type === 'ANYTIME' ? 1 : undefined,
      timePreference: type === 'SPECIFIC' ? 'SPECIFIC_TIMES' : undefined,
      specificTimes: type === 'SPECIFIC' ? [] : [],
    };
    this.scheduleChange.emit(newSchedule);
  }

  updateRepetitions(repetitions: number): void {
    this.scheduleChange.emit({
      ...this.schedule,
      repetitions,
    });
  }

  setTimePreference(preference: TimePreference): void {
    const newSchedule = {
      ...this.schedule,
      timePreference: preference,
      // Clear specific times if switching away from SPECIFIC_TIMES
      specificTimes: preference === 'SPECIFIC_TIMES' ? this.schedule.specificTimes : [],
    };
    this.scheduleChange.emit(newSchedule);
  }

  addSpecificTime(): void {
    const specificTimes = [...this.schedule.specificTimes, { hour: 12, minute: 0 }];
    this.scheduleChange.emit({
      ...this.schedule,
      specificTimes,
    });
  }

  updateSpecificTime(index: number, time: string): void {
    const [hours, minutes] = time.split(':').map(Number);
    const specificTimes = [...this.schedule.specificTimes];
    specificTimes[index] = { hour: hours, minute: minutes };
    this.scheduleChange.emit({
      ...this.schedule,
      specificTimes,
    });
  }

  removeSpecificTime(index: number): void {
    const specificTimes = [...this.schedule.specificTimes];
    specificTimes.splice(index, 1);
    this.scheduleChange.emit({
      ...this.schedule,
      specificTimes,
    });
  }

  formatTimePreference(preference: TimePreference): string {
    return preference
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  formatTime(time: HabitSpecificTime): string {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  }
}
