import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { Board } from './board.model';

@Injectable({ providedIn: 'root' })
export class BoardService {
  private resourceUrl: string;

  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
  ) {
    this.resourceUrl = this.applicationConfigService.getEndpointFor('api/boards');
  }

  create(board: Board): Observable<Board> {
    return this.http.post<Board>(this.resourceUrl, board);
  }

  update(board: Board): Observable<Board> {
    return this.http.put<Board>(`${this.resourceUrl}/${board.id}`, board);
  }

  find(id: number): Observable<Board> {
    return this.http.get<Board>(`${this.resourceUrl}/${id}`);
  }

  query(): Observable<Board[]> {
    return this.http.get<Board[]>(this.resourceUrl);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.resourceUrl}/${id}`);
  }

  refreshCurrentBoard(boardId: number): Observable<Board> {
    return this.find(boardId).pipe(
      map(board => ({
        ...board,
        tasks: [],
      })),
    );
  }
}
