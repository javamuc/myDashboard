import { animate, state, style, transition, trigger } from '@angular/animations';

export const fadeInOut = trigger('fadeInOut', [
  state(
    'closed',
    style({
      opacity: 0,
      visibility: 'hidden',
    }),
  ),
  state(
    'open',
    style({
      opacity: 1,
      visibility: 'visible',
    }),
  ),
  transition('closed => open', animate('200ms ease-in')),
  transition('open => closed', animate('200ms ease-out')),
]);
