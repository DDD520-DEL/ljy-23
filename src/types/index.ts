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

export interface StoreState {
  users: User[];
  currentUser: User | null;
  records: Record[];
  supermarkets: Supermarket[];
  categories: Category[];
  register: (username: string, password: string) => { success: boolean; message: string };
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  addRecord: (record: Omit<Record, 'id' | 'userId'>) => void;
  deleteRecord: (id: string) => void;
  updateRecord: (id: string, record: Partial<Record>) => void;
  getStats: () => StatsData;
  getPublicStats: () => PublicStats;
  getRecordsBySupermarket: (name: string) => Record[];
  getRecordsByCategory: (category: string) => Record[];
  loadFromStorage: () => void;
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
  notes: string;
}
