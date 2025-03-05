import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { DiaryService } from '../shared/diary/diary.service';
import { DiaryEntry, DiaryTag } from '../shared/diary/diary.model';
import { DiaryEditorComponent } from '../shared/diary/diary-editor/diary-editor.component';
import { DiaryEntryComponent } from '../shared/diary/diary-entry/diary-entry.component';
import { DiaryTagSelectorComponent } from '../shared/diary/diary-tag-selector/diary-tag-selector.component';
import { firstValueFrom } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';

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
  isEditing = false;
  selectedEntry: DiaryEntry | null = null;
  searchTerm = '';
  selectedTags: DiaryTag[] = [];

  private diaryService = inject(DiaryService);
  private modalService = inject(NgbModal);

  ngOnInit(): void {
    this.loadEntries();
  }

  loadEntries(): void {
    this.diaryService.getAllEntries().subscribe(entries => {
      this.diaryEntries = entries;
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

  onTagSelected(tag: DiaryTag): void {
    const index = this.selectedTags.indexOf(tag);
    if (index === -1) {
      this.selectedTags.push(tag);
    } else {
      this.selectedTags.splice(index, 1);
    }
  }

  get filteredEntries(): DiaryEntry[] {
    return this.diaryEntries.filter(entry => {
      // Filter by search term
      const matchesSearch = this.searchTerm === '' || entry.content.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filter by selected tags
      const matchesTags = this.selectedTags.length === 0 || this.selectedTags.every(tag => entry.tags.some(t => t.name === tag.name));

      return matchesSearch && matchesTags;
    });
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
