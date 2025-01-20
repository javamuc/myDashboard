import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from './note.model';
import { NoteListComponent } from './note-list/note-list.component';
import { NoteEditorComponent } from './note-editor/note-editor.component';

@Component({
  selector: 'jhi-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NoteListComponent, NoteEditorComponent],
})
export class NotesComponent {
  notes = signal<Note[]>([]);
  selectedNote = signal<Note | null>(null);
  searchQuery = '';
  filteredNotes = signal<Note[]>([]);

  createNewNote(): void {
    const newNote: Note = {
      title: 'New Note',
      content: '',
      lastModified: new Date(),
      created: new Date(),
    };
    this.notes.update(notes => [...notes, newNote]);
    this.selectedNote.set(newNote);
    this.updateFilteredNotes();
  }

  onNoteSelected(note: Note): void {
    this.selectedNote.set(note);
  }

  onNoteUpdated(updatedNote: Note): void {
    this.notes.update(notes => notes.map(note => (note.id === updatedNote.id ? { ...updatedNote, lastModified: new Date() } : note)));
    this.updateFilteredNotes();
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
