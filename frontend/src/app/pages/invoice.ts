import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { Product } from '../core/models';
import { ShopApiService } from '../core/shop-api.service';
import { MoneyPipe } from '../shared/money.pipe';

interface InvoiceLine {
  id: number;
  productId: number | null;
  quantity: number;
}

@Component({
  selector: 'app-invoice',
  imports: [DatePipe, FormsModule, MoneyPipe],
  template: `
    <section class="container invoice-page">
      <div class="page-heading">
        <div>
          <p class="eyebrow">ADMINISTRACIÓN · VENTAS</p>
          <h1 class="page-title">Nueva factura</h1>
        </div>
        <div class="folio">
          <span>COMPROBANTE</span>
          <strong>{{ invoiceNumber }}</strong>
          <time>{{ issuedAt | date: 'dd/MM/yyyy' }}</time>
        </div>
      </div>

      <div class="invoice-layout">
        <section class="invoice-sheet">
          <div class="section-heading">
            <span class="section-index">01</span>
            <h2>Datos del cliente</h2>
          </div>

          <div class="customer-fields">
            <label>
              Nombre y apellido
              <input
                type="text"
                autocomplete="name"
                placeholder="Nombre del cliente"
                [ngModel]="customerName()"
                (ngModelChange)="customerName.set($event)"
                [ngModelOptions]="{ standalone: true }"
              />
            </label>
            <label>
              Celular
              <input
                type="tel"
                autocomplete="tel"
                placeholder="+54 9 11 1234-5678"
                [ngModel]="customerPhone()"
                (ngModelChange)="customerPhone.set($event)"
                [ngModelOptions]="{ standalone: true }"
              />
            </label>
          </div>

          <div class="section-heading products-heading">
            <span class="section-index">02</span>
            <h2>Artículos</h2>
            <span class="line-count">{{ lines().length }} / 10</span>
          </div>

          @if (products.isLoading()) {
            <p class="catalog-state">Cargando catálogo...</p>
          } @else if (products.value(); as inventory) {
            @if (inventory.length === 0) {
              <p class="catalog-state">No hay productos disponibles en el catálogo.</p>
            } @else {
              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Producto</th>
                      <th scope="col">Cantidad</th>
                      <th scope="col" class="numeric">Precio</th>
                      <th scope="col" class="numeric">Importe</th>
                      <th scope="col" aria-label="Acciones"></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (line of lines(); track line.id; let index = $index) {
                      <tr>
                        <td class="row-number">{{ (index + 1).toString().padStart(2, '0') }}</td>
                        <td class="product-cell">
                          <select
                            [ngModel]="line.productId"
                            (ngModelChange)="selectProduct(line.id, $event)"
                            [ngModelOptions]="{ standalone: true }"
                            [attr.aria-label]="'Producto para artículo ' + (index + 1)"
                          >
                            <option [ngValue]="null" disabled>Elegir producto</option>
                            @for (product of inventory; track product.id) {
                              <option [ngValue]="product.id">{{ product.brand }} · {{ product.name }}</option>
                            }
                          </select>
                        </td>
                        <td>
                          <input
                            class="quantity"
                            type="number"
                            min="1"
                            step="1"
                            [ngModel]="line.quantity"
                            (ngModelChange)="setQuantity(line.id, $event)"
                            [ngModelOptions]="{ standalone: true }"
                            [attr.aria-label]="'Cantidad para artículo ' + (index + 1)"
                          />
                        </td>
                        <td class="numeric unit-price">{{ (productFor(line)?.price ?? 0) | money }}</td>
                        <td class="numeric line-total">{{ lineTotal(line) | money }}</td>
                        <td>
                          <button
                            class="remove-line no-print"
                            type="button"
                            (click)="removeLine(line.id)"
                            [disabled]="lines().length === 1"
                            [attr.aria-label]="'Quitar artículo ' + (index + 1)"
                            title="Quitar artículo"
                          >×</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <button class="add-line no-print" type="button" (click)="addLine()" [disabled]="lines().length >= 10">
                <span aria-hidden="true">+</span> Agregar artículo
              </button>
            }
          } @else {
            <div class="catalog-error">
              <p>No se pudo cargar el catálogo.</p>
              <button class="btn btn-ghost no-print" type="button" (click)="products.reload()">Reintentar</button>
            </div>
          }
        </section>

        <aside class="summary" aria-label="Resumen de factura">
          <p class="summary-kicker">RESUMEN</p>
          <div class="summary-stat">
            <span>Artículos elegidos</span>
            <strong>{{ selectedLines() }} <small>/ 10</small></strong>
          </div>
          <div class="summary-stat">
            <span>Unidades</span>
            <strong>{{ totalUnits() }}</strong>
          </div>
          <div class="total-block" aria-live="polite">
            <span>Total</span>
            <strong>{{ total() | money }}</strong>
          </div>
          <button class="btn btn-primary no-print" type="button" (click)="printInvoice()" [disabled]="!canPrint()">
            Imprimir factura
          </button>
          <button class="btn btn-ghost clear-button no-print" type="button" (click)="clearInvoice()">
            Limpiar datos
          </button>
          @if (!canPrint()) {
            <p class="validation-hint no-print">Completá nombre, celular y al menos un producto.</p>
          }
        </aside>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .invoice-page { padding-top: 28px; padding-bottom: 72px; }
    .page-heading { display: flex; justify-content: space-between; align-items: end; gap: 24px; margin-bottom: 26px; }
    .eyebrow, .summary-kicker, .folio span { color: var(--accent); font-size: .72rem; font-weight: 800; letter-spacing: .12em; margin: 0; }
    .page-title { margin: 6px 0 0; }
    .folio { display: grid; gap: 4px; text-align: right; }
    .folio strong { font-family: var(--font-display); font-size: 1.2rem; }
    .folio time { color: var(--muted); font-size: .86rem; }
    .invoice-layout { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 26px; align-items: start; }
    .invoice-sheet { min-width: 0; padding: clamp(18px, 3vw, 32px); background: var(--surface); border: 1px solid var(--border); border-radius: 8px; }
    .section-heading { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
    .section-heading h2 { margin: 0; font-family: var(--font-display); font-size: 1.25rem; text-transform: uppercase; }
    .section-index { color: var(--accent); font-size: .75rem; font-weight: 800; }
    .customer-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
    label { display: grid; gap: 7px; color: var(--muted); font-size: .82rem; font-weight: 700; }
    input, select { min-width: 0; width: 100%; padding: 11px 12px; color: var(--text); background: #111318; border: 1px solid var(--border); border-radius: 5px; }
    input:focus, select:focus { outline: 2px solid color-mix(in srgb, var(--accent) 55%, transparent); border-color: var(--accent); }
    .products-heading { margin-bottom: 10px; }
    .line-count { margin-left: auto; color: var(--muted); font-size: .8rem; }
    .table-scroll { width: 100%; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 690px; text-align: left; }
    th { padding: 10px 8px; color: var(--muted); border-bottom: 1px solid var(--border); font-size: .68rem; text-transform: uppercase; }
    td { padding: 10px 8px; border-bottom: 1px solid var(--border); }
    .row-number { color: var(--muted); font-size: .78rem; font-variant-numeric: tabular-nums; }
    .product-cell { width: 42%; }
    .quantity { width: 82px; }
    .numeric { text-align: right; white-space: nowrap; }
    .unit-price { color: var(--muted); font-size: .86rem; }
    .line-total { font-weight: 700; white-space: nowrap; }
    .remove-line { width: 30px; height: 30px; border: 0; background: transparent; color: var(--muted); font-size: 1.35rem; cursor: pointer; }
    .remove-line:disabled { opacity: .3; cursor: not-allowed; }
    .add-line { display: inline-flex; align-items: center; gap: 7px; margin-top: 16px; padding: 8px 0; color: var(--text); background: transparent; border: 0; font-weight: 700; cursor: pointer; }
    .add-line span { color: var(--accent); font-size: 1.25rem; }
    .add-line:disabled { opacity: .4; cursor: not-allowed; }
    .summary { position: sticky; top: 190px; padding: 6px 0 0; }
    .summary-kicker { padding-bottom: 14px; border-bottom: 1px solid var(--border); }
    .summary-stat { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; color: var(--muted); border-bottom: 1px solid var(--border); font-size: .88rem; }
    .summary-stat strong { color: var(--text); font-size: 1rem; font-variant-numeric: tabular-nums; }
    .summary-stat small { color: var(--muted); font-size: .75rem; }
    .total-block { display: grid; gap: 4px; padding: 22px 0; }
    .total-block span { color: var(--muted); font-size: .78rem; font-weight: 700; text-transform: uppercase; }
    .total-block strong { font-family: var(--font-display); font-size: 2.1rem; font-variant-numeric: tabular-nums; }
    .clear-button { margin-top: 9px; }
    .validation-hint, .catalog-state { color: var(--muted); font-size: .82rem; line-height: 1.5; }
    @media (max-width: 820px) {
      .invoice-layout { grid-template-columns: 1fr; }
      .summary { position: static; display: grid; grid-template-columns: 1fr 1fr; gap: 0 18px; }
      .summary-kicker, .total-block, .summary button, .validation-hint { grid-column: 1 / -1; }
      .summary-stat { padding: 10px 0; }
    }
    @media (max-width: 560px) {
      .page-heading { align-items: start; }
      .folio { font-size: .76rem; }
      .folio strong { font-size: 1rem; }
      .customer-fields { grid-template-columns: 1fr; }
    }
    @media print {
      .invoice-page { padding: 0; }
      .page-heading { margin-bottom: 18px; }
      .invoice-layout { display: block; }
      .summary { display: none; }
      .invoice-sheet { padding: 0; }
      input, select { border: 0; background: transparent; padding: 0; appearance: none; }
      .table-scroll { overflow: visible; }
      table { min-width: 0; }
      .quantity { border: 0; }
    }
  `
})
export class Invoice {
  private readonly api = inject(ShopApiService);

