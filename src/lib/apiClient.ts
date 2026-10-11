/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Category, User, Order, Review, FAQ, Slider, Decoration, BlogPost, ShippingMethod, Banner } from '@/types';

const API_BASE = 'https://api.marmoris.store/api';

async function fetchWithFallback(url: string, options?: RequestInit): Promise<Response> {
  return fetch(url, options);
}

// Global state for Offline Status
export let isOfflineMode = false;
let offlineListeners: ((offline: boolean) => void)[] = [];

export function getStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('marmoris_token');
  }
  return null;
}

export function setStoredToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('marmoris_token', token);
  }
}

export function removeStoredToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('marmoris_token');
  }
}

export function subscribeToOfflineStatus(listener: (offline: boolean) => void) {
  offlineListeners.push(listener);
  listener(isOfflineMode);
  return () => {
    offlineListeners = offlineListeners.filter((l) => l !== listener);
  };
}

function setOfflineMode(status: boolean) {
  if (isOfflineMode !== status) {
    isOfflineMode = status;
    console.warn(`[Marmoris] API status changed. Offline Mode: ${status}`);
    offlineListeners.forEach((l) => l(status));
  }
}

// Product Data Adapter for mapping dynamic backend schemas safely
export function adaptProduct(p: any): Product {
  const price = p.price || (p.colors && p.colors[0]?.price) || 0;
  
  // Clean main image URL
  let image = p.main_image || p.image || '/logo.png';
  if (image.startsWith('/public/')) {
    image = `https://api.marmoris.store${image}`;
  } else if (image.startsWith('/uploads/')) {
    image = `https://api.marmoris.store${image}`;
  }

  // Handle category mapping
  let categoryName = 'متفرقه';
  let categorySlug = 'uncategorized';
  let categoryId = '';
  if (p.category) {
    if (typeof p.category === 'object') {
      categoryName = p.category.name || categoryName;
      categorySlug = p.category.slug || categorySlug;
      categoryId = p.category._id || p.category.id || '';
    } else {
      categoryName = p.category;
    }
  }

  // Handle stock / inventory parsing
  let numericStock: number | undefined = undefined;
  if (p.stock !== undefined) numericStock = Number(p.stock);
  else if (p.quantity !== undefined) numericStock = Number(p.quantity);
  else if (p.inventory !== undefined) numericStock = Number(p.inventory);

  let isProductInStock = true;
  if (p.inStock !== undefined) {
    if (p.inStock === false || p.inStock === 'false' || p.inStock === 0 || p.inStock === '0') {
      isProductInStock = false;
    } else {
      isProductInStock = Boolean(p.inStock);
    }
  } else if (p.available !== undefined) {
    if (p.available === false || p.available === 'false' || p.available === 0 || p.available === '0') {
      isProductInStock = false;
    } else {
      isProductInStock = Boolean(p.available);
    }
  } else if (p.status === 'out_of_stock' || p.status === 'unavailable') {
    isProductInStock = false;
  }

  if (numericStock !== undefined && numericStock <= 0) {
    isProductInStock = false;
  }

  // Handle colors mapping
  const colors = (p.colors || []).map((c: any) => {
    let colorStock: number | undefined = undefined;
    if (c.stock !== undefined) colorStock = Number(c.stock);
    else if (c.quantity !== undefined) colorStock = Number(c.quantity);
    else if (c.inventory !== undefined) colorStock = Number(c.inventory);

    let colorInStock = true;
    if (c.inStock !== undefined) {
      if (c.inStock === false || c.inStock === 'false' || c.inStock === 0 || c.inStock === '0') {
        colorInStock = false;
      } else {
        colorInStock = Boolean(c.inStock);
      }
    } else if (c.in_stock !== undefined) {
      if (c.in_stock === false || c.in_stock === 'false' || c.in_stock === 0 || c.in_stock === '0') {
        colorInStock = false;
      } else {
        colorInStock = Boolean(c.in_stock);
      }
    } else if (c.available !== undefined) {
      if (c.available === false || c.available === 'false' || c.available === 0 || c.available === '0') {
        colorInStock = false;
      } else {
        colorInStock = Boolean(c.available);
      }
    } else if (c.status === 'out_of_stock') {
      colorInStock = false;
    }

    if (colorStock !== undefined && colorStock <= 0) {
      colorInStock = false;
    }

    return {
      name: typeof c.name === 'object' && c.name !== null
        ? (c.name.fa || c.name.name || c.name.en || 'نامشخص')
        : (c.name || 'نامشخص'),
      hex: c.code || c.hex || '#000000',
      price: c.price || price,
      inStock: colorInStock,
      stock: colorStock
    };
  });

  // Handle available decorations mapping
  const decorations = (p.available_decorations || []).map((dec: any) => {
    let decImg = dec.image || '';
    if (decImg && decImg.startsWith('/public/')) {
      decImg = `https://api.marmoris.store${decImg}`;
    } else if (decImg && decImg.startsWith('/uploads/')) {
      decImg = `https://api.marmoris.store${decImg}`;
    }
    return {
      id: dec._id || dec.id || String(Math.random()),
      name: typeof dec.name === 'object' && dec.name !== null
        ? (dec.name.fa || dec.name.name || dec.name.en || 'تزیین')
        : (dec.name || 'تزیین'),
      image: decImg,
      additional_price: Number(dec.additional_price || 0),
      status: dec.status || 'published'
    };
  });

  return {
    id: p._id || p.id || String(Math.random()),
    product_id: p.product_id || p._id || p.id || String(Math.random()),
    title: p.title || 'محصول بدون عنوان',
    price: Number(price),
    base_price: p.base_price ? Number(p.base_price) : undefined,
    max_price: p.max_price ? Number(p.max_price) : undefined,
    discount_percentage: p.discount_percentage !== undefined ? Number(p.discount_percentage) : undefined,
    description: p.description || 'توضیحات این محصول به‌زودی ارائه خواهد شد.',
    category: categoryName,
    categorySlug: categorySlug,
    categoryId: categoryId || p.category_id || p.categoryId || '',
    image,
    images: p.images || [image],
    rating: typeof p.rating === 'object' && p.rating ? {
      rate: p.rating.rate !== undefined ? Number(p.rating.rate) : 0,
      count: p.rating.count !== undefined ? Number(p.rating.count) : (p.num_reviews !== undefined ? Number(p.num_reviews) : 0)
    } : {
      rate: p.rating !== undefined ? Number(p.rating) : 0,
      count: p.num_reviews !== undefined ? Number(p.num_reviews) : 0
    },
    sizes: p.sizes || [],
    colors: colors,
    inStock: p.inStock !== undefined ? p.inStock : true,
    featured: p.is_featured || p.featured || false,
    originalPrice: p.originalPrice || p.original_price || p.oldPrice || p.old_price ? Number(p.originalPrice || p.original_price || p.oldPrice || p.old_price) : p.originalPrice,
    specifications: p.specifications || [],
    available_decorations: decorations
  };
}

