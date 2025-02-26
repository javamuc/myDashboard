import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Idea } from '../idea.model';
import { HomeService } from 'app/home/home.service';

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
  @Output() deleteFromList = new EventEmitter<number>();
  convertedToTask = false;
  convertedToNote = false;

  private readonly homeService = inject(HomeService);

  onSelect(): void {
    this.select.emit(this.idea.id);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    if (!this.convertedToTask && !this.convertedToNote) {
      this.delete.emit(this.idea.id);
    } else {
      this.deleteFromList.emit(this.idea.id);
    }
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
    this.homeService.setActiveComponent('board');
  }

  openNote(event: Event): void {
    event.stopPropagation();
    //open the notes component in the home component
    this.homeService.setActiveComponent('notes');
  }
}