  protected readonly products = rxResource({ stream: () => this.api.getProducts() });
  protected readonly customerName = signal('');
  protected readonly customerPhone = signal('');
  protected readonly lines = signal<InvoiceLine[]>([{ id: 1, productId: null, quantity: 1 }]);
  protected readonly issuedAt = new Date();
  protected readonly invoiceNumber = `RC-${this.issuedAt.getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  protected readonly selectedLines = computed(() => this.lines().filter(line => line.productId !== null).length);
  protected readonly totalUnits = computed(() => this.lines().reduce((sum, line) => sum + (line.productId === null ? 0 : line.quantity), 0));
  protected readonly total = computed(() => this.lines().reduce((sum, line) => sum + this.lineTotal(line), 0));
  protected readonly canPrint = computed(() =>
    this.customerName().trim().length >= 2 && this.customerPhone().trim().length >= 6 && this.selectedLines() > 0
  );

  private nextLineId = 2;

  protected productFor(line: InvoiceLine): Product | undefined {
    return this.products.value()?.find(product => product.id === line.productId);
  }

  protected lineTotal(line: InvoiceLine): number {
    return (this.productFor(line)?.price ?? 0) * line.quantity;
  }

  protected selectProduct(lineId: number, productId: number | null): void {
    this.lines.update(lines => lines.map(line => line.id === lineId ? { ...line, productId } : line));
  }

  protected setQuantity(lineId: number, quantity: number): void {
    const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
    this.lines.update(lines => lines.map(line => line.id === lineId ? { ...line, quantity: normalizedQuantity } : line));
  }

  protected addLine(): void {
    if (this.lines().length >= 10) return;
    this.lines.update(lines => [...lines, { id: this.nextLineId++, productId: null, quantity: 1 }]);
  }

  protected removeLine(lineId: number): void {
    if (this.lines().length <= 1) return;
    this.lines.update(lines => lines.filter(line => line.id !== lineId));
  }

  protected clearInvoice(): void {
    this.customerName.set('');
    this.customerPhone.set('');
    this.lines.set([{ id: this.nextLineId++, productId: null, quantity: 1 }]);
  }

  protected printInvoice(): void {
    if (this.canPrint()) window.print();
  }
}