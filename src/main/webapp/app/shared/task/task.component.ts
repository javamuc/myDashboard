import { Component, OnDestroy, OnInit, inject, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskStatus } from './task.model';
import { SidebarService } from 'app/layouts/sidebar/sidebar.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { TaskService } from './task.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TaskDescriptionComponent } from './task-description/task-description.component';

@Component({
  selector: 'jhi-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, TaskDescriptionComponent],
})
export class TaskComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;

  readonly statuses: TaskStatus[] = ['to-do', 'in-progress', 'done'];
  task: Task = {
    title: '',
    description: '',
    dueDate: undefined,
    status: 'to-do',
    boardId: undefined,
    priority: 1,
    assignee: '',
  };

  private destroy$ = new Subject<void>();
  private readonly sidebarService = inject(SidebarService);
  private readonly taskService = inject(TaskService);
  private taskUpdateSubject = new Subject<Task>();

  constructor() {
    this.taskUpdateSubject.pipe(debounceTime(1000)).subscribe(task => {
      this.saveTask(task);
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Check for CMD+Enter (Mac) or Ctrl+Enter (Windows)
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      this.task = {
        title: '',
        description: '',
        dueDate: undefined,
        status: 'to-do',
        boardId: undefined,
        priority: 1,
        assignee: '',
      };
    } else if (event.key === 'Escape') {
      this.sidebarService.setIsOpen(false);
    }
  }

  ngOnInit(): void {
    // Subscribe to task data from sidebar service
    console.warn('ngOnInit');
    this.sidebarService
      .getTaskData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(task => {
        if (task) {
          this.task = task;
        }
      });
  }

  ngAfterViewInit(): void {
    // Focus the title input after the view is initialized
    setTimeout(() => {
      this.titleInput.nativeElement.focus();
    });
  }

  onTaskChange(): void {
    const updatedTask: Task = {
      ...this.task,
    };
    this.taskUpdateSubject.next(updatedTask);
  }

  update(task: Task): void {
    // Instead of immediately saving, push to the subject
    this.taskUpdateSubject.next(task);
  }

  deleteTask(): void {
    if (!this.task.id) return;

    this.taskService.delete(this.task.id).subscribe(() => {
      this.sidebarService.getTaskDeletedListener().subscribe(listener => listener?.emit(this.task));
      this.sidebarService.setIsOpen(false);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private saveTask(task: Task): void {
    if (task.id) {
      // Persist the task in the database
      this.taskService.update(task).subscribe(savedTask => {
        this.task.id = savedTask.id;
        this.task.lastModifiedDate = savedTask.lastModifiedDate;
        this.task.createdDate = savedTask.createdDate;
      });
    } else {
      this.sidebarService.getBoardId().subscribe(boardId => (task.boardId = boardId));
      this.task.boardId = task.boardId;
      this.taskService.create(task).subscribe(createdTask => {
        this.task.id = createdTask.id;
        this.task.lastModifiedDate = createdTask.lastModifiedDate;
        this.task.createdDate = createdTask.createdDate;
        this.sidebarService.getTaskCreatedListener().subscribe(listener => listener?.emit(this.task));
      });
    }
  }
}