// Category Adapter
function adaptCategory(c: any): Category {
  let image = c.image || '/logo.png';
  if (image.startsWith('/public/') || image.startsWith('/uploads/')) {
    image = `https://api.marmoris.store${image}`;
  }
  return {
    id: c._id || c.id || String(Math.random()),
    name: c.name || 'دسته‌بندی',
    slug: c.slug || 'category',
    image,
    description: c.description || '',
    parent: c.parent || c.parentId || c.parent_id || null,
    children: Array.isArray(c.children) ? c.children.map(adaptCategory) : []
  };
}

// Order Adapter
export function adaptOrder(o: any): any {
  if (!o) return {};
  const raw = o.data || o;

  const rawAddress = raw.shipping_address || raw.shippingAddress;
  let formattedAddress = '';
  if (typeof rawAddress === 'string') {
    formattedAddress = rawAddress;
  } else if (rawAddress && typeof rawAddress === 'object') {
    formattedAddress = `${rawAddress.state || ''} ${rawAddress.city || ''} ${rawAddress.street || ''} (کدپستی: ${rawAddress.postal_code || rawAddress.postalCode || ''} - همراه: ${rawAddress.phone || ''})`.trim();
  }

  const rawDate = raw.created_at || raw.createdAt || raw.date;
  let formattedDate = '';
  if (rawDate) {
    try {
      formattedDate = new Date(rawDate).toLocaleDateString('fa-IR');
    } catch (e) {
      formattedDate = String(rawDate);
    }
  }

  const items = Array.isArray(raw.items) ? raw.items.map((item: any) => {
    const prod = typeof item.product === 'object' && item.product !== null ? item.product : {};
    let image = item.image || item.main_image || prod.main_image || (prod.images && prod.images[0]) || '/placeholder.png';
    if (typeof image === 'string') {
      if (image.startsWith('/public/') || image.startsWith('/uploads/')) {
        image = `https://api.marmoris.store${image}`;
      }
    }
    return {
      id: item.id || item._id || String(Math.random()),
      productId: item.product_id || prod.id || prod._id || (typeof item.product === 'string' ? item.product : ''),
      title: item.title || prod.title || 'محصول مرموریس',
      image,
      price: Number(item.price ?? prod.base_price ?? 0),
      quantity: Number(item.quantity ?? 1),
      color: item.color,
      size: item.size,
      decoration: item.decoration,
      accessory: item.accessory
    };
  }) : [];

  return {
    id: raw.id || raw._id || '',
    orderNumber: raw.order_number ? String(raw.order_number) : (raw.orderNumber || raw.id || raw._id || ''),
    date: formattedDate || raw.date || 'امروز',
    total: Number(raw.total_price ?? raw.total ?? 0),
    total_price: Number(raw.total_price ?? raw.total ?? 0),
    shipping_cost: Number(raw.shipping_cost ?? 0),
    status: raw.status || 'pending',
    items,
    shippingAddress: formattedAddress || 'ثبت نشده',
    shipping_address: rawAddress,
    shippingMethod: typeof raw.shipping_method === 'object' ? raw.shipping_method?.name : (raw.shippingMethod || 'پست پیشتاز'),
    shipping_method: raw.shipping_method,
    paymentMethod: raw.payment_info?.method || raw.payment_method || raw.paymentMethod || 'online',
    payment_info: raw.payment_info,
    trackingNumber: raw.tracking_code || raw.postal_tracking_code || raw.trackingNumber || ''
  };
}

