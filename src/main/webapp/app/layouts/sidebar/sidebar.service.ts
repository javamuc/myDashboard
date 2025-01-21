import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly isOpenSubject = new BehaviorSubject<boolean>(false);
  private readonly activeComponentSubject = new BehaviorSubject<'task' | 'note' | null>(null);

  getIsOpen(): Observable<boolean> {
    return this.isOpenSubject.asObservable();
  }

  getActiveComponent(): Observable<'task' | 'note' | null> {
    return this.activeComponentSubject.asObservable();
  }

  setIsOpen(isOpen: boolean): void {
    this.isOpenSubject.next(isOpen);
  }

  setActiveComponent(component: 'task' | 'note' | null): void {
    this.activeComponentSubject.next(component);
  }

  toggle(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }
}
