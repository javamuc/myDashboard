import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Task, TaskStatus } from './task.model';

@Component({
  selector: 'jhi-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class TaskComponent {
  title = new FormControl('');
  description = new FormControl('');
  dueDate = new FormControl('');
  status = new FormControl<TaskStatus>('to-do');
  assignee = new FormControl('');
  statuses: TaskStatus[] = ['to-do', 'in-progress', 'done'];
  createdDate = new Date().toISOString();
  lastModifiedDate = new Date().toISOString();

  constructor(private fb: FormBuilder) {}

  saveTask(): void {
    const task: Task = {
      title: this.title.value ?? '',
      description: this.description.value ?? '',
      dueDate: this.dueDate.value ?? '',
      status: this.status.value ?? 'to-do',
      assignee: this.assignee.value ?? '',
      priority: 1, // Default priority
      createdDate: this.createdDate,
      lastModifiedDate: new Date().toISOString(),
    };
  }
}
