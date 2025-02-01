import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../task/task.service';
import { Task } from '../../task/task.model';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskCardComponent } from '../../task-card/task-card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'jhi-backlog-board',
  templateUrl: './backlog-board.component.html',
  styleUrl: './backlog-board.component.scss',
  standalone: true,
  imports: [CommonModule, TaskCardComponent, FontAwesomeModule, DragDropModule],
})
export class BacklogBoardComponent implements OnInit {
  loading = false;
  @Input() taskCreateSubject!: Subject<Task>;
  @Input() backlogTasks!: Task[];
  private readonly taskService = inject(TaskService);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadBacklogTasks(); // Load tasks initially
    this.taskCreateSubject.pipe(takeUntil(this.destroy$)).subscribe(task => {
      // Set the position to be at the start of the list (0)
      task.position = 0;
      // Shift existing tasks' positions
      this.backlogTasks = this.backlogTasks.map(t => ({
        ...t,
        position: ((t.position ?? 0) as number) + 1,
      }));
      // Add the new task at the beginning
      this.backlogTasks = [task, ...this.backlogTasks];
      // Update all positions in the backend
      this.updateTaskPositions();
    });
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      // Reordering within backlog
      moveItemInArray(this.backlogTasks, event.previousIndex, event.currentIndex);
      this.updateTaskPositions();
    } else {
      // Moving from another list to backlog
      const task = event.item.data;
      task.status = 'backlog';
      // Insert at the specific position
      task.position = event.currentIndex;
      // Shift positions of other tasks
      this.backlogTasks.forEach((t, index) => {
        if (index >= event.currentIndex) {
          t.position = ((t.position ?? 0) as number) + 1;
        }
      });
      this.taskService.update(task).subscribe(() => {
        this.loadBacklogTasks();
      });
    }
  }

  getConnectedLists(): string[] {
    return ['to-do-list', 'in-progress-list', 'done-list'];
  }

  private loadBacklogTasks(): void {
    this.loading = true;
    this.taskService.findTasksByStatus('backlog').subscribe(taskVMs => {
      this.backlogTasks = taskVMs.map(vm => vm.task).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      this.loading = false;
    });
  }

  private updateTaskPositions(): void {
    // Update all task positions based on their current order
    this.backlogTasks.forEach((task, index) => {
      const updatedTask = { ...task, position: index };
      this.taskService.update(updatedTask).subscribe();
    });
  }
}
