import type { Supermarket, Category, Record } from '../types';
import { generateId } from './calculations';

export const defaultSupermarkets: Supermarket[] = [
  { name: '沃尔玛', x: 20, y: 30, address: '市中心购物广场' },
  { name: '永辉超市', x: 45, y: 25, address: '城东商业区' },
  { name: '盒马鲜生', x: 70, y: 40, address: '高新区科技路' },
  { name: '家乐福', x: 30, y: 60, address: '城西步行街' },
  { name: '大润发', x: 55, y: 70, address: '城南生活圈' },
  { name: 'Ole\'精品超市', x: 80, y: 20, address: '奢侈品购物中心' },
  { name: '7-11', x: 15, y: 75, address: '大学路便利店' },
  { name: '全家', x: 60, y: 15, address: '商务中心A座' },
  { name: '罗森', x: 85, y: 65, address: '地铁站B出口' },
];

export const defaultCategories: Category[] = [
  { name: '零食饮料', icon: 'Cookie', color: '#D97706' },
  { name: '奶制品', icon: 'Milk', color: '#0EA5E9' },
  { name: '冷冻食品', icon: 'Snowflake', color: '#0284C7' },
  { name: '粮油调味', icon: 'Wheat', color: '#A16207' },
  { name: '肉蛋生鲜', icon: 'Beef', color: '#DC2626' },
  { name: '烘焙甜品', icon: 'Cake', color: '#DB2777' },
  { name: '酒水', icon: 'Wine', color: '#7C3AED' },
  { name: '日用百货', icon: 'ShoppingBag', color: '#059669' },
];

const getRandomDate = (daysFromNow: number, maxDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow + Math.floor(Math.random() * maxDays));
  return date.toISOString().split('T')[0];
};

const getRandomPastDate = (maxDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * maxDays));
  return date.toISOString().split('T')[0];
};

