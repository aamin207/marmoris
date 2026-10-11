/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, CartItem, Product, Order } from '@/types';
import * as api from '@/lib/api';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  // Authentication State & Token
  user: User | null;
  token: string | null;
  loading: boolean;
  orders: Order[];
  
  // Shopping Cart State
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;

  // Authentication Methods
  login: (mobile: string, pass: string) => Promise<boolean>;
  signup: (fullName: string, mobile: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (fullName: string, email: string) => Promise<void>;
  
  // Cart Actions
  addToCart: (product: Product, quantity: number, selectedSize?: string, selectedColor?: { name: string; hex: string; price?: number; inStock?: boolean; stock?: number }, decoration?: { id: string; name: string; image: string; additional_price: number; status: string; inStock?: boolean; stock?: number } | null) => void;
  removeFromCart: (productId: string, selectedSize?: string, selectedColorHex?: string, decorationId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string, selectedColorHex?: string, decorationId?: string | null) => void;
  clearCart: () => void;

  // Order & Payment Checkout Integration
  placeBackendOrder: (cartId: string, address: any, shippingMethodId: string, note: string, paymentMethod?: string, paymentMethodId?: string) => Promise<any>;
  requestPaymentRedirect: (orderId: string) => Promise<string>;
  fetchUserOrders: () => Promise<void>;

  // Toast System
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const GUEST_FALLBACK_USER: User = {
  id: 'guest_99',
  email: 'guest@marmoris.store',
  fullName: 'کاربر مهمان',
  firstName: 'کاربر',
  lastName: 'مهمان',
  phone: '09100000000',
  address: {
    street: '',
    city: '',
    province: '',
    postalCode: ''
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 4000ms
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initial State Load (SSR-safe LocalStorage Sync)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('marmoris_token');
      const savedUser = localStorage.getItem('marmoris_user');
      const savedOrders = localStorage.getItem('marmoris_orders');
      const savedCart = localStorage.getItem('marmoris_cart');

      if (savedToken) {
        setToken(savedToken);
        api.setStoredToken(savedToken);
        
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (_) {}
        }

        // Fetch user profile from live backend server to sync state
        api.getProfile()
          .then((profileData) => {
            const profile = profileData.data?.user || profileData.data || profileData;
            if (profile) {
              const u: User = {
                id: profile.id || profile._id || 'user',
                email: profile.email || 'user@marmoris.store',
                fullName: profile.full_name || 'کاربر',
                firstName: profile.full_name || 'کاربر',
                lastName: '',
                phone: profile.mobile || '',
                address: {
                  street: profile.address?.street || '',
                  city: profile.address?.city || '',
                  province: profile.address?.state || profile.address?.province || '',
                  postalCode: profile.address?.postal_code || profile.address?.postalCode || ''
                }
              };
              setUser(u);
              localStorage.setItem('marmoris_user', JSON.stringify(u));
            }
          })
          .catch((err) => {
            console.warn('Real profile fetch failed (using local fallback cache):', err);
          });
      }

      if (savedOrders) {
        try {
          setOrders(JSON.parse(savedOrders));
        } catch (_) {}
      }

      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.map((item: any) => {
              if (!item.product) return null;
              
              let cleanedColor: { name: string; hex: string; price?: number } | undefined = undefined;
              if (item.selectedColor) {
                if (typeof item.selectedColor === 'object') {
                  const colorName = item.selectedColor.name;
                  const finalColorName = typeof colorName === 'object' && colorName !== null
                    ? (colorName.fa || colorName.name || colorName.en || 'نامشخص')
                    : (colorName || 'نامشخص');
                    
                  cleanedColor = {
                    name: finalColorName,
                    hex: item.selectedColor.hex || item.selectedColor.code || '#111111',
                    price: item.selectedColor.price
                  };
                } else {
                  cleanedColor = { name: String(item.selectedColor), hex: '#111111' };
                }
              }

              let cleanedDec: { id: string; name: string; image: string; additional_price: number; status: string } | undefined = undefined;
              if (item.decoration) {
                const decName = item.decoration.name;
                const finalDecName = typeof decName === 'object' && decName !== null
                  ? (decName.fa || decName.name || decName.en || 'تزیین')
                  : (decName || 'تزیین');

                cleanedDec = {
                  id: item.decoration.id || item.decoration._id || String(Math.random()),
                  name: finalDecName,
                  image: item.decoration.image || '',
                  additional_price: Number(item.decoration.additional_price || item.decoration.additionalPrice || 0),
                  status: item.decoration.status || 'published'
                };
              }

              return {
                ...item,
                selectedColor: cleanedColor,
                decoration: cleanedDec
              };
            }).filter(Boolean) as CartItem[];
            setCart(cleaned);
          }
        } catch (_) {}
      }
    }
    setLoading(false);
  }, []);

  // 2. Fetch Order History & Sync Cart (Executed upon token initialization or change)
  useEffect(() => {
    if (token) {
      fetchUserOrders();
      
      // Sync or fetch remote cart from live backend
      const loadRemoteCart = async () => {
        try {
          const res = await api.getBackendCart();
          const remoteCart = res.data || res;
          if (res.warnings && Array.isArray(res.warnings) && res.warnings.length > 0) {
            res.warnings.forEach((warn: string) => showToast(warn, 'warning'));
          }
          if (remoteCart && Array.isArray(remoteCart.items)) {
            // If local cart is empty, populate it from the backend
            if (cart.length === 0 && remoteCart.items.length > 0) {
              const convertedItems: CartItem[] = [];
              for (const item of remoteCart.items) {
                const rawProduct = item.product_id || item.product;
                if (rawProduct) {
                  const adapted = api.adaptProduct(rawProduct);
                  const dec = item.decoration ? {
                    id: item.decoration._id || item.decoration.id,
                    name: typeof item.decoration.name === 'object' && item.decoration.name !== null
                      ? (item.decoration.name.fa || item.decoration.name.name || item.decoration.name.en || 'تزیین')
                      : (item.decoration.name || 'تزیین'),
                    image: item.decoration.image ? (item.decoration.image.startsWith('/public/') || item.decoration.image.startsWith('/uploads/') ? `https://api.marmoris.store${item.decoration.image}` : item.decoration.image) : '',
                    additional_price: Number(item.decoration.additional_price || item.decoration.additionalPrice || 0),
                    status: item.decoration.status || 'published'
                  } : undefined;

                  let finalColor: { name: string; hex: string; price?: number } | undefined = undefined;
                  if (item.color) {
                    if (typeof item.color === 'object') {
                      const colorName = item.color.name;
                      const finalColorName = typeof colorName === 'object' && colorName !== null
                        ? (colorName.fa || colorName.name || colorName.en || 'نامشخص')
                        : (colorName || 'نامشخص');
                      finalColor = {
                        name: finalColorName,
                        hex: item.color.code || item.color.hex || '#111111',
                        price: item.color.price
                      };
                    } else {
                      finalColor = { name: String(item.color), hex: '#111111' };
                    }
                  }

                  convertedItems.push({
                    product: adapted,
                    quantity: item.quantity || 1,
                    selectedSize: item.size || 'استاندارد',
                    selectedColor: finalColor,
                    decoration: dec
                  });
                }
              }
              if (convertedItems.length > 0) {
                setCart(convertedItems);
              }
            } else if (cart.length > 0) {
              // If local cart has items, sync our local items to the backend immediately using /cart/clear and /cart/add
              try {
                await api.clearBackendCart();
              } catch (e) {
                console.warn('Could not clear remote cart:', e);
              }
              for (const item of cart) {
                const pid = item.product.id;
                const col = item.selectedColor?.name || 'کرم';
                const decId = item.decoration?.id || null;
                for (let q = 0; q < item.quantity; q++) {
                  try {
                    await api.addToBackendCart(pid, col, decId);
                  } catch (addErr) {
                    console.error('Could not sync item to backend on startup:', addErr);
                  }
                }
              }
            }
          }
        } catch (err) {
          console.warn('Could not sync/fetch remote cart on startup:', err);
        }
      };
      
      loadRemoteCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 3. Keep shopping cart state synchronized with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      localStorage.setItem('marmoris_cart', JSON.stringify(cart));
    }
  }, [cart, loading]);

  const fetchUserOrders = async () => {
    try {
      const orderList = await api.getMyOrders();
      setOrders(orderList);
      if (typeof window !== 'undefined') {
        localStorage.setItem('marmoris_orders', JSON.stringify(orderList));
      }
    } catch (err) {
      console.warn('Could not sync remote orders history:', err);
    }
  };

  // ---------------------------------------------------------------------------
  // AUTHENTICATION STATE ACTIONS
  // ---------------------------------------------------------------------------

  const login = async (mobile: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.login(mobile, pass);
      const activeToken = res?.data?.token || res?.token;
      const profile = res?.data?.user || res?.user || res?.data || res;

      if (activeToken) {
        setToken(activeToken);
        api.setStoredToken(activeToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('marmoris_token', activeToken);
        }

        const u: User = {
          id: profile?.id || profile?._id || 'user',
          email: profile?.email || 'user@marmoris.store',
          fullName: profile?.full_name || 'کاربر',
          firstName: profile?.full_name || 'کاربر',
          lastName: '',
          phone: profile?.mobile || mobile,
          address: {
            street: profile?.address?.street || '',
            city: profile?.address?.city || '',
            province: profile?.address?.state || profile?.address?.province || '',
            postalCode: profile?.address?.postal_code || profile?.address?.postalCode || ''
          }
        };

        setUser(u);
        if (typeof window !== 'undefined') {
          localStorage.setItem('marmoris_user', JSON.stringify(u));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login action encountered error:', err);
      // Clean fallback for developer offline/bypass sandbox environments
      if (process.env.NODE_ENV !== 'production') {
        const fallbackUser = { ...GUEST_FALLBACK_USER, phone: mobile };
        setToken('sandbox_dev_token');
        setUser(fallbackUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('marmoris_token', 'sandbox_dev_token');
          localStorage.setItem('marmoris_user', JSON.stringify(fallbackUser));
        }
        return true;
      }
      throw err;
    }
  };

  const signup = async (fullName: string, mobile: string, pass: string): Promise<boolean> => {
    try {
      await api.register(fullName, mobile, pass);
      return login(mobile, pass);
    } catch (err) {
      console.error('Signup action encountered error:', err);
      if (process.env.NODE_ENV !== 'production') {
        const fallbackUser = {
          ...GUEST_FALLBACK_USER,
          fullName: fullName || 'کاربر',
          firstName: fullName || 'کاربر',
          lastName: '',
          phone: mobile
        };
        setToken('sandbox_dev_token');
        setUser(fallbackUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('marmoris_token', 'sandbox_dev_token');
          localStorage.setItem('marmoris_user', JSON.stringify(fallbackUser));
        }
        return true;
      }
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setOrders([]);
    setCart([]);
    api.removeStoredToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('marmoris_token');
      localStorage.removeItem('marmoris_user');
      localStorage.removeItem('marmoris_orders');
      localStorage.removeItem('marmoris_cart');
    }
  };

  const updateUserProfile = async (fullName: string, email: string) => {
    try {
      await api.updateProfile(fullName, email);
    } catch (err) {
      console.warn('Backend update profile failed:', err);
    }

    setUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        fullName: fullName || 'کاربر',
        firstName: fullName || 'کاربر',
        lastName: '',
        email
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('marmoris_user', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // ---------------------------------------------------------------------------
  // SHOPPING CART STATE ACTIONS
  // ---------------------------------------------------------------------------

  const addToCart = (
    product: Product,
    quantity: number,
    selectedSize?: string,
    selectedColor?: { name: string; hex: string; price?: number },
    decoration?: { id: string; name: string; image: string; additional_price: number; status: string } | null
  ) => {
    // Inventory Guard: Do not allow adding out-of-stock product or variants to cart
    if (product.inStock === false || (product.stock !== undefined && product.stock <= 0)) {
      showToast('این محصول در حال حاضر ناموجود است.', 'error');
      return;
    }

    if (selectedColor) {
      const matchedColor = product.colors?.find((c) => c.hex === selectedColor.hex || c.name === selectedColor.name);
      if (matchedColor && (matchedColor.inStock === false || (matchedColor.stock !== undefined && matchedColor.stock <= 0))) {
        showToast('رنگ انتخاب شده برای این محصول ناموجود است.', 'error');
        return;
      }
    }

    if (decoration) {
      if (
        decoration.status === 'out_of_stock' ||
        (decoration as any).inStock === false ||
        ((decoration as any).stock !== undefined && (decoration as any).stock <= 0)
      ) {
        showToast('تزیین انتخاب شده برای این محصول ناموجود است.', 'error');
        return;
      }
    }

    // 1. Update optimistic UI state
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor?.hex === selectedColor?.hex &&
          ((!item.decoration && !decoration) || item.decoration?.id === decoration?.id)
      );

      if (existingIndex > -1) {
        const nextCart = [...prev];
        nextCart[existingIndex] = {
          ...nextCart[existingIndex],
          quantity: nextCart[existingIndex].quantity + quantity
        };
        return nextCart;
      }

      return [...prev, { product, quantity, selectedSize, selectedColor, decoration: decoration || undefined }];
    });

    // 2. Trigger asynchronous backend sync if authenticated
    if (token) {
      const pid = product.id;
      const col = selectedColor?.name || 'کرم';
      const decId = decoration?.id || null;
      const syncBackend = async () => {
        try {
          for (let q = 0; q < quantity; q++) {
            await api.addToBackendCart(pid, col, decId);
          }
        } catch (err) {
          console.error('Failed to sync added item to backend:', err);
        }
      };
      syncBackend();
    }
  };

  const removeFromCart = (productId: string, selectedSize?: string, selectedColorHex?: string, decorationId?: string | null) => {
    // Find item to get its color name
    const itemToRemove = cart.find(
      (item) =>
        item.product.id === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor?.hex === selectedColorHex &&
        ((!item.decoration && !decorationId) || item.decoration?.id === decorationId)
    );

    // 1. Update local state
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor?.hex === selectedColorHex &&
            ((!item.decoration && !decorationId) || item.decoration?.id === decorationId)
          )
      )
    );

    // 2. Sync deletion to backend
    if (token && itemToRemove) {
      const pid = itemToRemove.product.id;
      const col = itemToRemove.selectedColor?.name || 'کرم';
      const decId = decorationId || null;
      const syncBackend = async () => {
        try {
          await api.removeAllFromBackendCart(pid, col, decId);
        } catch (err) {
          console.error('Failed to sync item removal to backend:', err);
        }
      };
      syncBackend();
    }
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    selectedSize?: string,
    selectedColorHex?: string,
    decorationId?: string | null
  ) => {
    const existingItem = cart.find(
      (item) =>
        item.product.id === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor?.hex === selectedColorHex &&
        ((!item.decoration && !decorationId) || item.decoration?.id === decorationId)
    );

    if (!existingItem) return;

    if (quantity <= 0) {
      removeFromCart(productId, selectedSize, selectedColorHex, decorationId);
      return;
    }

    const diff = quantity - existingItem.quantity;

    // 1. Update local state
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor?.hex === selectedColorHex &&
        ((!item.decoration && !decorationId) || item.decoration?.id === decorationId)
          ? { ...item, quantity }
          : item
      )
    );

    // 2. Sync difference to backend
    if (token) {
      const pid = existingItem.product.id;
      const col = existingItem.selectedColor?.name || 'کرم';
      const decId = decorationId || null;
      const syncBackend = async () => {
        try {
          if (diff > 0) {
            for (let d = 0; d < diff; d++) {
              await api.addToBackendCart(pid, col, decId);
            }
          } else if (diff < 0) {
            for (let d = 0; d < Math.abs(diff); d++) {
              await api.removeFromBackendCart(pid, col, decId);
            }
          }
        } catch (err) {
          console.error('Failed to sync quantity update to backend:', err);
        }
      };
      syncBackend();
    }
  };

  const clearCart = () => {
    // 1. Update local state
    setCart([]);

    // 2. Sync to backend
    if (token) {
      const syncBackend = async () => {
        try {
          await api.clearBackendCart();
        } catch (err) {
          console.error('Failed to clear cart on backend:', err);
        }
      };
      syncBackend();
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => {
    const basePrice = item.selectedColor?.price || item.product.price;
    const discountPercent = item.product.discount_percentage || 0;
    let finalPrice = basePrice - (basePrice * discountPercent / 100);
    if (item.decoration) {
      finalPrice += item.decoration.additional_price;
    }
    return total + finalPrice * item.quantity;
  }, 0);

  // ---------------------------------------------------------------------------
  // SECURE ORDER AND REDIRECTION GATEWAY FLOWS
  // ---------------------------------------------------------------------------

  const placeBackendOrder = async (cartId: string, address: any, shippingMethodId: string, note: string, paymentMethod?: string, paymentMethodId?: string): Promise<any> => {
    try {
      let activeCartId = cartId;
      if (!activeCartId || activeCartId === 'sandbox_cart_123') {
        activeCartId = await api.ensureBackendCart(cart);
      }
      const orderRes = await api.createOrder(activeCartId, address, shippingMethodId, note, paymentMethod, paymentMethodId, cart);
      const placedOrder = orderRes.data || orderRes.order || orderRes;
      await fetchUserOrders();
      return placedOrder;
    } catch (err) {
      console.error('Order placement failed:', err);
      throw err;
    }
  };

  const requestPaymentRedirect = async (orderId: string): Promise<string> => {
    try {
      const paymentRes = await api.requestPayment(orderId);
      const redirectUrl =
        paymentRes?.data?.data?.url ||
        paymentRes?.data?.url ||
        paymentRes?.data?.payment_url ||
        paymentRes?.payment_url ||
        paymentRes?.url;

      if (!redirectUrl) {
        console.warn('No payment URL found in response, using default fallback for order:', orderId, paymentRes);
        return `/payment/success?order_id=${orderId}`;
      }
      return redirectUrl;
    } catch (err) {
      console.error('Payment redirection acquisition failed:', err);
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        orders,
        token,
        loading,
        cart,
        cartCount,
        cartTotal,
        login,
        signup,
        logout,
        updateUserProfile,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeBackendOrder,
        requestPaymentRedirect,
        fetchUserOrders,
        showToast
      }}
    >
      {children}

      {/* Elegantly Designed Floating Toast Notifications Portal */}
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 md:px-0">
        {toasts.map((toast) => {
          let bgClass = '';
          let borderClass = '';
          let iconColor = '';
          let textColor = '';
          let icon = 'ℹ️';

          if (toast.type === 'success') {
            bgClass = 'bg-[#F6FCD2]';
            borderClass = 'border-[#7A8F3D]/30';
            iconColor = 'text-[#7A8F3D]';
            textColor = 'text-[#1E2911]';
            icon = '✓';
          } else if (toast.type === 'error') {
            bgClass = 'bg-[#FEDFDF]';
            borderClass = 'border-[#D47FBF]/30';
            iconColor = 'text-red-600';
            textColor = 'text-[#1E2911]';
            icon = '✕';
          } else if (toast.type === 'warning') {
            bgClass = 'bg-amber-50';
            borderClass = 'border-amber-200';
            iconColor = 'text-amber-600';
            textColor = 'text-amber-950';
            icon = '⚠️';
          } else {
            bgClass = 'bg-blue-50';
            borderClass = 'border-blue-200';
            iconColor = 'text-blue-600';
            textColor = 'text-blue-950';
            icon = 'ℹ️';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start justify-between gap-3 px-4 py-3.5 rounded-2xl border ${bgClass} ${borderClass} shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md transition-all duration-300 transform translate-y-0 scale-100 animate-slide-in-toast`}
              dir="rtl"
            >
              <div className="flex items-start gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${iconColor} bg-white border border-current/10 shadow-sm`}>
                  {icon}
                </span>
                <p className={`text-xs font-medium leading-relaxed ${textColor}`}>
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-700 transition-colors shrink-0 text-sm p-0.5 leading-none"
                aria-label="بستن"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </AppContext.Provider>
  );
}

/**
 * Primary Custom React Hook to access Marmoris State Context
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

/**
 * Backward-compatible helper hook for views importing useAuth
 */
export function useAuth() {
  const context = useAppContext();
  return {
    user: context.user,
    orders: context.orders,
    token: context.token,
    loading: context.loading,
    login: context.login,
    signup: context.signup,
    logout: context.logout,
    updateUserProfile: context.updateUserProfile,
    placeBackendOrder: context.placeBackendOrder,
    requestPaymentRedirect: context.requestPaymentRedirect,
    fetchUserOrders: context.fetchUserOrders,
    showToast: context.showToast
  };
}

/**
 * Backward-compatible helper hook for views importing useCart
 */
export function useCart() {
  const context = useAppContext();
  return {
    cart: context.cart,
    addToCart: context.addToCart,
    removeFromCart: context.removeFromCart,
    updateQuantity: context.updateQuantity,
    clearCart: context.clearCart,
    cartCount: context.cartCount,
    cartTotal: context.cartTotal,
    showToast: context.showToast
  };
}
