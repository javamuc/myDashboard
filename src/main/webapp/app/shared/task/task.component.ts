import { Component, OnDestroy, OnInit, inject, ViewChild, ElementRef, AfterViewInit, HostListener, signal } from '@angular/core';
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
  task = signal<Task | undefined>(undefined);

  private destroy$ = new Subject<void>();
  private readonly sidebarService = inject(SidebarService);
  private readonly taskService = inject(TaskService);
  private taskUpdateSubject = new Subject<Task>();

  constructor() {
    this.taskUpdateSubject.pipe(debounceTime(300)).subscribe(task => {
      this.saveTask(task);
    });
  }

  ngOnInit(): void {
    this.sidebarService
      .getTaskData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(task => {
        if (task) {
          this.task.set(task);
          console.warn('new task from task service', this.task);
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
      ...this.task()!,
    };
    this.taskUpdateSubject.next(updatedTask);
  }

  update(task: Task): void {
    console.warn('update', task);
    // Instead of immediately saving, push to the subject
    this.taskUpdateSubject.next(task);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  deleteTask(): void {
    this.sidebarService.requestTaskDeletion(this.task()!);
  }

  private saveTask(task: Task): void {
    console.warn('saveTask', task);
    if (task.id) {
      // Persist the task in the database
      this.taskService.update(task).subscribe(savedTask => {
        if (this.task() && this.task()?.id === savedTask.id) {
          this.task()!.lastModifiedDate = savedTask.lastModifiedDate;
        }
      });
    }
  }
}
