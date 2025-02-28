import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitSpecificTime } from '../habit.model';

interface TimeKey {
  hour: number;
  minute: number;
  isHalfHour: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'jhi-time-selector',
  templateUrl: './time-selector.component.html',
  styleUrls: ['./time-selector.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class TimeSelectorComponent implements OnChanges {
  @Input() selectedTimes: HabitSpecificTime[] = [];
  @Output() selectedTimesChange = new EventEmitter<HabitSpecificTime[]>();

  timeKeys: TimeKey[] = [];

  constructor() {
    // Generate time keys from 7:00 to 23:00
    for (let hour = 7; hour <= 23; hour++) {
      // Full hour
      this.timeKeys.push({
        hour,
        minute: 0,
        isHalfHour: false,
        isSelected: false,
      });
      // Half hour
      this.timeKeys.push({
        hour,
        minute: 30,
        isHalfHour: true,
        isSelected: false,
      });
    }
  }

  ngOnChanges(): void {
    // Update selected states based on input
    this.timeKeys.forEach(key => {
      key.isSelected = this.selectedTimes.some(time => time.hour === key.hour && time.minute === key.minute);
    });
  }

  toggleTime(key: TimeKey): void {
    key.isSelected = !key.isSelected;

    // Convert selected keys to HabitSpecificTime array
    const newSelectedTimes = this.timeKeys
      .filter(k => k.isSelected)
      .map(k => ({
        hour: k.hour,
        minute: k.minute,
      }))
      .sort((a, b) => {
        // Sort by hour and then by minute
        if (a.hour === b.hour) {
          return a.minute - b.minute;
        }
        return a.hour - b.hour;
      });

    this.selectedTimesChange.emit(newSelectedTimes);
  }
}
