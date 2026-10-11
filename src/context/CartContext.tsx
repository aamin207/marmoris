/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { useCart as useCartFromAppContext } from './AppContext';

export { useCartFromAppContext as useCart };

/**
 * Safely retrieves and parses cart data from localStorage.
 */
export function getSafeCartFromStorage(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const savedCart = localStorage.getItem('marmoris_cart');
    if (!savedCart) return [];
    const parsed = JSON.parse(savedCart);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error parsing cart from localStorage:', e);
    return [];
  }
}

/**
 * Backward-compatible CartProvider wrapper.
 * Since the app now uses a single AppProvider as the core state manager,
 * this provider simply acts as a passthrough to prevent breaking any existing layouts.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
