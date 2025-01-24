import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { StockPickerService, StockSearchResult } from './stock-picker.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ExchangeSelectionComponent } from './exchange-selection/exchange-selection.component';
import { StockSymbolListComponent } from './stock-symbol-list/stock-symbol-list.component';

@Component({
  selector: 'jhi-stock-picker',
  templateUrl: './stock-picker.component.html',
  styleUrls: ['./stock-picker.component.scss'],
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, ExchangeSelectionComponent, StockSymbolListComponent],
})
export class StockPickerComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;

  searchResults: StockSearchResult[] = [];
  selectedStocks: StockSearchResult[] = [];
  exchangeSymbols: any[] = [];
  filteredSymbols: any[] = [];
  isLoading = false;
  showDropdown = false;
  selectedIndex = -1;
  faTimesCircle = faTimesCircle;
  selectedExchange: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private stockPickerService: StockPickerService) {}

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.stock-picker-container')) {
      this.closeDropdown();
    }
  }

  ngOnInit(): void {
    this.loadSavedStocks();
    setTimeout(() => this.setupSearchListener(), 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectStock(stock: StockSearchResult): void {
    if (!this.selectedStocks.find(s => s.symbol === stock.symbol)) {
      this.stockPickerService
        .addStock(stock)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.selectedStocks.push(stock);
            this.closeDropdown();
            this.searchInput.nativeElement.value = '';
          },
        });
    }
  }

  removeStock(stock: StockSearchResult): void {
    this.stockPickerService
      .removeStock(stock.symbol)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.selectedStocks = this.selectedStocks.filter(s => s.symbol !== stock.symbol);
        },
      });
  }

  onExchangeSelected(exchangeCode: string): void {
    this.selectedExchange = exchangeCode;
    this.loadExchangeSymbols(exchangeCode);
    if (this.searchInput.nativeElement.value) {
      this.filterSymbols();
    }
  }

  onSymbolSelected(symbol: any): void {
    const stockResult: StockSearchResult = {
      symbol: symbol.symbol,
      description: symbol.description,
      type: symbol.type,
    };
    this.selectStock(stockResult);
  }

  private loadSavedStocks(): void {
    this.stockPickerService
      .getSavedStocks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stocks: StockSearchResult[]) => {
          this.selectedStocks = stocks;
        },
      });
  }

  private closeDropdown(): void {
    this.showDropdown = false;
    this.searchResults = [];
    this.selectedIndex = -1;
  }

  private setupSearchListener(): void {
    fromEvent<Event>(this.searchInput.nativeElement, 'input')
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.filterSymbols();
      });

    // fromEvent<KeyboardEvent>(this.searchInput.nativeElement, 'keydown')
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((event: KeyboardEvent) => {
    //     this.handleKeyboardNavigation(event);
    //   });
  }

  private filterSymbols(): void {
    const query = (this.searchInput.nativeElement.value as string).toLowerCase();
    this.filteredSymbols = this.exchangeSymbols.filter(
      symbol =>
        symbol.symbol.toLowerCase().includes(query) ||
        symbol.description.toLowerCase().includes(query) ||
        symbol.displaySymbol.toLowerCase().includes(query),
    );
  }

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.searchResults.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0 || (this.searchResults.length === 1 && this.selectedIndex === -1)) {
          const selectedStock = this.searchResults[this.selectedIndex >= 0 ? this.selectedIndex : 0];
          this.selectStock(selectedStock);
        }
        break;
      case 'Escape':
        this.closeDropdown();
        break;
    }
  }

  private loadExchangeSymbols(exchange: string): void {
    this.isLoading = true;
    this.stockPickerService
      .getExchangeSymbols(exchange)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: symbols => {
          this.exchangeSymbols = symbols;
          this.filteredSymbols = symbols;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }
}
