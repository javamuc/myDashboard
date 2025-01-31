import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitDaySchedule, HabitSpecificTime, DayScheduleType } from './habit.model';
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

  setScheduleType(type: DayScheduleType): void {
    const newSchedule: HabitDaySchedule = {
      ...this.schedule,
      scheduleType: type,
      repetitions: type === 'ANYTIME' ? 1 : undefined,
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

  updateSpecificTimes(times: HabitSpecificTime[]): void {
    this.scheduleChange.emit({
      ...this.schedule,
      specificTimes: times,
    });
  }
}