// FETCHERS
export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetchWithFallback(`${API_BASE}/categories`, { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const body = await res.json();
    const list = body.data || body;
    if (Array.isArray(list)) {
      setOfflineMode(false);
      return list.map(adaptCategory);
    }
    return [];
  } catch (err: any) {
    setOfflineMode(true);
    console.warn('[Marmoris API] Unable to fetch categories from remote server:', err?.message || err);
    return [];
  }
}

export async function getProducts(categoryFilter?: string, searchQuery?: string): Promise<Product[]> {
  let apiList: Product[] = [];
  try {
    let url = `${API_BASE}/products?limit=50`;
    if (categoryFilter && categoryFilter !== 'all') {
      url += `&category=${encodeURIComponent(categoryFilter)}`;
    }
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    
    const res = await fetchWithFallback(url, { method: 'GET', mode: 'cors' });
    if (res.ok) {
      const body = await res.json();
      const list = body.data || body;
      if (Array.isArray(list)) {
        setOfflineMode(false);
        apiList = list.map(adaptProduct);
      }
    }
  } catch (err: any) {
    setOfflineMode(true);
    console.warn('[Marmoris API] Unable to fetch products from remote server:', err?.message || err);
  }

  let localCustomProducts: Product[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('marmoris_local_products');
      if (stored) {
        localCustomProducts = JSON.parse(stored);
      }
    } catch (e) {}
  }

  let allProducts = [...localCustomProducts, ...apiList];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    allProducts = allProducts.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  if (categoryFilter && categoryFilter !== 'all') {
    const cat = categoryFilter.toLowerCase();
    allProducts = allProducts.filter(p => 
      p.categorySlug.toLowerCase() === cat || 
      p.categoryId === cat || 
      p.category.toLowerCase().includes(cat)
    );
  }

  return allProducts;
}

export interface GetProductsParams {
  categoryFilter?: string;
  searchQuery?: string;
  sortBy?: string;
  priceRange?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export async function getProductsPaginated(params: GetProductsParams = {}): Promise<PaginatedProductsResponse> {
  const page = params.page || 1;
  const limit = params.limit || 10;
  let apiList: Product[] = [];
  let apiPagination: { page: number; limit: number; total: number; total_pages: number } | null = null;

  try {
    let url = `${API_BASE}/products?page=${page}&limit=${limit}`;
    if (params.categoryFilter && params.categoryFilter !== 'all') {
      url += `&category=${encodeURIComponent(params.categoryFilter)}`;
    }
    if (params.searchQuery) {
      url += `&search=${encodeURIComponent(params.searchQuery)}`;
    }
    if (params.sortBy && params.sortBy !== 'default') {
      url += `&sort=${encodeURIComponent(params.sortBy)}`;
    }

    const res = await fetchWithFallback(url, { method: 'GET', mode: 'cors' });
    if (res.ok) {
      const body = await res.json();
      const list = body.data || (Array.isArray(body) ? body : []);
      
      if (body.pagination) {
        apiPagination = {
          page: Number(body.pagination.page || page),
          limit: Number(body.pagination.limit || limit),
          total: Number(body.pagination.total || (Array.isArray(list) ? list.length : 0)),
          total_pages: Number(body.pagination.total_pages || body.pagination.totalPages || 1),
        };
      }

      if (Array.isArray(list)) {
        setOfflineMode(false);
        apiList = list.map(adaptProduct);
      }
    }
  } catch (err: any) {
    setOfflineMode(true);
    console.warn('[Marmoris API] Unable to fetch paginated products:', err?.message || err);
  }

  let localCustomProducts: Product[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('marmoris_local_products');
      if (stored) {
        localCustomProducts = JSON.parse(stored);
      }
    } catch (e) {}
  }

