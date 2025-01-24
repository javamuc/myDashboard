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

  getTagColor(tag: string): string {
    // Remove the # from the tag
    const cleanTag = tag.slice(1);

    // Generate a hash from the string
    let hash = 0;
    for (let i = 0; i < cleanTag.length; i++) {
      hash = cleanTag.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to HSL (using hue only)
    const hue = Math.abs(hash % 360);

    // Use fixed saturation and lightness for pastel colors
    return `hsl(${hue}, 70%, 85%)`;
  }

  getTagTextColor(tag: string): string {
    // Get the background color
    const hue = Math.abs(this.getTagColorHash(tag) % 360);

    // For pastel backgrounds, we usually want dark text
    return `hsl(${hue}, 90%, 15%)`;
  }

  private getTagColorHash(tag: string): number {
    const cleanTag = tag.slice(1);
    let hash = 0;
    for (let i = 0; i < cleanTag.length; i++) {
      hash = cleanTag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }
}
