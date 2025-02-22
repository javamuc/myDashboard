import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotesComponent } from './notes.component';
import { NoteService } from './note.service';
import { Note } from './note.model';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NoteListComponent } from './note-list/note-list.component';
import { NoteEditorComponent } from './note-editor/note-editor.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faPlus, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';

describe('NotesComponent', () => {
  let component: NotesComponent;
  let fixture: ComponentFixture<NotesComponent>;
  let noteService: jest.Mocked<NoteService>;

  const mockNotes: Note[] = [
    {
      id: 1,
      title: 'First Note',
      content: 'First Content',
      user_id: 1,
      createdDate: '2024-02-22T10:00:00Z',
      lastModifiedDate: '2024-02-22T10:00:00Z',
    },
    {
      id: 2,
      title: 'Second Note',
      content: 'Second Content',
      user_id: 1,
      createdDate: '2024-02-22T11:00:00Z',
      lastModifiedDate: '2024-02-22T11:00:00Z',
    },
  ];

  beforeEach(async () => {
    const mockNoteService = {
      query: jest.fn().mockReturnValue(of(mockNotes)),
      create: jest
        .fn()
        .mockImplementation(note =>
          of({ ...note, id: 3, user_id: 1, createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() }),
        ),
      update: jest.fn().mockImplementation(note => of({ ...note, lastModifiedDate: new Date().toISOString() })),
      delete: jest.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [NotesComponent, FormsModule, NoteListComponent, NoteEditorComponent, FontAwesomeModule],
      providers: [{ provide: NoteService, useValue: mockNoteService }],
    }).compileComponents();

    const library = TestBed.inject(FaIconLibrary);
    library.addIcons(faPlus, faSearch, faTrash);

    noteService = TestBed.inject(NoteService) as jest.Mocked<NoteService>;
    fixture = TestBed.createComponent(NotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load notes on init', () => {
    expect(noteService.query).toHaveBeenCalled();
    expect(component.notes()).toEqual(mockNotes.reverse());
    expect(component.selectedNote()).toEqual(mockNotes[1]);
    expect(component.filteredNotes()).toEqual(mockNotes);
  });

  it('should create a new note', fakeAsync(() => {
    const newNote = {
      title: '',
      content: '',
    };

    component.createNewNote();
    tick(0);

    expect(noteService.create).toHaveBeenCalledWith(newNote);
    expect(component.notes().length).toBe(3);
    expect(component.selectedNote()?.id).toBe(3);
  }));

  it('should update a note with debounce', fakeAsync(() => {
    const updatedNote = { ...mockNotes[0], title: 'Updated Title' };

    component.onNoteUpdated(updatedNote);
    expect(component.notes()[0].title).toBe('Updated Title');

    // Verify that the service wasn't called immediately
    expect(noteService.update).not.toHaveBeenCalled();

    // Wait for debounce
    tick(300);

    // Now the service should have been called
    expect(noteService.update).toHaveBeenCalledWith(updatedNote);
  }));

  it('should delete a note and select the previous one', fakeAsync(() => {
    component.selectedNote.set(mockNotes[1]);
    const event = new KeyboardEvent('keydown', {
      key: 'Backspace',
      shiftKey: true,
      metaKey: true,
    });

    component.handleKeyboardEvent(event);
    tick();

    expect(noteService.delete).toHaveBeenCalledWith(1);
    expect(component.selectedNote()?.id).toBe(2);
  }));

  it('should filter notes based on search query', () => {
    component.searchQuery = 'First';
    component.onSearch();

    expect(component.filteredNotes().length).toBe(1);
    expect(component.filteredNotes()[0].title).toBe('First Note');
  });

  it('should sort notes by last modified date', () => {
    const newNote = {
      ...mockNotes[0],
      lastModifiedDate: '2024-02-22T12:00:00Z',
    };

    component.onNoteUpdated(newNote);
    expect(component.filteredNotes()[0].id).toBe(2);
  });

  describe('Keyboard shortcuts', () => {
    it('should create new note on "n" key', () => {
      const event = new KeyboardEvent('keydown', { key: 'n' });
      jest.spyOn(component, 'createNewNote');

      component.handleKeyboardEvent(event);
      expect(component.createNewNote).toHaveBeenCalled();
    });

    it('should focus search on "f" key', () => {
      const event = new KeyboardEvent('keydown', { key: 'f' });
      const searchInput = fixture.debugElement.query(By.css('input[type="search"]')).nativeElement;
      jest.spyOn(searchInput, 'focus');

      component.handleKeyboardEvent(event);
      expect(searchInput.focus).toHaveBeenCalled();
    });

    it('should not trigger shortcuts when input is focused', () => {
      const input = document.createElement('input');
      const event = new KeyboardEvent('keydown', { key: 'n' });
      Object.defineProperty(event, 'target', { value: input });
      jest.spyOn(component, 'createNewNote');

      component.handleKeyboardEvent(event);
      expect(component.createNewNote).not.toHaveBeenCalled();
    });
  });

  describe('Note selection', () => {
    it('should select a note', () => {
      component.onNoteSelected(mockNotes[1]);
      expect(component.selectedNote()).toEqual(mockNotes[1]);
    });

    it('should handle note deletion when no notes remain', fakeAsync(() => {
      noteService.query.mockReturnValueOnce(of([]));
      component.loadNotes();
      tick();

      expect(component.selectedNote()).toBeNull();
      expect(component.notes().length).toBe(0);
    }));
  });

  it('should clean up subscriptions on destroy', () => {
    jest.spyOn(component['destroy$'], 'complete');
    jest.spyOn(component['noteUpdateSubject'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].complete).toHaveBeenCalled();
    expect(component['noteUpdateSubject'].complete).toHaveBeenCalled();
  });
});
