import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { ClockComponent } from '../shared/clock/clock.component';
import { NotesComponent } from '../notes/notes.component';
import { WeatherComponent } from 'app/shared/weather/weather.component';
import { BoardComponent } from 'app/shared/board/board.component';
import { Board } from 'app/shared/board/board.model';
import { LoginService } from 'app/login/login.service';
import { HomeService, type HomeComponent as HomeComponentType } from './home.service';
import { TaskComponent } from '../shared/task/task.component';
import { PomodoroComponent } from '../shared/pomodoro/pomodoro.component';
import StockPickerComponent from '../shared/shared.module';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    SharedModule,
    RouterModule,
    ClockComponent,
    NotesComponent,
    WeatherComponent,
    BoardComponent,
    TaskComponent,
    PomodoroComponent,
    StockPickerComponent,
  ],
})
export default class HomeComponent implements OnInit, OnDestroy {
  account = inject(AccountService).trackCurrentAccount();
  board = signal<Board>({
    id: 1,
    title: 'My Board',
    tasks: [],
    createdDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
  });
  activeComponent = signal<HomeComponentType>('board');

  private readonly destroy$ = new Subject<void>();

  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);
  private readonly homeService = inject(HomeService);

  ngOnInit(): void {
    this.homeService
      .getActiveComponent()
      .pipe(takeUntil(this.destroy$))
      .subscribe(component => {
        this.activeComponent.set(component);
      });
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
