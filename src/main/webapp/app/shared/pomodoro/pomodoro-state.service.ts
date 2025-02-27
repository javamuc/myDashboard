import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PomodoroStateService {
  // Observable that components can subscribe to
  public timerActiveSubject = new BehaviorSubject<boolean>(false);
  public timerActive$: Observable<boolean> = this.timerActiveSubject.asObservable();

  // Methods to control timer state
  startTimer(): void {
    this.timerActiveSubject.next(true);
  }

  stopTimer(): void {
    this.timerActiveSubject.next(false);
  }

  // Get current state without subscribing
  isTimerActive(): boolean {
    return this.timerActiveSubject.getValue();
  }
}
