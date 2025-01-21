import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskStatus } from './task.model';
import { SidebarService } from 'app/layouts/sidebar/sidebar.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'jhi-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TaskComponent implements OnInit, OnDestroy {
  readonly statuses: TaskStatus[] = ['to-do', 'in-progress', 'done'];
  task: Task = {
    title: '',
    description: '',
    dueDate: new Date().toISOString(),
    status: 'to-do',
    priority: 1,
    assignee: '',
  };

  private destroy$ = new Subject<void>();
  private readonly sidebarService = inject(SidebarService);

  ngOnInit(): void {
    // Subscribe to task data from sidebar service
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
      lastModifiedDate: new Date().toISOString(),
    };
    // this.sidebarService.setTaskData(updatedTask);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
