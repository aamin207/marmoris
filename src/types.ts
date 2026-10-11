/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  parent?: any;
  children?: Category[];
}

export interface Product {
  id: string;
  product_id?: string;
  title: string;
  price: number;
  description: string;
  category: string;
  categorySlug: string;
  categoryId?: string;
  image: string;
  images?: string[];
  rating: {
    rate: number;
    count: number;
  };
  sizes?: string[];
  colors?: { name: string; hex: string; price?: number; inStock?: boolean; stock?: number }[];
  inStock: boolean;
  stock?: number;
  featured?: boolean;
  originalPrice?: number;
  base_price?: number;
  max_price?: number;
  discount_percentage?: number;
  specifications?: { key: string; value: string }[];
  available_decorations?: {
    id: string;
    name: string;
    image: string;
    additional_price: number;
    status: string;
    inStock?: boolean;
    stock?: number;
  }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: { name: string; hex: string; price?: number };
  decoration?: {
    id: string;
    name: string;
    image: string;
    additional_price: number;
    status: string;
  };
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    province: string;
  };
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  color?: { name: string; hex: string; price?: number } | string;
  size?: string;
  decoration?: {
    id: string;
    name: string;
    image?: string;
    additional_price?: number;
    status?: string;
  };
  accessory?: {
    id: string;
    name: string;
    image?: string;
    additional_price?: number;
    status?: string;
  };
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  total_price?: number;
  shipping_cost?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'payment_pending' | 'awaiting_payment';
  shippingAddress: string;
  trackingNumber?: string;
  postal_tracking_code?: string;
  orderNumber?: string;
  payment_method?: string;
  payment_method_id?: string;
  payment_info?: {
    method?: string;
    method_title?: string;
    status?: string;
    receipt_image?: string;
    rejection_reason?: string;
    ref_id?: string;
    details?: {
      card_number?: string;
      owner_name?: string;
      card_holder?: string;
      bank_name?: string;
      sheba?: string;
      iban?: string;
    };
  };
  user?: {
    id?: string;
    full_name?: string;
    phone?: string;
  };
}

export interface Review {
  id: string;
  productId?: string;
  product_id?: string;
  userName?: string;
  user?: {
    id: string;
    full_name: string;
  };
  rating: number;
  title?: string;
  comment: string;
  status?: string;
  date?: string;
  created_at?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Slider {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  featured_image?: string;
  url?: string;
  link?: string;
  alt?: string;
}

export interface Decoration {
  id: string;
  title: string;
  image: string;
  description?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  image?: string;
  author: any;
  date: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  duration?: string;
  estimated_days?: string;
}

export interface Banner {
  id?: string;
  _id?: string;
  key: string;
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  link?: string;
  is_active?: boolean;
}
