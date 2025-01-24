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
import { Task, TaskStatus } from '../task/task.model';
import SharedModule from 'app/shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SidebarService } from 'app/layouts/sidebar/sidebar.service';
import { BoardService } from './board.service';
import { TaskService } from '../task/task.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardColumnsComponent } from './board-columns/board-columns.component';

type TaskProperty = keyof Task;

@Component({
  selector: 'jhi-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, FontAwesomeModule, DragDropModule, BoardColumnsComponent],
})
export class BoardComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  readonly statuses: TaskStatus[] = ['to-do', 'in-progress', 'done'];
  readonly taskProperties: TaskProperty[] = ['title', 'assignee', 'dueDate', 'priority', 'status', 'createdDate', 'lastModifiedDate'];

  filterMenuOpen = signal(false);
  sortMenuOpen = signal(false);

  boards = signal<Board[]>([]);
  activeBoard = signal<Board | undefined>(undefined);

  boardView = signal<BoardView>({
    filters: [],
    sort: { property: 'lastModifiedDate', direction: 'desc' },
    searchTerm: '',
  });

  filteredTasks = computed(() => {
    const board = this.activeBoard();
    if (!board) return [];

    let tasks = [...board.tasks];

    // Apply search term filter
    if (this.boardView().searchTerm) {
      tasks = tasks.filter(task => task.title.toLowerCase().includes(this.boardView().searchTerm!.toLowerCase()));
    }

    // Apply property filters
    this.boardView().filters.forEach(filter => {
      tasks = tasks.filter(task => {
        const taskValue = task[filter.property];
        return taskValue === filter.value;
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

  private readonly sidebarService = inject(SidebarService);
  private readonly boardService = inject(BoardService);
  private readonly taskService = inject(TaskService);
  private taskCreatedListener = new EventEmitter<Task>();
  private taskDeletedListener = new EventEmitter<Task>();

  ngOnInit(): void {
    this.loadBoards();
    this.taskCreatedListener.subscribe(task => this.taskCreated(task));
    this.taskDeletedListener.subscribe(task => this.taskDeleted(task));
    this.sidebarService.setTaskCreatedListener(this.taskCreatedListener);
    this.sidebarService.setTaskDeletedListener(this.taskDeletedListener);
  }

  ngOnDestroy(): void {
    this.taskCreatedListener.unsubscribe();
    this.taskDeletedListener.unsubscribe();
  }

  taskDeleted(task: Task): void {
    this.activeBoard.update(board => {
      if (!board) return board;
      const tasks = [...board.tasks];
      const index = tasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        tasks.splice(index, 1);
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
  }

  // Add a method to get the drop list IDs for connecting columns
  getConnectedLists(currentStatus: TaskStatus): string[] {
    return this.statuses.filter(status => status !== currentStatus).map(status => `${status}-list`);
  }

  onDrop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

      // Update the task's status in the database
      const task = event.container.data[event.currentIndex];
      const updatedTask: Task = {
        ...task,
        status: newStatus,
        lastModifiedDate: new Date().toISOString(),
      };

      this.taskService.update(updatedTask).subscribe(savedTask => {
        // Update the task in the board's tasks array
        this.activeBoard.update(board => {
          if (!board) return board;
          const tasks = [...board.tasks];
          const index = tasks.findIndex(t => t.id === savedTask.id);
          if (index !== -1) {
            tasks[index] = savedTask;
          }
          return { ...board, tasks };
        });
      });
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.setSearchTerm(input.value);
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

    // Just set the task data and open the sidebar
    this.sidebarService.setTaskData(null);
    this.sidebarService.setBoardId(board.id);
    this.sidebarService.setActiveComponent('task');
    this.sidebarService.setIsOpen(true);
  }

  getTaskCount(status: TaskStatus): number {
    return this.tasksByStatus().get(status)?.length ?? 0;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Only trigger if no input/textarea is focused (except for Escape key)
    const isInputFocused = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;

    if (event.key === 'n' && !isInputFocused) {
      event.preventDefault();
      this.createNewTask(event);
    } else if (event.key === 'f' && !isInputFocused) {
      event.preventDefault();
      this.searchInput.nativeElement.focus();
    }
  }

  private loadBoards(): void {
    this.boardService.query().subscribe(boards => {
      this.boards.set(boards);
      if (boards.length > 0) {
        const firstBoard = boards[0];
        this.taskService.getBoardTasks(firstBoard.id!).subscribe(tasks => {
          this.activeBoard.set({
            ...firstBoard,
            tasks,
          });
        });
      }
    });
  }
}
