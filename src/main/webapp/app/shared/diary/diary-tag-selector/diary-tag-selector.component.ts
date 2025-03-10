import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnInit, Output, inject } from '@angular/core';
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
export class DiaryTagSelectorComponent implements OnInit, AfterViewInit {
  @Input() selectedTags: DiaryTag[] = [];
  @Input() isTagSelectorOpen = false;
  @Input() canCreate = true;
  @Output() tagToggled = new EventEmitter<DiaryTag>();
  @Output() tagAdded = new EventEmitter<string>();
  @Output() enterPressed = new EventEmitter<void>();
  @Output() escapePressed = new EventEmitter<void>();

  readonly diaryService = inject(DiaryService);
  diaryTags = this.diaryService.getDiaryTags();

  // Keyboard shortcuts for the first 18 tags
  readonly firstRowShortcuts = ['q', 'w', 'e', 'r', 't', 'y'];
  readonly secondRowShortcuts = ['a', 's', 'd', 'f', 'g', 'h'];
  readonly thirdRowShortcuts = ['z', 'x', 'c', 'v', 'b', 'n'];
  readonly keyboardShortcuts = [...this.firstRowShortcuts, ...this.secondRowShortcuts, ...this.thirdRowShortcuts];

  // Tags organized in rows
  firstRowTags: DiaryTag[] = [];
  secondRowTags: DiaryTag[] = [];
  thirdRowTags: DiaryTag[] = [];

  readonly MAX_TAGS = 18;

  isAddingNewTag = false;
  newTagName = '';

  ngOnInit(): void {
    this.diaryService.loadTags();
    // Focus the component after initialization
  }

  ngAfterViewInit(): void {
    this.organizeTags();
    setTimeout(() => this.focusComponent());
  }

  organizeTags(): void {
    const tags = this.diaryTags();
    console.warn('Organizing tags:', tags);
    this.firstRowTags = tags.slice(0, 6);
    this.secondRowTags = tags.slice(6, 12);
    this.thirdRowTags = tags.slice(12, 18);
  }

  getTagShortcut(index: number): string {
    if (index < this.keyboardShortcuts.length) {
      return this.keyboardShortcuts[index];
    }
    return '';
  }

  canAddMoreTags(): boolean {
    return this.diaryTags().length < this.MAX_TAGS && this.canCreate;
  }

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    console.warn('Tag selector keydown:', event.key);

    if (!this.isTagSelectorOpen) {
      return;
    }

    if (/^[1-9]$/.test(event.key)) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }

    // Skip shortcut handling if user is typing in the new tag input
    if (this.isAddingNewTag && document.activeElement?.classList.contains('new-tag-input')) {
      // Only handle Enter and Escape for the input field
      if (event.key === 'Enter') {
        console.warn('Enter key pressed in diary tag selector - new tag input');
        event.preventDefault();
        this.addNewTag();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.cancelAddNewTag();
      }
      return;
    }

    // Handle keyboard shortcuts for tag selection
    const shortcutIndex = this.keyboardShortcuts.indexOf(event.key.toLowerCase());
    if (shortcutIndex >= 0 && shortcutIndex < this.diaryTags().length) {
      event.preventDefault();
      this.toggleTag(this.diaryTags()[shortcutIndex]);
      return;
    }

    // Handle tab navigation
    if (event.key === 'Tab') {
      // Let the default tab behavior work for navigation
      return;
    }

    // Handle space to toggle selected tag
    if (event.key === 'Space' && document.activeElement instanceof HTMLElement) {
      console.warn('Space key pressed in diary tag selector');
      const tagId = document.activeElement.getAttribute('data-tag-id');
      if (tagId) {
        event.preventDefault();
        const tag = this.diaryTags().find(t => t.id === parseInt(tagId, 10));
        if (tag) {
          this.toggleTag(tag);
        }
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
    if (!this.canAddMoreTags()) {
      return;
    }

    this.isAddingNewTag = true;
    this.newTagName = '';

    // Focus the input after it appears
    setTimeout(() => {
      const input = document.querySelector('.new-tag-input') as HTMLInputElement;
      input.focus();
    });
  }

  addNewTag(): void {
    if (this.newTagName.trim() && this.canAddMoreTags()) {
      this.tagAdded.emit(this.newTagName.trim());
      this.isAddingNewTag = false;
      this.newTagName = '';

      // Re-organize tags after adding a new one
      setTimeout(() => {
        this.organizeTags();
      });
    }
  }

  cancelAddNewTag(): void {
    this.isAddingNewTag = false;
    this.newTagName = '';
  }

  // Method to focus the component
  focusComponent(): void {
    const selectorElement = document.querySelector('.tag-selector') as HTMLElement;
    if (selectorElement) {
      selectorElement.focus();
    }
  }

  // Public method that can be called from parent component
  focus(): void {
    this.focusComponent();
  }
}
