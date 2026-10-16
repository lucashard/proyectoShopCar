import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home').then(m => m.Home), title: 'RC Competizione · Autos RC' },
  { path: 'tienda', loadComponent: () => import('./pages/catalog').then(m => m.Catalog), title: 'Tienda · RC Competizione' },
  { path: 'producto/:slug', loadComponent: () => import('./pages/product-detail').then(m => m.ProductDetail) },
  { path: 'carrito', loadComponent: () => import('./pages/cart-page').then(m => m.CartPage), title: 'Carrito · RC Competizione' },
  { path: 'checkout', loadComponent: () => import('./pages/checkout').then(m => m.Checkout), title: 'Checkout · RC Competizione' },
  { path: 'pedido/:id', loadComponent: () => import('./pages/order-success').then(m => m.OrderSuccess), title: 'Pedido confirmado' },
  { path: '**', redirectTo: '' }
];
