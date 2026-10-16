import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-quantity-input',
  template: `
    <div class="qty">
      <button type="button" (click)="valueChange.emit(value() - 1)" [disabled]="value() <= min()" aria-label="Restar">−</button>
      <span>{{ value() }}</span>
      <button type="button" (click)="valueChange.emit(value() + 1)" [disabled]="value() >= max()" aria-label="Sumar">+</button>
    </div>
  `,
  styles: `
    .qty { display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: 6px; }
    button {
      width: 32px; height: 32px; background: none; border: none; color: var(--text);
      font-size: 1.1rem; cursor: pointer;
    }
    button:disabled { opacity: .35; cursor: not-allowed; }
    button:not(:disabled):hover { color: var(--accent); }
    span { min-width: 30px; text-align: center; font-weight: 600; }
  `
})
export class QuantityInput {
  readonly value = input.required<number>();
  readonly min = input(0);
  readonly max = input(99);
  readonly valueChange = output<number>();
}
