import { Directive, ElementRef, OnInit, OnDestroy, Renderer2, Input } from '@angular/core';
import { PomodoroStateService } from './pomodoro-state.service';
import { Subscription } from 'rxjs';
import { animate, style, AnimationBuilder } from '@angular/animations';

@Directive({
  selector: '[jhiHideOnPomodoro]',
  standalone: true,
})
export class HideOnPomodoroDirective implements OnInit, OnDestroy {
  @Input() animationDuration = '300ms';

  private subscription: Subscription | null = null;
  private isHidden = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private pomodoroService: PomodoroStateService,
    private animationBuilder: AnimationBuilder,
  ) {}

  ngOnInit(): void {
    this.subscription = this.pomodoroService.timerActive$.subscribe(active => {
      if (active && !this.isHidden) {
        this.hideWithAnimation();
      } else if (!active && this.isHidden) {
        this.showWithAnimation();
      }
    });

    // Set initial state
    if (this.pomodoroService.isTimerActive()) {
      this.hideElement();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private hideWithAnimation(): void {
    const fadeOut = this.animationBuilder.build([
      style({ opacity: 1, transform: 'translateY(0)' }),
      animate(this.animationDuration, style({ opacity: 0, transform: 'translateY(-20px)' })),
    ]);

    const player = fadeOut.create(this.el.nativeElement);
    player.onDone(() => {
      this.hideElement();
    });
    player.play();
  }

  private showWithAnimation(): void {
    // Make visible but transparent for animation
    this.renderer.setStyle(this.el.nativeElement, 'display', 'block');
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(-20px)');

    const fadeIn = this.animationBuilder.build([
      style({ opacity: 0, transform: 'translateY(-20px)' }),
      animate(this.animationDuration, style({ opacity: 1, transform: 'translateY(0)' })),
    ]);

    const player = fadeIn.create(this.el.nativeElement);
    player.onDone(() => {
      this.isHidden = false;
    });
    player.play();
  }

  private hideElement(): void {
    this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    this.isHidden = true;
  }
}
