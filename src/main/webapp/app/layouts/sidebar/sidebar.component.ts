import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskEditorComponent } from 'app/shared/task/task-editor.component';
import { NoteEditorComponent } from 'app/notes/note-editor/note-editor.component';
import { slideInOut } from './sidebar.animations';

@Component({
  selector: 'jhi-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, TaskEditorComponent, NoteEditorComponent],
  animations: [slideInOut],
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() activeComponent: 'task' | 'note' | null = null;
  @Output() isOpenChange = new EventEmitter<boolean>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpenChange.emit(false);
    }
  }
}
