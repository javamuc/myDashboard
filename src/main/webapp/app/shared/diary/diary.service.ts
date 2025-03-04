import { Injectable, signal } from '@angular/core';
import { DiaryEntry, DiaryEmoticon, DiaryTag, NewDiaryEntry } from './diary.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { map } from 'rxjs/operators';

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root',
})
export class DiaryService {
  private resourceUrl: string;

  // State signals
  private isEditorOpen = signal<boolean>(false);
  private selectedEmoticon = signal<DiaryEmoticon | null>(null);
  private selectedTags = signal<DiaryTag[]>([]);
  private isTagSelectorOpen = signal<boolean>(false);
  private isEditingEntry = signal<boolean>(false);
  private currentEditingEntry = signal<DiaryEntry | null>(null);

  // Default diary tags
  private diaryTags = signal<DiaryTag[]>([
    { id: 1, name: 'work' },
    { id: 2, name: 'family' },
    { id: 3, name: 'relationship' },
    { id: 4, name: 'friends' },
    { id: 5, name: 'myself' },
    { id: 6, name: 'school' },
    { id: 7, name: 'coworkers' },
    { id: 8, name: 'health' },
    { id: 9, name: 'college' },
    { id: 10, name: 'hobby' },
    { id: 11, name: 'travel' },
    { id: 12, name: 'fitness' },
    { id: 13, name: 'entertainment' },
  ]);

  // Default emoticons
  private emoticons = signal<DiaryEmoticon[]>([
    { id: 1, name: 'Ecstatic', emoji: '😇', shortcut: '1' },
    { id: 2, name: 'Happy', emoji: '😍', shortcut: '2' },
    { id: 3, name: 'Content', emoji: '🙂', shortcut: '3' },
    { id: 4, name: 'Neutral', emoji: '🤔', shortcut: '4' },
    { id: 5, name: 'Displeased', emoji: '😕', shortcut: '5' },
    { id: 6, name: 'Frustrated', emoji: '😑', shortcut: '6' },
    { id: 7, name: 'Annoyed', emoji: '😵', shortcut: '7' },
    { id: 8, name: 'Angry', emoji: '😠', shortcut: '8' },
    { id: 9, name: 'Furious', emoji: '🤬', shortcut: '9' },
  ]);

  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
  ) {
    this.resourceUrl = this.applicationConfigService.getEndpointFor('api/diary-entries');
  }

  // Getters
  getIsEditorOpen(): typeof this.isEditorOpen {
    return this.isEditorOpen;
  }

  getSelectedEmoticon(): typeof this.selectedEmoticon {
    return this.selectedEmoticon;
  }

  getSelectedTags(): typeof this.selectedTags {
    return this.selectedTags;
  }

  getIsTagSelectorOpen(): typeof this.isTagSelectorOpen {
    return this.isTagSelectorOpen;
  }

  getIsEditingEntry(): typeof this.isEditingEntry {
    return this.isEditingEntry;
  }

  getCurrentEditingEntry(): typeof this.currentEditingEntry {
    return this.currentEditingEntry;
  }

  getDiaryTags(): typeof this.diaryTags {
    return this.diaryTags;
  }

  getEmoticons(): typeof this.emoticons {
    return this.emoticons;
  }

  // API methods
  getAllEntries(): Observable<DiaryEntry[]> {
    return this.http.get<PaginatedResponse<DiaryEntry>>(this.resourceUrl).pipe(
      map((response: PaginatedResponse<DiaryEntry>) => {
        if (response?.content) {
          return response.content.map(entry => this.convertFromServer(entry));
        }
        return [];
      }),
    );
  }

  createEntry(entry: NewDiaryEntry): Observable<DiaryEntry> {
    const payload = {
      content: entry.content,
      emoticon: entry.emoticon.emoji,
      tags: entry.tags.map(tag => tag.name),
    };
    return this.http.post<any>(this.resourceUrl, payload).pipe(map(response => this.convertFromServer(response)));
  }

  updateEntry(entry: DiaryEntry): Observable<DiaryEntry> {
    const payload = {
      id: entry.id,
      content: entry.content,
      emoticon: entry.emoticon.emoji,
      tags: entry.tags.map(tag => tag.name),
    };
    return this.http.put<any>(`${this.resourceUrl}/${entry.id}`, payload).pipe(map(response => this.convertFromServer(response)));
  }

  deleteEntry(entryId: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.resourceUrl}/${entryId}`);
  }

  // Actions
  openEditor(): void {
    this.isEditorOpen.set(true);
  }

  closeEditor(): void {
    this.isEditorOpen.set(false);
    this.resetState();
  }

  resetEditor(): void {
    console.warn('DiaryService.resetEditor called');
    this.resetState();
  }

  selectEmoticon(emoticon: DiaryEmoticon): void {
    console.warn('DiaryService.selectEmoticon called with emoticon:', emoticon);
    this.selectedEmoticon.set(emoticon);
  }

  setSelectedTags(tags: DiaryTag[]): void {
    console.warn('DiaryService.setSelectedTags called with tags:', tags);
    this.selectedTags.set(tags);
  }

  toggleTag(tag: DiaryTag): void {
    const currentTags = this.selectedTags();
    const tagIndex = currentTags.findIndex(t => t.id === tag.id);

    if (tagIndex >= 0) {
      // Remove tag if already selected
      this.selectedTags.set(currentTags.filter(t => t.id !== tag.id));
    } else {
      // Add tag if not selected
      this.selectedTags.set([...currentTags, tag]);
    }
  }

  startEditingEntry(entry: DiaryEntry): void {
    this.currentEditingEntry.set(entry);
    this.isEditingEntry.set(true);
    // Set the emoticon and tags for editing
    const emoticon = this.emoticons().find(e => e.emoji === entry.emoticon.emoji);
    if (emoticon) {
      this.selectedEmoticon.set(emoticon);
    }
    const tags = entry.tags.map(tag => {
      const existingTag = this.diaryTags().find(t => t.name === tag.name);
      return existingTag ?? { id: Math.random(), name: tag.name };
    });
    this.selectedTags.set(tags);
  }

  stopEditingEntry(): void {
    this.currentEditingEntry.set(null);
    this.isEditingEntry.set(false);
  }

  addNewTag(name: string): void {
    const currentTags = this.diaryTags();
    const newId = Math.max(...currentTags.map(t => t.id)) + 1;
    const newTag: DiaryTag = { id: newId, name };

    this.diaryTags.update(tags => [...tags, newTag]);
    // Also select the new tag
    this.toggleTag(newTag);
  }

  resetSelections(): void {
    this.selectedEmoticon.set(null);
    this.selectedTags.set([]);
  }

  private resetState(): void {
    this.resetSelections();
    this.isTagSelectorOpen.set(false);
    this.isEditingEntry.set(false);
    this.currentEditingEntry.set(null);
  }

  private convertFromServer(entry: any): DiaryEntry {
    const emoticon = this.emoticons().find(e => e.emoji === entry.emoticon) ?? {
      id: 0,
      name: 'Unknown',
      emoji: entry.emoticon,
      shortcut: '',
    };

    const tags = entry.tags.map((tagName: string) => {
      const existingTag = this.diaryTags().find(t => t.name === tagName);
      return existingTag ?? { id: Math.random(), name: tagName };
    });

    return {
      id: entry.id,
      content: entry.content,
      emoticon,
      tags,
      createdAt: new Date(entry.createdDate),
    };
  }
}
