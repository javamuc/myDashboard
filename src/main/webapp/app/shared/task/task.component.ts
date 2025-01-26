import { Component, OnDestroy, OnInit, inject, ViewChild, ElementRef, AfterViewInit, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskStatus } from './task.model';
import { SidebarService } from 'app/layouts/sidebar/sidebar.service';
import { Subject, takeUntil } from 'rxjs';
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

  ngOnInit(): void {
    this.sidebarService
      .getTaskData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(task => {
        if (task) {
          this.task.set(task);
          console.warn('new task from task service', task);
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
    this.sidebarService.requestTaskUpdate(updatedTask);
  }

  update(task: Task): void {
    console.warn('update', task);
    // Instead of immediately saving, push to the subject
    this.sidebarService.requestTaskUpdate(task);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  deleteTask(): void {
    this.sidebarService.requestTaskDeletion(this.task()!);
  }
}
