import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitDaySchedule, TimePreference, HabitSpecificTime, DayScheduleType } from './habit.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TimeSelectorComponent } from './time-selector.component';

@Component({
  selector: 'jhi-day-schedule',
  templateUrl: './day-schedule.component.html',
  styleUrl: './day-schedule.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, TimeSelectorComponent],
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

  updateSpecificTimes(times: HabitSpecificTime[]): void {
    this.scheduleChange.emit({
      ...this.schedule,
      specificTimes: times,
    });
  }

  formatTimePreference(preference: TimePreference): string {
    return preference
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }
}
