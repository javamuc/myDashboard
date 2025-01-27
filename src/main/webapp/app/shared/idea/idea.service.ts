import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Idea, NewIdea } from './idea.model';
import { ApplicationConfigService } from 'app/core/config/application-config.service';

@Injectable({ providedIn: 'root' })
export class IdeaService {
  private resourceUrl: string;

  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
  ) {
    this.resourceUrl = this.applicationConfigService.getEndpointFor('api/ideas');
  }

  create(idea: NewIdea): Observable<Idea> {
    return this.http.post<Idea>(this.resourceUrl, idea);
  }

  update(idea: Idea): Observable<Idea> {
    return this.http.put<Idea>(`${this.resourceUrl}/${idea.id}`, idea);
  }

  find(id: number): Observable<Idea> {
    return this.http.get<Idea>(`${this.resourceUrl}/${id}`);
  }

  query(): Observable<Idea[]> {
    return this.http.get<Idea[]>(this.resourceUrl);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.resourceUrl}/${id}`);
  }
}
