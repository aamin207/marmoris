/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as apiClient from './apiClient';
import moment from 'jalali-moment';

export * from './apiClient';

export function formatToJalali(dateInput: any): string {
  if (!dateInput) return '۱۴۰۵';
  try {
    const m = moment(dateInput);
    if (m.isValid()) {
      return m.locale('fa').format('YYYY/MM/DD');
    }
  } catch (err) {
    console.error('Jalali formatting error:', err);
  }
  return '۱۴۰۵';
}

export const BASE_URL = 'https://api.marmoris.store/api';

export class MarmorisAPI {
  static getStoredToken = apiClient.getStoredToken;
  static setStoredToken = apiClient.setStoredToken;
  static removeStoredToken = apiClient.removeStoredToken;
  
  static login = (mobile: string, pass: string) => apiClient.loginUser(mobile, pass);
  static register = (fullName: string, mobile: string, pass: string) => apiClient.registerUser(fullName, mobile, pass);
  static logout = apiClient.removeStoredToken;
  
  static getProducts = apiClient.getProducts;
  static getProductByIdOrSlug = apiClient.getProductBySlugOrId;
  static getCategories = apiClient.getCategories;
  static getShippingMethods = apiClient.getShippingMethods;
  static getShippingConfig = apiClient.getShippingConfig;
  static getPaymentMethods = apiClient.getPaymentMethods;
  static getCart = apiClient.getCart;
  static getBackendCart = (token?: string) => apiClient.getBackendCart(token || apiClient.getStoredToken() || '');
  static ensureBackendCart = (localItems?: any[]) => apiClient.ensureBackendCart(localItems);
  static checkOrderStatus = apiClient.checkOrderStatus;
  static getTrackingStatus = apiClient.getTrackingStatus;
  static adaptProduct = apiClient.adaptProduct;
  
  static createOrder = apiClient.createOrder;
  static requestPayment = apiClient.getPaymentRequest;
  static uploadOrderReceipt = (orderId: string, file: File) => {
    const token = apiClient.getStoredToken() || '';
    return apiClient.uploadOrderReceipt(token, orderId, file);
  };
  static getOrderById = apiClient.getOrderById;
  static getAdminOrders = () => {
    const token = apiClient.getStoredToken() || '';
    return apiClient.getAdminOrders(token);
  };
  static updateOrderStatus = (orderId: string, status: string) => {
    const token = apiClient.getStoredToken() || '';
    return apiClient.updateOrderStatus(token, orderId, status);
  };
  
  static getProfile = () => {
    const token = apiClient.getStoredToken() || '';
    return apiClient.getProfile(token);
  };
  static updateProfile = (fullName: string, email: string) => {
    const token = apiClient.getStoredToken() || '';
    return apiClient.updateProfile(token, fullName, email);
  };
  static getMyOrders = () => {
    const token = apiClient.getStoredToken() || '';
    return apiClient.getMyOrders(token);
  };
}
