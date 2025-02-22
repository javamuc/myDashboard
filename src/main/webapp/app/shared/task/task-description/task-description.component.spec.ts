import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TaskDescriptionComponent } from './task-description.component';
import { SidebarService } from 'app/layouts/sidebar/sidebar.service';
import { Task } from '../task.model';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ElementRef } from '@angular/core';

describe('TaskDescriptionComponent', () => {
  let component: TaskDescriptionComponent;
  let fixture: ComponentFixture<TaskDescriptionComponent>;
  let sidebarService: jest.Mocked<SidebarService>;

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Initial description #test',
    status: 'to-do',
    priority: 1,
    dueDate: '2024-02-22T10:00:00Z',
    boardId: 1,
    position: 0,
    createdDate: '2024-02-22T10:00:00Z',
    lastModifiedDate: '2024-02-22T10:00:00Z',
  };

  beforeEach(async () => {
    const mockSidebarService = {
      getTags: jest.fn().mockReturnValue(of(['#test', '#task', '#important'])),
      addTags: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TaskDescriptionComponent, FormsModule],
      providers: [{ provide: SidebarService, useValue: mockSidebarService }],
    }).compileComponents();

    sidebarService = TestBed.inject(SidebarService) as jest.Mocked<SidebarService>;
    fixture = TestBed.createComponent(TaskDescriptionComponent);
    component = fixture.componentInstance;
    component.task = { ...mockTask };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should extract hashtags from description', () => {
    const hashtags = component.getHashtags();
    expect(hashtags).toEqual(['#test']);
  });

  it('should emit description change event', () => {
    jest.spyOn(component.descriptionChange, 'emit');
    component.onDescriptionChange();
    expect(component.descriptionChange.emit).toHaveBeenCalled();
  });

  it('should add tags to sidebar service on blur', () => {
    component.onBlur();
    expect(sidebarService.addTags).toHaveBeenCalledWith(['#test']);
  });

  describe('Tag suggestions', () => {
    it('should show tag suggestions when typing #', fakeAsync(() => {
      const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;

      // Set up the textarea state
      component.task.description = 'New description #t';
      textarea.value = component.task.description;
      textarea.selectionStart = textarea.value.length;
      component.cursorPosition = textarea.value.length;

      // Trigger input event
      component.onInput({ target: textarea } as unknown as Event);
      tick(150); // Match component's debounce time
      fixture.detectChanges();

      expect(component.showTagDropdown).toBe(true);
      expect(component.tagSuggestions).toContain('#test');
      expect(component.tagSuggestions).toContain('#task');
    }));

    it('should not show suggestions when cursor is not after #', fakeAsync(() => {
      const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
      component.task.description = 'New #test description';
      textarea.value = component.task.description;
      textarea.selectionStart = textarea.value.length; // Cursor at end

      textarea.dispatchEvent(new Event('input'));
      tick(200);

      expect(component.showTagDropdown).toBe(false);
    }));

    it('should handle tag selection with keyboard navigation', () => {
      component.showTagDropdown = true;
      component.tagSuggestions = ['#test', '#task'];
      component.selectedTagIndex = -1;

      // Test arrow down
      component.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(component.selectedTagIndex).toBe(0);

      // Test arrow up
      component.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(component.selectedTagIndex).toBe(-1);
    });

    it('should insert selected tag on Enter', fakeAsync(() => {
      // Set up the textarea element
      const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
      component.task.description = 'Description #t';
      textarea.value = component.task.description;
      textarea.selectionStart = textarea.value.length;
      component.cursorPosition = textarea.value.length;

      // Mock the tag suggestions to have a controlled set
      sidebarService.getTags.mockReturnValueOnce(of(new Set(['#test', '#task'])));

      // Trigger input event to show suggestions
      component.onInput({ target: textarea } as unknown as Event);
      tick(150);
      fixture.detectChanges();

      // Verify suggestions are shown
      expect(component.showTagDropdown).toBe(true);
      expect(component.tagSuggestions).toEqual(['#task', '#test']);

      // Select first suggestion (#test) and trigger Enter
      component.selectedTagIndex = 0;
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      jest.spyOn(event, 'preventDefault');

      // Set up component state for tag insertion
      component.currentTagStart = component.task.description.lastIndexOf('#');
      component.textarea = { nativeElement: textarea } as ElementRef<HTMLTextAreaElement>;

      component.onKeyDown(event);

      // Verify the tag was inserted
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.showTagDropdown).toBe(false);
      expect(component.task.description).toBe('Description #task ');
    }));

    it('should close suggestions on Escape', () => {
      component.showTagDropdown = true;
      component.onKeyDown(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(component.showTagDropdown).toBe(false);
    });
  });

  describe('Text manipulation', () => {
    it('should insert tag at cursor position', () => {
      const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
      component.task.description = 'Description #t';
      textarea.value = component.task.description;
      component.cursorPosition = textarea.value.length;
      component.currentTagStart = component.task.description.lastIndexOf('#');

      component.insertTag('#test');

      expect(component.task.description).toBe('Description #test ');
      expect(component.showTagDropdown).toBe(false);
    });

    it('should handle tag insertion in middle of text', () => {
      const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
      component.task.description = 'Start #t end';
      textarea.value = component.task.description;
      component.cursorPosition = 9; // After #t
      component.currentTagStart = 6; // At #

      component.insertTag('#test');

      expect(component.task.description).toBe('Start #test end');
    });
  });

  it('should cleanup subscription on destroy', () => {
    const subscription = component['subscription'];
    jest.spyOn(subscription!, 'unsubscribe');

    component.ngOnDestroy();
    expect(subscription!.unsubscribe).toHaveBeenCalled();
  });

  it('should handle task changes', () => {
    const changes = {
      task: {
        currentValue: { ...mockTask, id: 2 },
        previousValue: mockTask,
        firstChange: false,
        isFirstChange: () => false,
      },
    };

    component.showTagDropdown = true;
    component.ngOnChanges(changes);
    expect(component.showTagDropdown).toBe(false);
  });
});
