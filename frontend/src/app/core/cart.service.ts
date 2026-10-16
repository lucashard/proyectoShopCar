import { computed, effect, Injectable, signal } from '@angular/core';
import { CartItem, Product } from './models';

const STORAGE_KEY = 'rc-shop-cart-v2';
export const SHIPPING_COST = 8990;
export const FREE_SHIPPING_FROM = 200000;

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<CartItem[]>(this.load());
  readonly drawerOpen = signal(false);

  readonly count = computed(() => this.items().reduce((n, i) => n + i.quantity, 0));
  readonly subtotal = computed(() => this.items().reduce((s, i) => s + i.product.price * i.quantity, 0));
  readonly shipping = computed(() =>
    this.items().length === 0 || this.subtotal() >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST
  );
  readonly total = computed(() => this.subtotal() + this.shipping());
  readonly missingForFreeShipping = computed(() => Math.max(0, FREE_SHIPPING_FROM - this.subtotal()));

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
      } catch {
        // Storage unavailable (private mode): cart still works for this session.
      }
    });
  }

  quantityOf(productId: number) {
    return this.items().find(i => i.product.id === productId)?.quantity ?? 0;
  }

  add(product: Product, quantity = 1) {
    this.items.update(items => {
      const existing = items.find(i => i.product.id === product.id);
      if (existing) {
        const next = Math.min(existing.quantity + quantity, product.stock);
        return items.map(i => (i.product.id === product.id ? { ...i, quantity: next } : i));
      }
      return [...items, { product, quantity: Math.min(quantity, product.stock) }];
    });
    this.drawerOpen.set(true);
  }

  setQuantity(productId: number, quantity: number) {
    if (quantity < 1) return this.remove(productId);
    this.items.update(items =>
      items.map(i =>
        i.product.id === productId ? { ...i, quantity: Math.min(quantity, i.product.stock) } : i
      )
    );
  }

  remove(productId: number) {
    this.items.update(items => items.filter(i => i.product.id !== productId));
  }

  clear() {
    this.items.set([]);
  }

  private load(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }
}