const getRandomTime = (): string => {
  const hour = 6 + Math.floor(Math.random() * 16);
  const minute = Math.floor(Math.random() * 60);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const getTimeBySupermarketType = (supermarketName: string): string => {
  const convenienceStores = ['7-11', '全家', '罗森'];
  const premiumStores = ['Ole\'精品超市', '盒马鲜生'];
  
  let hour: number;
  if (convenienceStores.some(s => supermarketName.includes(s))) {
    const r = Math.random();
    if (r < 0.25) {
      hour = 7 + Math.floor(Math.random() * 3);
    } else if (r < 0.5) {
      hour = 11 + Math.floor(Math.random() * 3);
    } else if (r < 0.75) {
      hour = 17 + Math.floor(Math.random() * 3);
    } else {
      hour = 20 + Math.floor(Math.random() * 4);
    }
  } else if (premiumStores.some(s => supermarketName.includes(s))) {
    const r = Math.random();
    if (r < 0.3) {
      hour = 10 + Math.floor(Math.random() * 3);
    } else if (r < 0.7) {
      hour = 14 + Math.floor(Math.random() * 4);
    } else {
      hour = 19 + Math.floor(Math.random() * 3);
    }
  } else {
    const r = Math.random();
    if (r < 0.25) {
      hour = 8 + Math.floor(Math.random() * 2);
    } else if (r < 0.55) {
      hour = 10 + Math.floor(Math.random() * 4);
    } else if (r < 0.85) {
      hour = 17 + Math.floor(Math.random() * 4);
    } else {
      hour = 20 + Math.floor(Math.random() * 2);
    }
  }
  
  const minute = Math.floor(Math.random() * 60);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const adjustTimeByCategory = (time: string, category: string): string => {
  const [hourStr] = time.split(':');
  let hour = parseInt(hourStr);
  
  switch (category) {
    case '烘焙甜品':
      hour = Math.max(7, Math.min(11, hour));
      break;
    case '肉蛋生鲜':
      hour = Math.max(7, Math.min(10, hour + Math.floor(Math.random() * 2)));
      break;
    case '奶制品':
      hour = Math.max(8, Math.min(12, hour));
      break;
    case '零食饮料':
      hour = Math.max(10, Math.min(22, hour));
      break;
    case '酒水':
      hour = Math.max(14, Math.min(22, hour + 2));
      break;
    case '冷冻食品':
    case '粮油调味':
    case '日用百货':
      hour = Math.max(9, Math.min(20, hour));
      break;
  }
  
  const minute = Math.floor(Math.random() * 60);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const combineDateAndTime = (dateStr: string, timeStr: string): string => {
  return `${dateStr}T${timeStr}:00`;
};

const supermarketData = [
  { name: '沃尔玛', x: 20, y: 30 },
  { name: '永辉超市', x: 45, y: 25 },
  { name: '盒马鲜生', x: 70, y: 40 },
  { name: '家乐福', x: 30, y: 60 },
  { name: '大润发', x: 55, y: 70 },
  { name: '7-11', x: 15, y: 75 },
  { name: '全家', x: 60, y: 15 },
  { name: '罗森', x: 85, y: 65 },
];

const productData = [
  { name: '进口牛奶 1L', category: '奶制品', price: 28.8 },
  { name: '原味酸奶 10杯装', category: '奶制品', price: 35.9 },
  { name: '马苏里拉芝士', category: '奶制品', price: 45.0 },
  { name: '薯片大礼包', category: '零食饮料', price: 29.9 },
  { name: '进口巧克力', category: '零食饮料', price: 68.0 },
  { name: '坚果混合装', category: '零食饮料', price: 55.0 },
  { name: '气泡水 6瓶', category: '零食饮料', price: 24.0 },
  { name: '速冻水饺', category: '冷冻食品', price: 32.8 },
  { name: '进口牛排', category: '冷冻食品', price: 88.0 },
  { name: '冰淇淋 4盒', category: '冷冻食品', price: 45.0 },
  { name: '橄榄油 1L', category: '粮油调味', price: 78.0 },
  { name: '意大利面套装', category: '粮油调味', price: 35.0 },
  { name: '进口蜂蜜', category: '粮油调味', price: 65.0 },
  { name: '新鲜三文鱼', category: '肉蛋生鲜', price: 98.0 },
  { name: '澳洲牛肉', category: '肉蛋生鲜', price: 128.0 },
  { name: '土鸡蛋 30枚', category: '肉蛋生鲜', price: 45.0 },
  { name: '提拉米苏蛋糕', category: '烘焙甜品', price: 58.0 },
  { name: '全麦面包', category: '烘焙甜品', price: 18.0 },
  { name: '手工曲奇', category: '烘焙甜品', price: 32.0 },
  { name: '进口红酒', category: '酒水', price: 188.0 },
  { name: '精酿啤酒 6瓶', category: '酒水', price: 72.0 },
  { name: '日本清酒', category: '酒水', price: 158.0 },
  { name: '进口洗衣液', category: '日用百货', price: 45.0 },
  { name: '厨房纸巾', category: '日用百货', price: 15.0 },
];

const shelfLocations = [
  '零食区最底层货架',
  '奶制品冷柜角落',
  '冷冻区深处',
  '粮油区最里面',
  '生鲜区临期专柜',
  '烘焙区打折区',
  '酒水区清仓架',
  '日用品特价区',
  '进门左手边货架',
  '收银台附近促销架',
  '超市深处角落货架',
  '仓库出口特价区',
];

export const generateMockRecords = (userId: string = 'mock-user'): Record[] => {
  const records: Record[] = [];
  
  for (let i = 0; i < 15; i++) {
    const supermarket = supermarketData[Math.floor(Math.random() * supermarketData.length)];
    const product = productData[Math.floor(Math.random() * productData.length)];
    const discount = 3 + Math.floor(Math.random() * 6);
    const expiryDays = 1 + Math.floor(Math.random() * 14);
    
    const baseTime = getTimeBySupermarketType(supermarket.name);
    const finalTime = adjustTimeByCategory(baseTime, product.category);
    const purchaseDateOnly = getRandomPastDate(30);
    const purchaseDateTime = combineDateAndTime(purchaseDateOnly, finalTime);
    
    records.push({
      id: generateId(),
      userId,
      supermarketName: supermarket.name,
      shelfLocation: shelfLocations[Math.floor(Math.random() * shelfLocations.length)],
      productName: product.name,
      category: product.category,
      originalPrice: product.price,
      discount: discount,
      expiryDate: getRandomDate(expiryDays, 7),
      purchaseDate: purchaseDateTime,
      notes: Math.random() > 0.5 ? '超级划算，下次还来！' : '货架不太好找，问了导购才找到',
      x: supermarket.x + (Math.random() - 0.5) * 8,
      y: supermarket.y + (Math.random() - 0.5) * 8,
    });
  }
  
  return records.sort((a, b) => 
    new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
  );
};

export const getSupermarketCoords = (name: string): { x: number; y: number } | undefined => {
  const supermarket = defaultSupermarkets.find(s => s.name === name);
  if (supermarket) {
    return {
      x: supermarket.x + (Math.random() - 0.5) * 6,
      y: supermarket.y + (Math.random() - 0.5) * 6,
    };
  }
  return undefined;
};

export const getCategoryColor = (categoryName: string): string => {
  const category = defaultCategories.find(c => c.name === categoryName);
  return category?.color || '#D97706';
};
