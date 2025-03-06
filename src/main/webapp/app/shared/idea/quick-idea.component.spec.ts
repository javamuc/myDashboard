import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QuickIdeaComponent } from './quick-idea.component';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { By } from '@angular/platform-browser';
import { IdeaService } from './idea.service';
import { of } from 'rxjs';
import { NewIdea } from './idea.model';
import { ElementRef } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';

describe('QuickIdeaComponent', () => {
  let component: QuickIdeaComponent;
  let fixture: ComponentFixture<QuickIdeaComponent>;
  let ideaService: IdeaService;

  const mockIdea = {
    id: 1,
    content: 'Test idea content',
    createdDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
  };

  beforeEach(async () => {
    const mockIdeaService = {
      create: jest.fn().mockReturnValue(of(mockIdea)),
    };

    await TestBed.configureTestingModule({
      imports: [QuickIdeaComponent, FormsModule, FontAwesomeModule],
      providers: [{ provide: IdeaService, useValue: mockIdeaService }],
    }).compileComponents();

    const library = TestBed.inject(FaIconLibrary);
    library.addIcons(faLightbulb);

    ideaService = TestBed.inject(IdeaService);
    fixture = TestBed.createComponent(QuickIdeaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with closed overlay', () => {
    expect(component.isOpen()).toBe(false);
    const overlay = fixture.debugElement.query(By.css('.idea-overlay'));
    expect(overlay).toBeNull();
  });

  it('should toggle overlay when button is clicked', () => {
    // Click to open
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', {
      stopPropagation() {},
    });
    fixture.detectChanges();

    expect(component.isOpen()).toBe(true);
    let overlay = fixture.debugElement.query(By.css('.idea-overlay'));
    expect(overlay).not.toBeNull();

    // Click to close
    button.triggerEventHandler('click', {
      stopPropagation() {},
    });
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
    overlay = fixture.debugElement.query(By.css('.idea-overlay'));
    expect(overlay).toBeNull();
  });

  it('should close overlay when clicking outside the content', () => {
    // Open the overlay
    component.toggleOverlay({
      stopPropagation() {},
    } as unknown as Event);
    fixture.detectChanges();

    // Click on the overlay (outside the content)
    const overlay = fixture.debugElement.query(By.css('.idea-overlay'));
    overlay.triggerEventHandler('click', {
      stopPropagation() {},
    });
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });

  it('should not close overlay when clicking inside the content', () => {
    // Open the overlay
    component.toggleOverlay({
      stopPropagation() {},
    } as unknown as Event);
    fixture.detectChanges();

    // The content has stopPropagation, so clicking it shouldn't trigger overlay's click handler
    const content = fixture.debugElement.query(By.css('.idea-content'));
    content.triggerEventHandler('click', {
      stopPropagation() {},
    });
    fixture.detectChanges();

    expect(component.isOpen()).toBe(true);
  });

  it('should focus the textarea when overlay is opened', fakeAsync(() => {
    // Mock the textarea element and its focus method
    const textareaEl = document.createElement('textarea');
    const focusSpy = jest.spyOn(textareaEl, 'focus');

    // Open overlay
    component.toggleOverlay({
      stopPropagation() {},
    } as unknown as Event);
    fixture.detectChanges();

    // Set the mock textarea
    component.ideaInput = { nativeElement: textareaEl } as ElementRef<HTMLTextAreaElement>;

    // Trigger the afterViewInit hook manually
    component.ngAfterViewInit();
    tick();

    expect(focusSpy).toHaveBeenCalled();
  }));

  it('should save idea and close overlay when Enter is pressed', () => {
    // Open overlay and set content
    component.toggleOverlay({
      stopPropagation() {},
    } as unknown as Event);
    component.content = 'New brilliant idea';
    fixture.detectChanges();

    // Simulate Enter key press
    const textarea = fixture.debugElement.query(By.css('textarea'));
    textarea.triggerEventHandler('keydown', {
      key: 'Enter',
      preventDefault() {},
    });
    fixture.detectChanges();

    const expectedIdea: NewIdea = {
      content: 'New brilliant idea',
    };
    expect(ideaService.create).toHaveBeenCalledWith(expectedIdea);
    expect(component.isOpen()).toBe(false);
    expect(component.content).toBe('');
  });

  it('should close overlay without saving when Escape is pressed', () => {
    // Open overlay and set content
    component.toggleOverlay({
      stopPropagation() {},
    } as unknown as Event);
    component.content = 'Idea to be discarded';
    fixture.detectChanges();

    // Simulate Escape key press
    const textarea = fixture.debugElement.query(By.css('textarea'));
    textarea.triggerEventHandler('keydown', {
      key: 'Escape',
      preventDefault() {},
    });
    fixture.detectChanges();

    expect(ideaService.create).not.toHaveBeenCalled();
    expect(component.isOpen()).toBe(false);
    expect(component.content).toBe('');
  });

  it('should handle keyboard events', () => {
    // Create spy on toggleOverlay
    const toggleSpy = jest.spyOn(component, 'toggleOverlay');

    // Simulate the keyboard event
    const event = new KeyboardEvent('keydown', {
      key: 'i',
      metaKey: true,
    });

    component.handleKeyboardEvent(event);

    expect(toggleSpy).toHaveBeenCalled();
  });
});
