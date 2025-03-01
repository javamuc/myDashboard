import { Component, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DiaryTag } from '../diary.model';
import { DiaryService } from '../diary.service';

@Component({
  selector: 'jhi-diary-tag-selector',
  templateUrl: './diary-tag-selector.component.html',
  styleUrls: ['./diary-tag-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
})
export class DiaryTagSelectorComponent {
  @Input() selectedTags: DiaryTag[] = [];
  @Output() tagToggled = new EventEmitter<DiaryTag>();
  @Output() tagAdded = new EventEmitter<string>();
  @Output() enterPressed = new EventEmitter<void>();
  @Output() escapePressed = new EventEmitter<void>();

  readonly diaryService = inject(DiaryService);
  diaryTags = this.diaryService.getDiaryTags();

  isAddingNewTag = false;
  newTagName = '';

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    // Handle tab and arrow navigation
    if (event.key === 'Tab' || event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      // Let the default tab behavior work for navigation
      return;
    }

    // Handle space to toggle selected tag
    if (event.key === 'Space' && document.activeElement instanceof HTMLElement) {
      const tagId = document.activeElement.getAttribute('data-tag-id');
      if (tagId) {
        event.preventDefault();
        const tag = this.diaryTags().find(t => t.id === parseInt(tagId, 10));
        if (tag) {
          this.toggleTag(tag);
        }
      }
    }

    // Handle Enter key
    if (event.key === 'Enter') {
      if (this.isAddingNewTag && this.newTagName.trim()) {
        event.preventDefault();
        this.addNewTag();
      } else {
        event.preventDefault();
        this.enterPressed.emit();
      }
    }

    // Handle Escape key
    if (event.key === 'Escape') {
      if (this.isAddingNewTag) {
        event.preventDefault();
        this.cancelAddNewTag();
      } else {
        event.preventDefault();
        this.escapePressed.emit();
      }
    }
  }

  toggleTag(tag: DiaryTag): void {
    this.tagToggled.emit(tag);
  }

  isTagSelected(tag: DiaryTag): boolean {
    return this.selectedTags.some(t => t.id === tag.id);
  }

  startAddNewTag(): void {
    this.isAddingNewTag = true;
    this.newTagName = '';

    // Focus the input after it appears
    setTimeout(() => {
      const input = document.querySelector('.new-tag-input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    });
  }

  addNewTag(): void {
    if (this.newTagName.trim()) {
      this.tagAdded.emit(this.newTagName.trim());
      this.isAddingNewTag = false;
      this.newTagName = '';
    }
  }

  cancelAddNewTag(): void {
    this.isAddingNewTag = false;
    this.newTagName = '';
  }
}
