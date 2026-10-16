import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../core/cart.service';
import { Customer } from '../core/models';
import { ShopApiService } from '../core/shop-api.service';
import { MoneyPipe } from '../shared/money.pipe';
import { OrderSummary } from '../shared/order-summary';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink, MoneyPipe, OrderSummary],
  template: `
    <div class="container">
      <h1 class="page-title">Finalizar compra</h1>

      @if (cart.items().length === 0) {
        <p class="muted">No hay productos en el carrito. <a routerLink="/tienda">Ir a la tienda</a></p>
      } @else {
        <div class="layout">
          <form [formGroup]="form" (ngSubmit)="submit()">
            <h2>Datos de contacto y envío</h2>

            @for (f of fields; track f.name) {
              <label>
                {{ f.label }}
                <input [type]="f.type" [formControlName]="f.name" [attr.autocomplete]="f.autocomplete" />
                @if (form.get(f.name)?.invalid && form.get(f.name)?.touched) {
                  <small>{{ f.error }}</small>
                }
              </label>
            }

            <h2>Productos</h2>
            <ul class="items">
              @for (item of cart.items(); track item.product.id) {
                <li><span>{{ item.quantity }} × {{ item.product.name }}</span><span>{{ item.product.price * item.quantity | money }}</span></li>
              }
            </ul>

            @if (error()) {
              <p class="error">{{ error() }}</p>
            }
          </form>

          <app-order-summary>
            <button class="btn btn-primary" (click)="submit()" [disabled]="sending()">
              {{ sending() ? 'Procesando…' : 'Confirmar pedido' }}
            </button>
          </app-order-summary>
        </div>
      }
    </div>
  `,
  styles: `
    .layout { display: grid; grid-template-columns: 1fr 340px; gap: 32px; align-items: start; }
    form { display: grid; gap: 14px; }
    h2 { margin: 10px 0 0; font-size: 1rem; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
    label { display: grid; gap: 6px; font-weight: 600; font-size: .9rem; }
    input {
      padding: 11px 14px; border-radius: 6px; background: var(--surface);
      border: 1px solid var(--border); color: var(--text); font-size: 1rem;
    }
    input:focus { outline: none; border-color: var(--accent); }
    input.ng-invalid.ng-touched { border-color: #f87171; }
    small { color: #f87171; font-weight: 400; }
    .items { list-style: none; padding: 0; margin: 0; }
    .items li { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); color: var(--muted); }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
  `
})
export class Checkout {
  protected readonly cart = inject(CartService);
  private readonly api = inject(ShopApiService);
  private readonly router = inject(Router);

  protected readonly sending = signal(false);
  protected readonly error = signal('');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]{8,}$/)]],
    address: ['', [Validators.required, Validators.minLength(6)]]
  });

  protected readonly fields = [
    { name: 'name', label: 'Nombre y apellido', type: 'text', autocomplete: 'name', error: 'Ingresá tu nombre completo' },
    { name: 'email', label: 'Email', type: 'email', autocomplete: 'email', error: 'Ingresá un email válido' },
    { name: 'phone', label: 'Teléfono', type: 'tel', autocomplete: 'tel', error: 'Ingresá un teléfono válido' },
    { name: 'address', label: 'Dirección de envío', type: 'text', autocomplete: 'street-address', error: 'Ingresá tu dirección' }
  ];

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sending.set(true);
    this.error.set('');

    const items = this.cart.items().map(i => ({ productId: i.product.id, quantity: i.quantity }));
    this.api.createOrder(this.form.getRawValue() as Customer, items).subscribe({
      next: order => {
        this.cart.clear();
        this.router.navigate(['/pedido', order.id]);
      },
      error: (err: HttpErrorResponse) => {
        this.sending.set(false);
        this.error.set(err.error?.error ?? 'No pudimos procesar el pedido. Intentá de nuevo.');
      }
    });
  }
}
