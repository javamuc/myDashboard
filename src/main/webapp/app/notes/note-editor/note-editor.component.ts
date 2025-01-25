import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, SimpleChanges, OnChanges } from '@angular/core';
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
export class NoteEditorComponent implements AfterViewInit, OnChanges {
  @Input() note!: Note;
  @Output() noteUpdated = new EventEmitter<Note>();
  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
  @ViewChild('contentInput') contentInput!: ElementRef<HTMLTextAreaElement>;
  private previousNoteId: number | undefined = undefined;

  ngAfterViewInit(): void {
    // Focus title for new notes, content for existing notes
    setTimeout(() => {
      if (this.note.title.length === 0) {
        this.titleInput.nativeElement.focus();
      } else {
        this.contentInput.nativeElement.focus();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.warn('onChanges ', changes['note'].currentValue.id);
    if (
      changes['note'].currentValue.id === undefined ||
      (changes['note'].previousValue?.id !== undefined && changes['note'].currentValue.id !== changes['note'].previousValue.id)
    ) {
      this.previousNoteId = changes['note'].currentValue.id;
      this.ngAfterViewInit();
    }
  }

  onTitleChange(title: string): void {
    const updatedNote = { ...this.note, title };
    this.noteUpdated.emit(updatedNote);
  }

  onContentChange(content: string): void {
    const updatedNote = { ...this.note, content };
    this.noteUpdated.emit(updatedNote);
  }
}
