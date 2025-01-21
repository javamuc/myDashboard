import { animate, state, style, transition, trigger } from '@angular/animations';

export const slideInOut = trigger('slideInOut', [
  state('closed', style({ transform: 'translateX(100%)', visibility: 'hidden' })),
  state('open', style({ transform: 'translateX(0)', visibility: 'visible' })),
  transition('closed => open', animate('200ms ease-in')),
  transition('open => closed', animate('200ms ease-out')),
]);
