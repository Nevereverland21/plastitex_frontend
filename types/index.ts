// ─── CATEGORY ────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}

// ─── PRICING TIER ────────────────────────────────────────────────────────────

export interface PricingTier {
  min_quantity: number;
  unit_price: string;       // decimal como string: "5.70"
  delivery_days: number | null;
}

// ─── PRODUCT EXTRA ───────────────────────────────────────────────────────────

export type ExtraType = 'color_tapa' | 'empaque' | 'impresion' | 'sticker' | 'caja' | 'otro';

export interface ProductExtra {
  id: number;
  name: string;
  extra_type: ExtraType;
  unit_cost: string;              // "0.15"
  is_quote_required: boolean;
  included_from_quantity: number | null;
}

// ─── TECHNICAL SHEET ─────────────────────────────────────────────────────────

export interface TechnicalSheet {
  pdf_file: string;
  uploaded_at: string;
}

// ─── PRODUCT LIST (catálogo / hero) ──────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: string;        // precio de referencia (100 unidades)
  starting_price: string;    // precio más bajo disponible ("Desde S/ X")
  image: string | null;
  stock: number;
  featured: boolean;
  category_name: string;
  category_slug: string;
  pricing_tiers: PricingTier[];
}

// ─── PRODUCT DETAIL (página /productos/[slug]) ───────────────────────────────

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: string;
  image: string | null;
  stock: number;
  featured: boolean;
  category: Category;
  // Especificaciones técnicas
  material: string;
  capacity_ml: number | null;
  height_cm: string | null;
  diameter_cm: string | null;
  weight_grams: number | null;
  packaging: string;
  // Relaciones
  pricing_tiers: PricingTier[];
  extras: ProductExtra[];
  technical_sheet: TechnicalSheet | null;
  created_at: string;
}

// ─── QUOTE (cotizador en tiempo real) ────────────────────────────────────────

export interface QuoteResponse {
  quantity: number;
  unit_price: string;
  subtotal: string;
  extras_cost: string;
  total: string;
  delivery_days: number | null;
  is_wholesale: boolean;
  requires_stock_confirmation: boolean;
  applied_tier: PricingTier | null;
  extras_detail: ProductExtra[];
}

// ─── ORDER ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'in_production'
  | 'ready'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export type OrderType    = 'retail' | 'wholesale' | 'quote';
export type DeliveryType = 'pickup' | 'delivery';

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
  order_type: OrderType;
  delivery_type: DeliveryType;
  delivery_cost: string;
  subtotal: string;
  total: string;
  status: OrderStatus;
  status_display: string;
  delivery_type_display: string;
  payment_reference: string | null;
  payment_method: string;
  advance_paid: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  order_type: OrderType;
  delivery_type: DeliveryType;
  delivery_cost: string;
  payment_reference?: string;
  payment_method?: string;
  items: {
    product: number;
    quantity: number;
    unit_price: string;
  }[];
}

// ─── COMPLAINT ───────────────────────────────────────────────────────────────

export type ComplaintType = 'reclamo' | 'queja' | 'consulta';

export interface CreateComplaintPayload {
  complaint_type: ComplaintType;
  customer_name: string;
  email: string;
  phone?: string;
  order_reference?: string;
  description: string;
}

// ─── JOB APPLICATION ─────────────────────────────────────────────────────────

export interface CreateJobApplicationPayload {
  full_name: string;
  email: string;
  phone: string;
  position?: string;
  message?: string;
  // cv_file se envía como FormData, no JSON
}

// ─── CART (Zustand) ───────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
  // Personalización opcional (para cuando viene del configurador)
  unit_price_override?: string;   // precio negociado por volumen
  selected_extras?: ProductExtra[];
  customization_notes?: string;
}