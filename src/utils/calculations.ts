import type { Record, StatsData, SupermarketStat, CategoryStat, MonthStat, ProductPriceHistory, PriceHistoryPoint, SupermarketScore, CategoryAnalysis, TimeSlotAnalysis, SupermarketDetail, BudgetStatus, CategorySpending, AchievementConfig } from '../types';
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

export const getCurrentMonthKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const calculateSpentAmount = (records: Record[]): number => {
  return Number(
    records.reduce((total, record) => {
      return total + calculateDiscountPrice(record.originalPrice, record.discount);
    }, 0).toFixed(2)
  );
};

export const calculateCategorySpending = (records: Record[]): CategorySpending[] => {
  const categoryMap = new Map<string, { totalSpent: number; count: number }>();

  records.forEach((record) => {
    const spent = calculateDiscountPrice(record.originalPrice, record.discount);
    if (!categoryMap.has(record.category)) {
      categoryMap.set(record.category, { totalSpent: 0, count: 0 });
    }
    const data = categoryMap.get(record.category)!;
    data.totalSpent += spent;
    data.count++;
  });

  const result: CategorySpending[] = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      color: getCategoryColor(name),
      totalSpent: Number(data.totalSpent.toFixed(2)),
      count: data.count,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return result;
};

export const computeBudgetStatus = (records: Record[], budgetLimit: number): BudgetStatus => {
  const currentMonthKey = getCurrentMonthKey();
  const monthlyRecords = filterRecordsByMonth(records, currentMonthKey);
  const spent = calculateSpentAmount(monthlyRecords);
  const remaining = Number((budgetLimit - spent).toFixed(2));
  const percentage = budgetLimit > 0 ? Math.min(100, (spent / budgetLimit) * 100) : 0;
  const isOverBudget = spent > budgetLimit;
  const overAmount = isOverBudget ? Number((spent - budgetLimit).toFixed(2)) : 0;
  const byCategory = calculateCategorySpending(monthlyRecords);

  return {
    limit: budgetLimit,
    spent,
    remaining,
    percentage: Number(percentage.toFixed(1)),
    isOverBudget,
    overAmount,
    byCategory,
  };
};

export const computeBudgetStatusWithNewRecord = (
  records: Record[],
  budgetLimit: number,
  newRecordOriginalPrice: number,
  newRecordDiscount: number,
  newRecordPurchaseDate: string,
  newRecordCategory: string
): BudgetStatus => {
  const currentMonthKey = getCurrentMonthKey();
  const newRecordMonthKey = getMonthKey(newRecordPurchaseDate);
  
  let monthlyRecords = filterRecordsByMonth(records, currentMonthKey);
  
  if (newRecordMonthKey === currentMonthKey && newRecordOriginalPrice > 0 && newRecordDiscount > 0) {
    const tempRecord: Record = {
      id: 'temp',
      userId: 'temp',
      supermarketName: '',
      shelfLocation: '',
      productName: '',
      category: newRecordCategory,
      originalPrice: newRecordOriginalPrice,
      discount: newRecordDiscount,
      expiryDate: '',
      purchaseDate: newRecordPurchaseDate,
      notes: '',
      x: 0,
      y: 0,
    };
    monthlyRecords = [...monthlyRecords, tempRecord];
  }

  const spent = calculateSpentAmount(monthlyRecords);
  const remaining = Number((budgetLimit - spent).toFixed(2));
  const percentage = budgetLimit > 0 ? Math.min(100, (spent / budgetLimit) * 100) : 0;
  const isOverBudget = spent > budgetLimit;
  const overAmount = isOverBudget ? Number((spent - budgetLimit).toFixed(2)) : 0;
  const byCategory = calculateCategorySpending(monthlyRecords);

  return {
    limit: budgetLimit,
    spent,
    remaining,
    percentage: Number(percentage.toFixed(1)),
    isOverBudget,
    overAmount,
    byCategory,
  };
};

export const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

export const formatDistance = (distance: number): string => {
  const km = distance * 0.1;
  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }
  return `${km.toFixed(0)} km`;
};

