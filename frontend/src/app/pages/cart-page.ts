import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../core/cart.service';
import { MoneyPipe } from '../shared/money.pipe';
import { OrderSummary } from '../shared/order-summary';
import { ProductImage } from '../shared/product-image';
import { QuantityInput } from '../shared/quantity-input';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, MoneyPipe, ProductImage, QuantityInput, OrderSummary],
  template: `
    <div class="container">
      <h1 class="page-title">Carrito</h1>

      @if (cart.items().length === 0) {
        <div class="empty">
          <p>Tu carrito está vacío.</p>
          <a routerLink="/tienda" class="btn btn-primary">Ir a la tienda</a>
        </div>
      } @else {
        <div class="layout">
          <table>
            <thead>
              <tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr>
            </thead>
            <tbody>
              @for (item of cart.items(); track item.product.id) {
                <tr>
                  <td class="prod">
                    <app-product-image class="thumb" [color]="item.product.color" [category]="item.product.category" [src]="item.product.images?.[0]" />
                    <a [routerLink]="['/producto', item.product.slug]">{{ item.product.name }}</a>
                  </td>
                  <td data-label="Precio">{{ item.product.price | money }}</td>
                  <td data-label="Cantidad">
                    <app-quantity-input
                      [value]="item.quantity"
                      [max]="item.product.stock"
                      (valueChange)="cart.setQuantity(item.product.id, $event)"
                    />
                  </td>
                  <td data-label="Subtotal"><strong>{{ item.product.price * item.quantity | money }}</strong></td>
                  <td><button class="remove" (click)="cart.remove(item.product.id)" aria-label="Quitar">✕</button></td>
                </tr>
              }
            </tbody>
          </table>

          <app-order-summary>
            <a routerLink="/checkout" class="btn btn-primary">Finalizar compra</a>
            <a routerLink="/tienda" class="btn btn-ghost">Seguir comprando</a>
          </app-order-summary>
        </div>
      }
    </div>
  `,
  styles: `
    .empty { text-align: center; padding: 40px 0; color: var(--muted); }
    .empty .btn { width: auto; display: inline-flex; padding-inline: 28px; }
    .layout { display: grid; grid-template-columns: 1fr 340px; gap: 32px; align-items: start; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; color: var(--muted); font-size: .8rem; text-transform: uppercase; letter-spacing: .06em; padding: 10px 8px; border-bottom: 1px solid var(--border); }
    td { padding: 14px 8px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .prod { display: flex; align-items: center; gap: 14px; }
    .prod a { color: var(--text); font-weight: 600; text-decoration: none; }
    .prod a:hover { color: var(--accent); }
    .thumb { width: 100px; flex-shrink: 0; border-radius: 6px; overflow: hidden; }
    .remove { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 1rem; }
    .remove:hover { color: var(--accent); }
    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      thead { display: none; }
      tr { display: grid; grid-template-columns: 1fr auto; border-bottom: 1px solid var(--border); padding: 10px 0; }
      td { border: none; padding: 6px 0; }
      .prod { grid-column: 1 / -1; }
      td[data-label]::before { content: attr(data-label) ': '; color: var(--muted); font-size: .85rem; margin-right: 6px; }
    }
  `
})
export class CartPage {
  protected readonly cart = inject(CartService);
}
