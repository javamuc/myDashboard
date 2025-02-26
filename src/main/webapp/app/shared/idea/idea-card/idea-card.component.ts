import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Idea } from '../idea.model';

@Component({
  selector: 'jhi-idea-card',
  templateUrl: './idea-card.component.html',
  styleUrls: ['./idea-card.component.scss'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
})
export class IdeaCardComponent {
  @Input() idea!: Idea;
  @Input() selected = false;

  @Output() select = new EventEmitter<number>();
  @Output() makeTask = new EventEmitter<{ idea: Idea; event: MouseEvent }>();
  @Output() makeNote = new EventEmitter<Idea>();
  @Output() delete = new EventEmitter<number>();

  convertedToTask = false;
  convertedToNote = false;

  onSelect(): void {
    this.select.emit(this.idea.id);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.idea.id);
  }

  onConvertToTask(event: MouseEvent): void {
    event.stopPropagation();
    this.makeTask.emit({ idea: this.idea, event });
    this.convertedToTask = true;
  }

  onConvertToNote(event: Event): void {
    event.stopPropagation();
    this.makeNote.emit(this.idea);
    this.convertedToNote = true;
  }

  openTask(event: Event): void {
    event.stopPropagation();
    // this.openTask.emit(this.idea);
  }

  openNote(event: Event): void {
    event.stopPropagation();
    // this.openNote.emit(this.idea);
  }
}
