import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../core/cart.service';
import { MoneyPipe } from './money.pipe';
import { ProductImage } from './product-image';
import { QuantityInput } from './quantity-input';

@Component({
  selector: 'app-cart-drawer',
  imports: [MoneyPipe, ProductImage, QuantityInput],
  template: `
    @if (cart.drawerOpen()) {
      <div class="backdrop" (click)="close()"></div>
      <aside class="drawer" role="dialog" aria-label="Carrito de compras">
        <div class="head">
          <h2>Tu carrito ({{ cart.count() }})</h2>
          <button class="close" (click)="close()" aria-label="Cerrar">✕</button>
        </div>

        @if (cart.items().length === 0) {
          <p class="empty">Tu carrito está vacío.</p>
        } @else {
          @if (cart.missingForFreeShipping() > 0) {
            <p class="ship">Te faltan <strong>{{ cart.missingForFreeShipping() | money }}</strong> para envío gratis</p>
          } @else {
            <p class="ship ok">¡Tenés envío gratis!</p>
          }

          <ul class="items">
            @for (item of cart.items(); track item.product.id) {
              <li>
                <app-product-image class="thumb" [color]="item.product.color" [category]="item.product.category" [src]="item.product.images?.[0]" />
                <div class="info">
                  <span class="name">{{ item.product.name }}</span>
                  <span class="price">{{ item.product.price | money }}</span>
                  <app-quantity-input
                    [value]="item.quantity"
                    [max]="item.product.stock"
                    (valueChange)="cart.setQuantity(item.product.id, $event)"
                  />
                </div>
                <button class="remove" (click)="cart.remove(item.product.id)" aria-label="Quitar">✕</button>
              </li>
            }
          </ul>

          <div class="foot">
            <div class="line"><span>Subtotal</span><strong>{{ cart.subtotal() | money }}</strong></div>
            <button class="btn btn-primary" (click)="go('/checkout')">Finalizar compra</button>
            <button class="btn btn-ghost" (click)="go('/carrito')">Ver carrito</button>
          </div>
        }
      </aside>
    }
  `,
  styles: `
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 40; animation: fade .2s; }
    .drawer {
      position: fixed; top: 0; right: 0; bottom: 0; width: min(420px, 100%);
      background: var(--bg); border-left: 1px solid var(--border); z-index: 50;
      display: flex; flex-direction: column; animation: slide .25s ease-out;
    }
    @keyframes slide { from { transform: translateX(100%); } }
    @keyframes fade { from { opacity: 0; } }
    .head { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; border-bottom: 1px solid var(--border); }
    h2 { margin: 0; font-size: 1.15rem; }
    .close, .remove { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 1rem; }
    .close:hover, .remove:hover { color: var(--accent); }
    .empty { padding: 40px 20px; color: var(--muted); text-align: center; }
    .ship { margin: 0; padding: 10px 20px; background: var(--surface); font-size: .85rem; }
    .ship.ok { color: #4ade80; }
    .items { list-style: none; margin: 0; padding: 0 20px; overflow-y: auto; flex: 1; }
    li { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border); align-items: flex-start; }
    .thumb { width: 90px; flex-shrink: 0; border-radius: 6px; overflow: hidden; }
    .info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .name { font-weight: 600; font-size: .9rem; }
    .price { color: var(--muted); font-size: .85rem; }
    .foot { padding: 18px 20px; border-top: 1px solid var(--border); display: grid; gap: 10px; }
    .line { display: flex; justify-content: space-between; font-size: 1.05rem; margin-bottom: 4px; }
  `
})
export class CartDrawer {
  protected readonly cart = inject(CartService);
  private readonly router = inject(Router);

  @HostListener('document:keydown.escape')
  close() {
    this.cart.drawerOpen.set(false);
  }

  go(url: string) {
    this.close();
    this.router.navigateByUrl(url);
  }
}
