import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

interface Exchange {
  code: string;
  name: string;
  countryName: string;
}

@Component({
  selector: 'jhi-exchange-selection',
  templateUrl: './exchange-selection.component.html',
  styleUrls: ['./exchange-selection.component.scss'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
})
export class ExchangeSelectionComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;
  @Output() exchangeSelected = new EventEmitter<string>();

  exchanges: Exchange[] = [];
  filteredExchanges: Exchange[] = [];
  showDropdown = false;
  selectedIndex = -1;
  faExchangeAlt = faExchangeAlt;
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadExchanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
        this.setupSearchListener();
      }, 0);
    }
  }

  selectExchange(exchange: Exchange): void {
    this.exchangeSelected.emit(exchange.code);
    this.closeDropdown();
  }

  private loadExchanges(): void {
    this.http
      .get<Exchange[]>('/api/exchanges')
      .pipe(takeUntil(this.destroy$))
      .subscribe(exchanges => {
        this.exchanges = exchanges;
        this.filteredExchanges = exchanges;
      });
  }

  private setupSearchListener(): void {
    fromEvent<Event>(this.searchInput.nativeElement, 'input')
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((event: Event) => {
        const query = (event.target as HTMLInputElement).value.toLowerCase();
        this.filteredExchanges = this.exchanges.filter(
          exchange =>
            exchange.code.toLowerCase().includes(query) ||
            exchange.name.toLowerCase().includes(query) ||
            exchange.countryName.toLowerCase().includes(query),
        );
        this.selectedIndex = -1;
      });

    fromEvent<KeyboardEvent>(this.searchInput.nativeElement, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: KeyboardEvent) => {
        this.handleKeyboardNavigation(event);
      });
  }

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredExchanges.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0 || (this.filteredExchanges.length === 1 && this.selectedIndex === -1)) {
          const selectedExchange = this.filteredExchanges[this.selectedIndex >= 0 ? this.selectedIndex : 0];
          this.selectExchange(selectedExchange);
        }
        break;
      case 'Escape':
        this.closeDropdown();
        break;
    }
  }

  private closeDropdown(): void {
    this.showDropdown = false;
    this.filteredExchanges = this.exchanges;
    this.selectedIndex = -1;
    this.searchInput.nativeElement.value = '';
  }
}
