// Type definitions for SQLite-compatible enums
// These replace the Prisma enums that aren't supported in SQLite

export type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED';

export type PaymentStatus = 
  | 'PENDING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'REFUNDED';

export type DocumentStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED';

export type ProductStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'DISABLED';

export type PlanType = 'FREE' | 'PREMIUM';

// Helper functions for validation
export const isValidUserRole = (role: string): role is UserRole => {
  return ['CUSTOMER', 'VENDOR', 'ADMIN'].includes(role);
};

export const isValidOrderStatus = (status: string): status is OrderStatus => {
  return ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status);
};

export const isValidPaymentStatus = (status: string): status is PaymentStatus => {
  return ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].includes(status);
};

export const isValidDocumentStatus = (status: string): status is DocumentStatus => {
  return ['PENDING', 'APPROVED', 'REJECTED'].includes(status);
};

export const isValidProductStatus = (status: string): status is ProductStatus => {
  return ['PENDING', 'APPROVED', 'REJECTED', 'DISABLED'].includes(status);
};

export const isValidPlanType = (type: string): type is PlanType => {
  return ['FREE', 'PREMIUM'].includes(type);
};
