import { Component, Input, OnInit, inject, HostListener, ViewChildren, QueryList, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../task/task.service';
import { Task } from '../../task/task.model';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskCardComponent } from '../../task-card/task-card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject, takeUntil } from 'rxjs';
import { SidebarService } from 'app/layouts/sidebar/sidebar.service';
import { Board } from '../../board/board.model';

@Component({
  selector: 'jhi-backlog-board',
  templateUrl: './backlog-board.component.html',
  styleUrl: './backlog-board.component.scss',
  standalone: true,
  imports: [CommonModule, TaskCardComponent, FontAwesomeModule, DragDropModule],
})
export class BacklogBoardComponent implements OnInit, OnDestroy {
  @ViewChildren('taskItem') taskItems!: QueryList<ElementRef>;
  @ViewChild('backlogContent') backlogContent!: ElementRef;

  loading = false;
  @Input() taskCreateSubject!: Subject<Task>;
  @Input() set backlogTasks(tasks: Task[]) {
    // Sort tasks by position whenever they change
    this._backlogTasks = [...tasks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }
  get backlogTasks(): Task[] {
    return this._backlogTasks;
  }
  private _backlogTasks: Task[] = [];
  private readonly taskService = inject(TaskService);
  private readonly sidebarService = inject(SidebarService);
  private destroy$ = new Subject<void>();
  private activeTask?: Task;
  private activeBoard?: Board;

  ngOnInit(): void {
    // Subscribe to active board changes
    this.sidebarService
      .getActiveBoard()
      .pipe(takeUntil(this.destroy$))
      .subscribe(board => {
        this.activeBoard = board;
        if (board?.id) {
          this.loadBacklogTasks(board.id);
        }
      });

    // Subscribe to active task changes
    this.sidebarService
      .getTaskData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(task => {
        this.activeTask = task;
      });

    this.taskCreateSubject.pipe(takeUntil(this.destroy$)).subscribe(task => {
      // Set the position to be at the start of the list (0)
      task.position = 0;
      // Shift existing tasks' positions
      this.backlogTasks = this.backlogTasks.map(t => ({
        ...t,
        position: (t.position ?? 0) + 1,
      }));
      // Add the new task at the beginning
      this.backlogTasks = [task, ...this.backlogTasks];
      // Update all positions in the backend
      this.updateTaskPositions();
      // Scroll to the new task after it's rendered
      setTimeout(() => this.scrollToTask(0), 0);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Only handle if there's an active task
    if (!this.activeTask || this.activeTask.status !== 'backlog') {
      return;
    }

    const taskIndex = this.backlogTasks.findIndex(t => t.id === this.activeTask!.id);
    if (taskIndex === -1) {
      return;
    }

    // Handle different key combinations
    if (event.metaKey || event.ctrlKey) {
      // CMD/CTRL key is pressed
      if (event.shiftKey) {
        // SHIFT key is also pressed
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          this.moveTaskToTop(taskIndex);
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          this.moveTaskToBottom(taskIndex);
        }
      } else {
        // Only CMD/CTRL is pressed
        if (event.key === 'ArrowUp' && taskIndex > 0) {
          event.preventDefault();
          this.moveTaskUp(taskIndex);
        } else if (event.key === 'ArrowDown' && taskIndex < this.backlogTasks.length - 1) {
          event.preventDefault();
          this.moveTaskDown(taskIndex);
        }
      }
    }
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      // Reordering within backlog
      moveItemInArray(this.backlogTasks, event.previousIndex, event.currentIndex);
      this.updateTaskPositions();
      // Scroll to the dropped task
      setTimeout(() => this.scrollToTask(event.currentIndex), 0);
    } else {
      // Moving from another list to backlog
      const task = event.item.data;

      // Calculate the new position for the task
      const newPosition = event.currentIndex;

      // Update positions of existing tasks
      this.backlogTasks.forEach((t, index) => {
        if (index >= newPosition) {
          t.position = (t.position ?? 0) + 1;
        }
      });

      // Set the position for the new task
      task.position = newPosition;

      // Add the task to the backlog
      this.backlogTasks.splice(newPosition, 0, task);

      // Update the task's status
      this.sidebarService.changeTaskStatus(task, 'backlog');

      // Update all positions in the backend
      this.updateTaskPositions();

      // Scroll to the new task
      setTimeout(() => this.scrollToTask(newPosition), 100);
    }
  }

  getConnectedLists(): string[] {
    return ['to-do-list', 'in-progress-list', 'done-list'];
  }

  private moveTaskUp(index: number): void {
    if (index > 0) {
      moveItemInArray(this.backlogTasks, index, index - 1);
      this.updateTaskPositions();
      setTimeout(() => this.scrollToTask(index - 1), 0);
    }
  }

  private moveTaskDown(index: number): void {
    if (index < this.backlogTasks.length - 1) {
      moveItemInArray(this.backlogTasks, index, index + 1);
      this.updateTaskPositions();
      setTimeout(() => this.scrollToTask(index + 1), 0);
    }
  }

  private moveTaskToTop(index: number): void {
    if (index > 0) {
      moveItemInArray(this.backlogTasks, index, 0);
      this.updateTaskPositions();
      setTimeout(() => this.scrollToTask(0), 0);
    }
  }

  private moveTaskToBottom(index: number): void {
    if (index < this.backlogTasks.length - 1) {
      moveItemInArray(this.backlogTasks, index, this.backlogTasks.length - 1);
      this.updateTaskPositions();
      setTimeout(() => this.scrollToTask(this.backlogTasks.length - 1), 0);
    }
  }

  private scrollToTask(index: number): void {
    const taskElements = this.taskItems.toArray();
    if (taskElements[index]) {
      const taskElement = taskElements[index].nativeElement;
      const container = this.backlogContent.nativeElement;
      const taskTop = taskElement.offsetTop;
      const containerHeight = container.clientHeight;
      const taskHeight = taskElement.clientHeight;

      // Calculate the ideal scroll position to center the task
      const idealScrollTop = taskTop - (containerHeight - taskHeight) / 2;

      container.scrollTo({
        top: idealScrollTop,
        behavior: 'smooth',
      });
    }
  }

  private loadBacklogTasks(boardId: number): void {
    this.loading = true;
    this.taskService.getBoardTasksByStatus(boardId, 'backlog').subscribe(tasks => {
      this.backlogTasks = tasks.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      this.loading = false;
    });
  }

  private updateTaskPositions(): void {
    // Update all task positions based on their current order
    this.backlogTasks.forEach((task, index) => {
      const updatedTask = { ...task, position: index };
      this.taskService.update(updatedTask).subscribe();
    });
  }
}
