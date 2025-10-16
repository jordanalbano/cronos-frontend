import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MobileMenuService {
  private _isOpen = signal<boolean>(false);

  public readonly isOpen = this._isOpen.asReadonly();

  toggle(): void {
    this._isOpen.update(value => !value);
  }

  open(): void {
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
  }
}
