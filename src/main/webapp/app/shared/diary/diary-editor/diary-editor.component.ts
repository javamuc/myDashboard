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

@Component({
  selector: 'jhi-diary-editor',
  templateUrl: './diary-editor.component.html',
  styleUrls: ['./diary-editor.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, DiaryEmoticonSelectorComponent, DiaryTagSelectorComponent],
})
export class DiaryEditorComponent implements AfterViewInit {
  @ViewChild('entryInput') entryInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('emoticonSelector') emoticonSelector!: DiaryEmoticonSelectorComponent;
  @ViewChild('tagSelector') tagSelector!: DiaryTagSelectorComponent;
  @Input() entry: DiaryEntry | null = null;
  @Output() saveEntry = new EventEmitter<DiaryEntry>();
  @Output() cancelEdit = new EventEmitter<void>();

  readonly diaryService = inject(DiaryService);
  readonly steps = [
    {
      label: 'Emoticon',
      title: 'How do you feel?',
      selector: this.emoticonSelector,
    },
    {
      label: 'Tags',
      title: 'What was it about?',
      selector: this.tagSelector,
    },
    {
      label: 'Content',
      title: 'Write it down',
      selector: this.entryInput,
    },
  ];
  currentStep = signal(0);

  isEditorOpen = this.diaryService.getIsEditorOpen();
  selectedEmoticon = this.diaryService.getSelectedEmoticon();
  selectedTags = this.diaryService.getSelectedTags();
  isTagSelectorOpen = this.diaryService.getIsTagSelectorOpen();
  isEditingEntry = this.diaryService.getIsEditingEntry();
  currentEditingEntry = this.diaryService.getCurrentEditingEntry();

  entryContent: WritableSignal<string> = signal('');

  ngAfterViewInit(): void {
    // Focus the emoticon selector if the editor is already open when the view is initialized
    if (this.isEditorOpen()) {
      this.setFocus();
    }
  }

  nextStep(): void {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(step => step + 1);
      this.setFocus();
    }
    return;
  }

  previousStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(step => step - 1);
      this.setFocus();
    }
    return;
  }

  canGoForward(): boolean {
    if (this.currentStep() === 0) {
      return this.selectedEmoticon() !== null;
    } else if (this.currentStep() === 1) {
      return this.selectedTags().length > 0;
    }
    return false;
  }

  canGoBack(): boolean {
    return this.currentStep() > 0;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Skip if the editor is not open
    if (!this.isEditorOpen()) {
      return;
    }

    const isTextInput = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
    const isTextArea = event.target === this.entryInput.nativeElement;

    // Skip all keyboard shortcuts if we're in the text area (except for specific ones we want to handle)
    if (isTextArea) {
      // Only handle Cmd+Enter and Escape in the text area
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        if (this.isEditingEntry()) {
          this.saveEditedEntry();
        } else if (this.entryContent().trim()) {
          this.createEntry();
        }
      } else if (event.key === 'Escape') {
        // Handle Escape key for navigation
        this.handleTextareaKeydown(event);
      }
      return;
    }

    if (/^[1-9]$/.test(event.key)) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }

    // Handle CMD+Enter to save entry (works in text area too)
    // if (this.currentStep() === 2 && (event.metaKey || event.ctrlKey) && event.key === 'Enter' && this.canSaveEntry()) {
    //   event.preventDefault();
    //   event.stopPropagation();
    //   if (this.isEditingEntry()) {
    //     this.saveEditedEntry();
    //   } else if (this.entryContent().trim()) {
    //     this.createEntry();
    //   }
    //   return;
    // }

    // Handle Enter or Right Arrow key to continue to tag selection when emoticon is selected
    if ((event.key === 'Enter' || event.key === 'ArrowRight') && this.canGoForward()) {
      event.preventDefault();
      event.stopPropagation();
      this.nextStep();
      return;
    }

    // Handle Escape or Left Arrow key to go back or close
    if (event.key === 'Escape' || event.key === 'ArrowLeft') {
      // Don't handle left arrow in text inputs unless at the beginning of the text
      if (event.key === 'ArrowLeft' && isTextInput && !(this.entryInput.nativeElement.selectionStart === 0)) {
        return;
      }

      // If we're in the text area and Escape is pressed, blur the input and open tag selector
      if (this.canGoBack()) {
        console.warn('Escape pressed in text area, blurring input and opening tag selector');
        event.preventDefault();
        event.stopPropagation();
        this.previousStep();
        return;
      } else if (this.currentStep() === 0) {
        this.diaryService.closeEditor();
      }
      return;
    }
  }

  canSaveEntry(): boolean {
    return this.entryContent().trim().length > 0 && this.selectedEmoticon() !== null && this.selectedTags().length > 0;
  }

  onOverlayClick(event: Event): void {
    event.stopPropagation();
    this.closeEditor();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  selectEmoticon(emoticon: DiaryEmoticon): void {
    this.diaryService.setSelectedEmoticon(emoticon);
  }

  toggleTag(tag: DiaryTag): void {
    this.diaryService.toggleTag(tag);
  }

  createEntry(): void {
    if (this.entryContent().trim()) {
      const newEntry: NewDiaryEntry = {
        emoticon: this.selectedEmoticon()!,
        tags: this.selectedTags(),
        content: this.entryContent().trim(),
      };

      this.saveEntry.emit(newEntry as DiaryEntry);
      this.diaryService.closeEditor();
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
    this.diaryService.cancelEditingEntry();
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

  // Handle keydown events in the textarea
  handleTextareaKeydown(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // Only handle Escape key
    if (event.key === 'Escape') {
      console.warn('Escape key pressed in textarea via keydown handler');

      if (this.entryInput?.nativeElement && !this.isTagSelectorOpen() && !this.isEditingEntry()) {
        this.entryInput.nativeElement.blur();
      } else if (this.isEditingEntry()) {
        // If editing an entry, cancel editing on Escape
        this.cancelEditing();
      }
    }
  }

  setFocus(): void {
    setTimeout(() => {
      console.warn('Setting focus to step:', this.currentStep());
      if (this.currentStep() === 0 && this.emoticonSelector) {
        this.emoticonSelector.focus();
      } else if (this.currentStep() === 1 && this.tagSelector) {
        this.tagSelector.focus();
      } else if (this.currentStep() === 2 && this.entryInput) {
        this.entryInput.nativeElement.focus();
      }
    }, 50);
  }
}