  if (apiPagination && apiList.length > 0) {
    return {
      products: apiList,
      pagination: apiPagination,
    };
  }

  let allProducts = [...localCustomProducts, ...apiList];

  if (params.searchQuery) {
    const q = params.searchQuery.toLowerCase();
    allProducts = allProducts.filter(
      p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  if (params.categoryFilter && params.categoryFilter !== 'all') {
    const cat = params.categoryFilter.toLowerCase();
    allProducts = allProducts.filter(
      p =>
        p.categorySlug.toLowerCase() === cat ||
        p.categoryId === cat ||
        p.category.toLowerCase().includes(cat)
    );
  }

  if (params.priceRange !== undefined) {
    allProducts = allProducts.filter(p => p.price <= params.priceRange!);
  }

  if (params.sortBy === 'price-asc') {
    allProducts.sort((a, b) => a.price - b.price);
  } else if (params.sortBy === 'price-desc') {
    allProducts.sort((a, b) => b.price - a.price);
  } else if (params.sortBy === 'rating') {
    allProducts.sort((a, b) => b.rating.rate - a.rating.rate);
  }

  const total = allProducts.length;
  const total_pages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const sliced = allProducts.slice(startIndex, startIndex + limit);

  return {
    products: sliced,
    pagination: {
      page,
      limit,
      total,
      total_pages,
    },
  };
}

export async function getProductBySlugOrId(idOrSlug: string): Promise<Product | null> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('marmoris_local_products');
      if (stored) {
        const localList: Product[] = JSON.parse(stored);
        const found = localList.find(p => p.id === idOrSlug || p.product_id === idOrSlug || (p as any).slug === idOrSlug);
        if (found) return found;
      }
    } catch (e) {}
  }

  try {
    const res = await fetchWithFallback(`${API_BASE}/products/${idOrSlug}`, { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const body = await res.json();
    const prodData = body.data || body;
    if (prodData) {
      console.log('RAW PRODUCT API RESPONSE:', prodData);
      setOfflineMode(false);
      return adaptProduct(prodData);
    }
    return null;
  } catch (err: any) {
    setOfflineMode(true);
    console.warn('[Marmoris API] Unable to fetch product detail from remote server:', err?.message || err);
    return null;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  let apiList: Product[] = [];
  try {
    const res = await fetchWithFallback(`${API_BASE}/products/featured`, { method: 'GET', mode: 'cors' });
    if (res.ok) {
      const body = await res.json();
      const list = body.data || body;
      if (Array.isArray(list)) {
        setOfflineMode(false);
        apiList = list.map(adaptProduct);
      }
    }
  } catch (err: any) {
    setOfflineMode(true);
  }

  let localCustomProducts: Product[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('marmoris_local_products');
      if (stored) {
        localCustomProducts = JSON.parse(stored).filter((p: Product) => p.featured);
      }
    } catch (e) {}
  }

  return [...localCustomProducts, ...apiList];
}

// AUTH API CALLS
export async function registerUser(fullName: string, mobile: string, pass: string): Promise<any> {
  const res = await fetchWithFallback(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: fullName, mobile, password: pass }),
    mode: 'cors'
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || 'ثبت‌نام با خطا مواجه شد.');
  }
  return res.json();
}

export async function loginUser(mobile: string, pass: string): Promise<any> {
  const res = await fetchWithFallback(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, password: pass }),
    mode: 'cors'
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || 'شماره همراه یا کلمه عبور نادرست است.');
  }
  return res.json();
}

