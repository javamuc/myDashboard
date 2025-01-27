import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskVM } from '../task.model';
import { TaskCardComponent } from '../../task-card/task-card.component';

@Component({
  selector: 'jhi-task-list',
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule, TaskCardComponent],
})
export class TaskListComponent {
  @Input() tasks: TaskVM[] = [];
  @Input() loading = false;
  @Input() title = 'Tasks';
  @Input() emptyStateMessage = 'No tasks yet. Go to the board to create your first task!';
}
