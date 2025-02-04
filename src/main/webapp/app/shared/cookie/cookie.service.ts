import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CookieService {
  private readonly LAST_BOARD_KEY = 'lastBoardId';

  setLastBoardId(boardId: number): void {
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 6); // Cookie expires in 1 month
    document.cookie = `${this.LAST_BOARD_KEY}=${boardId};expires=${expirationDate.toUTCString()};path=/`;
  }

  getLastBoardId(): number | null {
    const value = this.getCookie(this.LAST_BOARD_KEY);
    return value ? parseInt(value, 10) : null;
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let c of ca) {
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
}
