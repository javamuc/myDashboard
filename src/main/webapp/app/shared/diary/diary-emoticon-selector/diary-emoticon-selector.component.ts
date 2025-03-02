import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiaryEmoticon } from '../diary.model';
import { DiaryService } from '../diary.service';

@Component({
  selector: 'jhi-diary-emoticon-selector',
  templateUrl: './diary-emoticon-selector.component.html',
  styleUrls: ['./diary-emoticon-selector.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class DiaryEmoticonSelectorComponent {
  @ViewChild('selectorContainer') selectorContainer!: ElementRef<HTMLDivElement>;
  @Input() selectedEmoticon: DiaryEmoticon | null = null;
  selectionConfirmed = false;
  @Output() emoticonSelected = new EventEmitter<DiaryEmoticon>();
  @Output() nextClicked = new EventEmitter<void>();

  readonly diaryService = inject(DiaryService);
  emoticons = this.diaryService.getEmoticons();

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    // Handle number keys for selecting emoticons
    if (/^[1-9]$/.test(event.key)) {
      event.stopPropagation();
      event.preventDefault();

      const emoticonIndex = parseInt(event.key, 10) - 1;
      const emoticonsList = this.emoticons();

      if (emoticonsList[emoticonIndex]) {
        this.selectEmoticon(emoticonsList[emoticonIndex]);
      }
    }

    // Handle Enter key to continue to tag selection
    if (event.key === 'Enter' && this.selectedEmoticon && !this.selectionConfirmed) {
      event.stopPropagation();
      event.preventDefault();
      this.nextClicked.emit();
    }
  }

  selectEmoticon(emoticon: DiaryEmoticon): void {
    this.emoticonSelected.emit(emoticon);
  }

  onNextClick(): void {
    if (this.selectedEmoticon) {
      this.nextClicked.emit();
    }
  }

  focus(): void {
    if (this.selectorContainer) {
      this.selectorContainer.nativeElement.focus();
    }
  }
}
