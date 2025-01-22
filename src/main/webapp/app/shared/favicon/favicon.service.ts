import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FaviconService {
  private readonly defaultFavicon = 'favicon.ico';
  private readonly focusFavicon = 'favicon_focus.ico';

  setFocusMode(isFocused: boolean): void {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    favicon.href = isFocused ? this.focusFavicon : this.defaultFavicon;
  }
}
