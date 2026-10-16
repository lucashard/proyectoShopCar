import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CartService } from '../core/cart.service';
import { ShopApiService } from '../core/shop-api.service';
import { MoneyPipe } from '../shared/money.pipe';
import { ProductImage } from '../shared/product-image';
import { QuantityInput } from '../shared/quantity-input';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, MoneyPipe, ProductImage, QuantityInput],
  template: `
    <div class="container">
      @if (product.isLoading()) {
        <p class="muted pad">Cargando…</p>
      } @else if (product.error()) {
        <p class="error pad">Producto no encontrado. <a routerLink="/tienda">Volver a la tienda</a></p>
      } @else if (product.value(); as p) {
        <nav class="crumbs">
          <a routerLink="/">Inicio</a> / <a routerLink="/tienda" [queryParams]="{ categoria: p.category }">{{ p.category }}</a> /
          <span>{{ p.name }}</span>
        </nav>

        <div class="detail">
          <div class="gallery">
            <app-product-image class="image" [color]="p.color" [category]="p.category" [label]="p.name" [src]="selectedImage()" />
            @if ((p.images?.length ?? 0) > 1) {
              <div class="thumbs">
                @for (img of p.images; track img) {
                  <button type="button" [class.active]="img === selectedImage()" (click)="selectedImage.set(img)" [attr.aria-label]="'Ver foto ' + ($index + 1)">
                    <img [src]="img" alt="" />
                  </button>
                }
              </div>
            }
          </div>

          <div class="info">
            <span class="brand">{{ p.brand }} · Escala {{ p.scale }}</span>
            <h1>{{ p.name }}</h1>
            <div class="prices">
              <span class="price">{{ p.price | money }}</span>
              @if (p.oldPrice) {
                <span class="old">{{ p.oldPrice | money }}</span>
              }
            </div>
            <p class="installments">6 cuotas sin interés de {{ p.price / 6 | money }}</p>

            <p class="stock" [class.none]="p.stock === 0">
              {{ p.stock === 0 ? 'Sin stock' : p.stock <= 3 ? '¡Últimas ' + p.stock + ' unidades!' : 'En stock' }}
            </p>

            @if (p.stock > 0) {
              <div class="buy">
                <app-quantity-input [value]="qty()" [min]="1" [max]="available()" (valueChange)="qty.set($event)" />
                <button class="btn btn-primary" [disabled]="available() === 0" (click)="addToCart()">
                  {{ available() === 0 ? 'Ya tenés todo el stock en el carrito' : 'Agregar al carrito' }}
                </button>
              </div>
            }

            <h3>Descripción</h3>
            <p class="desc">{{ p.description }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .pad { padding: 40px 0; }
    .crumbs { padding: 20px 0; color: var(--muted); font-size: .85rem; text-transform: capitalize; }
    .crumbs a { color: var(--muted); }
    .crumbs span { color: var(--text); }
    .detail { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; align-items: start; }
    .image { border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
    .thumbs { display: flex; gap: 10px; margin-top: 10px; }
    .thumbs button {
      width: 96px; padding: 0; border: 2px solid var(--border); border-radius: 8px;
      overflow: hidden; background: none; cursor: pointer; opacity: .6;
    }
    .thumbs button.active, .thumbs button:hover { border-color: var(--accent); opacity: 1; }
    .thumbs img { display: block; width: 100%; aspect-ratio: 8 / 5; object-fit: cover; }
    .brand { color: var(--accent); text-transform: uppercase; font-weight: 700; font-size: .8rem; letter-spacing: .08em; }
    h1 { margin: 8px 0 16px; font-size: 1.9rem; line-height: 1.2; }
    .prices { display: flex; gap: 12px; align-items: baseline; }
    .price { font-size: 2rem; font-weight: 800; }
    .old { color: var(--muted); text-decoration: line-through; }
    .installments { color: var(--muted); margin: 4px 0 16px; }
    .stock { color: #4ade80; font-weight: 600; }
    .stock.none { color: var(--muted); }
    .buy { display: flex; gap: 12px; align-items: center; margin: 20px 0 28px; }
    .buy .btn { flex: 1; }
    h3 { border-top: 1px solid var(--border); padding-top: 20px; font-size: 1rem; text-transform: uppercase; letter-spacing: .06em; }
    .desc { color: var(--muted); line-height: 1.7; }
    @media (max-width: 800px) { .detail { grid-template-columns: 1fr; } }
  `
})
export class ProductDetail {
  private readonly api = inject(ShopApiService);
  private readonly cart = inject(CartService);

  /** Bound from the :slug route param (withComponentInputBinding). */
  readonly slug = input.required<string>();

  protected readonly product = rxResource({
    params: () => this.slug(),
    stream: ({ params }) => this.api.getProduct(params)
  });

  protected readonly available = computed(() => {
    const p = this.product.value();
    return p ? Math.max(0, p.stock - this.cart.quantityOf(p.id)) : 0;
  });

  protected readonly selectedImage = linkedSignal(() => this.product.value()?.images?.[0]);

  protected readonly qty = linkedSignal(() => Math.min(1, this.available()));

  addToCart() {
    const p = this.product.value();
    if (!p) return;
    this.cart.add(p, this.qty());
  }
}
