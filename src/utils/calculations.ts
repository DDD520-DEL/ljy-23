import type { Record, StatsData, SupermarketStat, CategoryStat, MonthStat, ProductPriceHistory, PriceHistoryPoint } from '../types';
import { defaultSupermarkets, getCategoryColor } from './mockData';

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

export const computeStatsFromRecords = (records: Record[]): StatsData => {
  if (records.length === 0) {
    return {
      totalRecords: 0,
      totalSavings: 0,
      averageDiscount: 0,
      latestRecord: null,
      bySupermarket: [],
      byCategory: [],
      byMonth: [],
    };
  }

  const totalSavings = calculateTotalSavings(records);
  const averageDiscount = calculateAverageDiscount(records);
  const latestRecord = records[0];

  const supermarketMap = new Map<string, { count: number; totalSavings: number; totalDiscount: number; x: number; y: number }>();
  const categoryMap = new Map<string, { count: number; totalSavings: number; totalDiscount: number }>();
  const monthMap = new Map<string, { count: number; totalSavings: number }>();

  records.forEach((record) => {
    const savings = calculateSavings(record.originalPrice, record.discount);
    const monthKey = getMonthKey(record.purchaseDate);

    if (!supermarketMap.has(record.supermarketName)) {
      const supermarket = defaultSupermarkets.find(s => s.name === record.supermarketName);
      supermarketMap.set(record.supermarketName, {
        count: 0,
        totalSavings: 0,
        totalDiscount: 0,
        x: supermarket?.x || 50,
        y: supermarket?.y || 50,
      });
    }
    const superData = supermarketMap.get(record.supermarketName)!;
    superData.count++;
    superData.totalSavings += savings;
    superData.totalDiscount += record.discount;

    if (!categoryMap.has(record.category)) {
      categoryMap.set(record.category, {
        count: 0,
        totalSavings: 0,
        totalDiscount: 0,
      });
    }
    const catData = categoryMap.get(record.category)!;
    catData.count++;
    catData.totalSavings += savings;
    catData.totalDiscount += record.discount;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { count: 0, totalSavings: 0 });
    }
    const monthData = monthMap.get(monthKey)!;
    monthData.count++;
    monthData.totalSavings += savings;
  });

  const bySupermarket: SupermarketStat[] = Array.from(supermarketMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      totalSavings: Number(data.totalSavings.toFixed(2)),
      averageDiscount: Number((data.totalDiscount / data.count).toFixed(1)),
      x: data.x,
      y: data.y,
    }))
    .sort((a, b) => b.count - a.count);

  const byCategory: CategoryStat[] = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      totalSavings: Number(data.totalSavings.toFixed(2)),
      averageDiscount: Number((data.totalDiscount / data.count).toFixed(1)),
      color: getCategoryColor(name),
    }))
    .sort((a, b) => b.count - a.count);

  const byMonth: MonthStat[] = Array.from(monthMap.entries())
    .map(([monthKey, data]) => ({
      month: getMonthLabel(monthKey),
      count: data.count,
      totalSavings: Number(data.totalSavings.toFixed(2)),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalRecords: records.length,
    totalSavings: Number(totalSavings.toFixed(2)),
    averageDiscount,
    latestRecord,
    bySupermarket,
    byCategory,
    byMonth,
  };
};

export const filterRecordsByMonth = (records: Record[], monthKey: string): Record[] => {
  return records.filter(record => getMonthKey(record.purchaseDate) === monthKey);
};

export const filterRecordsBySupermarket = (records: Record[], supermarketName: string): Record[] => {
  return records.filter(record => record.supermarketName === supermarketName);
};

export const getAvailableMonths = (records: Record[]): string[] => {
  const monthSet = new Set(records.map(r => getMonthKey(r.purchaseDate)));
  return Array.from(monthSet).sort().reverse();
};

export const getAvailableSupermarkets = (records: Record[]): string[] => {
  const supermarketSet = new Set(records.map(r => r.supermarketName));
  return Array.from(supermarketSet).sort();
};

export const computeProductPriceHistory = (records: Record[], productName: string): ProductPriceHistory | null => {
  const productRecords = records
    .filter(r => r.productName.toLowerCase() === productName.toLowerCase())
    .sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());

  if (productRecords.length === 0) return null;

  const history: PriceHistoryPoint[] = productRecords.map(record => ({
    date: record.purchaseDate,
    discount: record.discount,
    discountPrice: calculateDiscountPrice(record.originalPrice, record.discount),
    originalPrice: record.originalPrice,
    supermarketName: record.supermarketName,
    recordId: record.id,
  }));

  let lowestPrice = Infinity;
  let lowestPriceDate = '';
  let lowestPriceSupermarket = '';
  let lowestPriceRecordId = '';
  let highestDiscount = 0;
  let totalDiscount = 0;
  let totalPrice = 0;

  history.forEach(point => {
    if (point.discountPrice < lowestPrice) {
      lowestPrice = point.discountPrice;
      lowestPriceDate = point.date;
      lowestPriceSupermarket = point.supermarketName;
      lowestPriceRecordId = point.recordId;
    }
    if (point.discount > highestDiscount) {
      highestDiscount = point.discount;
    }
    totalDiscount += point.discount;
    totalPrice += point.discountPrice;
  });

  return {
    productName: productRecords[0].productName,
    category: productRecords[0].category,
    totalRecords: history.length,
    lowestPrice,
    lowestPriceDate,
    lowestPriceSupermarket,
    lowestPriceRecordId,
    highestDiscount,
    averageDiscount: Number((totalDiscount / history.length).toFixed(1)),
    averagePrice: Number((totalPrice / history.length).toFixed(2)),
    history,
  };
};
