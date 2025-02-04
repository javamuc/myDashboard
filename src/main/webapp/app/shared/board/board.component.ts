import {
  Component,
  OnInit,
  computed,
  signal,
  inject,
  EventEmitter,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Board, BoardFilter, BoardSort, BoardView } from './board.model';
import { NewTask, Task, TaskStatus } from '../task/task.model';
import SharedModule from 'app/shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SidebarService } from 'app/layouts/sidebar/sidebar.service';
import { BoardService } from './board.service';
import { TaskService } from '../task/task.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardColumnsComponent } from './board-columns/board-columns.component';
import { debounceTime, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import { AlertService } from 'app/core/util/alert.service';
import { BacklogBoardComponent } from './backlog-board/backlog-board.component';
import { CookieService } from '../cookie/cookie.service';

type TaskProperty = keyof Task;

@Component({
  selector: 'jhi-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, FontAwesomeModule, DragDropModule, BoardColumnsComponent, BacklogBoardComponent],
})
export class BoardComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild(BoardColumnsComponent) boardColumns!: BoardColumnsComponent;

  readonly statuses: TaskStatus[] = ['to-do', 'in-progress', 'done'];
  readonly taskProperties: TaskProperty[] = ['title', 'assignee', 'dueDate', 'priority', 'status', 'createdDate', 'lastModifiedDate'];

  filterMenuOpen = signal(false);
  sortMenuOpen = signal(false);
  showBacklog = signal(false);
  sidebarOpen = signal(false);

  boards = signal<Board[]>([]);
  activeBoard = signal<Board | undefined>(undefined);
  task = signal<Task | undefined>(undefined);

  boardView = signal<BoardView>({
    filters: [],
    sort: { property: 'lastModifiedDate', direction: 'desc' },
    searchTerm: '',
  });

  filteredTasks = computed(() => {
    const board = this.activeBoard();
    if (!board) return [];

    let tasks = board.tasks ? [...board.tasks] : [];

    // Apply search term filter
    if (this.boardView().searchTerm) {
      tasks = tasks.filter(task => task.title.toLowerCase().includes(this.boardView().searchTerm!.toLowerCase()));
    }

    // Apply property filters
    this.boardView().filters.forEach(filter => {
      tasks = tasks.filter(task => {
        const taskValue = task[filter.property];
        return taskValue?.toString().toLowerCase().includes(filter.value.toString().toLowerCase());
      });
    });

    return tasks;
  });

  tasksByStatus = computed(() => {
    const grouped = new Map<TaskStatus, Task[]>();
    this.statuses.forEach(status => grouped.set(status, []));

    this.filteredTasks().forEach(task => {
      const statusTasks = grouped.get(task.status) ?? [];
      statusTasks.push(task);
      grouped.set(task.status, statusTasks);
    });

    // Apply custom sorting for each status
    grouped.forEach((tasks, status) => {
      if (status === 'done') {
        // Sort done tasks by lastModifiedDate desc
        tasks.sort((a, b) => {
          const aDate = a.lastModifiedDate ? new Date(a.lastModifiedDate).getTime() : 0;
          const bDate = b.lastModifiedDate ? new Date(b.lastModifiedDate).getTime() : 0;
          return bDate - aDate;
        });
      } else {
        // Sort to-do and in-progress tasks by priority desc, then lastModifiedDate desc
        tasks.sort((a, b) => {
          if (a.priority !== b.priority) {
            return b.priority - a.priority; // Higher priority first
          }
          const aDate = a.lastModifiedDate ? new Date(a.lastModifiedDate).getTime() : 0;
          const bDate = b.lastModifiedDate ? new Date(b.lastModifiedDate).getTime() : 0;
          return bDate - aDate;
        });
      }
    });

    return grouped;
  });

  taskCreateSubject = new Subject<Task>();
  taskDeletedSubject = new Subject<Task>();
  private readonly sidebarService = inject(SidebarService);
  private readonly boardService = inject(BoardService);
  private readonly taskService = inject(TaskService);
  private readonly alertService = inject(AlertService);
  private readonly cookieService = inject(CookieService);
  private destroy$ = new Subject<void>();
  private taskUpdateSubject = new Subject<Task>();

  constructor() {
    this.taskUpdateSubject.pipe(debounceTime(300)).subscribe(task => {
      this.saveTask(task);
    });
  }

  ngOnInit(): void {
    this.loadBoards();

    this.sidebarService
      .getTaskData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(task => {
        this.task.set(task);
      });

    this.sidebarService
      .getIsOpen()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.sidebarOpen.set(isOpen);
      });

    this.sidebarService
      .getTaskUpdateRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe(task => {
        this.taskUpdateSubject.next(task);
      });

    this.sidebarService
      .getTaskStatusUpdateRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe(task => {
        this.updateStatus(task, task.status);
      });

    // Subscribe to task deletion requests
    this.sidebarService
      .getTaskDeleteRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe(task => {
        if (task.id) {
          this.taskService.delete(task.id).subscribe(() => {
            this.taskDeleted(task);
          });
        }
      });

    // Subscribe to tag filter changes
    this.sidebarService
      .getTagFilter()
      .pipe(takeUntil(this.destroy$))
      .subscribe(tag => {
        if (tag) {
          // const searchTerm = this.boardView().searchTerm ?? '';
          // this.setSearchTerm(`${tag} ${searchTerm}`.trim());
          // this.searchInput.nativeElement.value = this.boardView().searchTerm ?? '';
          // this.searchInput.nativeElement.focus();
          this.boardView.update(view => ({ ...view, filters: [{ property: 'description', value: tag }] }));
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  taskDeleted(task: Task): void {
    this.sidebarService.setIsOpen(false);
    this.activeBoard.update(board => {
      if (!board) return board;
      const tasks = [...board.tasks];
      const index = tasks.findIndex(t => t.id === task.id);
      console.warn('taskDeleted in board', index);
      if (index !== -1) {
        tasks.splice(index, 1);
      }
      if (tasks[index]) {
        console.warn('task found in board after deletion', tasks[index]);
        this.sidebarService.setTaskData(tasks[index]);
        this.task.set(tasks[index]);
      } else {
        console.warn('No task found in board after deletion');
        this.sidebarService.setTaskData(undefined);
        this.task.set(undefined);
      }
      return { ...board, tasks };
    });
  }

  taskCreated(task: Task): void {
    this.activeBoard.update(board => {
      if (!board) return board;
      const tasks = [...board.tasks];
      tasks.push(task);
      return { ...board, tasks };
    });

    this.sidebarService.setTaskData(task);
    console.warn('taskCreated in board', task);
    this.sidebarService.setActiveComponent('task');
    this.sidebarService.setIsOpen(true);
    this.taskCreateSubject.next(task);
  }

  // Add a method to get the drop list IDs for connecting columns
  getConnectedLists(currentStatus: TaskStatus): string[] {
    return this.statuses.filter(status => status !== currentStatus).map(status => `${status}-list`);
  }

  onDrop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.item.data;

      // Check if we can change the status before moving the task
      if (!this.canChangeStatus(task, newStatus)) {
        return;
      }

      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

      // Update the task's status using the centralized method
      this.sidebarService.changeTaskStatus(task, newStatus);
    }
  }

  onSearchInput(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.setSearchTerm(searchTerm);
  }

  addFilter(property: TaskProperty, value: any): void {
    const filters = [...this.boardView().filters];
    filters.push({ property, value });
    this.boardView.update(view => ({ ...view, filters }));
    this.filterMenuOpen.set(false);
  }

  removeFilter(index: number): void {
    const filters = [...this.boardView().filters];
    filters.splice(index, 1);
    this.boardView.update(view => ({ ...view, filters }));
  }

  setSort(property: TaskProperty): void {
    const currentSort = this.boardView().sort;
    let newSort: BoardSort;

    if (currentSort?.property === property) {
      newSort = {
        property,
        direction: currentSort.direction === 'asc' ? 'desc' : 'asc',
      };
    } else {
      newSort = { property, direction: 'asc' };
    }

    this.boardView.update(view => ({ ...view, sort: newSort }));
    this.sortMenuOpen.set(false);
  }

  setSearchTerm(term: string): void {
    this.boardView.update(view => ({ ...view, searchTerm: term }));
  }

  createNewTask(event: Event): void {
    event.stopPropagation();

    const board = this.activeBoard();
    if (!board) return;

    const task: NewTask = {
      title: '',
      description: '',
      dueDate: null,
      status: 'backlog',
      boardId: board.id,
      priority: 1,
      position: 0,
      assignee: '',
    };
    this.taskService.create(task).subscribe(createdTask => {
      this.taskCreated(createdTask);
    });
  }

  getTaskCount(status: TaskStatus): number {
    return this.tasksByStatus().get(status)?.length ?? 0;
  }

  deleteTask(): void {
    if (!this.task()?.id) return;
    if (this.task()?.status !== 'backlog') {
      this.alertService.addAlert({
        type: 'warning',
        message: 'Task has not the status "backlog"',
      });
      return;
    }

    this.taskService.delete(this.task()!.id).subscribe(() => {
      this.taskDeleted(this.task()!);
    });
  }

  clearSearch(): void {
    this.setSearchTerm('');
    this.searchInput.nativeElement.value = '';
    this.sidebarService.clearTagFilter();
  }

  onBoardSelect(board: Board): void {
    this.activeBoard.set(board);
    if (board.id) {
      this.cookieService.setLastBoardId(board.id);
      this.taskService.getBoardTasks(board.id).subscribe(tasks => {
        this.activeBoard.set({
          ...board,
          tasks,
        });
      });
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && event.type === 'keydown') {
      event.preventDefault();
      this.createNewTask(event);
      return;
    }
    if (event.key === 'Backspace' && event.shiftKey && (event.metaKey || event.ctrlKey)) {
      console.warn('delete task in board component');
      event.preventDefault();
      this.deleteTask();
      return;
    }

    // Check for CMD+Enter (Mac) or Ctrl+Enter (Windows)
    if (event.key === 'Escape' && this.sidebarOpen()) {
      event.preventDefault();
      if (this.taskIsUnedited()) {
        this.deleteTask();
      }
      this.sidebarService.setIsOpen(false);
      return;
    }
    // Only trigger if no input/textarea is focused (except for Escape key)
    const isInputFocused = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;

    if (event.key === 'n' && !isInputFocused) {
      event.preventDefault();
      this.createNewTask(event);
    } else if (event.key === 'f' && !isInputFocused) {
      event.preventDefault();
      this.searchInput.nativeElement.focus();
    } else if (event.key === 'b' && !isInputFocused) {
      event.preventDefault();
      this.showBacklog.set(!this.showBacklog());
    }
  }

  private saveTask(task: Task, updateBoard = false): void {
    console.warn('saveTask', task);
    if (task.id) {
      // if (task.status === 'done') {
      //   this.alertService.addAlert({
      //     type: 'warning',
      //     message: 'Task has already been completed',
      //   });
      //   return;
      // }
      // Persist the task in the database
      this.taskService.update(task).subscribe(savedTask => {
        if (this.task() && this.task()?.id === savedTask.id) {
          this.task()!.lastModifiedDate = savedTask.lastModifiedDate;
        }

        if (updateBoard) {
          this.activeBoard.update(board => {
            if (!board) return board;
            const tasks = [...board.tasks];
            const index = tasks.findIndex(t => t.id === savedTask.id);
            if (index !== -1) {
              tasks[index] = savedTask;
            }
            return { ...board, tasks };
          });
        }
      });
    }
  }

  private taskIsUnedited(): boolean {
    if (!this.task()) return false;
    return (
      this.task()?.status === 'backlog' &&
      this.task()?.title === '' &&
      this.task()?.createdDate.substring(0, this.task()!.createdDate.lastIndexOf('.') + 1) ===
        this.task()?.lastModifiedDate.substring(0, this.task()!.lastModifiedDate.lastIndexOf('.') + 1)
    );
  }

  private loadBoards(): void {
    this.boardService.query().subscribe(boards => {
      // Filter out archived boards
      this.boards.set(boards);

      if (boards.length > 0) {
        // Try to get the last selected board from cookie
        const lastBoardId = this.cookieService.getLastBoardId();
        let boardToLoad: Board | undefined;

        if (lastBoardId) {
          boardToLoad = boards.find(b => b.id === lastBoardId);
        }

        // If no board found from cookie, use the oldest board
        if (!boardToLoad) {
          boardToLoad = boards.sort((a, b) => new Date(a.createdDate!).getTime() - new Date(b.createdDate!).getTime())[0];
        }

        this.onBoardSelect(boardToLoad);
      }
    });
  }

  private updateStatus(task: Task, newStatus: TaskStatus): void {
    this.saveTask(task, true);
  }

  // Add a new method to handle status changes
  private canChangeStatus(task: Task, newStatus: TaskStatus): boolean {
    const board = this.activeBoard();
    if (!board) return false;

    const tasksInTargetStatus = board.tasks.filter(t => t.status === newStatus).length;

    if (newStatus === 'in-progress' && tasksInTargetStatus >= board.progressLimit) {
      this.alertService.addAlert({
        type: 'warning',
        message: `Board limit of ${board.progressLimit} tasks reached`,
      });
      return false;
    }

    if (newStatus === 'to-do' && tasksInTargetStatus >= board.toDoLimit) {
      this.alertService.addAlert({
        type: 'warning',
        message: `Board limit of ${board.toDoLimit} tasks reached`,
      });
      return false;
    }

    return true;
  }
}
