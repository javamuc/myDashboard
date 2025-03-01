import { Injectable, signal } from '@angular/core';
import { DiaryEntry, DiaryEmoticon, DiaryTag, NewDiaryEntry } from './diary.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DiaryService {
  // State signals
  private isEditorOpen = signal<boolean>(false);
  private entries = signal<DiaryEntry[]>([]);
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

  // Getters
  getIsEditorOpen(): typeof this.isEditorOpen {
    return this.isEditorOpen;
  }

  getEntries(): typeof this.entries {
    return this.entries;
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

  // Observable-based methods for DiaryComponent
  getAllEntries(): Observable<DiaryEntry[]> {
    return of(this.entries());
  }

  createEntry(entry: NewDiaryEntry): Observable<DiaryEntry> {
    const newEntry = {
      ...entry,
      id: Date.now(), // Temporary ID until we have a backend
      createdAt: new Date(),
    };

    this.entries.update(entries => [newEntry, ...entries] as DiaryEntry[]);
    return of(newEntry);
  }

  updateEntry(entry: DiaryEntry): Observable<DiaryEntry> {
    this.entries.update(entries => entries.map(e => (e.id === entry.id ? entry : e)));
    return of(entry);
  }

  deleteEntry(entryId: number): Observable<void> {
    this.entries.update(entries => entries.filter(e => e.id !== entryId));
    return of(undefined);
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
    this.resetState();
  }

  selectEmoticon(emoticon: DiaryEmoticon): void {
    this.selectedEmoticon.set(emoticon);
    // No longer automatically open tag selector
  }

  openTagSelector(): void {
    this.isTagSelectorOpen.set(true);
  }

  setSelectedTags(tags: DiaryTag[]): void {
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

  closeTagSelector(): void {
    this.isTagSelectorOpen.set(false);
    // Don't reset emoticon and tags here
  }

  createDiaryEntry(content: string): void {
    if (!this.selectedEmoticon()) {
      return;
    }

    const newEntry: DiaryEntry = {
      id: Date.now(), // Temporary ID until we have a backend
      emoticon: this.selectedEmoticon()!,
      tags: this.selectedTags(),
      content,
      createdAt: new Date(),
    };

    this.entries.update(entries => [newEntry, ...entries]);
    this.resetState();
  }

  startEditingEntry(entry: DiaryEntry): void {
    this.currentEditingEntry.set(entry);
    this.isEditingEntry.set(true);
  }

  updateDiaryEntry(entry: DiaryEntry, content: string): void {
    const updatedEntry = { ...entry, content };
    this.entries.update(entries => entries.map(e => (e.id === entry.id ? updatedEntry : e)));
    this.stopEditingEntry();
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
}
