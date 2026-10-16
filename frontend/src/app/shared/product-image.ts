import { Component, input } from '@angular/core';

/** Product photo, or a vector illustration when the product has no picture. */
@Component({
  selector: 'app-product-image',
  template: `
    @if (src()) {
      <img [src]="src()" [alt]="label()" loading="lazy" [class.contain]="fit() === 'contain'" />
    } @else {
    <svg viewBox="0 0 320 200" role="img" [attr.aria-label]="label()">
      <defs>
        <linearGradient [attr.id]="'bg' + uid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#1c1f26" />
          <stop offset="1" stop-color="#0b0c0f" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" [attr.fill]="'url(#bg' + uid + ')'" />
      <g opacity=".08" stroke="#fff">
        @for (x of stripes; track x) {
          <line [attr.x1]="x" y1="200" [attr.x2]="x + 60" y2="0" stroke-width="10" />
        }
      </g>

      @switch (category()) {
        @case ('electronica') {
          <g transform="translate(110 50)">
            <rect width="100" height="100" rx="12" [attr.fill]="color()" />
            <rect x="22" y="22" width="56" height="56" rx="6" fill="#0b0c0f" opacity=".55" />
            @for (i of pins; track i) {
              <rect [attr.x]="14 + i * 18" y="-12" width="6" height="12" fill="#cbd5e1" />
              <rect [attr.x]="14 + i * 18" y="100" width="6" height="12" fill="#cbd5e1" />
            }
          </g>
        }
        @case ('repuestos') {
          <g transform="translate(160 100)">
            <circle r="62" fill="#111" stroke="#2a2d34" stroke-width="4" />
            <circle r="38" [attr.fill]="color()" />
            @for (a of spokes; track a) {
              <rect x="-4" y="-36" width="8" height="30" fill="#0b0c0f" [attr.transform]="'rotate(' + a + ')'" />
            }
            <circle r="8" fill="#e5e7eb" />
          </g>
        }
        @default {
          <g transform="translate(20 52)">
            <ellipse cx="140" cy="112" rx="130" ry="10" fill="#000" opacity=".5" />
            <path
              d="M10 86 C10 70 22 64 40 62 L86 58 C104 36 132 26 170 26 C204 26 222 40 238 56 L270 62 C284 65 292 74 292 88 L292 98 L10 98 Z"
              [attr.fill]="color()"
            />
            <path d="M98 58 C112 42 136 34 166 34 C190 34 206 44 220 58 Z" fill="#0b0c0f" opacity=".75" />
            <path d="M10 86 L292 86" stroke="#000" stroke-opacity=".25" stroke-width="2" />
            <rect x="268" y="70" width="18" height="6" rx="2" fill="#fde68a" />
            <rect x="12" y="72" width="12" height="6" rx="2" fill="#ef4444" />
            @for (cx of wheels; track cx) {
              <circle [attr.cx]="cx" cy="98" r="22" fill="#111" />
              <circle [attr.cx]="cx" cy="98" r="12" fill="#9ca3af" />
              <circle [attr.cx]="cx" cy="98" r="4" fill="#111" />
            }
          </g>
        }
      }
    </svg>
    }
  `,
  styles: `
    :host { display: block; background: #0b0c0f; }
    svg { display: block; width: 100%; height: auto; }
    img { display: block; width: 100%; aspect-ratio: 8 / 5; object-fit: cover; }
    img.contain { object-fit: contain; }
  `
})
export class ProductImage {
  private static nextId = 0;
  readonly uid = ProductImage.nextId++;

  readonly color = input.required<string>();
  readonly category = input<string>('autos');
  readonly label = input<string>('');
  readonly src = input<string | undefined>(undefined);
  readonly fit = input<'cover' | 'contain'>('cover');

  readonly stripes = [-40, 40, 120, 200, 280];
  readonly pins = [0, 1, 2, 3, 4];
  readonly spokes = [0, 72, 144, 216, 288];
  readonly wheels = [70, 232];
}
