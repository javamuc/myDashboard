import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoteEditorComponent } from './note-editor.component';
import { Note } from '../note.model';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('NoteEditorComponent', () => {
  let component: NoteEditorComponent;
  let fixture: ComponentFixture<NoteEditorComponent>;

  const mockNote: Note = {
    id: 1,
    title: 'Test Note',
    content: 'Test Content',
    user_id: 1,
    createdDate: '2024-02-22T10:00:00Z',
    lastModifiedDate: '2024-02-22T10:00:00Z',
  };

  const mockNewNote: Note = {
    id: 1,
    title: '',
    content: '',
    user_id: 1,
    createdDate: '2024-02-22T10:00:00Z',
    lastModifiedDate: '2024-02-22T10:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteEditorComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteEditorComponent);
    component = fixture.componentInstance;
    component.note = { ...mockNote };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display note title and content', () => {
    const titleInput = fixture.debugElement.query(By.css('.title-input'));
    const contentInput = fixture.debugElement.query(By.css('.content-input'));

    expect(titleInput.nativeElement.value).toBe(mockNote.title);
    expect(contentInput.nativeElement.value).toBe(mockNote.content);
  });

  it('should emit updated note when title changes', () => {
    const newTitle = 'Updated Title';
    jest.spyOn(component.noteUpdated, 'emit');

    const titleInput = fixture.debugElement.query(By.css('.title-input'));
    titleInput.nativeElement.value = newTitle;
    titleInput.nativeElement.dispatchEvent(new Event('input'));

    expect(component.noteUpdated.emit).toHaveBeenCalledWith({
      ...mockNote,
      title: newTitle,
    });
  });

  it('should emit updated note when content changes', () => {
    const newContent = 'Updated Content';
    jest.spyOn(component.noteUpdated, 'emit');

    const contentInput = fixture.debugElement.query(By.css('.content-input'));
    contentInput.nativeElement.value = newContent;
    contentInput.nativeElement.dispatchEvent(new Event('input'));

    expect(component.noteUpdated.emit).toHaveBeenCalledWith({
      ...mockNote,
      content: newContent,
    });
  });

  it('should focus title input for new notes', fakeAsync(() => {
    component.note = { ...mockNewNote };
    fixture.detectChanges();

    const titleInput = fixture.debugElement.query(By.css('.title-input')).nativeElement;
    jest.spyOn(titleInput, 'focus');

    component.ngAfterViewInit();
    tick();

    expect(titleInput.focus).toHaveBeenCalled();
  }));

  it('should focus content input for existing notes', fakeAsync(() => {
    const contentInput = fixture.debugElement.query(By.css('.content-input')).nativeElement;
    jest.spyOn(contentInput, 'focus');

    component.ngAfterViewInit();
    tick();

    expect(contentInput.focus).toHaveBeenCalled();
  }));

  it('should handle note changes correctly', () => {
    const newNote: Note = {
      ...mockNote,
      id: 2,
      title: 'Different Note',
      content: 'Different Content',
    };

    jest.spyOn(component, 'ngAfterViewInit');

    component.ngOnChanges({
      note: {
        currentValue: newNote,
        previousValue: mockNote,
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    expect(component.ngAfterViewInit).toHaveBeenCalled();
  });

  it('should display formatted last modified date', () => {
    const lastModifiedElement = fixture.debugElement.query(By.css('.last-modified'));
    expect(lastModifiedElement.nativeElement.textContent).toContain('Last modified:');
    expect(lastModifiedElement.nativeElement.textContent).toContain(
      new Date(mockNote.lastModifiedDate).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
    );
  });

  it('should blur inputs on escape key', () => {
    const titleInput = fixture.debugElement.query(By.css('.title-input')).nativeElement;
    const contentInput = fixture.debugElement.query(By.css('.content-input')).nativeElement;

    jest.spyOn(titleInput, 'blur');
    jest.spyOn(contentInput, 'blur');

    titleInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    contentInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(titleInput.blur).toHaveBeenCalled();
    expect(contentInput.blur).toHaveBeenCalled();
  });
});
