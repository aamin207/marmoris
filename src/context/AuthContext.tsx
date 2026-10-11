/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { useAuth as useAuthFromAppContext } from './AppContext';

export { useAuthFromAppContext as useAuth };

/**
 * Safely retrieves and parses auth data from localStorage.
 */
export function getSafeAuthFromStorage(): { token: string | null; user: any | null } {
  if (typeof window === 'undefined') return { token: null, user: null };
  try {
    const savedToken = localStorage.getItem('marmoris_token');
    const savedUser = localStorage.getItem('marmoris_user');
    return {
      token: savedToken,
      user: savedUser ? JSON.parse(savedUser) : null,
    };
  } catch (e) {
    console.error('Error parsing auth from localStorage:', e);
    return { token: null, user: null };
  }
}

/**
 * Backward-compatible AuthProvider wrapper.
 * Since the app now uses a single AppProvider as the core state manager,
 * this provider simply acts as a passthrough to prevent breaking any existing layouts.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
