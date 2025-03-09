import { Injectable, signal } from '@angular/core';
import { DiaryEntry, DiaryEmoticon, DiaryTag, NewDiaryEntry } from './diary.model';
import { Observable, firstValueFrom } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  private tagResourceUrl: string;

  // State signals
  private isEditorOpen = signal<boolean>(false);
  private selectedEmoticon = signal<DiaryEmoticon | null>(null);
  private selectedTags = signal<DiaryTag[]>([]);
  private isTagSelectorOpen = signal<boolean>(false);
  private isEditingEntry = signal<boolean>(false);
  private currentEditingEntry = signal<DiaryEntry | null>(null);
  private diaryTags = signal<DiaryTag[]>([]);

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
    this.tagResourceUrl = this.applicationConfigService.getEndpointFor('api/diary-tags');
    this.loadTags();
  }

  // API methods
  getAllEntries(emoticon?: string, tags?: string[]): Observable<DiaryEntry[]> {
    let params = new HttpParams();
    if (emoticon) {
      params = params.set('emoticon', emoticon);
    }
    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        params = params.append('tags', tag);
      });
    }
    return this.http.get<PaginatedResponse<DiaryEntry>>(this.resourceUrl, { params }).pipe(
      map((response: PaginatedResponse<DiaryEntry>) => {
        if (response.content) {
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
      tags: entry.tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        archived: tag.archived,
        createdDate: tag.createdDate,
        lastModifiedDate: tag.lastModifiedDate,
      })),
    };
    return this.http.post<any>(this.resourceUrl, payload).pipe(map(response => this.convertFromServer(response)));
  }

  updateEntry(entry: DiaryEntry): Observable<DiaryEntry> {
    const payload = {
      id: entry.id,
      content: entry.content,
      emoticon: entry.emoticon.emoji,
      tags: entry.tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        archived: tag.archived,
        createdDate: tag.createdDate,
        lastModifiedDate: tag.lastModifiedDate,
      })),
    };
    return this.http.put<any>(`${this.resourceUrl}/${entry.id}`, payload).pipe(map(response => this.convertFromServer(response)));
  }

  deleteEntry(entryId: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.resourceUrl}/${entryId}`);
  }

  // Tag methods
  loadTags(): void {
    // Only load tags if we don't have any yet
    if (this.diaryTags().length === 0) {
      this.http.get<DiaryTag[]>(`${this.tagResourceUrl}/active`).subscribe(tags => {
        console.warn('Loaded tags:', tags);
        this.diaryTags.set(tags);
      });
    }
  }

  createTag(name: string): Observable<DiaryTag> {
    return this.http.post<DiaryTag>(this.tagResourceUrl, { name }).pipe(
      map(tag => {
        this.diaryTags.update(tags => [...tags, tag]);
        return tag;
      }),
    );
  }

  updateTag(tag: DiaryTag): Observable<DiaryTag> {
    return this.http.put<DiaryTag>(`${this.tagResourceUrl}/${tag.id}`, tag).pipe(
      map(updatedTag => {
        this.diaryTags.update(tags => tags.map(t => (t.id === updatedTag.id ? updatedTag : t)));
        return updatedTag;
      }),
    );
  }

  deleteTag(tagId: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.tagResourceUrl}/${tagId}`).pipe(
      map(() => {
        this.diaryTags.update(tags => tags.filter(t => t.id !== tagId));
      }),
    );
  }

  archiveTag(tagId: number): Observable<DiaryTag> {
    return this.http.put<DiaryTag>(`${this.tagResourceUrl}/${tagId}/archive`, {}).pipe(
      map(archivedTag => {
        this.diaryTags.update(tags => tags.filter(t => t.id !== tagId));
        return archivedTag;
      }),
    );
  }

  // State management methods
  getIsEditorOpen(): typeof this.isEditorOpen {
    return this.isEditorOpen;
  }

  openEditor(): void {
    this.isEditorOpen.set(true);
  }

  closeEditor(): void {
    this.isEditorOpen.set(false);
    this.selectedEmoticon.set(null);
    this.selectedTags.set([]);
    this.isTagSelectorOpen.set(false);
    this.isEditingEntry.set(false);
    this.currentEditingEntry.set(null);
  }

  getSelectedEmoticon(): typeof this.selectedEmoticon {
    return this.selectedEmoticon;
  }

  setSelectedEmoticon(emoticon: DiaryEmoticon | null): void {
    this.selectedEmoticon.set(emoticon);
  }

  getSelectedTags(): typeof this.selectedTags {
    return this.selectedTags;
  }

  setSelectedTags(tags: DiaryTag[]): void {
    console.warn('DiaryService.setSelectedTags called with tags:', tags);
    this.selectedTags.set(tags);
  }

  getIsTagSelectorOpen(): typeof this.isTagSelectorOpen {
    return this.isTagSelectorOpen;
  }

  openTagSelector(): void {
    this.isTagSelectorOpen.set(true);
  }

  closeTagSelector(): void {
    this.isTagSelectorOpen.set(false);
  }

  getEmoticons(): typeof this.emoticons {
    return this.emoticons;
  }

  getDiaryTags(): typeof this.diaryTags {
    return this.diaryTags;
  }

  getIsEditingEntry(): typeof this.isEditingEntry {
    return this.isEditingEntry;
  }

  getCurrentEditingEntry(): typeof this.currentEditingEntry {
    return this.currentEditingEntry;
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

    // Handle tags - create any new tags that don't exist yet
    const existingTags: DiaryTag[] = [];
    const newTagPromises: Promise<DiaryTag>[] = [];

    entry.tags.forEach(tag => {
      const existingTag = this.diaryTags().find(t => t.name === tag.name);
      if (existingTag) {
        existingTags.push(existingTag);
      } else {
        // Create new tag through the API
        const promise = firstValueFrom(this.createTag(tag.name)).then(newTag => {
          existingTags.push(newTag);
          return newTag;
        });
        newTagPromises.push(promise);
      }
    });

    // Once all new tags are created, set the selected tags
    if (newTagPromises.length > 0) {
      Promise.all(newTagPromises).then(() => {
        this.selectedTags.set(existingTags);
      });
    } else {
      this.selectedTags.set(existingTags);
    }
  }

  cancelEditingEntry(): void {
    this.currentEditingEntry.set(null);
    this.isEditingEntry.set(false);
    this.selectedEmoticon.set(null);
    this.selectedTags.set([]);
  }

  addNewTag(name: string): void {
    if (name.trim()) {
      this.createTag(name.trim()).subscribe(newTag => {
        // Also select the new tag
        this.toggleTag(newTag);
      });
    }
  }

  deleteAll(): Observable<unknown> {
    return this.http.delete<unknown>(`${this.resourceUrl}/all`);
  }

  private convertFromServer(entry: any): DiaryEntry {
    const emoticon = this.emoticons().find(e => e.emoji === entry.emoticon) ?? {
      id: 0,
      name: 'Unknown',
      emoji: entry.emoticon,
      shortcut: '',
    };

    // Ensure we're working with the proper tag objects from the backend
    const tags = Array.isArray(entry.tags)
      ? entry.tags.map((tag: DiaryTag) => {
          if (typeof tag === 'string') {
            // If it's just a string (legacy data), find or create a proper tag
            const existingTag = this.diaryTags().find(t => t.name === tag);
            if (existingTag) {
              return existingTag;
            }
            // If we don't find the tag, we'll need to create it
            return {
              name: tag,
              archived: false,
              createdDate: new Date(),
              lastModifiedDate: new Date(),
            };
          }
          // If it's already a tag object, return it as is
          return tag;
        })
      : [];

    return {
      id: entry.id,
      content: entry.content,
      emoticon,
      tags,
      createdAt: new Date(entry.createdDate),
    };
  }
}
