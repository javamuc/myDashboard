import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from '../note.model';

@Component({
  selector: 'jhi-note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class NoteEditorComponent {
  @Input() note!: Note;
  @Output() noteUpdated = new EventEmitter<Note>();

  onTitleChange(title: string): void {
    const updatedNote = { ...this.note, title };
    this.noteUpdated.emit(updatedNote);
  }

  onContentChange(content: string): void {
    const updatedNote = { ...this.note, content };
    this.noteUpdated.emit(updatedNote);
  }
}
