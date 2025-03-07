import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import SharedModule from 'app/shared/shared.module';

@Component({
  selector: 'jhi-account-locked',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, SharedModule],
  templateUrl: './account-locked.component.html',
  styleUrls: ['./account-locked.component.scss'],
})
export class AccountLockedComponent implements OnInit, OnDestroy {
  remainingTime = 0;
  totalLockTime = 15 * 60; // 15 minutes in seconds
  timerSubscription?: Subscription;
  formattedTime = '15:00';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Get the lock duration from the error message or use default 15 minutes
    const lockDuration = localStorage.getItem('accountLockDuration');
    if (lockDuration) {
      this.totalLockTime = parseInt(lockDuration, 10);
    }
    this.remainingTime = this.totalLockTime;

    // Start the countdown timer
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  startTimer(): void {
    this.timerSubscription = interval(1000)
      .pipe(takeWhile(() => this.remainingTime > 0))
      .subscribe(() => {
        this.remainingTime--;
        this.formattedTime = this.formatTime(this.remainingTime);

        // When timer reaches zero, redirect to login page
        if (this.remainingTime === 0) {
          localStorage.removeItem('accountLockDuration');
          this.router.navigate(['/login']);
        }
      });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // For testing purposes - allows skipping the wait
  skipWait(): void {
    this.remainingTime = 0;
    localStorage.removeItem('accountLockDuration');
    this.router.navigate(['/login']);
  }
}
