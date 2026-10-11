/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '@/types';
import { getProductsPaginated } from '@/lib/apiClient';

export interface UseInfiniteProductsOptions {
  categoryFilter?: string;
  searchQuery?: string;
  sortBy?: string;
  priceRange?: number;
  limit?: number;
  enabled?: boolean;
}

export interface UseInfiniteProductsReturn {
  products: Product[];
  loadingInitial: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  totalPages: number;
  totalProducts: number;
  loadMore: () => void;
  retry: () => void;
  targetRef: (node: HTMLElement | null) => void;
}

/**
 * Custom Hook for Infinite Scroll Product Listing with robust guards preventing rapid multi-page triggers.
 *
 * FIX FOR INFINITE SCROLL BUG:
 * When the user reaches the bottom of the list and a page fetch completes, if the user has not scrolled away
 * from the bottom, the sentinel element remains continuously intersecting the viewport. Without proper guards,
 * the IntersectionObserver fires callbacks continuously on the stale intersection state, loading all pages
 * back-to-back in rapid succession.
 *
 * SOLUTION APPLIED:
 * 1. GUARD 1 (isFetchingRef): Set to true the instant fetch starts, ignoring any incoming intersection events.
 * 2. GUARD 2 (wasIntersectingRef & Unobserve/Re-observe): Unobserves the sentinel during fetch and requires
 *    a fresh transition from "not intersecting" to "intersecting" after DOM layout settles.
 * 3. GUARD 3 (lastFetchTimeRef): Enforces a minimum time-based cooldown (500ms) between page loads.
 * 4. GUARD 4 (hasMoreRef / totalPagesRef): Disconnects the observer entirely once the final page is reached.
 */
