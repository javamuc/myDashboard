import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from 'app/shared/task/task.model';

@Injectable({ providedIn: 'root' })
export class SidebarService {
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
    this.activeComponentSubject.next(component);
  }

  getTaskData(): Observable<Task | null> {
    return this.taskDataSubject.asObservable();
  }

  setTaskData(task: Task | null): void {
    this.taskDataSubject.next(task);
  }

  toggle(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }
}
