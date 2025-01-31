import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { Habit, HabitDaySchedule, HabitSpecificTime, HabitRecord } from './habit.model';

@Injectable({ providedIn: 'root' })
export class HabitService {
  private resourceUrl: string;
  private habitRecordUrl: string;

  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
  ) {
    this.resourceUrl = this.applicationConfigService.getEndpointFor('api/habits');
    this.habitRecordUrl = this.applicationConfigService.getEndpointFor('api/habit-records');
  }

  create(habit: Habit): Observable<Habit> {
    const copy = this.convertDateToServer(habit);
    return this.http.post<Habit>(this.resourceUrl, copy).pipe(map(response => this.convertDateFromServer(response)));
  }

  update(habit: Habit): Observable<Habit> {
    const copy = this.convertDateToServer(habit);
    return this.http.put<Habit>(`${this.resourceUrl}/${habit.id}`, copy).pipe(map(response => this.convertDateFromServer(response)));
  }

  find(id: number): Observable<Habit> {
    return this.http.get<Habit>(`${this.resourceUrl}/${id}`).pipe(map(response => this.convertDateFromServer(response)));
  }

  query(): Observable<Habit[]> {
    return this.http.get<Habit[]>(this.resourceUrl).pipe(map(response => response.map(item => this.convertDateFromServer(item))));
  }

  queryActive(): Observable<Habit[]> {
    return this.http
      .get<Habit[]>(`${this.resourceUrl}/active`)
      .pipe(map(response => response.map(item => this.convertDateFromServer(item))));
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.resourceUrl}/${id}`);
  }

  // Habit Record methods
  createRecord(habitId: number): Observable<HabitRecord> {
    const record: HabitRecord = {
      habitId,
      recordDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    };
    return this.http.post<HabitRecord>(this.habitRecordUrl, record);
  }

  getHabitRecords(date: string): Observable<HabitRecord[]> {
    return this.http.get<HabitRecord[]>(`${this.habitRecordUrl}/date/${date}`);
  }

  private convertDateFromServer(habit: Habit): Habit {
    return {
      ...habit,
      daySchedules: habit.daySchedules.map(schedule => ({
        ...schedule,
        specificTimes: schedule.specificTimes.map(time => ({ ...time }) as HabitSpecificTime),
      })),
      createdDate: habit.createdDate ? new Date(habit.createdDate).toISOString() : undefined,
      lastModifiedDate: habit.lastModifiedDate ? new Date(habit.lastModifiedDate).toISOString() : undefined,
    };
  }

  private convertDateToServer(habit: Habit): Habit {
    return {
      ...habit,
      daySchedules: habit.daySchedules.map(schedule => ({
        ...schedule,
        specificTimes: schedule.specificTimes.map(time => ({ ...time }) as HabitSpecificTime),
      })),
      createdDate: habit.createdDate ?? undefined,
      lastModifiedDate: habit.lastModifiedDate ?? undefined,
    };
  }
}
