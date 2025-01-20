import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { format, addDays } from 'date-fns';

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

interface CurrentWeatherResponse {
  weather: WeatherItem;
  sources: WeatherSource[];
}

interface WeatherItem {
  timestamp: string;
  source_id: number;
  precipitation_30: number;
  pressure_msl: number;
  sunshine: number;
  temperature: number;
  wind_direction_30: number;
  wind_speed_30: number;
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
    return this.http.get<CurrentWeatherResponse>(`${this.baseUrl}/current_weather?lat=${this.MUNICH_LAT}&lon=${this.MUNICH_LON}`).pipe(
      map(response => ({
        timestamp: response.weather.timestamp,
        temperature: response.weather.temperature,
        precipitation: response.weather.precipitation_30,
        windSpeed: response.weather.wind_speed_30,
        windDirection: response.weather.wind_direction_30,
        condition: response.weather.condition,
        icon: `fas fa-${this.getIconClass(response.weather.icon.replace('-', ''))}`,
      })),
    );
  }

  getForecast(): Observable<WeatherData[]> {
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentHour = new Date().getHours();

    return this.http.get<WeatherResponse>(`${this.baseUrl}/weather?lat=${this.MUNICH_LAT}&lon=${this.MUNICH_LON}&date=${today}`).pipe(
      map(response => {
        // Get current hour
        // Filter to get next 5 hours from now
        const nextHours = response.weather
          .filter(item => {
            const itemHour = new Date(item.timestamp).getHours();
            const itemDate = format(new Date(item.timestamp).toDateString(), 'yyyy-MM-dd');
            console.warn('itemDate', itemDate);
            console.warn('itemHour', itemHour);
            console.warn('currentHour', currentHour);
            // Include items that are either from today with hours > currentHour
            // or from tomorrow with hours that complete our 5-hour window
            return (itemDate === today && itemHour > currentHour) || (itemDate !== today && itemHour <= (currentHour + 5) % 24);
          })
          .slice(0, 5); // Take only the first 5 items

        return nextHours.map(item => this.mapToWeatherData(item));
      }),
    );
  }

  private mapToWeatherData(data: WeatherItem): WeatherData {
    return {
      timestamp: data.timestamp,
      temperature: data.temperature,
      precipitation: data.precipitation_30,
      windSpeed: data.wind_speed_30,
      windDirection: data.wind_direction_30,
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
