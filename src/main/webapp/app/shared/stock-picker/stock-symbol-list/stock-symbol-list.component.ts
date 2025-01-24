import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StockSymbol {
  currency: string;
  description: string;
  displaySymbol: string;
  figi: string;
  mic: string;
  symbol: string;
  type: string;
}

@Component({
  selector: 'jhi-stock-symbol-list',
  templateUrl: './stock-symbol-list.component.html',
  styleUrls: ['./stock-symbol-list.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class StockSymbolListComponent {
  @Input() symbols: StockSymbol[] = [];
  @Output() symbolSelected = new EventEmitter<StockSymbol>();

  selectSymbol(symbol: StockSymbol): void {
    this.symbolSelected.emit(symbol);
  }
}
