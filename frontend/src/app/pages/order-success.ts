import { DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ShopApiService } from '../core/shop-api.service';
import { MoneyPipe } from '../shared/money.pipe';

@Component({
  selector: 'app-order-success',
  imports: [RouterLink, MoneyPipe, DatePipe],
  template: `
    <div class="container narrow">
      @if (order.value(); as o) {
        <div class="ok">✓</div>
        <h1>¡Gracias por tu compra, {{ o.customer.name }}!</h1>
        <p class="muted">Pedido <strong>#{{ o.id }}</strong> · {{ o.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>
        <p class="muted">Te enviamos la confirmación a {{ o.customer.email }}.</p>

        <div class="box">
          @for (i of o.items; track i.productId) {
            <div class="line"><span>{{ i.quantity }} × {{ i.name }}</span><span>{{ i.subtotal | money }}</span></div>
          }
          <div class="line"><span>Envío</span><span>{{ o.shipping === 0 ? 'Gratis' : (o.shipping | money) }}</span></div>
          <div class="line total"><span>Total</span><span>{{ o.total | money }}</span></div>
          <p class="muted addr">Envío a: {{ o.customer.address }}</p>
        </div>

        <a routerLink="/tienda" class="btn btn-primary">Seguir comprando</a>
      } @else if (order.error()) {
        <p class="error">No encontramos ese pedido.</p>
      }
    </div>
  `,
  styles: `
    .narrow { max-width: 620px; text-align: center; padding-top: 48px; }
    .ok {
      width: 64px; height: 64px; border-radius: 50%; background: #16a34a; color: #fff;
      display: grid; place-items: center; font-size: 2rem; margin: 0 auto 16px;
    }
    h1 { font-size: 1.7rem; }
    .box { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 20px; margin: 24px 0; text-align: left; }
    .line { display: flex; justify-content: space-between; padding: 6px 0; }
    .total { border-top: 1px solid var(--border); margin-top: 8px; padding-top: 12px; font-weight: 800; font-size: 1.15rem; }
    .addr { margin: 12px 0 0; font-size: .85rem; }
    .btn { width: auto; display: inline-flex; padding-inline: 28px; }
  `
})
export class OrderSuccess {
  private readonly api = inject(ShopApiService);
  readonly id = input.required<string>();
  protected readonly order = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.api.getOrder(params)
  });
}
