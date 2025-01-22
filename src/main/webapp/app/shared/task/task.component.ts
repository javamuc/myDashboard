import { Component, OnDestroy, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskStatus } from './task.model';
import { SidebarService } from 'app/layouts/sidebar/sidebar.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { TaskService } from './task.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'jhi-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
})
export class TaskComponent implements OnInit, OnDestroy {
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

  onTaskChange(): void {
    const updatedTask: Task = {
      ...this.task,
    };
    if (this.task.id) {
      // Persist the task in the database
      this.taskService.update(updatedTask).subscribe(savedTask => {
        this.task.id = savedTask.id;
        this.task.lastModifiedDate = savedTask.lastModifiedDate;
        this.task.createdDate = savedTask.createdDate;
      });
    } else {
      this.sidebarService.getBoardId().subscribe(boardId => (updatedTask.boardId = boardId));
      this.task.boardId = updatedTask.boardId;
      this.taskService.create(updatedTask).subscribe(createdTask => {
        this.task.id = createdTask.id;
        this.task.lastModifiedDate = createdTask.lastModifiedDate;
        this.task.createdDate = createdTask.createdDate;
        this.sidebarService.getTaskCreatedListener().subscribe(listener => listener?.emit(this.task));
      });
    }
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
}
