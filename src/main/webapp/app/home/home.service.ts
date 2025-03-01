import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type HomeComponent = 'board' | 'notes' | 'dashboard' | 'diary';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly activeComponentSubject = new BehaviorSubject<HomeComponent>('dashboard');

  getActiveComponent(): Observable<HomeComponent> {
    return this.activeComponentSubject.asObservable();
  }

  setActiveComponent(component: HomeComponent): void {
    this.activeComponentSubject.next(component);
  }
}
