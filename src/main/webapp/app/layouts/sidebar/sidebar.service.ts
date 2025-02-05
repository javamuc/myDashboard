import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Task, TaskStatus } from 'app/shared/task/task.model';
import { AlertService } from 'app/core/util/alert.service';
import { Board } from 'app/shared/board/board.model';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly boardIdSubject = new BehaviorSubject<number | undefined>(undefined);
  private readonly isOpenSubject = new BehaviorSubject<boolean>(false);
  private readonly taskDataSubject = new BehaviorSubject<Task | undefined>(undefined);
  private readonly tagsSubject = new BehaviorSubject<Set<string>>(new Set<string>());
  private readonly activeBoardSubject = new BehaviorSubject<Board | undefined>(undefined);
  private readonly tagFilterSubject = new BehaviorSubject<string | undefined>(undefined);

  private taskDeleteRequested = new Subject<Task>();
  private taskUpdateRequested = new Subject<Task>();
  private taskStatusUpdateRequested = new Subject<Task>();

  constructor(private alertService: AlertService) {}

  getIsOpen(): Observable<boolean> {
    return this.isOpenSubject.asObservable();
  }

  setIsOpen(isOpen: boolean): void {
    this.isOpenSubject.next(isOpen);
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

  setActiveBoard(board: Board | undefined): void {
    this.activeBoardSubject.next(board);
  }

  getActiveBoard(): Observable<Board | undefined> {
    return this.activeBoardSubject.asObservable();
  }

  getActiveBoardValue(): Board | undefined {
    return this.activeBoardSubject.getValue();
  }

  changeTaskStatus(task: Task, newStatus: TaskStatus): void {
    const board = this.getActiveBoardValue();
    if (!board) {
      this.alertService.addAlert({
        type: 'warning',
        message: 'No active board found',
      });
      return;
    }

    const updatedTask: Task = {
      ...task,
      status: newStatus,
      lastModifiedDate: new Date().toISOString(),
    };
    this.taskStatusUpdateRequested.next(updatedTask);
  }

  addTagFilter(tag: string): void {
    this.tagFilterSubject.next(tag);
  }

  getTagFilter(): Observable<string | undefined> {
    return this.tagFilterSubject.asObservable();
  }

  clearTagFilter(): void {
    this.tagFilterSubject.next(undefined);
  }
}
