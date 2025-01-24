import { Component, OnInit, signal, HostListener, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from './note.model';
import { NoteListComponent } from './note-list/note-list.component';
import { NoteEditorComponent } from './note-editor/note-editor.component';
import { NoteService } from './note.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'jhi-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NoteListComponent, NoteEditorComponent, FaIconComponent],
})
export class NotesComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  notes = signal<Note[]>([]);
  selectedNote = signal<Note | null>(null);
  searchQuery = '';
  filteredNotes = signal<Note[]>([]);

  private destroy$ = new Subject<void>();
  private noteUpdateSubject = new Subject<Note>();

  constructor(private noteService: NoteService) {
    this.noteUpdateSubject.pipe(debounceTime(300)).subscribe(note => {
      this.saveNote(note);
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Only trigger if no input/textarea is focused (except for Escape key)
    const isInputFocused = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;

    if (event.key === 'n' && !isInputFocused) {
      event.preventDefault();
      this.createNewNote();
    } else if (event.key === 'f' && !isInputFocused) {
      event.preventDefault();
      this.searchInput.nativeElement.focus();
    } else if (event.key === 'Backspace' && event.shiftKey && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (this.selectedNote()) {
        this.noteUpdateSubject.complete();
        this.deleteNoteAndSelectNext(this.selectedNote());
      }
    }
  }

  ngOnInit(): void {
    this.loadNotes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.noteUpdateSubject.complete();
  }

  loadNotes(): void {
    this.noteService.query().subscribe(notes => {
      this.notes.set(notes);
      this.updateFilteredNotes();
    });
  }

  createNewNote(): void {
    const newNote: Note = {
      title: '',
      content: '',
    };
    this.selectedNote.set(newNote);
  }

  onNoteSelected(note: Note): void {
    this.selectedNote.set(note);
  }

  onNoteUpdated(updatedNote: Note): void {
    if (!updatedNote.id) {
      this.noteService.create(updatedNote).subscribe(createdNote => {
        this.selectedNote.update(note => createdNote);
        this.notes.update(notes => [...notes, createdNote]);
        this.updateFilteredNotes();
      });
    } else {
      const note = { ...updatedNote };
      this.notes.update(notes => notes.map(n => (n.id === note.id ? note : n)));
      this.selectedNote.set(note);
      this.updateFilteredNotes();
      this.noteUpdateSubject.next(note);
    }
  }

  onSearch(): void {
    this.updateFilteredNotes();
  }

  private deleteNoteAndSelectNext(noteToDelete: Note | null): void {
    if (!noteToDelete) {
      return;
    }
    const currentNotes = this.filteredNotes();
    const currentIndex = currentNotes.findIndex(note => note.id === noteToDelete.id);

    this.noteService.delete(noteToDelete.id!).subscribe(() => {
      // Remove the note from the lists
      this.notes.update(notes => notes.filter(note => note.id !== noteToDelete.id));
      this.updateFilteredNotes();

      // Select the next appropriate note
      const updatedNotes = this.filteredNotes();
      if (updatedNotes.length > 0) {
        if (currentIndex >= 0) {
          // Try to select the previous note
          if (currentIndex > 0) {
            this.selectedNote.set(updatedNotes[currentIndex - 1]);
          } else {
            // If there is no previous note, select the first note
            this.selectedNote.set(updatedNotes[0]);
          }
        }
      } else {
        this.selectedNote.set(null);
      }
    });
  }

  private updateFilteredNotes(): void {
    const query = this.searchQuery.toLowerCase();
    const filteredAndSortedNotes = this.notes()
      .filter(note => note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query))
      .sort((a, b) => {
        const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
        const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      });

    this.filteredNotes.set(filteredAndSortedNotes);
  }

  private saveNote(note: Note): void {
    if (note.id) {
      this.noteService.update(note).subscribe(savedNote => {
        this.notes.update(notes => notes.map(n => (n.id === savedNote.id ? savedNote : n)));
        this.selectedNote.set(savedNote);
        this.updateFilteredNotes();
      });
    }
  }
}
