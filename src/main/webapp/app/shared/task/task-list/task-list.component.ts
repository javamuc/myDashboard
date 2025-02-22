import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskVM } from '../task.model';
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
  @Input() status: 'to-do' | 'in-progress' | 'done' = 'in-progress';
  @Input() limit?: number;
  @Input() sortBy: 'createdDate' | 'lastModifiedDate' = 'lastModifiedDate';

  tasks = signal<TaskVM[]>([]);
  loading = signal(true);

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  private loadTasks(): void {
    if (!this.status) {
      this.loading.set(false);
      return;
    }

    this.taskService.findTasksByStatus(this.status).subscribe(taskVMs => {
      const sortedTasks = taskVMs.sort((a, b) => {
        const dateA = a.task[this.sortBy] ? new Date(a.task[this.sortBy]).getTime() : 0;
        const dateB = b.task[this.sortBy] ? new Date(b.task[this.sortBy]).getTime() : 0;
        return dateB - dateA;
      });

      this.tasks.set(this.limit ? sortedTasks.slice(0, this.limit) : sortedTasks);
      this.loading.set(false);
    });
  }
}
