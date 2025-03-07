import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PomodoroComponent } from './pomodoro.component';
import { FaviconService } from '../favicon/favicon.service';
import { PomodoroStateService } from './pomodoro-state.service';
import { BehaviorSubject } from 'rxjs';
import { PomodoroProfile, PomodoroSettings, TimerType } from './pomodoro.model';
import { signal } from '@angular/core';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCog, faSync, faQuestionCircle, faEdit } from '@fortawesome/free-solid-svg-icons';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PomodoroComponent', () => {
  let component: PomodoroComponent;
  let fixture: ComponentFixture<PomodoroComponent>;
  let faviconService: jest.Mocked<FaviconService>;
  let pomodoroStateService: jest.Mocked<PomodoroStateService>;
  let library: FaIconLibrary;

  // Mock data
  const mockSettings: PomodoroSettings = {
    workTime: 1500, // 25 minutes
    breakTime: 300, // 5 minutes
    repeatEnabled: false,
    repeatCount: 0,
  };

  const mockProfiles: PomodoroProfile[] = [
    { id: 1, name: 'Test Profile', workTime: 1500, breakTime: 300, repeatEnabled: false, repeatCount: 0 },
  ];

  beforeEach(async () => {
    const mockFaviconService = {
      setFocusMode: jest.fn(),
    };

    const mockPomodoroStateService = {
      getSettings: jest.fn().mockReturnValue(mockSettings),
      getProfiles: jest.fn().mockReturnValue(mockProfiles),
      startTimer: jest.fn(),
      stopTimer: jest.fn(),
      setTimerType: jest.fn(),
      applyProfile: jest.fn(),
      settings$: new BehaviorSubject<PomodoroSettings>(mockSettings),
      profiles$: new BehaviorSubject<PomodoroProfile[]>(mockProfiles),
      timerType$: new BehaviorSubject<TimerType>(TimerType.WORK),
    };

    await TestBed.configureTestingModule({
      imports: [PomodoroComponent, FontAwesomeModule],
      providers: [
        { provide: FaviconService, useValue: mockFaviconService },
        { provide: PomodoroStateService, useValue: mockPomodoroStateService },
      ],
      schemas: [NO_ERRORS_SCHEMA], // Ignore unknown elements and attributes
    }).compileComponents();

    fixture = TestBed.createComponent(PomodoroComponent);
    component = fixture.componentInstance;
    faviconService = TestBed.inject(FaviconService) as jest.Mocked<FaviconService>;
    pomodoroStateService = TestBed.inject(PomodoroStateService) as jest.Mocked<PomodoroStateService>;

    // Add FontAwesome icons
    library = TestBed.inject(FaIconLibrary);
    library.addIcons(faCog, faSync, faQuestionCircle, faEdit);

    fixture.detectChanges();
  });

  afterEach(() => {
    // Make sure timer is reset
    component.resetTimer();
    // Call ngOnDestroy explicitly to clean up resources
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with settings from PomodoroStateService', () => {
    expect(component.timeLeft).toBe(mockSettings.workTime);
    expect(component.breakTimeLeft).toBe(mockSettings.breakTime);
    expect(component.repeatEnabled).toBe(mockSettings.repeatEnabled);
    expect(component.repeatCount).toBe(mockSettings.repeatCount);
    expect(component.profiles).toEqual(mockProfiles);
  });

  it('should start the timer when startTimer is called', fakeAsync(() => {
    component.startTimer();
    expect(component.isRunning).toBe(true);
    expect(faviconService.setFocusMode).toHaveBeenCalledWith(true);
    expect(pomodoroStateService.startTimer).toHaveBeenCalled();

    // Fast-forward time
    tick(1000);
    expect(component.timeLeft).toBe(mockSettings.workTime - 1);

    // Clean up timer to avoid test pollution
    component.resetTimer();
  }));

  it('should reset the timer when resetTimer is called', () => {
    component.startTimer();
    component.resetTimer();

    expect(component.isRunning).toBe(false);
    expect(component.timeLeft).toBe(mockSettings.workTime);
    expect(component.timerType).toBe(TimerType.WORK);
    expect(component.cyclesCompleted).toBe(0);
    expect(faviconService.setFocusMode).toHaveBeenCalledWith(false);
    expect(pomodoroStateService.stopTimer).toHaveBeenCalled();
    expect(pomodoroStateService.setTimerType).toHaveBeenCalledWith(TimerType.WORK);
  });

  it('should handle work timer completion correctly', () => {
    // Set up for work timer completion
    component.timeLeft = 0;
    component.repeatEnabled = true;

    component.handleWorkTimerComplete();

    expect(component.timerType).toBe(TimerType.BREAK);
    expect(pomodoroStateService.setTimerType).toHaveBeenCalledWith(TimerType.BREAK);
    expect(component.breakTimeLeft).toBe(mockSettings.breakTime);
  });

  it('should handle break timer completion correctly', () => {
    // Set up for break timer completion
    component.breakTimeLeft = 0;
    component.timerType = TimerType.BREAK;

    component.handleBreakTimerComplete();

    expect(component.cyclesCompleted).toBe(1);
    expect(component.timerType).toBe(TimerType.WORK);
    expect(pomodoroStateService.setTimerType).toHaveBeenCalledWith(TimerType.WORK);
    expect(component.timeLeft).toBe(mockSettings.workTime);
  });

  it('should reset timer after completing all cycles', () => {
    // Set up for break timer completion with all cycles completed
    component.breakTimeLeft = 0;
    component.timerType = TimerType.BREAK;
    component.repeatCount = 2;
    component.cyclesCompleted = 1; // This will become 2 after handleBreakTimerComplete

    component.handleBreakTimerComplete();

    expect(component.isRunning).toBe(false);
    expect(component.timeLeft).toBe(mockSettings.workTime);
    expect(component.timerType).toBe(TimerType.WORK);
    expect(component.cyclesCompleted).toBe(0);
  });

  it('should format time correctly', () => {
    expect(component.formatTime(65)).toBe('01:05'); // 1 minute and 5 seconds
    expect(component.formatTime(3600)).toBe('60:00'); // 60 minutes
  });

  it('should toggle settings', () => {
    expect(component.isFlipped()).toBe(false);
    component.toggleSettings();
    expect(component.isFlipped()).toBe(true);
    component.toggleSettings();
    expect(component.isFlipped()).toBe(false);
  });

  it('should handle flip back', () => {
    component.isFlipped.set(true);
    component.handleFlipBack(true);
    expect(component.isFlipped()).toBe(false);
  });

  it('should select profile', () => {
    component.selectProfile(1);
    expect(pomodoroStateService.applyProfile).toHaveBeenCalledWith(1);
  });

  it('should get active profile name', () => {
    component.activeProfile = mockProfiles[0];
    expect(component.getActiveProfileName()).toBe('Test Profile');

    component.activeProfile = null;
    expect(component.getActiveProfileName()).toBe('Profiles');
  });

  it('should get timer background class', () => {
    component.isRunning = false;
    expect(component.getTimerBackgroundClass()).toBe('');

    component.isRunning = true;
    component.timerType = TimerType.WORK;
    expect(component.getTimerBackgroundClass()).toBe('work-active');

    component.timerType = TimerType.BREAK;
    expect(component.getTimerBackgroundClass()).toBe('break-active');
  });

  it('should clean up on destroy', () => {
    component.startTimer();
    component.ngOnDestroy();

    expect(faviconService.setFocusMode).toHaveBeenCalledWith(false);
    expect(pomodoroStateService.stopTimer).toHaveBeenCalled();
  });
});
