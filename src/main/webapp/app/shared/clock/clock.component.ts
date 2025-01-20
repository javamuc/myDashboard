import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'jhi-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ClockComponent implements OnInit, OnDestroy {
  currentTime: Date = new Date();
  private timer: any;

  ngOnInit(): void {
    // Update time immediately
    this.updateTime();
    // Set up timer to update every minute
    this.timer = setInterval(() => this.updateTime(), 6000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private updateTime(): void {
    this.currentTime = new Date();
  }
}
