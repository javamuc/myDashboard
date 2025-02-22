import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskStatus, TaskVM } from '../task.model';
import { TaskCardComponent } from '../../task-card/task-card.component';
import { TaskService } from '../task.service';

@Component({
  selector: 'jhi-task-list',
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule, TaskCardComponent],
})
export class TaskListComponent implements OnInit {
  @Input() title = 'Tasks';
  @Input() emptyStateMessage = 'No tasks yet. Go to the board to create your first task!';
  @Input() limit?: number;
  @Input() sortBy: 'createdDate' | 'lastModifiedDate' = 'lastModifiedDate';
  tasks = signal<TaskVM[]>([]);
  loading = signal(true);

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks('in-progress');
  }

  private loadTasks(status: TaskStatus): void {
    this.taskService.findTasksByStatus(status).subscribe(taskVMs => {
      const sortedTasks = taskVMs.sort((a, b) => {
        const dateA = a.task[this.sortBy] ? new Date(a.task[this.sortBy]).getTime() : 0;
        const dateB = b.task[this.sortBy] ? new Date(b.task[this.sortBy]).getTime() : 0;
        return dateB - dateA;
      });

      this.tasks.set(this.limit ? sortedTasks.slice(0, this.limit) : sortedTasks);
      if (taskVMs.length > 0 || status === 'to-do') {
        this.loading.set(false);
      } else {
        this.loadTasks('to-do');
      }
    });
  }
}
