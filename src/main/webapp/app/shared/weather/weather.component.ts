import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { WeatherService, WeatherData } from './weather.service';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'jhi-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class WeatherComponent implements OnInit, OnDestroy {
  currentWeather = signal<WeatherData | undefined>(undefined);
  forecast = signal<WeatherData[]>([]);
  private subscription?: Subscription;

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    // Initial load
    // this.loadWeatherData();

    // Set up auto-refresh every 5 minutes
    this.subscription = timer(0, 300000).subscribe(() => this.loadWeatherData());
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getWindDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  private loadWeatherData(): void {
    this.weatherService.getCurrentWeather().subscribe(data => {
      return this.currentWeather.set(data);
    });
    this.weatherService.getForecast().subscribe(data => {
      return this.forecast.set(data);
    });
  }
}
