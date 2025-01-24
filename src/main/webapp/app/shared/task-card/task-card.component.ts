import { Component, Input, HostListener } from '@angular/core';
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

  @HostListener('keydown.enter', ['$event'])
  @HostListener('click', ['$event'])
  openTask(event: Event): void {
    event.stopPropagation();
    this.sidebarService.setTaskData(this.task);
    this.sidebarService.setActiveComponent('task');
    this.sidebarService.setIsOpen(true);
  }

  getHashtags(): string[] {
    if (!this.task.description) {
      return [];
    }
    const hashtagRegex = /#[\w_-]+/g;
    return this.task.description.match(hashtagRegex) ?? [];
  }
}
