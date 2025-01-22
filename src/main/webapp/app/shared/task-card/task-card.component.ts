import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Task } from '../task/task.model';
import { SidebarService } from 'app/layouts/sidebar/sidebar.service';

@Component({
  selector: 'jhi-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
})
export class TaskCardComponent {
  @Input() task!: Task;
  isExpanded = false;
  private hoverTimer: any;
  private readonly sidebarService = inject(SidebarService);

  onMouseEnter(): void {
    this.hoverTimer = setTimeout(() => {
      this.isExpanded = true;
    }, 1200);
  }

  onMouseLeave(): void {
    clearTimeout(this.hoverTimer);
    this.isExpanded = false;
  }

  openTask(event: Event): void {
    event.stopPropagation();
    this.sidebarService.setTaskData(this.task);
    this.sidebarService.setActiveComponent('task');
    this.sidebarService.setIsOpen(true);
  }
}