export async function getProfile(token?: string): Promise<any> {
  const activeToken = token || getStoredToken() || '';
  const res = await fetchWithFallback(`${API_BASE}/auth/profile`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${activeToken}` },
    mode: 'cors'
  });
  if (!res.ok) throw new Error('موفق به دریافت اطلاعات پروفایل نشد.');
  return res.json();
}

export async function updateProfile(param1: string, param2: string, param3?: string): Promise<any> {
  let token = '';
  let fullName = '';
  let email = '';

  if (param3 !== undefined) {
    // Overload: (token, fullName, email)
    token = param1;
    fullName = param2;
    email = param3;
  } else {
    // Overload: (fullName, email)
    fullName = param1;
    email = param2;
    token = getStoredToken() || '';
  }

  const res = await fetchWithFallback(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ full_name: fullName, email }),
    mode: 'cors'
  });
  if (!res.ok) throw new Error('بروزرسانی پروفایل با خطا مواجه شد.');
  return res.json();
}

// ORDER & PAYMENT API CALLS
export async function createOrder(...args: any[]): Promise<any> {
  let token = getStoredToken() || '';
  let cartId = '';
  let address: any = {};
  let shippingMethodId = '';
  let note = '';
  let paymentMethod = '';
  let paymentMethodId = '';
  let cartItems: any[] = [];

  if (args.length >= 5 && typeof args[0] === 'string' && (args[0].length > 25 || args[0].startsWith('ey'))) {
    // (token, cartId, address, shippingMethodId, note, paymentMethod?, paymentMethodId?, cartItems?)
    token = args[0];
    cartId = args[1];
    address = args[2];
    shippingMethodId = args[3];
    note = args[4];
    paymentMethod = args[5];
    paymentMethodId = args[6];
    cartItems = args[7];
  } else {
    // (cartId, address, shippingMethodId, note, paymentMethod?, paymentMethodId?, cartItems?)
    cartId = args[0];
    address = args[1];
    shippingMethodId = args[2];
    note = args[3];
    paymentMethod = args[4];
    paymentMethodId = args[5];
    cartItems = args[6];
  }

  const res = await fetchWithFallback(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      cart_id: cartId,
      shipping_address: address,
      shipping_method_id: shippingMethodId,
      note,
      payment_method: paymentMethod,
      payment_method_id: paymentMethodId,
      items: cartItems
    }),
    mode: 'cors'
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const message = errBody.error?.message || errBody.message || (typeof errBody.error === 'string' ? errBody.error : '') || 'ثبت سفارش ناموفق بود.';
    throw new Error(message);
  }
  setOfflineMode(false);
  return res.json();
}

export async function getPaymentRequest(param1: string, param2?: string): Promise<any> {
  let token = '';
  let orderId = '';

  if (param2 !== undefined) {
    token = param1;
    orderId = param2;
  } else {
    orderId = param1;
    token = getStoredToken() || '';
  }

  const res = await fetchWithFallback(`${API_BASE}/payment/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ order_id: orderId }),
    mode: 'cors'
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || 'درخواست درگاه پرداخت با خطا مواجه شد.');
  }
  setOfflineMode(false);
  return res.json();
}

export async function getMyOrders(token?: string): Promise<any> {
  const activeToken = token || getStoredToken() || '';
  try {
    const res = await fetchWithFallback(`${API_BASE}/orders/my-orders`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${activeToken}` },
      mode: 'cors'
    });
    if (!res.ok) throw new Error('خطا در دریافت لیست سفارشات.');
    setOfflineMode(false);
    const body = await res.json();
    const list = Array.isArray(body) ? body : (Array.isArray(body?.data) ? body.data : []);
    return list.map(adaptOrder);
  } catch (err: any) {
    console.warn('[Marmoris API] Unable to fetch user orders from remote server:', err?.message || err);
    return [];
  }
}

// ADDITIONAL AUTH ENDPOINTS
export async function forgotPassword(mobile: string): Promise<any> {
  const res = await fetchWithFallback(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile }),
    mode: 'cors'
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || 'ارسال پیامک بازیابی رمز عبور با خطا مواجه شد.');
  }
  return res.json();
}

export async function resetPassword(mobile: string, code: string, pass: string): Promise<any> {
  const res = await fetchWithFallback(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, code, new_password: pass }),
    mode: 'cors'
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || 'تغییر کلمه عبور با خطا مواجه شد.');
  }
  return res.json();
}

export async function logoutUser(token: string): Promise<any> {
  const res = await fetchWithFallback(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    mode: 'cors'
  });
  return res.ok ? res.json().catch(() => ({ success: true })) : { success: false };
}

// BACKEND CART SYNC API
export async function getBackendCart(token?: string): Promise<any> {
  const activeToken = token || getStoredToken() || '';
  try {
    const res = await fetchWithFallback(`${API_BASE}/cart`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${activeToken}` },
      mode: 'cors'
    });
    if (!res.ok) throw new Error('دریافت سبد خرید از سرور ناموفق بود.');
    return res.json();
  } catch (err: any) {
    return { items: [] };
  }
}

export async function updateBackendCart(token: string, items: { product_id: string; quantity: number }[]): Promise<any> {
  const res = await fetchWithFallback(`${API_BASE}/cart`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ items }),
    mode: 'cors'
  });
  if (!res.ok) throw new Error('بروزرسانی سبد خرید روی سرور ناموفق بود.');
  return res.json();
}

export const login = loginUser;
export const register = registerUser;
export const requestPayment = getPaymentRequest;

