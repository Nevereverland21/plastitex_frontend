export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  active: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  image: string | null;
  stock: number;
  featured: boolean;
  active: boolean;
  category: Category;
  category_name: string;
  created_at: string;
}

export interface OrderItem {
  product: number;
  quantity: number;
  unit_price: string;
}

export interface Order {
  id: number;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  total: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  culqi_reference: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  culqi_reference: string;
  items: {
    product: number;
    quantity: number;
    unit_price: string;
  }[];
}

// Carrito (Zustand)
export interface CartItem {
  product: Product;
  quantity: number;
}