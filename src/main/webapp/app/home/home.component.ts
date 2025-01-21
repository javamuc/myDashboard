import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { ClockComponent } from '../shared/clock/clock.component';
import { NotesComponent } from '../notes/notes.component';
import { WeatherComponent } from 'app/shared/weather/weather.component';
import { BoardComponent } from 'app/shared/board/board.component';
import { Board } from 'app/shared/board/board.model';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [SharedModule, RouterModule, ClockComponent, NotesComponent, WeatherComponent, BoardComponent],
})
export default class HomeComponent implements OnInit, OnDestroy {
  account = signal<Account | null>(null);
  board = signal<Board>({
    id: 1,
    title: 'My Board',
    tasks: [],
    createdDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
  });

  private readonly destroy$ = new Subject<void>();

  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => this.account.set(account));
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
