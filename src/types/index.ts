export interface Record {
  id: string;
  userId: string;
  supermarketName: string;
  shelfLocation: string;
  productName: string;
  category: string;
  originalPrice: number;
  discount: number;
  expiryDate: string;
  purchaseDate: string;
  notes: string;
  x: number;
  y: number;
  alertHandled?: boolean;
}

export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface Supermarket {
  name: string;
  x: number;
  y: number;
  address: string;
}

export interface Category {
  name: string;
  icon: string;
  color: string;
}

export interface SupermarketStat {
  name: string;
  count: number;
  totalSavings: number;
  averageDiscount: number;
  x: number;
  y: number;
}

export interface CategoryStat {
  name: string;
  count: number;
  totalSavings: number;
  averageDiscount: number;
  color: string;
}

export interface MonthStat {
  month: string;
  count: number;
  totalSavings: number;
}

export interface StatsData {
  totalRecords: number;
  totalSavings: number;
  averageDiscount: number;
  latestRecord: Record | null;
  bySupermarket: SupermarketStat[];
  byCategory: CategoryStat[];
  byMonth: MonthStat[];
}

export interface PublicStats {
  totalRecords: number;
  totalSavings: number;
  totalUsers: number;
}

export interface PriceHistoryPoint {
  date: string;
  discount: number;
  discountPrice: number;
  originalPrice: number;
  supermarketName: string;
  recordId: string;
}

export interface ProductPriceHistory {
  productName: string;
  category: string;
  totalRecords: number;
  lowestPrice: number;
  lowestPriceDate: string;
  lowestPriceSupermarket: string;
  lowestPriceRecordId: string;
  highestDiscount: number;
  averageDiscount: number;
  averagePrice: number;
  history: PriceHistoryPoint[];
}

export interface CategoryAnalysis {
  name: string;
  count: number;
  totalSavings: number;
  averageDiscount: number;
  score: number;
  color: string;
}

export interface TimeSlotAnalysis {
  timeSlot: string;
  count: number;
  averageDiscount: number;
  totalSavings: number;
  score: number;
}

export interface SupermarketScore {
  name: string;
  count: number;
  totalSavings: number;
  averageDiscount: number;
  discountScore: number;
  frequencyScore: number;
  savingsScore: number;
  totalScore: number;
  grade: string;
  x: number;
  y: number;
}

export interface SupermarketDetail {
  name: string;
  score: SupermarketScore;
  topCategories: CategoryAnalysis[];
  topTimeSlots: TimeSlotAnalysis[];
  recentRecords: Record[];
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface UserCloudData {
  records: Record[];
  lastSyncTime: string | null;
  updatedAt: string;
}

export interface CloudSyncState {
  syncStatus: SyncStatus;
  lastSyncTime: string | null;
  syncError: string | null;
}

export interface StoreState {
  users: User[];
  currentUser: User | null;
  records: Record[];
  supermarkets: Supermarket[];
  categories: Category[];
  syncStatus: SyncStatus;
  lastSyncTime: string | null;
  syncError: string | null;
  register: (username: string, password: string) => { success: boolean; message: string };
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  addRecord: (record: Omit<Record, 'id' | 'userId'>) => void;
  deleteRecord: (id: string) => void;
  updateRecord: (id: string, record: Partial<Record>) => void;
  markAlertHandled: (id: string) => void;
  getStats: () => StatsData;
  getPublicStats: () => PublicStats;
  getRecordsBySupermarket: (name: string) => Record[];
  getRecordsByCategory: (category: string) => Record[];
  getRecordsByProductName: (productName: string) => Record[];
  getProductPriceHistory: (productName: string) => ProductPriceHistory | null;
  getAllProductNames: () => string[];
  getSupermarketScores: () => SupermarketScore[];
  getSupermarketDetail: (name: string) => SupermarketDetail | null;
  loadFromStorage: () => void;
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  syncAll: () => Promise<void>;
}

export interface FormData {
  supermarketName: string;
  shelfLocation: string;
  productName: string;
  category: string;
  originalPrice: string;
  discount: string;
  expiryDate: string;
  purchaseDate: string;
  purchaseTime: string;
  notes: string;
}
