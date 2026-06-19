export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

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
  isFavorite?: boolean;
  tagIds?: string[];
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

export type SyncPhase = 'idle' | 'downloading' | 'merging' | 'uploading' | 'success' | 'error';

export interface UserCloudData {
  records: Record[];
  lastSyncTime: string | null;
  updatedAt: string;
}

export interface CloudSyncState {
  syncPhase: SyncPhase;
  lastSyncTime: string | null;
  syncError: string | null;
}

export interface ShoppingListItem {
  id: string;
  userId: string;
  productName: string;
  category: string;
  targetDiscount: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
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

export interface CategorySpending {
  name: string;
  color: string;
  totalSpent: number;
  count: number;
}

export interface MonthlyBudget {
  userId: string;
  limit: number;
}

export interface BudgetStatus {
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  overAmount: number;
  byCategory: CategorySpending[];
}

export interface StoreState {
  users: User[];
  currentUser: User | null;
  records: Record[];
  tags: Tag[];
  supermarkets: Supermarket[];
  categories: Category[];
  syncPhase: SyncPhase;
  lastSyncTime: string | null;
  syncError: string | null;
  monthlyBudgets: MonthlyBudget[];
  shoppingList: ShoppingListItem[];
  register: (username: string, password: string) => { success: boolean; message: string };
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  addRecord: (record: Omit<Record, 'id' | 'userId'>) => void;
  deleteRecord: (id: string) => void;
  updateRecord: (id: string, record: Partial<Record>) => void;
  markAlertHandled: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addTag: (name: string, color: string) => { success: boolean; message: string; tag?: Tag };
  updateTag: (id: string, name: string, color: string) => { success: boolean; message: string };
  deleteTag: (id: string) => { success: boolean; message: string };
  addTagToRecord: (recordId: string, tagId: string) => void;
  removeTagFromRecord: (recordId: string, tagId: string) => void;
  batchAddTagsToRecords: (recordIds: string[], tagIds: string[]) => void;
  batchRemoveTagsFromRecords: (recordIds: string[], tagIds: string[]) => void;
  addShoppingListItem: (item: Omit<ShoppingListItem, 'id' | 'userId' | 'createdAt'>) => void;
  updateShoppingListItem: (id: string, item: Partial<ShoppingListItem>) => void;
  deleteShoppingListItem: (id: string) => void;
  completeShoppingListItem: (id: string) => void;
  uncompleteShoppingListItem: (id: string) => void;
  getStats: () => StatsData;
  getPublicStats: () => PublicStats;
  getRecordsBySupermarket: (name: string) => Record[];
  getRecordsByCategory: (category: string) => Record[];
  getRecordsByProductName: (productName: string) => Record[];
  getProductPriceHistory: (productName: string) => ProductPriceHistory | null;
  getAllProductNames: () => string[];
  getSupermarketScores: () => SupermarketScore[];
  getSupermarketDetail: (name: string) => SupermarketDetail | null;
  getMonthlyBudget: () => number;
  setMonthlyBudget: (limit: number) => void;
  getBudgetStatus: () => BudgetStatus;
  loadFromStorage: () => void;
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  syncAll: () => Promise<void>;
  batchAddRecords: (records: Array<Omit<Record, 'id' | 'userId'>>) => void;
  batchUpdateRecords: (updates: Array<{ id: string; data: Partial<Record> }>) => void;
}
