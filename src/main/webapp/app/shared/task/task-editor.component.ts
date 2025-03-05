import { Component, OnDestroy, OnInit, inject, ViewChild, ElementRef, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskStatus } from './task.model';
import { TaskEditorService } from 'app/layouts/task-editor-container/task-editor-container.service';
import { Subject, takeUntil } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TaskDescriptionComponent } from './task-description/task-description.component';

@Component({
  selector: 'jhi-task-editor',
  templateUrl: './task-editor.component.html',
  styleUrls: ['./task-editor.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, TaskDescriptionComponent],
})
export class TaskEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;

  readonly statuses: TaskStatus[] = ['to-do', 'in-progress', 'done'];
  task = signal<Task | undefined>(undefined);

  private destroy$ = new Subject<void>();
  private readonly taskEditorService = inject(TaskEditorService);

  ngOnInit(): void {
    this.taskEditorService
      .getTaskData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(task => {
        if (task) {
          this.task.set(task);
        }
      });
  }

  ngAfterViewInit(): void {
    this.titleInput.nativeElement.focus();
  }

  onTaskChange(): void {
    const updatedTask: Task = {
      ...this.task()!,
    };
    this.taskEditorService.requestTaskUpdate(updatedTask);
  }

  update(task: Task): void {
    console.warn('update', task);
    // Instead of immediately saving, push to the subject
    this.taskEditorService.requestTaskUpdate(task);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  deleteTask(): void {
    this.taskEditorService.requestTaskDeletion(this.task()!);
  }
}
