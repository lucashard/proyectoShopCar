import { Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ShopApiService } from '../core/shop-api.service';
import { ProductCard } from '../shared/product-card';

@Component({
  selector: 'app-catalog',
  imports: [RouterLink, ProductCard],
  template: `
    <div class="container layout">
      <aside>
        <h3>Categorías</h3>
        <a [routerLink]="[]" [queryParams]="{ categoria: null }" queryParamsHandling="merge" [class.active]="!filters().category">
          Todas
        </a>
        @for (c of categories.value() ?? []; track c.id) {
          <a [routerLink]="[]" [queryParams]="{ categoria: c.id }" queryParamsHandling="merge" [class.active]="filters().category === c.id">
            {{ c.name }}
          </a>
        }
      </aside>

      <section>
        <div class="toolbar">
          <h1>{{ title() }}</h1>
          <label>
            Ordenar
            <select [value]="filters().sort ?? ''" (change)="setSort($any($event.target).value)">
              <option value="">Relevancia</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
              <option value="name">Nombre</option>
            </select>
          </label>
        </div>

        @if (products.isLoading()) {
          <p class="muted">Cargando productos…</p>
        } @else if (products.error()) {
          <p class="error">No se pudieron cargar los productos.</p>
        } @else if (products.value()?.length === 0) {
          <p class="muted">No encontramos productos para tu búsqueda.</p>
        } @else {
          <p class="muted count">{{ products.value()?.length }} productos</p>
          <div class="grid">
            @for (p of products.value(); track p.id) {
              <app-product-card [product]="p" />
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: `
    .layout { display: grid; grid-template-columns: 220px 1fr; gap: 32px; padding-top: 32px; }
    aside { display: flex; flex-direction: column; gap: 4px; }
    aside h3 { margin: 0 0 10px; font-size: .85rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
    aside a {
      color: var(--text); text-decoration: none; padding: 8px 12px; border-radius: 6px;
      border-left: 3px solid transparent;
    }
    aside a:hover { background: var(--surface); }
    aside a.active { background: var(--surface); border-left-color: var(--accent); font-weight: 700; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
    h1 { margin: 0; font-family: var(--font-display); font-style: italic; text-transform: uppercase; }
    label { color: var(--muted); font-size: .85rem; display: flex; align-items: center; gap: 8px; }
    select { background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 6px; padding: 8px; }
    .count { margin: 8px 0 18px; }
    @media (max-width: 760px) {
      .layout { grid-template-columns: 1fr; }
      aside { flex-direction: row; overflow-x: auto; }
      aside h3 { display: none; }
      aside a { white-space: nowrap; border-left: none; border-bottom: 3px solid transparent; }
      aside a.active { border-bottom-color: var(--accent); }
    }
  `
})
export class Catalog {
  private readonly api = inject(ShopApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly filters = toSignal(
    this.route.queryParamMap.pipe(
      map(p => ({
        category: p.get('categoria') ?? undefined,
        q: p.get('q') ?? undefined,
        sort: p.get('orden') ?? undefined
      }))
    ),
    { requireSync: true }
  );

  protected readonly categories = rxResource({ stream: () => this.api.getCategories() });
  protected readonly products = rxResource({
    params: () => this.filters(),
    stream: ({ params }) => this.api.getProducts(params)
  });

  protected readonly title = computed(() => {
    const { category, q } = this.filters();
    if (q) return `Resultados para "${q}"`;
    return this.categories.value()?.find(c => c.id === category)?.name ?? 'Tienda';
  });

  setSort(sort: string) {
    this.router.navigate([], { queryParams: { orden: sort || null }, queryParamsHandling: 'merge' });
  }
}
