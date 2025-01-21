import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../task/task.model';

@Component({
  selector: 'jhi-task-card',
  template: `
    <div class="task-card">
      <h3>{{ task.title }}</h3>
      @if (task.assignee) {
        <div class="task-assignee">
          <i class="fas fa-user"></i>
          {{ task.assignee }}
        </div>
      }
      @if (task.dueDate) {
        <div class="task-due-date">
          <i class="fas fa-calendar"></i>
          {{ task.dueDate | date }}
        </div>
      }
    </div>
  `,
  styleUrls: ['./task-card.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
}
