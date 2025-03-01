import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
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
  @Output() emoticonSelected = new EventEmitter<DiaryEmoticon>();

  readonly diaryService = inject(DiaryService);
  emoticons = this.diaryService.getEmoticons();

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (/^[1-9]$/.test(event.key)) {
      event.stopPropagation();
      event.preventDefault();

      const emoticonIndex = parseInt(event.key, 10) - 1;
      const emoticonsList = this.emoticons();

      if (emoticonsList[emoticonIndex]) {
        this.selectEmoticon(emoticonsList[emoticonIndex]);
      }
    }
  }

  selectEmoticon(emoticon: DiaryEmoticon): void {
    this.emoticonSelected.emit(emoticon);
  }

  focus(): void {
    if (this.selectorContainer) {
      this.selectorContainer.nativeElement.focus();
    }
  }
}
