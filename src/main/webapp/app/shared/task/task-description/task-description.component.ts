import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../task.model';
import { SidebarService } from 'app/layouts/sidebar/sidebar.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'jhi-task-description',
  templateUrl: './task-description.component.html',
  styleUrls: ['./task-description.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TaskDescriptionComponent implements OnChanges, OnInit, OnDestroy {
  @Input() task!: Task;
  @Output() descriptionChange = new EventEmitter<void>();
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  showTagDropdown = false;
  tagSuggestions: string[] = [];
  selectedTagIndex = -1;
  cursorPosition = 0;
  currentTagStart = -1;

  private tagInputSubject = new Subject<{ tag: string; start: number }>();
  private subscription?: Subscription;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.subscription = this.tagInputSubject
      .pipe(
        debounceTime(150),
        distinctUntilChanged((prev, curr) => prev.tag === curr.tag),
        switchMap(({ tag, start }) =>
          this.sidebarService.getTags().pipe(
            switchMap(tags =>
              Promise.resolve({
                suggestions: Array.from(tags)
                  .filter(t => t.toLowerCase().includes(tag.toLowerCase()))
                  .sort(),
                start,
              }),
            ),
          ),
        ),
      )
      .subscribe(({ suggestions, start }) => {
        // Only update if the tag start position hasn't changed
        if (start === this.currentTagStart) {
          this.tagSuggestions = suggestions;
          this.showTagDropdown = suggestions.length > 0;
          this.selectedTagIndex = -1;
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'].currentValue.id !== changes['task'].previousValue?.id) {
      this.showTagDropdown = false;
    }
  }

  onDescriptionChange(): void {
    this.descriptionChange.emit();
  }

  onBlur(): void {
    const hashtags = this.getHashtags();
    if (hashtags.length > 0) {
      this.sidebarService.addTags(hashtags);
    }
  }

  getHashtags(): string[] {
    if (!this.task.description) {
      return [];
    }
    const hashtagRegex = /#[\w_-]+/g;
    return this.task.description.match(hashtagRegex) ?? [];
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showTagDropdown) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedTagIndex = Math.min(this.selectedTagIndex + 1, this.tagSuggestions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedTagIndex = Math.max(this.selectedTagIndex - 1, -1);
        break;
      case 'Enter':
      case 'Tab':
        if (this.selectedTagIndex >= 0) {
          event.preventDefault();
          this.insertTag(this.tagSuggestions[this.selectedTagIndex]);
        }
        break;
      case 'Escape':
        this.showTagDropdown = false;
        break;
    }
  }

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.cursorPosition = textarea.selectionStart;

    // Find the start of the current tag (if any)
    const textBeforeCursor = textarea.value.substring(0, this.cursorPosition);
    this.currentTagStart = textBeforeCursor.lastIndexOf('#');

    if (this.currentTagStart >= 0 && (this.currentTagStart === 0 || textarea.value[this.currentTagStart - 1] === ' ')) {
      const currentTag = textBeforeCursor.substring(this.currentTagStart + 1);
      this.tagInputSubject.next({ tag: currentTag, start: this.currentTagStart });
    } else {
      this.showTagDropdown = false;
      this.tagSuggestions = [];
    }

    this.onDescriptionChange();
  }

  insertTag(tag: string): void {
    const textarea = this.textarea.nativeElement;
    const textBeforeCursor = textarea.value.substring(0, this.currentTagStart);
    const textAfterCursor = textarea.value.substring(this.cursorPosition);

    textarea.value = textBeforeCursor + tag + ' ' + textAfterCursor;
    const newCursorPosition = this.currentTagStart + tag.length + 1;
    textarea.selectionStart = newCursorPosition;
    textarea.selectionEnd = newCursorPosition;

    this.showTagDropdown = false;
    this.task.description = textarea.value;
    this.onDescriptionChange();
  }

  selectTag(tag: string): void {
    this.insertTag(tag);
  }
}
