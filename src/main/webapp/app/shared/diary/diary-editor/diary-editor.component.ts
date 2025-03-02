import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  effect,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DiaryService } from '../diary.service';
import { DiaryEmoticon, DiaryEntry, DiaryTag, NewDiaryEntry } from '../diary.model';
import { DiaryEmoticonSelectorComponent } from '../diary-emoticon-selector/diary-emoticon-selector.component';
import { DiaryTagSelectorComponent } from '../diary-tag-selector/diary-tag-selector.component';
import { DiaryEntryComponent } from '../diary-entry/diary-entry.component';

@Component({
  selector: 'jhi-diary-editor',
  templateUrl: './diary-editor.component.html',
  styleUrls: ['./diary-editor.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, DiaryEmoticonSelectorComponent, DiaryTagSelectorComponent, DiaryEntryComponent],
})
export class DiaryEditorComponent implements OnChanges, AfterViewInit {
  @ViewChild('entryInput') entryInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild(DiaryEmoticonSelectorComponent) emoticonSelector!: DiaryEmoticonSelectorComponent;
  @ViewChild(DiaryTagSelectorComponent) tagSelector!: DiaryTagSelectorComponent;
  @Input() entry: DiaryEntry | null = null;
  @Output() saveEntry = new EventEmitter<DiaryEntry>();
  @Output() cancelEdit = new EventEmitter<void>();

  readonly diaryService = inject(DiaryService);

  isEditorOpen = this.diaryService.getIsEditorOpen();
  entries = this.diaryService.getEntries();
  selectedEmoticon = this.diaryService.getSelectedEmoticon();
  selectedTags = this.diaryService.getSelectedTags();
  isTagSelectorOpen = this.diaryService.getIsTagSelectorOpen();
  isEditingEntry = this.diaryService.getIsEditingEntry();
  currentEditingEntry = this.diaryService.getCurrentEditingEntry();

  entryContent: WritableSignal<string> = signal('');

  private previousEditorState = false;

  constructor() {
    // Use effect to watch for changes to the isEditorOpen signal
    effect(() => {
      const isOpen = this.isEditorOpen();
      // Only focus when the editor transitions from closed to open
      if (isOpen && !this.previousEditorState) {
        setTimeout(() => {
          if (this.emoticonSelector) {
            this.emoticonSelector.focus();
          }
        });
      }
      this.previousEditorState = isOpen;
    });
  }

  ngAfterViewInit(): void {
    // Focus the emoticon selector if the editor is already open when the view is initialized
    if (this.isEditorOpen() && this.emoticonSelector) {
      setTimeout(() => {
        this.emoticonSelector.focus();
      });
    }

    // Set up a timer to check if the tag selector is open
    setInterval(() => {
      if (this.isEditorOpen()) {
        console.warn('Tag selector open check:', this.isTagSelectorOpen());
      }
    }, 1000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entry'] && this.entry) {
      this.entryContent.set(this.entry.content);
      if (this.entry.emoticon) {
        this.diaryService.selectEmoticon(this.entry.emoticon);
      }
      if (this.entry.tags) {
        this.diaryService.setSelectedTags(this.entry.tags);
      }
      this.diaryService.startEditingEntry(this.entry);
    } else if (changes['entry'] && !this.entry) {
      this.entryContent.set('');
      this.diaryService.resetEditor();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Skip if the editor is not open
    if (!this.isEditorOpen()) {
      return;
    }

    console.warn('Keyboard event:', event.key, 'isTagSelectorOpen:', this.isTagSelectorOpen());

    const isTextInput = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
    const isTextArea = event.target === this.entryInput?.nativeElement;

    // Handle keyboard shortcuts for emoticons (1 through 9)
    if (this.isEditorOpen() && /^[1-9]$/.test(event.key) && !isTextInput) {
      // Stop propagation to prevent navbar from capturing these keys
      event.stopPropagation();
      event.preventDefault();

      const emoticonIndex = parseInt(event.key, 10) - 1;
      const emoticons = this.diaryService.getEmoticons()();

      if (emoticons[emoticonIndex]) {
        this.selectEmoticon(emoticons[emoticonIndex]);
      }
      return;
    }

    // Handle Enter or Right Arrow key to continue to tag selection when emoticon is selected
    if (
      (event.key === 'Enter' || event.key === 'ArrowRight') &&
      this.selectedEmoticon() &&
      !this.isTagSelectorOpen() &&
      !this.isEditingEntry() &&
      !isTextInput
    ) {
      event.preventDefault();
      event.stopPropagation();
      this.openTagSelector();
      return;
    }

    // Handle Escape or Left Arrow key to go back or close
    if (event.key === 'Escape' || event.key === 'ArrowLeft') {
      // Don't handle left arrow in text inputs unless at the beginning of the text
      if (event.key === 'ArrowLeft' && isTextInput && !(isTextArea && this.entryInput.nativeElement.selectionStart === 0)) {
        return;
      }

      if (this.isTagSelectorOpen()) {
        event.preventDefault();
        event.stopPropagation();
        console.warn('Escape/ArrowLeft pressed while tag selector is open, forcing it closed');
        this.diaryService.forceCloseTagSelector();
      } else if (this.isEditorOpen() && !isTextArea) {
        event.preventDefault();
        event.stopPropagation();
        this.closeEditor();
      }
      return;
    }

    // Handle Enter or Right Arrow key to create entry when tag selector is open
    if (
      (event.key === 'Enter' || event.key === 'ArrowRight') &&
      this.isTagSelectorOpen() &&
      this.selectedTags().length > 0 &&
      !event.shiftKey &&
      !isTextInput
    ) {
      console.warn('Handling Enter/Right Arrow in tag selector');
      event.preventDefault();
      event.stopPropagation();
      this.startNewEntry();
      return;
    }

    // Handle CMD+Enter to save entry (works in text area too)
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      if (this.isEditingEntry()) {
        this.saveEditedEntry();
      } else if (this.entryContent().trim()) {
        this.createEntry();
      }
      return;
    }
  }

  onOverlayClick(event: Event): void {
    event.stopPropagation();
    this.closeEditor();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  selectEmoticon(emoticon: DiaryEmoticon): void {
    this.diaryService.selectEmoticon(emoticon);
  }

  openTagSelector(): void {
    this.diaryService.openTagSelector();

    // Focus the tag selector after it's opened
    setTimeout(() => {
      if (this.tagSelector) {
        this.tagSelector.focus();
      }
    });
  }

  toggleTag(tag: DiaryTag): void {
    this.diaryService.toggleTag(tag);
  }

  closeTagSelector(): void {
    console.warn('closeTagSelector called');
    this.diaryService.forceCloseTagSelector();
    console.warn('Tag selector closed, isTagSelectorOpen:', this.isTagSelectorOpen());
  }

  startNewEntry(): void {
    console.warn('startNewEntry called');
    if (this.selectedEmoticon() && this.selectedTags().length > 0) {
      console.warn('startNewEntry called 2');
      this.entryContent.set('');

      // Use the new forceCloseTagSelector method
      this.diaryService.forceCloseTagSelector();
      console.warn('After forceCloseTagSelector, isTagSelectorOpen:', this.isTagSelectorOpen());

      // Force Angular change detection and focus the input
      setTimeout(() => {
        console.warn('After timeout, isTagSelectorOpen:', this.isTagSelectorOpen());

        // If the tag selector is still open, force it closed again
        if (this.isTagSelectorOpen()) {
          console.warn('Tag selector is still open, forcing it closed again');
          this.diaryService.forceCloseTagSelector();

          // Give it another moment to update the UI
          setTimeout(() => {
            if (this.entryInput?.nativeElement) {
              console.warn('Focusing entry input after second close');
              this.entryInput.nativeElement.focus();
            } else {
              console.warn('Entry input not available after second close');
            }
          }, 50);
        } else if (this.entryInput?.nativeElement) {
          console.warn('Focusing entry input');
          this.entryInput.nativeElement.focus();
        } else {
          console.warn('Entry input not available');
        }
      }, 100);

      // Set up a timer to ensure the tag selector stays closed
      const checkInterval = setInterval(() => {
        if (this.isTagSelectorOpen() && this.selectedEmoticon() && this.selectedTags().length > 0) {
          console.warn('Tag selector reopened, forcing it closed again');
          this.diaryService.forceCloseTagSelector();
        } else if (!this.isEditorOpen()) {
          // Clear the interval if the editor is closed
          clearInterval(checkInterval);
        }
      }, 200);

      // Clear the interval after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 5000);
    }
  }

  createEntry(): void {
    if (this.entryContent().trim()) {
      const newEntry: NewDiaryEntry = {
        emoticon: this.selectedEmoticon()!,
        tags: this.selectedTags(),
        content: this.entryContent().trim(),
      };

      this.saveEntry.emit(newEntry as DiaryEntry);
      this.entryContent.set('');
      this.diaryService.resetSelections();
    }
  }

  startEditingEntry(entry: DiaryEntry): void {
    this.diaryService.startEditingEntry(entry);
    this.entryContent.set(entry.content);

    // Focus the input after setting up editing
    setTimeout(() => {
      this.entryInput.nativeElement.focus();
    });
  }

  saveEditedEntry(): void {
    const entry = this.currentEditingEntry();
    if (entry && this.entryContent().trim()) {
      const updatedEntry: DiaryEntry = {
        ...entry,
        content: this.entryContent().trim(),
        emoticon: this.selectedEmoticon()!,
        tags: this.selectedTags(),
      };

      this.saveEntry.emit(updatedEntry);
      this.entryContent.set('');
    }
  }

  cancelEditing(): void {
    this.diaryService.stopEditingEntry();
    this.entryContent.set('');
    this.diaryService.resetSelections();
    this.cancelEdit.emit();
  }

  closeEditor(): void {
    this.diaryService.closeEditor();
    this.entryContent.set('');
    this.cancelEdit.emit();
  }

  addNewTag(name: string): void {
    if (name.trim()) {
      this.diaryService.addNewTag(name.trim());
    }
  }
}