export async function getCart(token?: string): Promise<any> {
  const activeToken = token || getStoredToken();
  if (!activeToken) return { items: [] };
  return getBackendCart(activeToken);
}

export async function addToBackendCart(productId: string, color?: any, decId?: string | null, quantity: number = 1): Promise<any> {
  const token = getStoredToken();
  if (!token) return;
  try {
    const colorName = typeof color === 'object' && color !== null
      ? (color.name || 'کرم')
      : (color ? String(color) : 'کرم');

    const bodyPayload: any = {
      product_id: productId,
      color: colorName,
      quantity
    };
    if (decId) {
      bodyPayload.decoration_id = decId;
    }

    const res = await fetchWithFallback(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bodyPayload),
      mode: 'cors'
    });
    if (res.ok) return res.json();
  } catch (err) {
    console.warn('addToBackendCart error:', err);
  }
}

export async function removeFromBackendCart(productId: string, color?: any, decId?: string | null): Promise<any> {
  // Clearing/managing cart items via clear or sync
  return clearBackendCart();
}

export async function removeAllFromBackendCart(productId: string, color?: any, decId?: string | null): Promise<any> {
  return clearBackendCart();
}

export async function clearBackendCart(): Promise<any> {
  const token = getStoredToken();
  if (!token) return;
  try {
    const res = await fetchWithFallback(`${API_BASE}/cart/clear`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
      mode: 'cors'
    });
    if (res.ok) return res.json();
  } catch (err) {
    console.warn('clearBackendCart error:', err);
  }
}

export async function ensureBackendCart(localCartItems: any[] = []): Promise<string> {
  const token = getStoredToken();
  if (!token) throw new Error('لطفاً ابتدا وارد حساب کاربری خود شوید.');

  let cartRes = await getBackendCart(token);
  let cartData = cartRes?.data || cartRes;
  let cartId = cartData?._id || cartData?.id;
  let items = cartData?.items || [];

  // If backend cart has no items or no valid ID, sync local cart items to backend cart
  if (!cartId || items.length === 0) {
    if (localCartItems && localCartItems.length > 0) {
      for (const item of localCartItems) {
        const pid = item.product?.product_id || item.product?._id || item.product?.id || item.product_id;
        if (!pid) continue;
        const colorName = item.selectedColor?.name || item.color?.name || item.color || 'کرم';
        const decId = item.decoration?.id || item.decoration?._id || item.decoration_id || null;
        const qty = item.quantity || 1;
        await addToBackendCart(pid, colorName, decId, qty);
      }
      // Re-fetch backend cart to get the created cart ID & items
      cartRes = await getBackendCart(token);
      cartData = cartRes?.data || cartRes;
      cartId = cartData?._id || cartData?.id;
    }
  }

  if (!cartId) {
    throw new Error('شناسه سبد خرید یافت نشد. لطفاً ابتدا کالاهایی به سبد خرید خود اضافه کنید.');
  }

  return cartId;
}

export async function getPaymentMethods(): Promise<any[]> {
  try {
    const res = await fetchWithFallback(`${API_BASE}/payment/methods`);
    if (res.ok) {
      const body = await res.json();
      const list = Array.isArray(body) ? body : (body.data || body.methods || []);
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item: any) => {
          const details = item.details || {};
          return {
            ...item,
            title: item.title || item.name || item.label || (item.type === 'card_to_card' ? 'کارت به کارت / واریز به حساب' : 'درگاه پرداخت آنلاین شتابی'),
            card_number: details.card_number || item.card_number || '',
            bank_name: details.bank_name || item.bank_name || '',
            owner_name: details.owner_name || item.owner_name || '',
            sheba: details.sheba || item.sheba || '',
            details: {
              card_number: details.card_number || item.card_number || '',
              bank_name: details.bank_name || item.bank_name || '',
              owner_name: details.owner_name || item.owner_name || '',
              sheba: details.sheba || item.sheba || ''
            }
          };
        });
      }
    }
  } catch (err) {
    console.warn('Failed to fetch payment methods from /api/payment/methods:', err);
  }
  return [];
}

export async function checkOrderStatus(code: string): Promise<any> {
  try {
    const res = await fetchWithFallback(`${API_BASE}/orders/track/${encodeURIComponent(code)}`);
    if (res.ok) return res.json();
  } catch (err) {
    console.warn('Track order endpoint error, trying fallback by ID');
  }
  // Fallback: try get order by ID if tracking endpoint is not present on backend
  const token = getStoredToken() || '';
  return getOrderById(token, code);
}

export const getTrackingStatus = checkOrderStatus;

