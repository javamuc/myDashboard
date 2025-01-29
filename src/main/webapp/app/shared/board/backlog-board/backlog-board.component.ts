import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../task/task.service';
import { Task } from '../../task/task.model';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskCardComponent } from '../../task-card/task-card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'jhi-backlog-board',
  templateUrl: './backlog-board.component.html',
  styleUrl: './backlog-board.component.scss',
  standalone: true,
  imports: [CommonModule, TaskCardComponent, FontAwesomeModule],
})
export class BacklogBoardComponent implements OnInit {
  loading = false;
  @Input() taskCreateSubject!: Subject<Task>;
  @Input() backlogTasks!: Task[];
  private readonly taskService = inject(TaskService);
  private destroy$ = new Subject<void>();
  ngOnInit(): void {
    // this.loadBacklogTasks();
    this.taskCreateSubject.pipe(takeUntil(this.destroy$)).subscribe(task => {
      // this.backlogTasks = [task, ...this.backlogTasks];
    });
  }

  onDrop(event: any): void {
    const task = event.item.data;
    task.status = 'backlog';
    this.taskService.update(task).subscribe(() => {
      this.loadBacklogTasks();
    });
  }

  getConnectedLists(): string[] {
    return ['to-do-list', 'in-progress-list', 'done-list'];
  }

  private loadBacklogTasks(): void {
    this.taskService.findTasksByStatus('backlog').subscribe(taskVMs => {
      this.backlogTasks = taskVMs.map(vm => vm.task);
      this.loading = false;
    });
  }
}
