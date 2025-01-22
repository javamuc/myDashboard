import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from 'app/shared/task/task.model';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly boardIdSubject = new BehaviorSubject<number | undefined>(undefined);
  private readonly taskCreatedSubject = new BehaviorSubject<EventEmitter<Task> | undefined>(undefined);
  private readonly taskDeletedSubject = new BehaviorSubject<EventEmitter<Task> | undefined>(undefined);
  private readonly isOpenSubject = new BehaviorSubject<boolean>(false);
  private readonly activeComponentSubject = new BehaviorSubject<'task' | 'note' | null>(null);
  private readonly taskDataSubject = new BehaviorSubject<Task | null>(null);

  getIsOpen(): Observable<boolean> {
    return this.isOpenSubject.asObservable();
  }

  setIsOpen(isOpen: boolean): void {
    console.warn('setIsOpen', isOpen);
    this.isOpenSubject.next(isOpen);
  }

  getActiveComponent(): Observable<'task' | 'note' | null> {
    return this.activeComponentSubject.asObservable();
  }

  setActiveComponent(component: 'task' | 'note' | null): void {
    console.warn('setActiveComponent', component);
    this.activeComponentSubject.next(component);
  }

  getTaskData(): Observable<Task | null> {
    return this.taskDataSubject.asObservable();
  }

  setTaskData(task: Task | null): void {
    this.taskDataSubject.next(task);
  }

  getBoardId(): Observable<number | undefined> {
    return this.boardIdSubject.asObservable();
  }

  setBoardId(boardId: number | undefined): void {
    this.boardIdSubject.next(boardId);
  }

  getTaskCreatedListener(): Observable<EventEmitter<Task> | undefined> {
    return this.taskCreatedSubject.asObservable();
  }

  setTaskCreatedListener(listener: EventEmitter<Task>): void {
    this.taskCreatedSubject.next(listener);
  }

  getTaskDeletedListener(): Observable<EventEmitter<Task> | undefined> {
    return this.taskDeletedSubject.asObservable();
  }

  setTaskDeletedListener(taskDeletedListener: EventEmitter<Task>): void {
    this.taskDeletedSubject.next(taskDeletedListener);
  }

  toggle(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }
}
