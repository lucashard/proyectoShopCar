export interface Product {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  scale: string;
  price: number;
  oldPrice?: number;
  stock: number;
  color: string;
  featured: boolean;
  description: string;
  images?: string[];
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: Customer;
  items: { productId: number; name: string; unitPrice: number; quantity: number; subtotal: number }[];
  subtotal: number;
  shipping: number;
  total: number;
}

export interface ProductFilters {
  category?: string;
  q?: string;
  sort?: string;
  featured?: boolean;
}