// GET ORDER BY ID
export async function getOrderById(param1: string, param2?: string): Promise<any> {
  let token = '';
  let id = '';

  if (param2 !== undefined) {
    token = param1;
    id = param2;
  } else {
    id = param1;
    token = getStoredToken() || '';
  }

  const res = await fetchWithFallback(`${API_BASE}/orders/${id}`, {
    method: 'GET',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    mode: 'cors'
  });
  if (!res.ok) throw new Error('سفارش مورد نظر یافت نشد.');
  const body = await res.json();
  return adaptOrder(body);
}

// SHIPPING METHODS
export async function getShippingMethods(): Promise<ShippingMethod[]> {
  try {
    const res = await fetchWithFallback(`${API_BASE}/shipping/methods`, { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error('خطا در دریافت روش‌های ارسال.');
    const body = await res.json();
    return body.data || body;
  } catch (err: any) {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('marmoris_shipping_methods');
      if (cached) {
        return JSON.parse(cached);
      }
    }
    return [];
  }
}

export async function updateShippingMethods(methods: ShippingMethod[]): Promise<boolean> {
  if (typeof window !== 'undefined') {
    localStorage.setItem('marmoris_shipping_methods', JSON.stringify(methods));
  }
  const token = typeof window !== 'undefined' ? localStorage.getItem('marmoris_token') : '';
  const res = await fetchWithFallback(`${API_BASE}/shipping/methods`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    mode: 'cors',
    body: JSON.stringify({ methods })
  });
  return res.ok;
}

export async function getShippingConfig(): Promise<{ default_method_id: string }> {
  try {
    const res = await fetchWithFallback(`${API_BASE}/shipping/config`, { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error('خطا در دریافت تنظیمات ارسال.');
    const body = await res.json();
    return body.data || body;
  } catch (err) {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('marmoris_shipping_config');
      if (cached) {
        return JSON.parse(cached);
      }
    }
    return { default_method_id: '' };
  }
}

export async function updateShippingConfig(config: { default_method_id: string }): Promise<boolean> {
  if (typeof window !== 'undefined') {
    localStorage.setItem('marmoris_shipping_config', JSON.stringify(config));
  }
  const token = typeof window !== 'undefined' ? localStorage.getItem('marmoris_token') : '';
  const res = await fetchWithFallback(`${API_BASE}/shipping/config`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    mode: 'cors',
    body: JSON.stringify(config)
  });
  return res.ok;
}

// REVIEWS
export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const res = await fetchWithFallback(`${API_BASE}/reviews/product/${productId}`, { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error('خطا در دریافت نظرات محصول.');
    const body = await res.json();
    return body.data || body;
  } catch (err: any) {
    return [];
  }
}

export async function submitProductReview(
  token: string,
  productId: string,
  rating: number,
  title: string,
  comment: string
): Promise<any> {
  const res = await fetchWithFallback(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ product_id: productId, rating, title, comment }),
    mode: 'cors'
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || 'ثبت نظر با خطا مواجه شد.');
  }
  return res.json();
}

export async function updateProductReview(
  token: string,
  reviewId: string,
  rating: number,
  title: string,
  comment: string
): Promise<any> {
  const res = await fetchWithFallback(`${API_BASE}/reviews/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ rating, title, comment }),
    mode: 'cors'
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || 'ویرایش نظر با خطا مواجه شد.');
  }
  return res.json();
}

export async function deleteProductReview(token: string, reviewId: string): Promise<any> {
  const res = await fetchWithFallback(`${API_BASE}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    mode: 'cors'
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || 'حذف نظر با خطا مواجه شد.');
  }
  return res.json();
}

