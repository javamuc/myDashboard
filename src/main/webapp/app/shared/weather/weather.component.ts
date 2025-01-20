import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService, WeatherData } from './weather.service';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'jhi-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class WeatherComponent implements OnInit, OnDestroy {
  currentWeather = signal<WeatherData | null>(null);
  forecast = signal<WeatherData[]>([]);
  private destroy$ = new Subject<void>();

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.loadWeatherData();
    // Update weather data every 30 minutes
    interval(30 * 60 * 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadWeatherData());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getWindDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  private loadWeatherData(): void {
    this.weatherService
      .getCurrentWeather()
      .pipe(takeUntil(this.destroy$))
      .subscribe(weather => this.currentWeather.set(weather));

    this.weatherService
      .getForecast()
      .pipe(takeUntil(this.destroy$))
      .subscribe(forecast => this.forecast.set(forecast));
  }
}
