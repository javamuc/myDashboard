import { Component, Input, ViewChildren, QueryList, ElementRef, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Task, TaskStatus } from '../../task/task.model';
import { TaskCardComponent } from '../../task-card/task-card.component';
import { SidebarService } from 'app/layouts/sidebar/sidebar.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'jhi-board-columns',
  templateUrl: './board-columns.component.html',
  styleUrls: ['./board-columns.component.scss'],
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent],
})
export class BoardColumnsComponent implements OnInit, OnDestroy {
  @Input() statuses!: TaskStatus[];
  @Input() taskCreateSubject!: Subject<Task>;
  @Input() tasksByStatus!: Map<TaskStatus, Task[]>;
  @Input({ required: true }) onDrop!: (event: CdkDragDrop<Task[]>, status: TaskStatus) => void;
  @Input({ required: true }) getConnectedLists!: (status: TaskStatus) => string[];
  @Input({ required: true }) getTaskCount!: (status: TaskStatus) => number;
  @ViewChildren('taskCard') taskCards!: QueryList<ElementRef>;

  activeTaskId = signal<number | undefined>(undefined);
  sidebarOpen = signal<boolean>(false);
  private destroy$ = new Subject<void>();

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.taskCreateSubject.pipe(takeUntil(this.destroy$)).subscribe(task => {
      setTimeout(() => {
        this.scrollToTask(task.id);
      }, 100); // Small delay to ensure the task is rendered
    });
    // Subscribe to active task changes
    this.sidebarService
      .getTaskData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(task => {
        this.activeTaskId.set(task?.id);
      });
    this.sidebarService
      .getIsOpen()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.sidebarOpen.set(isOpen);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  scrollToTask(taskId: number): void {
    setTimeout(() => {
      const taskElement = this.taskCards.find(card => card.nativeElement.getAttribute('data-task-id') === taskId.toString());
      if (taskElement) {
        taskElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
}
