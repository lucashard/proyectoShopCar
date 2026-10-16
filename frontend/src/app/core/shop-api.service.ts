import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Category, Customer, Order, Product, ProductFilters } from './models';

@Injectable({ providedIn: 'root' })
export class ShopApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  getCategories() {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  getProducts(filters: ProductFilters = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== '') params = params.set(key, String(value));
    }
    return this.http.get<Product[]>(`${this.base}/products`, { params });
  }

  getProduct(slug: string) {
    return this.http.get<Product>(`${this.base}/products/${slug}`);
  }

  createOrder(customer: Customer, items: { productId: number; quantity: number }[]) {
    return this.http.post<Order>(`${this.base}/orders`, { customer, items });
  }

  getOrder(id: string) {
    return this.http.get<Order>(`${this.base}/orders/${id}`);
  }
}
