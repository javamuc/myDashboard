import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TaskEditorComponent } from './task-editor.component';
import { SidebarService } from 'app/layouts/sidebar/sidebar.service';
import { Task } from './task.model';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TaskDescriptionComponent } from './task-description/task-description.component';
import { faTrash, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';

describe('TaskEditorComponent', () => {
  let component: TaskEditorComponent;
  let fixture: ComponentFixture<TaskEditorComponent>;
  let sidebarService: jest.Mocked<SidebarService>;

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
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
      getTaskData: jest.fn().mockReturnValue(of(mockTask)),
      requestTaskUpdate: jest.fn(),
      requestTaskDeletion: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TaskEditorComponent, FormsModule, FontAwesomeModule, TaskDescriptionComponent],
      providers: [{ provide: SidebarService, useValue: mockSidebarService }],
    }).compileComponents();

    const library = TestBed.inject(FaIconLibrary);
    library.addIcons(faPlus, faSearch, faTrash);

    sidebarService = TestBed.inject(SidebarService) as jest.Mocked<SidebarService>;
    fixture = TestBed.createComponent(TaskEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load task data on init', () => {
    expect(sidebarService.getTaskData).toHaveBeenCalled();
    expect(component.task()).toEqual(mockTask);
  });

  it('should focus title input after view init', fakeAsync(() => {
    const titleInput = fixture.debugElement.query(By.css('input[type="text"]')).nativeElement;
    jest.spyOn(titleInput, 'focus');

    component.ngAfterViewInit();
    tick();

    expect(titleInput.focus).toHaveBeenCalled();
  }));

  it('should update task when changes occur', () => {
    const updatedTask = { ...mockTask, title: 'Updated Title' };
    component.task.set(updatedTask);
    component.onTaskChange();

    expect(sidebarService.requestTaskUpdate).toHaveBeenCalledWith(updatedTask);
  });

  it('should update task when update method is called', () => {
    const updatedTask = { ...mockTask, title: 'Updated Title' };
    component.update(updatedTask);

    expect(sidebarService.requestTaskUpdate).toHaveBeenCalledWith(updatedTask);
  });

  it('should delete task when deleteTask is called', () => {
    component.deleteTask();

    expect(sidebarService.requestTaskDeletion).toHaveBeenCalledWith(mockTask);
  });

  it('should handle task status changes', () => {
    const updatedTask = { ...mockTask, status: 'in-progress' as const };
    component.task.set(updatedTask);
    component.onTaskChange();

    expect(sidebarService.requestTaskUpdate).toHaveBeenCalledWith(updatedTask);
  });

  it('should display correct task statuses', () => {
    expect(component.statuses).toEqual(['to-do', 'in-progress', 'done']);
  });

  describe('Task title input', () => {
    it('should update task title on input', () => {
      const titleInput = fixture.debugElement.query(By.css('input[type="text"]')).nativeElement;
      const newTitle = 'New Task Title';

      titleInput.value = newTitle;
      titleInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.task()?.title).toBe(newTitle);
      expect(sidebarService.requestTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        title: newTitle,
      });
    });
  });

  it('should clean up subscriptions on destroy', () => {
    jest.spyOn(component['destroy$'], 'next');
    jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
