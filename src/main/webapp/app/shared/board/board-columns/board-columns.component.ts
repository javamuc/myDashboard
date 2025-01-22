import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Task, TaskStatus } from '../../task/task.model';
import { TaskCardComponent } from '../../task-card/task-card.component';

@Component({
  selector: 'jhi-board-columns',
  templateUrl: './board-columns.component.html',
  styleUrls: ['./board-columns.component.scss'],
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent],
})
export class BoardColumnsComponent {
  @Input() statuses!: TaskStatus[];
  @Input() tasksByStatus!: Map<TaskStatus, Task[]>;
  @Input({ required: true }) onDrop!: (event: CdkDragDrop<Task[]>, status: TaskStatus) => void;
  @Input({ required: true }) getConnectedLists!: (status: TaskStatus) => string[];
  @Input({ required: true }) getTaskCount!: (status: TaskStatus) => number;
}