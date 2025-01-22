import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type HomeComponent = 'task' | 'board' | 'notes';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly activeComponentSubject = new BehaviorSubject<HomeComponent>('board');

  getActiveComponent(): Observable<HomeComponent> {
    return this.activeComponentSubject.asObservable();
  }

  setActiveComponent(component: HomeComponent): void {
    this.activeComponentSubject.next(component);
  }
}
