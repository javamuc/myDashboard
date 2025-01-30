import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DaySchedule, TimePreference, FixedTime } from './habit.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'jhi-day-schedule',
  templateUrl: './day-schedule.component.html',
  styleUrl: './day-schedule.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
})
export class DayScheduleComponent {
  @Input() schedule!: DaySchedule;
  @Output() scheduleChange = new EventEmitter<DaySchedule>();

  readonly timePreferences: TimePreference[] = ['MORNING', 'MIDDAY', 'AFTERNOON', 'EVENING', 'SPECIFIC_TIMES'];

  setScheduleType(type: 'ANYTIME' | 'SPECIFIC'): void {
    const newSchedule: DaySchedule = {
      type,
      repetitions: type === 'ANYTIME' ? 1 : undefined,
      timePreferences: type === 'SPECIFIC' ? [] : undefined,
      specificTimes: undefined,
    };
    this.scheduleChange.emit(newSchedule);
  }

  updateRepetitions(repetitions: number): void {
    this.scheduleChange.emit({
      ...this.schedule,
      repetitions,
    });
  }

  toggleTimePreference(preference: TimePreference): void {
    const timePreferences = this.schedule.timePreferences ?? [];
    const index = timePreferences.indexOf(preference);

    if (index === -1) {
      timePreferences.push(preference);
    } else {
      timePreferences.splice(index, 1);
    }

    // If SPECIFIC_TIMES is removed, clear the specific times
    if (preference === 'SPECIFIC_TIMES' && index !== -1) {
      this.scheduleChange.emit({
        ...this.schedule,
        timePreferences,
        specificTimes: undefined,
      });
    } else {
      this.scheduleChange.emit({
        ...this.schedule,
        timePreferences,
      });
    }
  }

  addSpecificTime(): void {
    const specificTimes = [...(this.schedule.specificTimes ?? []), { hour: 12, minute: 0 }];
    this.scheduleChange.emit({
      ...this.schedule,
      specificTimes,
    });
  }

  updateSpecificTime(index: number, time: string): void {
    const [hours, minutes] = time.split(':').map(Number);
    const specificTimes = [...(this.schedule.specificTimes ?? [])];
    specificTimes[index] = { hour: hours, minute: minutes };
    this.scheduleChange.emit({
      ...this.schedule,
      specificTimes,
    });
  }

  removeSpecificTime(index: number): void {
    const specificTimes = [...(this.schedule.specificTimes ?? [])];
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

  formatTime(time: FixedTime): string {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  }
}
