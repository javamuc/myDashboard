import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DiaryEntry } from '../diary.model';

@Component({
  selector: 'jhi-diary-entry',
  templateUrl: './diary-entry.component.html',
  styleUrls: ['./diary-entry.component.scss'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, DatePipe],
})
export class DiaryEntryComponent {
  @Input() entry!: DiaryEntry;
  @Output() editEntry = new EventEmitter<DiaryEntry>();

  onEditClick(): void {
    this.editEntry.emit(this.entry);
  }

  formatDate(date: Date): string {
    return new DatePipe('en-US').transform(date, 'MMM d, y - h:mm a') ?? '';
  }
}
