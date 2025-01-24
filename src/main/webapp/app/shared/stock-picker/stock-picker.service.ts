import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StockSearchResult {
  symbol: string;
  description: string;
  type: string;
}

export interface StockSymbol {
  currency: string;
  description: string;
  displaySymbol: string;
  figi: string;
  mic: string;
  symbol: string;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class StockPickerService {
  private readonly apiUrl = 'api/stocks'; // Backend endpoint

  constructor(private http: HttpClient) {}

  searchStocks(query: string, exchange: string | null): Observable<StockSearchResult[]> {
    return this.http.get<StockSearchResult[]>(
      `${this.apiUrl}/search?query=${encodeURIComponent(query)}&exchange=${exchange ? exchange : ''}`,
    );
  }

  getExchangeSymbols(exchange: string): Observable<StockSymbol[]> {
    return this.http.get<StockSymbol[]>(`${this.apiUrl}/symbols/${exchange}`);
  }

  getSavedStocks(): Observable<StockSearchResult[]> {
    return this.http.get<StockSearchResult[]>(`${this.apiUrl}/saved`);
  }

  addStock(stock: StockSearchResult): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/saved`, stock);
  }

  removeStock(symbol: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.apiUrl}/saved/${encodeURIComponent(symbol)}`);
  }
}
