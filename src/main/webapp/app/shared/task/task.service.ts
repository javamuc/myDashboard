import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { Task } from './task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private resourceUrl: string;

  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
  ) {
    this.resourceUrl = this.applicationConfigService.getEndpointFor('api/tasks');
  }

  create(task: Task): Observable<Task> {
    return this.http.post<Task>(this.resourceUrl, task);
  }

  update(task: Task): Observable<Task> {
    return this.http.put<Task>(this.resourceUrl, task);
  }

  find(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.resourceUrl}/${id}`);
  }

  getBoardTasks(boardId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.applicationConfigService.getEndpointFor('api/boards')}/${boardId}/tasks`);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.resourceUrl}/${id}`);
  }
}
