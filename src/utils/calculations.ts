import type { Record, StatsData, SupermarketStat, CategoryStat, MonthStat, ProductPriceHistory, PriceHistoryPoint, SupermarketScore, CategoryAnalysis, TimeSlotAnalysis, SupermarketDetail } from '../types';
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

const normalize = (value: number, min: number, max: number): number => {
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
};

const getGradeFromScore = (score: number): string => {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
};

export const computeSupermarketScores = (records: Record[]): SupermarketScore[] => {
  if (records.length === 0) return [];

  const supermarketMap = new Map<string, { count: number; totalSavings: number; totalDiscount: number; x: number; y: number }>();

  records.forEach((record) => {
    const savings = calculateSavings(record.originalPrice, record.discount);

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
    const data = supermarketMap.get(record.supermarketName)!;
    data.count++;
    data.totalSavings += savings;
    data.totalDiscount += record.discount;
  });

  const stats = Array.from(supermarketMap.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    totalSavings: Number(data.totalSavings.toFixed(2)),
    averageDiscount: Number((data.totalDiscount / data.count).toFixed(1)),
    x: data.x,
    y: data.y,
  }));

  const maxCount = Math.max(...stats.map(s => s.count));
  const minCount = Math.min(...stats.map(s => s.count));
  const maxSavings = Math.max(...stats.map(s => s.totalSavings));
  const minSavings = Math.min(...stats.map(s => s.totalSavings));

  const scores: SupermarketScore[] = stats.map(stat => {
    const discountScore = normalize(10 - stat.averageDiscount, 0, 9) * 1.11;
    const frequencyScore = normalize(stat.count, minCount, maxCount);
    const savingsScore = normalize(stat.totalSavings, minSavings, maxSavings);

    const totalScore = Number((discountScore * 0.4 + frequencyScore * 0.3 + savingsScore * 0.3).toFixed(1));
    const grade = getGradeFromScore(totalScore);

    return {
      name: stat.name,
      count: stat.count,
      totalSavings: stat.totalSavings,
      averageDiscount: stat.averageDiscount,
      discountScore: Number(discountScore.toFixed(1)),
      frequencyScore: Number(frequencyScore.toFixed(1)),
      savingsScore: Number(savingsScore.toFixed(1)),
      totalScore,
      grade,
      x: stat.x,
      y: stat.y,
    };
  });

  return scores.sort((a, b) => b.totalScore - a.totalScore);
};

export const getTimeSlot = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hour = date.getHours();
  if (hour >= 6 && hour < 10) return '早晨 6:00-10:00';
  if (hour >= 10 && hour < 14) return '上午 10:00-14:00';
  if (hour >= 14 && hour < 18) return '下午 14:00-18:00';
  if (hour >= 18 && hour < 22) return '傍晚 18:00-22:00';
  return '夜间 22:00-6:00';
};

export const computeCategoryAnalysis = (records: Record[]): CategoryAnalysis[] => {
  if (records.length === 0) return [];

  const categoryMap = new Map<string, { count: number; totalSavings: number; totalDiscount: number }>();

  records.forEach((record) => {
    const savings = calculateSavings(record.originalPrice, record.discount);

    if (!categoryMap.has(record.category)) {
      categoryMap.set(record.category, {
        count: 0,
        totalSavings: 0,
        totalDiscount: 0,
      });
    }
    const data = categoryMap.get(record.category)!;
    data.count++;
    data.totalSavings += savings;
    data.totalDiscount += record.discount;
  });

  const analysis: CategoryAnalysis[] = Array.from(categoryMap.entries()).map(([name, data]) => {
    const averageDiscount = Number((data.totalDiscount / data.count).toFixed(1));
    const discountScore = normalize(10 - averageDiscount, 0, 9) * 1.11;
    const countScore = normalize(data.count, 1, Math.max(...Array.from(categoryMap.values()).map(v => v.count)));
    const savingsScore = normalize(data.totalSavings, 0, Math.max(...Array.from(categoryMap.values()).map(v => v.totalSavings)));
    const score = Number((discountScore * 0.5 + countScore * 0.25 + savingsScore * 0.25).toFixed(1));

    return {
      name,
      count: data.count,
      totalSavings: Number(data.totalSavings.toFixed(2)),
      averageDiscount,
      score,
      color: getCategoryColor(name),
    };
  });

  return analysis.sort((a, b) => b.score - a.score);
};

export const computeTimeSlotAnalysis = (records: Record[]): TimeSlotAnalysis[] => {
  if (records.length === 0) return [];

  const timeSlotMap = new Map<string, { count: number; totalSavings: number; totalDiscount: number }>();

  records.forEach((record) => {
    const timeSlot = getTimeSlot(record.purchaseDate);
    const savings = calculateSavings(record.originalPrice, record.discount);

    if (!timeSlotMap.has(timeSlot)) {
      timeSlotMap.set(timeSlot, {
        count: 0,
        totalSavings: 0,
        totalDiscount: 0,
      });
    }
    const data = timeSlotMap.get(timeSlot)!;
    data.count++;
    data.totalSavings += savings;
    data.totalDiscount += record.discount;
  });

  const analysis: TimeSlotAnalysis[] = Array.from(timeSlotMap.entries()).map(([timeSlot, data]) => {
    const averageDiscount = Number((data.totalDiscount / data.count).toFixed(1));
    const discountScore = normalize(10 - averageDiscount, 0, 9) * 1.11;
    const countScore = normalize(data.count, 1, Math.max(...Array.from(timeSlotMap.values()).map(v => v.count)));
    const savingsScore = normalize(data.totalSavings, 0, Math.max(...Array.from(timeSlotMap.values()).map(v => v.totalSavings)));
    const score = Number((discountScore * 0.5 + countScore * 0.3 + savingsScore * 0.2).toFixed(1));

    return {
      timeSlot,
      count: data.count,
      averageDiscount,
      totalSavings: Number(data.totalSavings.toFixed(2)),
      score,
    };
  });

  return analysis.sort((a, b) => b.score - a.score);
};

export const computeSupermarketDetail = (allRecords: Record[], supermarketName: string): SupermarketDetail | null => {
  const supermarketRecords = allRecords.filter(r => r.supermarketName === supermarketName);

  if (supermarketRecords.length === 0) return null;

  const scores = computeSupermarketScores(allRecords);
  const score = scores.find(s => s.name === supermarketName);

  if (!score) return null;

  const topCategories = computeCategoryAnalysis(supermarketRecords).slice(0, 5);
  const topTimeSlots = computeTimeSlotAnalysis(supermarketRecords).slice(0, 4);
  const recentRecords = [...supermarketRecords]
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 5);

  return {
    name: supermarketName,
    score,
    topCategories,
    topTimeSlots,
    recentRecords,
  };
};
