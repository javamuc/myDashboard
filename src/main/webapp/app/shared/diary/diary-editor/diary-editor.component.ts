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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Handle keyboard shortcuts for emoticons (1 through 9)
    if (this.isEditorOpen() && /^[1-9]$/.test(event.key)) {
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

    // Handle Enter key to continue to tag selection when emoticon is selected
    if (event.key === 'Enter' && this.selectedEmoticon() && !this.isTagSelectorOpen() && !this.isEditingEntry()) {
      event.preventDefault();
      event.stopPropagation();
      this.openTagSelector();
      return;
    }

    // Handle Escape key to close tag selector or editor
    if (event.key === 'Escape') {
      if (this.isTagSelectorOpen()) {
        event.preventDefault();
        event.stopPropagation();
        this.closeTagSelector();
      } else if (this.isEditorOpen()) {
        event.preventDefault();
        event.stopPropagation();
        this.closeEditor();
      }
      return;
    }

    // Handle Enter key to create entry when tag selector is open
    if (event.key === 'Enter' && this.isTagSelectorOpen() && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      this.startNewEntry();
      return;
    }

    // Handle CMD+Enter to save entry
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
    this.diaryService.closeTagSelector();
  }

  startNewEntry(): void {
    if (this.selectedEmoticon() && this.selectedTags().length > 0) {
      this.entryContent.set('');
      this.closeTagSelector();

      // Focus the input after the tag selector is closed
      setTimeout(() => {
        this.entryInput.nativeElement.focus();
      });
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
