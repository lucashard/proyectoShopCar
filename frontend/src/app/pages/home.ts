import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ShopApiService } from '../core/shop-api.service';
import { ProductCard } from '../shared/product-card';
import { ProductImage } from '../shared/product-image';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCard, ProductImage],
  template: `
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <span class="eyebrow">Distribuidor XRAY · HUDY · Competición</span>
          <h1>Ingeniería de<br />campeones <em>mundiales</em></h1>
          <p>Kits XRAY eléctricos y nitro, repuestos originales y lubricantes HUDY para que llegues primero a la bandera a cuadros.</p>
          <div class="cta">
            <a routerLink="/tienda" class="btn btn-primary">Ver tienda</a>
            <a routerLink="/tienda" [queryParams]="{ categoria: 'repuestos' }" class="btn btn-ghost">Repuestos</a>
          </div>
        </div>
        <app-product-image class="hero-car" color="#d40000" src="img/xray/x4-1.jpg" label="XRAY X4 touring car 1/10" />
      </div>
    </section>

    <section class="container perks">
      <div><strong>Envío a todo el país</strong><span>Gratis desde $200.000</span></div>
      <div><strong>Hasta 6 cuotas</strong><span>Con todas las tarjetas</span></div>
      <div><strong>Garantía oficial</strong><span>Productos originales</span></div>
      <div><strong>Asesoramiento</strong><span>Pilotos que corren lo que venden</span></div>
    </section>

    <section class="container">
      <h2 class="section-title">Categorías</h2>
      <div class="cats">
        @for (c of categories.value() ?? []; track c.id) {
          <a [routerLink]="['/tienda']" [queryParams]="{ categoria: c.id }" class="cat">{{ c.name }}</a>
        }
      </div>
    </section>

    <section class="container">
      <h2 class="section-title">Destacados</h2>
      @if (featured.isLoading()) {
        <p class="muted">Cargando…</p>
      } @else if (featured.error()) {
        <p class="error">No se pudo conectar con la API. ¿Está corriendo el backend en el puerto 3000?</p>
      } @else {
        <div class="grid">
          @for (p of featured.value(); track p.id) {
            <app-product-card [product]="p" />
          }
        </div>
      }
    </section>
  `,
  styles: `
    .hero {
      background: radial-gradient(ellipse at 70% 50%, rgba(212,0,0,.25), transparent 60%), #0b0c0f;
      border-bottom: 1px solid var(--border);
      padding: 56px 0;
    }
    .hero-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 40px; align-items: center; }
    .eyebrow { color: var(--accent); font-weight: 700; text-transform: uppercase; letter-spacing: .1em; font-size: .8rem; }
    h1 {
      font-family: var(--font-display); font-style: italic; font-weight: 800;
      font-size: clamp(2.2rem, 5vw, 3.6rem); line-height: 1.05; margin: 12px 0 16px; text-transform: uppercase;
    }
    h1 em { color: var(--accent); }
    .hero p { color: var(--muted); max-width: 46ch; font-size: 1.05rem; }
    .cta { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
    .cta .btn { width: auto; padding-inline: 28px; }
    .hero-car { border-radius: 14px; overflow: hidden; border: 1px solid var(--border); }
    .perks {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 32px;
    }
    .perks div {
      background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent);
      border-radius: 8px; padding: 14px 16px; display: grid; gap: 2px;
    }
    .perks span { color: var(--muted); font-size: .85rem; }
    .cats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .cat {
      background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
      padding: 24px 12px; text-align: center; color: var(--text); text-decoration: none;
      font-weight: 700; text-transform: uppercase; letter-spacing: .04em; font-size: .9rem;
    }
    .cat:hover { border-color: var(--accent); color: var(--accent); }
    @media (max-width: 800px) {
      .hero-grid { grid-template-columns: 1fr; }
      .perks { grid-template-columns: 1fr 1fr; }
      .cats { grid-template-columns: 1fr 1fr; }
    }
  `
})
export class Home {
  private readonly api = inject(ShopApiService);
  protected readonly featured = rxResource({ stream: () => this.api.getProducts({ featured: true }) });
  protected readonly categories = rxResource({ stream: () => this.api.getCategories() });
}
