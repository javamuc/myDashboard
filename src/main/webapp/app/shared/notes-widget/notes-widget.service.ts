import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { NoteSummary } from './note-summary.model';

@Injectable({ providedIn: 'root' })
export class NotesWidgetService {
  private resourceUrl: string;

  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
  ) {
    this.resourceUrl = this.applicationConfigService.getEndpointFor('api/notes/summary');
  }

  /**
   * Get the top 5 most recently modified notes
   * @returns Observable of NoteSummary array
   */
  getRecentNotes(): Observable<NoteSummary[]> {
    return this.http.get<any[]>(`${this.resourceUrl}?sort=lastModifiedDate,desc&size=5`).pipe(
      map(notes =>
        notes.map(note => ({
          id: note.id,
          title: note.title,
          lastModifiedDate: note.lastModifiedDate,
        })),
      ),
    );
  }
}