// FAQS
export async function getFaqs(): Promise<FAQ[]> {
  try {
    const res = await fetchWithFallback(`${API_BASE}/faqs`, { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error('خطا در دریافت سوالات متداول.');
    const body = await res.json();
    return body.data || body;
  } catch (err: any) {
    return [];
  }
}

// SLIDERS & BANNERS

export function adaptSlider(s: any): Slider {
  let img = s.url || s.image || s.featured_image || '';
  if (img.startsWith('/public/')) {
    img = `https://api.marmoris.store${img}`;
  } else if (img.startsWith('/uploads/')) {
    img = `https://api.marmoris.store${img}`;
  }

  let linkUrl = s.link || '/products';
  if (linkUrl === 'marmoris.store') {
    linkUrl = '/products';
  } else if (!linkUrl.startsWith('/') && !linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
    linkUrl = `https://${linkUrl}`;
  }

  return {
    id: s._id || s.id || String(Math.random()),
    title: s.title || s.alt || 'گالری مرموریس',
    subtitle: s.subtitle || s.description || '',
    image: img,
    url: img,
    featured_image: img,
    link: linkUrl,
    alt: s.alt || s.title || 'اسلایدر مرموریس',
  };
}

export async function getSliders(): Promise<Slider[]> {
  try {
    const res = await fetchWithFallback(`${API_BASE}/sliders`, { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error('خطا در دریافت اسلایدرها.');
    const body = await res.json();
    const rawList = Array.isArray(body) ? body : (body.data || body.sliders || []);
    if (Array.isArray(rawList)) {
      return rawList.filter((s: any) => s.is_active !== false).map(adaptSlider);
    }
    return [];
  } catch (err: any) {
    console.warn('[Marmoris API] Error fetching sliders from backend:', err);
    return [];
  }
}

export async function getBanners(): Promise<Banner[]> {
  try {
    const sliders = await getSliders();
    if (sliders && sliders.length > 0) {
      return sliders.map((s, idx) => ({
        id: s.id,
        key: idx === 0 ? 'bag_banner' : idx === 1 ? 'jewelry_banner' : `banner_${idx}`,
        image: s.image,
        title: s.title,
        subtitle: s.subtitle,
        description: s.subtitle,
        button_text: 'مشاهده محصولات',
        link: s.link || '/products',
        is_active: true
      }));
    }
  } catch (err) {
    console.warn('Error converting sliders to banners:', err);
  }
  return [];
}

// DECORATIONS
export async function getDecorations(): Promise<Decoration[]> {
  try {
    const res = await fetchWithFallback(`${API_BASE}/decorations`, { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error('خطا در دریافت المان‌های تزیینی.');
    const body = await res.json();
    return body.data || body;
  } catch (err: any) {
    return [];
  }
}

// BLOG
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetchWithFallback(`${API_BASE}/blog`, { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error('خطا در دریافت مطالب وبلاگ.');
    const body = await res.json();
    const posts = body.data || body;
    if (Array.isArray(posts)) {
      return posts.map((post: any) => ({
        ...post,
        id: post._id || post.id || String(Math.random()),
        author: typeof post.author === 'object' && post.author !== null 
          ? post.author.full_name || post.author.name || 'مدیریت مرموریس' 
          : post.author || 'مدیریت مرموریس',
      }));
    }
    return [];
  } catch (err: any) {
    return [];
  }
}

export async function getBlogPost(idOrSlug: string): Promise<BlogPost | null> {
  try {
    const res = await fetchWithFallback(`${API_BASE}/blog/${idOrSlug}`, { method: 'GET', mode: 'cors' });
    if (!res.ok) throw new Error('مطلب وبلاگ یافت نشد.');
    const body = await res.json();
    const post = body.data || body;
    if (post) {
      return {
        ...post,
        id: post._id || post.id || idOrSlug,
        author: typeof post.author === 'object' && post.author !== null 
          ? post.author.full_name || post.author.name || 'مدیریت مرموریس' 
          : post.author || 'مدیریت مرموریس',
      };
    }
    return null;
  } catch (err: any) {
    return null;
  }
}

// FILE UPLOAD
export async function uploadFile(token: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetchWithFallback(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
    mode: 'cors'
  });
  if (!res.ok) throw new Error('آپلود فایل با خطا مواجه شد.');
  return res.json();
}

export async function uploadOrderReceipt(token: string, orderId: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetchWithFallback(`${API_BASE}/orders/${orderId}/receipt?folder=receipts`, {
    method: 'PATCH',
    headers,
    body: formData,
    mode: 'cors'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'آپلود فیش پرداخت با خطا مواجه شد.');
  }
  return res.json();
}

// ADMIN ENDPOINTS
export async function getAdminDashboard(token: string): Promise<any> {
  const res = await fetchWithFallback(`${API_BASE}/admin/dashboard`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
    mode: 'cors'
  });
  if (!res.ok) throw new Error('عدم دسترسی به پنل مدیریت.');
  return res.json();
}

export async function getAdminOrders(token: string): Promise<any> {
  try {
    const res = await fetchWithFallback(`${API_BASE}/admin/orders`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      mode: 'cors'
    });
    if (!res.ok) throw new Error('خطا در دریافت سفارشات ادمین.');
    return res.json();
  } catch (err: any) {
    return { data: [] };
  }
}

export async function updateOrderStatus(token: string, orderId: string, status: string): Promise<any> {
  const res = await fetchWithFallback(`${API_BASE}/admin/orders/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status }),
    mode: 'cors'
  });
  if (!res.ok) throw new Error('خطا در بروزرسانی وضعیت سفارش.');
  return res.json();
}

// SEO-friendly slug generator for Persian and English text
export function getSlug(title: string): string {
  if (!title) return 'item';
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9آ-ی۰-۹\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}
