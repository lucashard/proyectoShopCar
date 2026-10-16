import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService, FREE_SHIPPING_FROM } from '../core/cart.service';
import { ShopApiService } from '../core/shop-api.service';
import { MoneyPipe } from './money.pipe';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, FormsModule, MoneyPipe],
  template: `
    <div class="topbar">Envío gratis en compras desde {{ freeShippingFrom | money }} · Retiro en local sin cargo</div>
    <header>
      <div class="container row">
        <a routerLink="/" class="logo">RC<span>Competizione</span></a>

        <form class="search" (ngSubmit)="search()">
          <input type="search" name="q" [(ngModel)]="query" placeholder="Buscar kits XRAY, repuestos, HUDY…" />
        </form>

        <button class="cart-btn" (click)="cart.drawerOpen.set(true)" aria-label="Abrir carrito">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6" />
            <circle cx="10" cy="21" r="1" /><circle cx="18" cy="21" r="1" />
          </svg>
          @if (cart.count() > 0) {
            <span class="count">{{ cart.count() }}</span>
          }
        </button>
      </div>
      <nav class="container">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
        <a routerLink="/tienda" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Tienda</a>
        <a routerLink="/factura" routerLinkActive="active">Facturación</a>
        @for (c of categories.value() ?? []; track c.id) {
          <a routerLink="/tienda" [queryParams]="{ categoria: c.id }">{{ c.name }}</a>
        }
      </nav>
    </header>
  `,
  styles: `
    .topbar {
      background: var(--accent); color: #fff; text-align: center;
      font-size: .8rem; padding: 6px 16px; font-weight: 600;
    }
    header { background: #0b0c0f; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 20; }
    .row { display: flex; align-items: center; gap: 20px; padding-top: 14px; padding-bottom: 14px; }
    .logo {
      font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; font-style: italic;
      color: var(--accent); text-decoration: none; letter-spacing: -.02em; white-space: nowrap;
    }
    .logo span { color: var(--text); }
    .search { flex: 1; }
    .search input {
      width: 100%; padding: 10px 14px; border-radius: 6px;
      background: var(--surface); border: 1px solid var(--border); color: var(--text);
    }
    .cart-btn {
      position: relative; background: none; border: 1px solid var(--border); color: var(--text);
      border-radius: 6px; padding: 8px 10px; cursor: pointer; display: grid; place-items: center;
    }
    .cart-btn:hover { border-color: var(--accent); }
    .count {
      position: absolute; top: -8px; right: -8px; background: var(--accent); color: #fff;
      border-radius: 999px; min-width: 20px; height: 20px; font-size: .75rem; font-weight: 700;
      display: grid; place-items: center; padding: 0 5px;
    }
    nav { display: flex; gap: 22px; overflow-x: auto; padding-bottom: 12px; }
    nav a {
      color: var(--muted); text-decoration: none; font-weight: 600; font-size: .9rem;
      text-transform: uppercase; letter-spacing: .04em; white-space: nowrap;
    }
    nav a:hover, nav a.active { color: var(--text); }
    @media (max-width: 640px) {
      .row { flex-wrap: wrap; }
      .search { order: 3; flex-basis: 100%; }
      .cart-btn { margin-left: auto; }
    }
  `
})
export class Header {
  protected readonly cart = inject(CartService);
  private readonly router = inject(Router);
  protected readonly freeShippingFrom = FREE_SHIPPING_FROM;
  protected query = '';

  private readonly api = inject(ShopApiService);
  protected readonly categories = rxResource({ stream: () => this.api.getCategories() });

  search() {
    this.router.navigate(['/tienda'], { queryParams: { q: this.query.trim() || null } });
  }
}
