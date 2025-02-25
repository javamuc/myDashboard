import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PomodoroComponent } from './pomodoro.component';
import { FaviconService } from '../favicon/favicon.service';

describe('PomodoroComponent', () => {
  let component: PomodoroComponent;
  let fixture: ComponentFixture<PomodoroComponent>;
  let faviconService: jest.Mocked<FaviconService>;

  beforeEach(async () => {
    const mockFaviconService = {
      setFocusMode: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PomodoroComponent],
      providers: [{ provide: FaviconService, useValue: mockFaviconService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PomodoroComponent);
    component = fixture.componentInstance;
    faviconService = TestBed.inject(FaviconService) as jest.Mocked<FaviconService>;
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

  it('should start the timer when startTimer is called', fakeAsync(() => {
    component.startTimer();
    expect(component.isRunning).toBe(true);
    expect(faviconService.setFocusMode).toHaveBeenCalledWith(true);

    // Fast-forward time
    tick(1000);
    expect(component.timeLeft).toBe(component.WORK_TIME - 1);

    // Clean up timer to avoid test pollution
    component.resetTimer();
  }));

  it('should reset the timer when resetTimer is called', () => {
    component.startTimer();
    component.resetTimer();

    expect(component.isRunning).toBe(false);
    expect(component.timeLeft).toBe(component.WORK_TIME);
    expect(faviconService.setFocusMode).toHaveBeenCalledWith(false);
  });

  it('should format time correctly', () => {
    component.timeLeft = 65; // 1 minute and 5 seconds
    expect(component.formatTime()).toBe('01:05');

    component.timeLeft = 3600; // 60 minutes
    expect(component.formatTime()).toBe('60:00');
  });

  it('should clean up on destroy', () => {
    component.startTimer();
    component.ngOnDestroy();

    expect(faviconService.setFocusMode).toHaveBeenCalledWith(false);
  });
});
