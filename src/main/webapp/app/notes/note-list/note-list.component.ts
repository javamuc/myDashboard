import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from '../note.model';

@Component({
  selector: 'jhi-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class NoteListComponent {
  @Input() notes: Note[] = [];
  @Input() selectedNoteId?: number;
  @Output() noteSelected = new EventEmitter<Note>();

  isSelected(note: Note): boolean {
    return note.id === this.selectedNoteId;
  }

  onNoteClick(note: Note): void {
    this.noteSelected.emit(note);
  }

  getPreviewText(content: string): string {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }
}
