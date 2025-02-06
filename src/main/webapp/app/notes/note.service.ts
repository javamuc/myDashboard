import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { NewNote, Note } from './note.model';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private resourceUrl: string;

  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
  ) {
    this.resourceUrl = this.applicationConfigService.getEndpointFor('api/notes');
  }

  create(note: NewNote): Observable<Note> {
    return this.http.post<Note>(this.resourceUrl, note).pipe(map(n => this.convertDateFromServer(n)));
  }

  update(note: Note): Observable<Note> {
    return this.http.put<Note>(`${this.resourceUrl}/${note.id}`, note).pipe(map(n => this.convertDateFromServer(n)));
  }

  find(id: number): Observable<Note> {
    return this.http.get<Note>(`${this.resourceUrl}/${id}`).pipe(map(n => this.convertDateFromServer(n)));
  }

  query(): Observable<Note[]> {
    return this.http.get<Note[]>(this.resourceUrl).pipe(map(notes => notes.map(n => this.convertDateFromServer(n))));
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.resourceUrl}/${id}`);
  }

  private convertDateFromServer(note: Note): Note {
    return {
      ...note,
      lastModifiedDate: note.lastModifiedDate,
      createdDate: note.createdDate,
    };
  }
}
