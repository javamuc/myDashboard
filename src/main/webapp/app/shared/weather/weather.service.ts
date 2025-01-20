import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';

export interface WeatherData {
  timestamp: string;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  condition: string;
  icon: string;
}

interface WeatherResponse {
  weather: WeatherItem[];
  sources: WeatherSource[];
}

interface WeatherItem {
  timestamp: string;
  source_id: number;
  precipitation: number;
  pressure_msl: number;
  sunshine: number;
  temperature: number;
  wind_direction: number;
  wind_speed: number;
  cloud_cover: number;
  dew_point: number;
  relative_humidity: number | null;
  visibility: number;
  wind_gust_direction: number | null;
  wind_gust_speed: number;
  condition: string;
  precipitation_probability: number | null;
  precipitation_probability_6h: number | null;
  solar: number;
  icon: string;
}

interface WeatherSource {
  id: number;
  dwd_station_id: string;
  observation_type: string;
  lat: number;
  lon: number;
  height: number;
  station_name: string;
  wmo_station_id: string;
  first_record: string;
  last_record: string;
  distance: number;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private baseUrl = 'https://api.brightsky.dev';
  private readonly MUNICH_LAT = 48.137154;
  private readonly MUNICH_LON = 11.576124;

  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
  ) {}

  getCurrentWeather(): Observable<WeatherData> {
    const today = new Date().toISOString().split('T')[0];
    return this.http.get<WeatherResponse>(`${this.baseUrl}/weather?lat=${this.MUNICH_LAT}&lon=${this.MUNICH_LON}&date=${today}`).pipe(
      map(response => {
        const currentWeather = response.weather[0]; // Get the most recent weather data
        return this.mapToWeatherData(currentWeather);
      }),
    );
  }

  getForecast(): Observable<WeatherData[]> {
    return this.http.get<WeatherResponse>(`${this.baseUrl}/forecast?lat=${this.MUNICH_LAT}&lon=${this.MUNICH_LON}`).pipe(
      map(response => {
        // Get one weather item per day at noon
        const dailyForecasts = response.weather.filter(item => item.timestamp.includes('T12:00:00'));
        return dailyForecasts.map(item => this.mapToWeatherData(item));
      }),
    );
  }

  private mapToWeatherData(data: WeatherItem): WeatherData {
    return {
      timestamp: data.timestamp,
      temperature: data.temperature,
      precipitation: data.precipitation,
      windSpeed: data.wind_speed,
      windDirection: data.wind_direction,
      condition: data.condition,
      icon: `fas fa-${this.getIconClass(data.icon.replace('-', ''))}`,
    };
  }

  private getIconClass(apiIcon: string): string {
    const iconMap: Record<string, string> = {
      clearday: 'sun',
      clearnight: 'moon',
      partlycloudyday: 'cloud-sun',
      partlycloudynight: 'cloud-moon',
      cloudy: 'cloud',
      fog: 'smog',
      wind: 'wind',
      rain: 'cloud-rain',
      sleet: 'cloud-sleet',
      snow: 'snowflake',
      thunder: 'bolt',
    };
    return iconMap[apiIcon] || 'question';
  }
}
