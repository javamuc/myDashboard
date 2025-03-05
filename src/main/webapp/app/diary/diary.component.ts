import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { DiaryEditorComponent } from '../shared/diary/diary-editor/diary-editor.component';
import { DiaryEntryComponent } from '../shared/diary/diary-entry/diary-entry.component';
import { DiaryTagSelectorComponent } from '../shared/diary/diary-tag-selector/diary-tag-selector.component';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { DiaryService } from 'app/shared/diary/diary.service';
import { DiaryEntry, DiaryEmoticon, DiaryTag } from 'app/shared/diary/diary.model';
import { firstValueFrom } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'jhi-diary',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    DiaryEditorComponent,
    DiaryEntryComponent,
    DiaryTagSelectorComponent,
    HasAnyAuthorityDirective,
  ],
  templateUrl: './diary.component.html',
  styleUrls: ['./diary.component.scss'],
})
export class DiaryComponent implements OnInit {
  diaryEntries: DiaryEntry[] = [];
  filteredEntries: DiaryEntry[] = [];
  isEditing = false;
  selectedEntry: DiaryEntry | null = null;
  searchTerm = '';
  selectedEmoticon: string | undefined = undefined;
  selectedTags: DiaryTag[] = [];
  isEmoticonSelectorOpen = signal(false);
  isTagSelectorOpen = signal(false);

  constructor(
    public diaryService: DiaryService,
    private modalService: NgbModal,
  ) {}

  get emoticons(): DiaryEmoticon[] {
    return this.diaryService.getEmoticons()();
  }

  ngOnInit(): void {
    // Ensure tags are loaded before loading entries
    this.loadEntries();
  }

  async loadEntries(): Promise<void> {
    const entries = await firstValueFrom(
      this.diaryService.getAllEntries(
        this.selectedEmoticon,
        this.selectedTags.map(tag => tag.name),
      ),
    );
    this.diaryEntries = entries;
    this.updateFilteredEntries();
  }

  updateFilteredEntries(): void {
    this.filteredEntries = this.diaryEntries.filter(entry => {
      // Filter by search term
      const matchesSearch = this.searchTerm === '' || entry.content.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesSearch;
    });
  }

  createNewEntry(): void {
    this.isEditing = true;
    this.selectedEntry = null;
    this.diaryService.closeEditor();
    setTimeout(() => {
      this.diaryService.openEditor();
    }, 0);
  }

  editEntry(entry: DiaryEntry): void {
    this.isEditing = true;
    this.selectedEntry = entry;
    this.diaryService.openEditor();
  }

  onSaveEntry(entry: DiaryEntry): void {
    if (this.selectedEntry) {
      this.diaryService.updateEntry(entry).subscribe(() => {
        this.isEditing = false;
        this.selectedEntry = null;
        this.diaryService.closeEditor();
        this.loadEntries();
      });
    } else {
      this.diaryService.createEntry(entry).subscribe(() => {
        this.isEditing = false;
        this.diaryService.closeEditor();
        this.loadEntries();
      });
    }
  }

  onCancelEdit(): void {
    this.isEditing = false;
    this.selectedEntry = null;
    this.diaryService.closeEditor();
  }

  toggleEmoticonSelector(): void {
    this.isEmoticonSelectorOpen.set(!this.isEmoticonSelectorOpen());
    if (this.isEmoticonSelectorOpen()) {
      this.isTagSelectorOpen.set(false);
    }
  }

  toggleTagSelector(): void {
    this.isTagSelectorOpen.set(!this.isTagSelectorOpen());
    if (this.isTagSelectorOpen()) {
      this.isEmoticonSelectorOpen.set(false);
    }
  }

  selectEmoticon(emoticon: string | undefined): void {
    this.selectedEmoticon = emoticon;
    this.isEmoticonSelectorOpen.set(false);
    this.loadEntries();
  }

  toggleTag(tag: DiaryTag): void {
    const index = this.selectedTags.findIndex(t => t.id === tag.id);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.loadEntries();
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    this.isEmoticonSelectorOpen.set(false);
    this.isTagSelectorOpen.set(false);
  }

  @HostListener('document:keydown.n', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'n' && !this.diaryService.getIsEditorOpen()()) {
      this.createNewEntry();
    }
  }

  async deleteAllEntries(): Promise<void> {
    const modalRef = this.modalService.open(ConfirmationDialogComponent);
    modalRef.componentInstance.title = 'Delete All Entries';
    modalRef.componentInstance.message = 'Are you sure you want to delete all diary entries? This action cannot be undone.';
    modalRef.componentInstance.confirmButtonText = 'Delete All';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    try {
      const confirmed = await modalRef.result;
      if (confirmed) {
        await firstValueFrom(this.diaryService.deleteAll());
        // Refresh the entries list
        this.loadEntries();
      }
    } catch (error) {
      console.error('Error deleting entries:', error);
    }
  }
}