export const achievementConfigs: AchievementConfig[] = [
  {
    id: 'first-deal',
    name: '初出茅庐',
    description: '完成第一次捡漏记录，开启你的临期猎人之旅',
    requirement: '记录第1次捡漏',
    icon: '🌱',
    color: '#22c55e',
    checkUnlocked: (stats) => stats.totalRecords >= 1,
    getProgress: (stats) => ({ current: Math.min(stats.totalRecords, 1), total: 1 }),
  },
  {
    id: 'savings-100',
    name: '省钱百元户',
    description: '累计节省达到100元，省钱小能手',
    requirement: '累计节省100元',
    icon: '💰',
    color: '#eab308',
    checkUnlocked: (stats) => stats.totalSavings >= 100,
    getProgress: (stats) => ({ current: Math.min(Math.floor(stats.totalSavings), 100), total: 100 }),
  },
  {
    id: 'three-fold-sniper',
    name: '三折狙击手',
    description: '成功抢到3折或更低折扣的商品',
    requirement: '有一次记录折扣≤3折',
    icon: '🎯',
    color: '#ef4444',
    checkUnlocked: (_, records) => records.some(r => r.discount <= 3),
    getProgress: (_, records) => {
      const hasThreeFold = records.some(r => r.discount <= 3);
      return { current: hasThreeFold ? 1 : 0, total: 1 };
    },
  },
  {
    id: 'supermarket-overlord',
    name: '超市全制霸',
    description: '在5家不同的超市都有捡漏记录',
    requirement: '在5家不同超市有记录',
    icon: '🏪',
    color: '#8b5cf6',
    checkUnlocked: (stats) => stats.bySupermarket.length >= 5,
    getProgress: (stats) => ({ current: Math.min(stats.bySupermarket.length, 5), total: 5 }),
  },
  {
    id: 'deal-master',
    name: '捡漏达人',
    description: '累计完成20次捡漏记录',
    requirement: '累计记录20次',
    icon: '🏆',
    color: '#f59e0b',
    checkUnlocked: (stats) => stats.totalRecords >= 20,
    getProgress: (stats) => ({ current: Math.min(stats.totalRecords, 20), total: 20 }),
  },
  {
    id: 'discount-hunter',
    name: '折扣猎人',
    description: '平均折扣低于5折，且至少记录10次',
    requirement: '平均折扣≤5折且≥10次记录',
    icon: '🔍',
    color: '#06b6d4',
    checkUnlocked: (stats) => stats.totalRecords >= 10 && stats.averageDiscount <= 5,
    getProgress: (stats) => {
      const recordProgress = Math.min(stats.totalRecords, 10);
      const discountProgress = stats.averageDiscount > 0 ? Math.max(0, Math.min(10, 10 - stats.averageDiscount)) : 0;
      return { 
        current: Math.min(recordProgress + Math.floor(discountProgress / 2), 15), 
        total: 15 
      };
    },
  },
  {
    id: 'category-explorer',
    name: '品类探索家',
    description: '在5个不同品类都有捡漏记录',
    requirement: '在5个不同品类有记录',
    icon: '📦',
    color: '#ec4899',
    checkUnlocked: (stats) => stats.byCategory.length >= 5,
    getProgress: (stats) => ({ current: Math.min(stats.byCategory.length, 5), total: 5 }),
  },
  {
    id: 'savings-1000',
    name: '千元大亨',
    description: '累计节省达到1000元，真正的省钱大师',
    requirement: '累计节省1000元',
    icon: '👑',
    color: '#f97316',
    checkUnlocked: (stats) => stats.totalSavings >= 1000,
    getProgress: (stats) => ({ current: Math.min(Math.floor(stats.totalSavings), 1000), total: 1000 }),
  },
];

export const getAchievementProgress = (
  stats: StatsData,
  records: Record[],
  achievementId: string
): { current: number; total: number; percentage: number } | null => {
  const config = achievementConfigs.find(c => c.id === achievementId);
  if (!config) return null;

  if (config.getProgress) {
    const { current, total } = config.getProgress(stats, records);
    return {
      current,
      total,
      percentage: total > 0 ? Math.min(100, (current / total) * 100) : 0,
    };
  }

  const unlocked = config.checkUnlocked(stats, records);
  return {
    current: unlocked ? 1 : 0,
    total: 1,
    percentage: unlocked ? 100 : 0,
  };
};

export const checkAchievementUnlocked = (
  stats: StatsData,
  records: Record[],
  achievementId: string
): boolean => {
  const config = achievementConfigs.find(c => c.id === achievementId);
  if (!config) return false;
  return config.checkUnlocked(stats, records);
};
