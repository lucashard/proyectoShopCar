import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../core/cart.service';
import { Product } from '../core/models';
import { MoneyPipe } from './money.pipe';
import { ProductImage } from './product-image';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, MoneyPipe, ProductImage],
  template: `
    @let p = product();
    <article class="card">
      <a [routerLink]="['/producto', p.slug]" class="media">
        <app-product-image [color]="p.color" [category]="p.category" [label]="p.name" [src]="p.images?.[0]" />
        @if (p.oldPrice) {
          <span class="badge sale">-{{ discount() }}%</span>
        }
        @if (p.stock === 0) {
          <span class="badge out">Sin stock</span>
        }
      </a>
      <div class="body">
        <span class="brand">{{ p.brand }} · {{ p.scale }}</span>
        <a [routerLink]="['/producto', p.slug]" class="name">{{ p.name }}</a>
        <div class="prices">
          <span class="price">{{ p.price | money }}</span>
          @if (p.oldPrice) {
            <span class="old">{{ p.oldPrice | money }}</span>
          }
        </div>
        <button class="btn btn-primary" [disabled]="!canAdd()" (click)="cart.add(p)">
          {{ p.stock === 0 ? 'Agotado' : canAdd() ? 'Agregar al carrito' : 'Máximo en carrito' }}
        </button>
      </div>
    </article>
  `,
  styles: `
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: transform .2s, border-color .2s;
    }
    .card:hover { transform: translateY(-3px); border-color: var(--accent); }
    .media { position: relative; display: block; }
    .badge {
      position: absolute; top: 10px; left: 10px;
      padding: 3px 8px; border-radius: 4px;
      font-size: .75rem; font-weight: 700; text-transform: uppercase;
    }
    .sale { background: var(--accent); color: #fff; }
    .out { background: #374151; color: #e5e7eb; left: auto; right: 10px; }
    .body { padding: 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .brand { color: var(--muted); font-size: .8rem; text-transform: uppercase; letter-spacing: .05em; }
    .name { color: var(--text); font-weight: 600; text-decoration: none; line-height: 1.3; flex: 1; }
    .name:hover { color: var(--accent); }
    .prices { display: flex; align-items: baseline; gap: 8px; margin: 4px 0 8px; }
    .price { font-size: 1.25rem; font-weight: 800; }
    .old { color: var(--muted); text-decoration: line-through; font-size: .9rem; }
  `
})
export class ProductCard {
  protected readonly cart = inject(CartService);
  readonly product = input.required<Product>();

  protected readonly canAdd = computed(
    () => this.cart.quantityOf(this.product().id) < this.product().stock
  );
  protected readonly discount = computed(() => {
    const { price, oldPrice } = this.product();
    return oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0;
  });
}
