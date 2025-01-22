import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'jhi-pomodoro',
  templateUrl: './pomodoro.component.html',
  styleUrls: ['./pomodoro.component.scss'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
})
export class PomodoroComponent implements OnDestroy {
  readonly WORK_TIME = 25 * 60; // 25 minutes in seconds
  timeLeft = this.WORK_TIME;
  isRunning = false;
  private timer: any;

  startTimer(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.resetTimer();
        }
      }, 1000);
    }
  }

  resetTimer(): void {
    this.isRunning = false;
    clearInterval(this.timer);
    this.timeLeft = this.WORK_TIME;
  }

  formatTime(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
