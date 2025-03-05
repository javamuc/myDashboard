import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskEditorComponent } from 'app/shared/task/task-editor.component';
import { fadeInOut } from './task-editor-container.animations';

@Component({
  selector: 'jhi-task-editor-container',
  templateUrl: './task-editor-container.component.html',
  styleUrls: ['./task-editor-container.component.scss'],
  standalone: true,
  imports: [CommonModule, TaskEditorComponent],
  animations: [fadeInOut],
})
export class TaskEditorContainerComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpenChange.emit(false);
    }
  }
}
