import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Task } from 'app/shared/task/task.model';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly boardIdSubject = new BehaviorSubject<number | undefined>(undefined);
  private readonly isOpenSubject = new BehaviorSubject<boolean>(false);
  private readonly activeComponentSubject = new BehaviorSubject<'task' | 'note' | null>(null);
  private readonly taskDataSubject = new BehaviorSubject<Task | undefined>(undefined);
  private readonly tagsSubject = new BehaviorSubject<Set<string>>(new Set<string>());

  private taskDeleteRequested = new Subject<Task>();
  private taskUpdateRequested = new Subject<Task>();
  private taskStatusUpdateRequested = new Subject<Task>();

  getIsOpen(): Observable<boolean> {
    return this.isOpenSubject.asObservable();
  }

  setIsOpen(isOpen: boolean): void {
    this.isOpenSubject.next(isOpen);
  }

  getActiveComponent(): Observable<'task' | 'note' | null> {
    return this.activeComponentSubject.asObservable();
  }

  setActiveComponent(component: 'task' | 'note' | null): void {
    this.activeComponentSubject.next(component);
  }

  getTaskData(): Observable<Task | undefined> {
    return this.taskDataSubject.asObservable();
  }

  getTaskDataValue(): Task | undefined {
    return this.taskDataSubject.getValue();
  }

  setTaskData(task: Task | undefined): void {
    this.taskDataSubject.next(task);
  }

  getBoardId(): Observable<number | undefined> {
    return this.boardIdSubject.asObservable();
  }

  setBoardId(boardId: number | undefined): void {
    this.boardIdSubject.next(boardId);
  }

  toggle(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  getTags(): Observable<Set<string>> {
    return this.tagsSubject.asObservable();
  }

  addTags(tags: string[]): void {
    const currentTags = this.tagsSubject.value;
    tags.forEach(tag => currentTags.add(tag));
    this.tagsSubject.next(currentTags);
  }

  removeTags(tags: string[]): void {
    const currentTags = this.tagsSubject.value;
    tags.forEach(tag => currentTags.delete(tag));
    this.tagsSubject.next(currentTags);
  }

  requestTaskDeletion(task: Task): void {
    this.taskDeleteRequested.next(task);
  }

  getTaskDeleteRequests(): Observable<Task> {
    return this.taskDeleteRequested.asObservable();
  }

  requestTaskUpdate(task: Task): void {
    this.taskUpdateRequested.next(task);
  }

  getTaskUpdateRequests(): Observable<Task> {
    return this.taskUpdateRequested.asObservable();
  }

  requestTaskStatusUpdate(task: Task): void {
    this.taskStatusUpdateRequested.next(task);
  }

  getTaskStatusUpdateRequests(): Observable<Task> {
    return this.taskStatusUpdateRequested.asObservable();
  }
}
