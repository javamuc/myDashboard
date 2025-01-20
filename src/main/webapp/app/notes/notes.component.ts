import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from './note.model';
import { NoteListComponent } from './note-list/note-list.component';
import { NoteEditorComponent } from './note-editor/note-editor.component';
import { NoteService } from './note.service';

@Component({
  selector: 'jhi-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NoteListComponent, NoteEditorComponent],
})
export class NotesComponent implements OnInit {
  notes = signal<Note[]>([]);
  selectedNote = signal<Note | null>(null);
  searchQuery = '';
  filteredNotes = signal<Note[]>([]);

  constructor(private noteService: NoteService) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.noteService.query().subscribe(notes => {
      this.notes.set(notes);
      this.updateFilteredNotes();
    });
  }

  createNewNote(): void {
    const newNote: Note = {
      title: 'New Note',
      content: '',
    };

    this.noteService.create(newNote).subscribe(createdNote => {
      this.notes.update(notes => [...notes, createdNote]);
      this.selectedNote.set(createdNote);
      this.updateFilteredNotes();
    });
  }

  onNoteSelected(note: Note): void {
    this.selectedNote.set(note);
  }

  onNoteUpdated(updatedNote: Note): void {
    this.noteService.update(updatedNote).subscribe(savedNote => {
      this.notes.update(notes => notes.map(note => (note.id === savedNote.id ? savedNote : note)));
      this.selectedNote.set(savedNote);
      this.updateFilteredNotes();
    });
  }

  onSearch(): void {
    this.updateFilteredNotes();
  }

  private updateFilteredNotes(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredNotes.set(
      this.notes().filter(note => note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)),
    );
  }
}
