import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { BoardComponent } from './board.component';
import { BoardService } from './board.service';
import { SidebarService } from 'app/layouts/sidebar/sidebar.service';
import { TaskService } from 'app/shared/task/task.service';
import { AlertService } from 'app/core/util/alert.service';
import { Board } from './board.model';
import { Task, TaskStatus } from '../task/task.model';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { provideRouter } from '@angular/router';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { faAlignLeft, faAlignRight, faAlignCenter, faClock, faPlay, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { CookieService } from '../cookie/cookie.service';
describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let boardService: BoardService;
  let sidebarService: SidebarService;
  let taskService: TaskService;
  let alertService: AlertService;
  let cookieService: any;

  // Mock data
  const mockBoards: Board[] = [
    { id: 1, title: 'Board 1', description: 'Description 1', archived: false, progressLimit: 3, toDoLimit: 5, tasks: [], autoPull: false },
    { id: 2, title: 'Board 2', description: 'Description 2', archived: false, progressLimit: 3, toDoLimit: 5, tasks: [], autoPull: false },
    { id: 3, title: 'Archived Board', description: 'Archived', archived: true, progressLimit: 3, toDoLimit: 5, tasks: [], autoPull: false },
  ];

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      status: 'backlog',
      boardId: 1,
      position: 0,
      dueDate: null,
      priority: 0,
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'Description 2',
      status: 'to-do',
      boardId: 1,
      position: 0,
      dueDate: null,
      priority: 0,
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    },
    {
      id: 3,
      title: 'Task 3',
      description: 'Description 3',
      status: 'in-progress',
      boardId: 1,
      position: 0,
      dueDate: null,
      priority: 0,
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    },
    {
      id: 4,
      title: 'Task 4',
      description: 'Description 4',
      status: 'done',
      boardId: 1,
      position: 0,
      dueDate: null,
      priority: 0,
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    },
  ];

  // Subjects for observables
  const boardIdSubject = new Subject<number | undefined>();
  const taskDataSubject = new Subject<Task | undefined>();
  const taskDeleteSubject = new Subject<Task>();
  const taskUpdateSubject = new Subject<Task>();
  const taskStatusUpdateSubject = new Subject<Task>();
  const tagFilterSubject = new Subject<string | undefined>();
  const activeBoardSubject = new Subject<Board | undefined>();
  const isOpenSubject = new Subject<boolean>();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardComponent, RouterModule, FormsModule, DragDropModule, NgbModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: BoardService,
          useValue: {
            query: jest.fn().mockReturnValue(of(mockBoards)),
            find: jest.fn().mockImplementation((id: number) => of(mockBoards.find(b => b.id === id))),
            refreshCurrentBoard: jest.fn().mockImplementation((board: Board) => of(board)),
            create: jest.fn().mockImplementation((board: Board) => of({ ...board, id: 999 })),
            update: jest.fn().mockImplementation((board: Board) => of(board)),
            delete: jest.fn().mockReturnValue(of({})),
          },
        },
        {
          provide: TaskService,
          useValue: {
            getBoardTasks: jest.fn().mockReturnValue(of(mockTasks)),
            getBoardTasksByStatus: jest
              .fn()
              .mockImplementation((boardId: number, status: TaskStatus) =>
                of(mockTasks.filter(t => t.boardId === boardId && t.status === status)),
              ),
            create: jest.fn().mockImplementation((task: Task) => of({ ...task, id: 999 })),
            update: jest.fn().mockReturnValue(of({})),
            delete: jest.fn().mockReturnValue(of({})),
          },
        },
        {
          provide: SidebarService,
          useValue: {
            getBoardId: jest.fn().mockReturnValue(boardIdSubject.asObservable()),
            getTaskData: jest.fn().mockReturnValue(taskDataSubject.asObservable()),
            getTaskDeleteRequests: jest.fn().mockReturnValue(taskDeleteSubject.asObservable()),
            getTaskUpdateRequests: jest.fn().mockReturnValue(taskUpdateSubject.asObservable()),
            getTaskStatusUpdateRequests: jest.fn().mockReturnValue(taskStatusUpdateSubject.asObservable()),
            getTagFilter: jest.fn().mockReturnValue(tagFilterSubject.asObservable()),
            getActiveBoard: jest.fn().mockReturnValue(activeBoardSubject.asObservable()),
            setTaskData: jest.fn(),
            setActiveBoard: jest.fn(),
            setTagFilter: jest.fn(),
            setIsOpen: jest.fn(),
            getIsOpen: jest.fn().mockReturnValue(isOpenSubject.asObservable()),
          },
        },
        {
          provide: CookieService,
          useValue: {
            setLastBoardId: jest.fn(),
            getLastBoardId: jest.fn().mockReturnValue(1),
          },
        },
        {
          provide: AlertService,
          useValue: {
            success: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: 'ngbDropdownConfig',
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    boardService = TestBed.inject(BoardService);
    sidebarService = TestBed.inject(SidebarService);
    taskService = TestBed.inject(TaskService);
    alertService = TestBed.inject(AlertService);
    cookieService = TestBed.inject(CookieService);

    const library = TestBed.inject(FaIconLibrary);
    library.addIcons(faPlay, faSearch, faTrash, faPlus, faTimes, faClock, faAlignLeft, faAlignRight, faAlignCenter);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load boards on init', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(boardService.query).toHaveBeenCalled();
    }));

    it('should subscribe to sidebar service events', fakeAsync(() => {
      component.ngOnInit();
      tick();

      // Test task data subscription
      const mockTask = { ...mockTasks[0] };
      taskDataSubject.next(mockTask);
      tick();
      expect(sidebarService.getTaskData).toHaveBeenCalled();
    }));
  });

  describe('Task Management', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick();
    }));

    it('should handle task deletion', fakeAsync(() => {
      // Set up the active board with tasks
      const activeBoard = { ...mockBoards[0], tasks: [...mockTasks] };
      component.activeBoard.set(activeBoard);

      // Set up the task to delete
      const taskToDelete = { ...mockTasks[0] };
      component.task.set(taskToDelete);

      // Call deleteTask
      component.deleteTask();
      tick();

      expect(taskService.delete).toHaveBeenCalledWith(1);
    }));

    it('should handle task update', fakeAsync(() => {
      const taskToUpdate = { ...mockTasks[0], title: 'Updated Title' };
      taskUpdateSubject.next(taskToUpdate);
      tick(300);

      expect(taskService.update).toHaveBeenCalled();
    }));
  });

  describe('Board Management', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick();
    }));

    it('should handle board selection', fakeAsync(() => {
      component.onBoardSelect(mockBoards[1]);
      tick();

      expect(sidebarService.setActiveBoard).toHaveBeenCalledWith({ ...mockBoards[1], tasks: mockTasks });
      expect(cookieService.setLastBoardId).toHaveBeenCalledWith(2);
      expect(taskService.getBoardTasks).toHaveBeenCalledWith(2);
    }));
  });

  describe('Cleanup', () => {
    it('should call ngOnDestroy', () => {
      // Just verify the method can be called without errors
      component.ngOnDestroy();
      expect(true).toBeTruthy();
    });
  });
});
