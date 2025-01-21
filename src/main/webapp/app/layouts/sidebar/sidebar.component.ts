import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskComponent } from 'app/shared/task/task.component';
import { NoteEditorComponent } from 'app/notes/note-editor/note-editor.component';
import { slideInOut } from './sidebar.animations';

@Component({
  selector: 'jhi-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, TaskComponent, NoteEditorComponent],
  animations: [slideInOut],
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() activeComponent: 'task' | 'note' | null = null;
}
