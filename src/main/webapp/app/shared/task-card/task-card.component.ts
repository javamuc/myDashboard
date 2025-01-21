import { Component, Input } from '@angular/core';
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

  constructor(private sidebarService: SidebarService) {}

  openTask(): void {
    this.sidebarService.setTaskData(this.task);
    this.sidebarService.setActiveComponent('task');
    this.sidebarService.setIsOpen(true);
  }
}
