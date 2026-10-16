import { Component, inject } from '@angular/core';
import { CartService } from '../core/cart.service';
import { MoneyPipe } from './money.pipe';

@Component({
  selector: 'app-order-summary',
  imports: [MoneyPipe],
  template: `
    <div class="summary">
      <h2>Resumen</h2>
      <div class="line"><span>Subtotal ({{ cart.count() }} productos)</span><span>{{ cart.subtotal() | money }}</span></div>
      <div class="line">
        <span>Envío</span>
        <span>{{ cart.shipping() === 0 ? 'Gratis' : (cart.shipping() | money) }}</span>
      </div>
      @if (cart.missingForFreeShipping() > 0) {
        <p class="hint">Sumá {{ cart.missingForFreeShipping() | money }} más para envío gratis.</p>
      }
      <div class="line total"><span>Total</span><span>{{ cart.total() | money }}</span></div>
      <div class="actions"><ng-content /></div>
    </div>
  `,
  styles: `
    .summary {
      background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
      padding: 20px; position: sticky; top: 140px;
    }
    h2 { margin: 0 0 16px; font-size: 1.1rem; text-transform: uppercase; letter-spacing: .06em; }
    .line { display: flex; justify-content: space-between; padding: 6px 0; color: var(--muted); }
    .total { color: var(--text); font-size: 1.25rem; font-weight: 800; border-top: 1px solid var(--border); margin-top: 10px; padding-top: 14px; }
    .hint { font-size: .8rem; color: var(--accent); margin: 4px 0; }
    .actions { display: grid; gap: 10px; margin-top: 18px; }
  `
})
export class OrderSummary {
  protected readonly cart = inject(CartService);
}