export function useInfiniteProducts({
  categoryFilter = 'all',
  searchQuery = '',
  sortBy = 'default',
  priceRange,
  limit = 10,
  enabled = true,
}: UseInfiniteProductsOptions = {}): UseInfiniteProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // GUARD 1: Ref tracking active fetch state synchronously to avoid react state update delays
  const isFetchingRef = useRef<boolean>(false);

  // GUARD 2: Ref tracking if sentinel was previously intersecting to detect genuine fresh transitions
  // (Prevents firing on continuous intersection when user remains at page bottom post-load)
  const wasIntersectingRef = useRef<boolean>(false);

  // GUARD 3: Ref tracking timestamp of last fetch to enforce a minimum cooldown safety net
  const lastFetchTimeRef = useRef<number>(0);

  // GUARD 4: State refs kept in sync for synchronous access inside observer callbacks
  const hasMoreRef = useRef<boolean>(true);
  const pageRef = useRef<number>(1);
  const totalPagesRef = useRef<number>(1);
  const loadingInitialRef = useRef<boolean>(true);

  // DOM node & observer refs
  const sentinelNodeRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Keep state refs in sync on state changes
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    totalPagesRef.current = totalPages;
  }, [totalPages]);

  useEffect(() => {
    loadingInitialRef.current = loadingInitial;
  }, [loadingInitial]);

  // Keep latest filter options in ref for async callbacks
  const optionsRef = useRef({ categoryFilter, searchQuery, sortBy, priceRange, limit });
  useEffect(() => {
    optionsRef.current = { categoryFilter, searchQuery, sortBy, priceRange, limit };
  }, [categoryFilter, searchQuery, sortBy, priceRange, limit]);

  // Request counter to avoid race conditions when filters change quickly
  const activeFetchRef = useRef<number>(0);

  // Main fetch runner
  const fetchPage = useCallback(
    async (targetPage: number, isReset = false) => {
      if (!enabled) return;

      const fetchId = ++activeFetchRef.current;

      // GUARD 1: Set isFetchingRef to true IMMEDIATELY before async operations begin
      isFetchingRef.current = true;

      if (isReset) {
        setLoadingInitial(true);
        setError(null);
      } else {
        setLoadingMore(true);
        setError(null);
      }

      try {
        const currentOpts = optionsRef.current;
        const res = await getProductsPaginated({
          page: targetPage,
          limit: currentOpts.limit,
          categoryFilter: currentOpts.categoryFilter,
          searchQuery: currentOpts.searchQuery,
          sortBy: currentOpts.sortBy,
          priceRange: currentOpts.priceRange,
        });

        // Ignore stale responses from earlier filter changes
        if (fetchId !== activeFetchRef.current) return;

        const newProducts = res.products || [];
        const pagination = res.pagination || {
          page: targetPage,
          limit: currentOpts.limit,
          total: newProducts.length,
          total_pages: 1,
        };

        const totalP = Math.max(1, Number(pagination.total_pages || 1));
        const totalItems = Number(pagination.total || 0);

        setTotalPages(totalP);
        totalPagesRef.current = totalP;

        setTotalProducts(totalItems);

        setPage(targetPage);
        pageRef.current = targetPage;

        if (isReset) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const uniqueAdditions = newProducts.filter((p) => !existingIds.has(p.id));
            return [...prev, ...uniqueAdditions];
          });
        }

        // GUARD 4: Check if more pages exist (page < total_pages)
        const canLoadMore = targetPage < totalP && newProducts.length > 0;
        setHasMore(canLoadMore);
        hasMoreRef.current = canLoadMore;
      } catch (err: any) {
        if (fetchId !== activeFetchRef.current) return;
        console.error('Error in useInfiniteProducts fetch:', err);
        setError(err?.message || 'خطا در دریافت اطلاعات محصولات. لطفاً دوباره تلاش کنید.');
      } finally {
        if (fetchId === activeFetchRef.current) {
          setLoadingInitial(false);
          setLoadingMore(false);

          // GUARD 1 & 2: Reset fetching guard ONLY after DOM rendering and paint complete.
          // Since the user may still be sitting at the bottom of the page when data finishes loading,
          // the sentinel node might still intersect the viewport. Delaying guard release and re-observing
          // after a DOM paint ensures the observer requires a fresh intersection event rather than firing
          // on a stale continuous intersection state.
          requestAnimationFrame(() => {
            setTimeout(() => {
              isFetchingRef.current = false;

              // Re-observe sentinel if more pages exist
              if (hasMoreRef.current && observerRef.current && sentinelNodeRef.current) {
                observerRef.current.observe(sentinelNodeRef.current);
              }
            }, 300); // 300ms post-render cooldown
          });
        }
      }
    },
    [enabled]
  );

  // Load next page function
  const loadMore = useCallback(() => {
    // GUARD 1: Completely ignore if a fetch is already in progress
    if (isFetchingRef.current) return;

    // GUARD 4: Completely ignore if no more pages exist
    if (!hasMoreRef.current || pageRef.current >= totalPagesRef.current) return;

    // GUARD 3: Time-based cooldown check (minimum 500ms between page loads)
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 500) return;

    const nextPage = pageRef.current + 1;
    if (nextPage <= totalPagesRef.current) {
      lastFetchTimeRef.current = now;
      isFetchingRef.current = true;

      // GUARD 2: Unobserve sentinel immediately when fetch starts so it cannot fire repeatedly during load
      if (observerRef.current && sentinelNodeRef.current) {
        observerRef.current.unobserve(sentinelNodeRef.current);
      }

      fetchPage(nextPage, false);
    }
  }, [fetchPage]);

  // Reset page and products on filter or query change
  useEffect(() => {
    setPage(1);
    pageRef.current = 1;

    setHasMore(true);
    hasMoreRef.current = true;

    // Reset guards on filter change
    isFetchingRef.current = false;
    wasIntersectingRef.current = false;
    lastFetchTimeRef.current = 0;

    fetchPage(1, true);
  }, [categoryFilter, searchQuery, sortBy, priceRange, limit, fetchPage]);

  // Retry failed request
  const retry = useCallback(() => {
    setError(null);
    isFetchingRef.current = false;
    wasIntersectingRef.current = false;
    lastFetchTimeRef.current = 0;

    if (products.length === 0 || page === 1) {
      fetchPage(1, true);
    } else {
      fetchPage(page, false);
    }
  }, [products.length, page, fetchPage]);

  // IntersectionObserver effect with proper cleanup (React Strict Mode compliant)
  useEffect(() => {
    const node = sentinelNodeRef.current;
    if (!node || loadingInitial || !hasMore) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        // Track when sentinel leaves viewport so the next entry is treated as a fresh transition
        if (!entry.isIntersecting) {
          wasIntersectingRef.current = false;
          return;
        }

        // GUARD 1: Ignore intersection events while a fetch is active or completing
        if (isFetchingRef.current) {
          return;
        }

        // GUARD 4: Stop observer if end of list is reached
        if (!hasMoreRef.current || pageRef.current >= totalPagesRef.current) {
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
          return;
        }

        // GUARD 2: Require a genuine transition from "not intersecting" to "intersecting".
        // If the sentinel was ALREADY intersecting (i.e. user has not scrolled away since the last load),
        // ignore this event to prevent back-to-back rapid pagination loops.
        if (wasIntersectingRef.current) {
          return;
        }

        // GUARD 3: Time-based cooldown safety net (500ms minimum between consecutive page loads)
        const now = Date.now();
        if (now - lastFetchTimeRef.current < 500) {
          return;
        }

        // Mark transition as handled and load next page
        wasIntersectingRef.current = true;
        loadMore();
      },
      {
        root: null,
        rootMargin: '200px', // Pre-fetch 200px before bottom
        threshold: 0,
      }
    );

    if (!isFetchingRef.current) {
      observerRef.current.observe(node);
    }

    // Clean up observer on effect re-run or unmount to prevent memory leaks in Strict Mode
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [loadingInitial, hasMore, loadMore]);

  // Callback ref for the sentinel element in DOM
  const targetRef = useCallback((node: HTMLElement | null) => {
    sentinelNodeRef.current = node;

    if (!node) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      return;
    }

    if (observerRef.current && !isFetchingRef.current && hasMoreRef.current && !loadingInitialRef.current) {
      observerRef.current.disconnect();
      observerRef.current.observe(node);
    }
  }, []);

  return {
    products,
    loadingInitial,
    loadingMore,
    error,
    hasMore,
    page,
    totalPages,
    totalProducts,
    loadMore,
    retry,
    targetRef,
  };
}
