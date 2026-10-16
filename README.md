# RC Competizione: tienda de autos RC XRAY

Carrito de compras con **Angular 21** (frontend) y **Node.js + Express** (backend).

## Cómo correrlo

Abrí dos terminales:

```bash
# 1) API: http://localhost:3000
cd backend
npm install
npm run dev

# 2) Frontend: http://localhost:4200
cd frontend
npm install
npm start
```

El frontend redirige `/api/*` al backend a través de `frontend/proxy.conf.json`.

## Ejecutar con Docker

Con Docker Compose instalado, ejecutá desde la raíz del proyecto:

```bash
docker compose up --build
```

La tienda queda disponible en `http://localhost:8081` y la API en `http://localhost:3000`. El puerto de la tienda se puede cambiar con `SHOPCAR_HTTP_PORT`. Compose conserva productos y pedidos en el volumen `backend-data`.

## Funcionalidades

- Home con hero, beneficios, categorías y productos destacados
- Tienda con filtro por categoría, búsqueda y orden por precio o nombre
- Detalle de producto con selector de cantidad y aviso de stock
- Carrito lateral (drawer) y página de carrito, guardados en `localStorage`
- Envío gratis desde $200.000 (si no, $8.990)
- Checkout con formulario validado. El backend recalcula precios y totales, valida y descuenta el stock, y guarda el pedido
- Página de confirmación del pedido

## API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/categories` | Categorías |
| GET | `/api/products?category=&q=&sort=&featured=` | Listado con filtros (`sort`: `price-asc`, `price-desc`, `name`) |
| GET | `/api/products/:slug` | Detalle |
| POST | `/api/orders` | Crea un pedido `{ customer, items: [{ productId, quantity }] }` |
| GET | `/api/orders/:id` | Consulta un pedido |

Los datos están en `backend/data/products.json` y los pedidos se guardan en `backend/data/orders.json`.
Para reiniciar el stock, copiá `products.seed.json` sobre `products.json`.

## Notas

- Las fotos de los productos están en `frontend/public/img/xray/` y se asignan con el campo `images` de cada producto en `products.json` (la primera es la principal; si hay más, aparecen como galería en la ficha). Un producto sin `images` muestra una ilustración SVG.
- Las fotos son material oficial de XRAY (teamxray.com). Usalas solo si tenés autorización como distribuidor; si no, reemplazalas por fotos propias.
- `frontend/package.json` reemplaza `rollup` por `@rollup/wasm-node` (en `overrides`) porque el Control de aplicaciones de Windows bloquea el binario nativo de Rollup.
