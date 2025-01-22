import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../task.model';

@Component({
  selector: 'jhi-task-description',
  templateUrl: './task-description.component.html',
  styleUrls: ['./task-description.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TaskDescriptionComponent {
  @Input() task!: Task;
  @Output() descriptionChange = new EventEmitter<void>();

  onDescriptionChange(): void {
    this.descriptionChange.emit();
  }
}
