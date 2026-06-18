import type { Record } from '../types';

export const calculateDiscountPrice = (originalPrice: number, discount: number): number => {
  return Number((originalPrice * (discount / 10)).toFixed(2));
};

export const calculateSavings = (originalPrice: number, discount: number): number => {
  return Number((originalPrice - calculateDiscountPrice(originalPrice, discount)).toFixed(2));
};

export const calculateDaysUntilExpiry = (expiryDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const formatCurrency = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

export const formatDiscount = (discount: number): string => {
  return `${discount}折`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  });
};

export const getExpiryStatus = (days: number): { status: string; color: string; bgColor: string } => {
  if (days <= 0) {
    return { status: '已过期', color: 'text-crimson-700', bgColor: 'bg-red-100' };
  } else if (days <= 3) {
    return { status: '紧急', color: 'text-crimson-700', bgColor: 'bg-red-100' };
  } else if (days <= 7) {
    return { status: '临期', color: 'text-amber-700', bgColor: 'bg-amber-100' };
  } else if (days <= 14) {
    return { status: '优惠', color: 'text-forest-700', bgColor: 'bg-green-100' };
  } else {
    return { status: '充足', color: 'text-map-600', bgColor: 'bg-blue-100' };
  }
};

export const getMonthKey = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const getMonthLabel = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  return `${year}年${parseInt(month)}月`;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateTotalSavings = (records: Record[]): number => {
  return records.reduce((total, record) => {
    return total + calculateSavings(record.originalPrice, record.discount);
  }, 0);
};

export const calculateAverageDiscount = (records: Record[]): number => {
  if (records.length === 0) return 0;
  const total = records.reduce((sum, record) => sum + record.discount, 0);
  return Number((total / records.length).toFixed(1));
};
