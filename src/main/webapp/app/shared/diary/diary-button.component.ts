import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DiaryService } from './diary.service';

@Component({
  selector: 'jhi-diary-button',
  templateUrl: './diary-button.component.html',
  styleUrls: ['./diary-button.component.scss'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
})
export class DiaryButtonComponent {
  private readonly diaryService = inject(DiaryService);

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Open diary editor with Cmd+D (Mac) or Ctrl+D (Windows)
    if ((event.metaKey || event.ctrlKey) && event.key === 'd') {
      event.preventDefault();
      this.openDiaryEditor();
    }
  }

  openDiaryEditor(): void {
    this.diaryService.openEditor();
  }
}
