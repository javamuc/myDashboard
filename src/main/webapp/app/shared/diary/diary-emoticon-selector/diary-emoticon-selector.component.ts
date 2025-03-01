import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
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
  @Input() selectedEmoticon: DiaryEmoticon | null = null;
  @Output() emoticonSelected = new EventEmitter<DiaryEmoticon>();

  readonly diaryService = inject(DiaryService);
  emoticons = this.diaryService.getEmoticons();

  selectEmoticon(emoticon: DiaryEmoticon): void {
    this.emoticonSelected.emit(emoticon);
  }
}
