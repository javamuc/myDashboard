jest.mock('app/core/auth/account.service');

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import HomeComponent from './home.component';
import { HomeService } from './home.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Home Component', () => {
  let comp: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAccountService: AccountService;
  let mockHomeService: jest.Mocked<HomeService>;
  let mockRouter: Router;

  const account: Account = {
    activated: true,
    authorities: [],
    email: '',
    firstName: null,
    langKey: '',
    lastName: null,
    login: 'login',
    imageUrl: null,
  };

  beforeEach(waitForAsync(() => {
    const homeServiceMock = {
      getActiveComponent: jest.fn().mockReturnValue(of('dashboard')),
      setActiveComponent: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [AccountService, { provide: HomeService, useValue: homeServiceMock }],
      schemas: [NO_ERRORS_SCHEMA], // Ignore child components for isolated testing
    })
      .overrideTemplate(HomeComponent, '')
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    comp = fixture.componentInstance;
    mockAccountService = TestBed.inject(AccountService);
    mockHomeService = TestBed.inject(HomeService) as jest.Mocked<HomeService>;
    mockRouter = TestBed.inject(Router);

    mockAccountService.identity = jest.fn(() => of(null));
    mockAccountService.getAuthenticationState = jest.fn(() => of(null));
    mockAccountService.isAuthenticated = jest.fn().mockReturnValue(false);

    jest.spyOn(mockRouter, 'navigate').mockImplementation(() => Promise.resolve(true));
  });

  describe('ngOnInit', () => {
    it('Should redirect to login page when user is not authenticated', () => {
      // GIVEN
      const authenticationState = new Subject<Account | null>();
      mockAccountService.getAuthenticationState = jest.fn(() => authenticationState.asObservable());

      // WHEN
      comp.ngOnInit();
      authenticationState.next(null);

      // THEN
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: {
          reason: 'unauthenticated',
          redirect: expect.any(String),
        },
      });
    });

    it('Should not redirect to login page when user is authenticated', () => {
      // GIVEN
      const authenticationState = new Subject<Account | null>();
      mockAccountService.getAuthenticationState = jest.fn(() => authenticationState.asObservable());

      // WHEN
      comp.ngOnInit();
      authenticationState.next(account);

      // THEN
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('Should synchronize activeComponent with HomeService', () => {
      // GIVEN
      const activeComponentSubject = new Subject<'board' | 'notes' | 'dashboard'>();
      mockHomeService.getActiveComponent = jest.fn(() => activeComponentSubject.asObservable());

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.activeComponent()).toBe('dashboard');

      // WHEN
      activeComponentSubject.next('board');

      // THEN
      expect(comp.activeComponent()).toBe('board');

      // WHEN
      activeComponentSubject.next('notes');

      // THEN
      expect(comp.activeComponent()).toBe('notes');
    });
  });

  describe('login', () => {
    it('Should navigate to /login on login', () => {
      // WHEN
      comp.login();

      // THEN
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('isAuthenticated', () => {
    it('Should return true when user is authenticated', () => {
      // GIVEN
      mockAccountService.isAuthenticated = jest.fn().mockReturnValue(true);

      // WHEN
      const result = comp.isAuthenticated();

      // THEN
      expect(result).toBe(true);
      expect(mockAccountService.isAuthenticated).toHaveBeenCalled();
    });

    it('Should return false when user is not authenticated', () => {
      // GIVEN
      mockAccountService.isAuthenticated = jest.fn().mockReturnValue(false);

      // WHEN
      const result = comp.isAuthenticated();

      // THEN
      expect(result).toBe(false);
      expect(mockAccountService.isAuthenticated).toHaveBeenCalled();
    });
  });

  describe('board signal', () => {
    it('Should initialize board with default values', () => {
      // THEN
      expect(comp.board()).toEqual({
        id: 1,
        title: 'My Board',
        tasks: [],
        createdDate: expect.any(String),
        lastModifiedDate: expect.any(String),
        toDoLimit: 5,
        progressLimit: 2,
        archived: false,
        autoPull: false,
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('Should destroy activeComponent subscription on component destroy', () => {
      // GIVEN
      const activeComponentSubject = new Subject<'board' | 'notes' | 'dashboard'>();
      mockHomeService.getActiveComponent = jest.fn(() => activeComponentSubject.asObservable());
      comp.ngOnInit();
      activeComponentSubject.next('board');

      // WHEN
      comp.ngOnDestroy();
      activeComponentSubject.next('notes');

      // THEN
      expect(comp.activeComponent()).toBe('board');
    });
  });
});
