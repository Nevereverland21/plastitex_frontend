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
  unit_price: string;
  delivery_days: number | null;
}

// ─── PRODUCT EXTRA ───────────────────────────────────────────────────────────

export type ExtraType =
  | 'color_tapa'
  | 'empaque'
  | 'impresion'
  | 'sticker'
  | 'caja'
  | 'otro';

export interface ProductExtra {
  id: number;
  name: string;
  extra_type: ExtraType;
  unit_cost: string;
  is_quote_required: boolean;
  included_from_quantity: number | null;
}

// ─── TECHNICAL SHEET ─────────────────────────────────────────────────────────

export interface TechnicalSheet {
  pdf_file: string;
  uploaded_at: string;
}

// ─── PRODUCT COLOR ───────────────────────────────────────────────────────────

export interface ProductColor {
  id: number;
  name: string;
  hex_code: string;
  image: string;
  is_default: boolean;
  sort_order: number;
}

// ─── CATALOG TYPE ────────────────────────────────────────────────────────────

export type CatalogType = 'retail' | 'wholesale' | 'both';

// ─── PRODUCT LIST (catálogo / hero) ──────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: string;
  starting_price: string;
  image: string | null;
  stock: number;
  featured: boolean;
  catalog_type: CatalogType;
  min_units: number;
  quote_threshold: number;
  allows_logo: boolean;
  min_units_for_logo: number;
  category_name: string;
  category_slug: string;
  pricing_tiers: PricingTier[];
  colors: ProductColor[];
}

// ─── PRODUCT DETAIL (página /[slug]) ─────────────────────────────────────────

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: string;
  starting_price: string;
  image: string | null;
  stock: number;
  featured: boolean;
  catalog_type: CatalogType;
  min_units: number;
  quote_threshold: number;
  allows_logo: boolean;
  min_units_for_logo: number;
  category: Category;
  material: string;
  capacity_ml: number | null;
  height_cm: string | null;
  diameter_cm: string | null;
  weight_grams: number | null;
  packaging: string;
  pricing_tiers: PricingTier[];
  colors: ProductColor[];
  extras: ProductExtra[];
  technical_sheet: TechnicalSheet | null;
  created_at: string;
}

// ─── LOGO SURCHARGE ───────────────────────────────────────────────────────────

export type LogoTechnique = 'serigrafia' | 'dtf' | 'bordado' | 'grabado';

export interface LogoSurcharge {
  id: number;
  technique: LogoTechnique;
  technique_display: string;
  colors: number;
  price_extra: number;
}

// ─── STORE LOCATION ───────────────────────────────────────────────────────────

export interface StoreLocation {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  schedule: string;
  phone: string;
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
  | 'confirmed'
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
  public_token: string;
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
  notes: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  // Link de pago completo (100%) para pedidos minoristas. El backend lo
  // genera automáticamente al crear el pedido; null si no aplica.
  payment_url?: string | null;
}

export interface CreateOrderPayload {
  customer_name: string;
  email: string;
  phone: string;
  address?: string;
  order_type: OrderType;
  delivery_type: DeliveryType;
  delivery_cost?: string;
  payment_method?: string;
  notes?: string;
  items: {
    product: number;
    quantity: number;
    unit_price: string;
  }[];
}

// ─── QUOTE REQUEST (mayorista) ───────────────────────────────────────────────

export interface CreateQuotePayload {
  customer_name: string;
  email: string;
  phone: string;
  company?: string;
  product: number;
  quantity: number;
  logo_notes?: string;
  message?: string;
}

// ─── PAYMENT LINK ─────────────────────────────────────────────────────────────

export interface PaymentLinkItem {
  product: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface PaymentLink {
  order_id: number;
  customer_name: string;
  total: string;
  advance_amount: string;
  remaining_amount: string;
  amount_to_pay: string;
  link_type: string;
  link_type_value: 'advance' | 'remaining' | 'full';
  delivery_type: string;
  items: PaymentLinkItem[];
  is_active: boolean;
  expires_at: string;
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
}

// ─── CART (Zustand) ───────────────────────────────────────────────────────────

// ─── CART (Zustand) ───────────────────────────────────────────────────────────

export interface CartItem {
  product: Product | ProductDetail;
  quantity: number;
  /** @deprecated Use unit_price instead. Kept for backward compatibility. */
  unit_price_override?: string;
  /** Precio unitario real del cotizador para esta cantidad */
  unit_price?: string;
  selected_extras?: ProductExtra[];
  customization_notes?: string;
}

// ─── PUBLIC ORDER (seguimiento de pedido) ────────────────────────────────────

export interface PublicOrderItem {
  product_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface PublicOrder {
  id: number;
  public_token: string;
  customer_name: string;
  status: OrderStatus;
  status_display: string;
  delivery_type: DeliveryType;
  delivery_type_display: string;
  order_type: OrderType;
  subtotal: string;
  total: string;
  delivery_cost: string;
  delivery_deadline: string | null;
  address: string;
  created_at: string;
  updated_at: string;
  items: PublicOrderItem[];
  store_location: {
    name: string;
    address: string;
    schedule: string;
    phone: string;
  } | null;
}

// ─── PAYMENT METHODS ─────────────────────────────────────────────────────────

export type PaymentMethod = 'whatsapp' | 'izipay' | 'yape' | 'plin' | 'transferencia';

export interface PaymentMethodConfig {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: string; // nombre del icono o URL
  enabled: boolean;
  isDefault?: boolean;
}
