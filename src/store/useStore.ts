import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreState, Record, StatsData, SupermarketStat, CategoryStat, MonthStat, User, PublicStats } from '../types';
import { generateId, calculateSavings, calculateTotalSavings, calculateAverageDiscount, getMonthKey, getMonthLabel } from '../utils/calculations';
import { defaultSupermarkets, defaultCategories, getCategoryColor } from '../utils/mockData';

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      records: [],
      supermarkets: defaultSupermarkets,
      categories: defaultCategories,

      register: (username: string, password: string) => {
        const { users } = get();
        const trimmedUsername = username.trim();

        if (!trimmedUsername || !password) {
          return { success: false, message: '用户名和密码不能为空' };
        }

        if (trimmedUsername.length < 3) {
          return { success: false, message: '用户名至少需要3个字符' };
        }

        if (password.length < 6) {
          return { success: false, message: '密码至少需要6个字符' };
        }

        if (users.some(u => u.username === trimmedUsername)) {
          return { success: false, message: '该用户名已被注册' };
        }

        const newUser: User = {
          id: generateId(),
          username: trimmedUsername,
          password,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          users: [...state.users, newUser],
          currentUser: newUser,
        }));

        return { success: true, message: '注册成功' };
      },

      login: (username: string, password: string) => {
        const { users } = get();
        const trimmedUsername = username.trim();
        const user = users.find(u => u.username === trimmedUsername);

        if (!trimmedUsername || !password) {
          return { success: false, message: '用户名和密码不能为空' };
        }

        if (!user) {
          return { success: false, message: '用户不存在' };
        }

        if (user.password !== password) {
          return { success: false, message: '密码错误' };
        }

        set({ currentUser: user });
        return { success: true, message: '登录成功' };
      },

      logout: () => {
        set({ currentUser: null });
      },

      addRecord: (recordData) => {
        const { currentUser } = get();
        if (!currentUser) return;

        const newRecord: Record = {
          ...recordData,
          id: generateId(),
          userId: currentUser.id,
        };
        set((state) => ({
          records: [newRecord, ...state.records],
        }));
      },

      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        }));
      },

      updateRecord: (id, recordData) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...recordData } : r
          ),
        }));
      },

      getStats: (): StatsData => {
        const { records, currentUser } = get();
        const userRecords = currentUser 
          ? records.filter(r => r.userId === currentUser.id) 
          : [];

        if (userRecords.length === 0) {
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

        const totalSavings = calculateTotalSavings(userRecords);
        const averageDiscount = calculateAverageDiscount(userRecords);
        const latestRecord = userRecords[0];

        const supermarketMap = new Map<string, { count: number; totalSavings: number; totalDiscount: number; x: number; y: number }>();
        const categoryMap = new Map<string, { count: number; totalSavings: number; totalDiscount: number }>();
        const monthMap = new Map<string, { count: number; totalSavings: number }>();

        userRecords.forEach((record) => {
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
          totalRecords: userRecords.length,
          totalSavings: Number(totalSavings.toFixed(2)),
          averageDiscount,
          latestRecord,
          bySupermarket,
          byCategory,
          byMonth,
        };
      },

      getPublicStats: (): PublicStats => {
        const { records, users } = get();
        const totalSavings = calculateTotalSavings(records);
        return {
          totalRecords: records.length,
          totalSavings: Number(totalSavings.toFixed(2)),
          totalUsers: users.length,
        };
      },

      getRecordsBySupermarket: (name: string): Record[] => {
        const { records, currentUser } = get();
        const userRecords = currentUser 
          ? records.filter(r => r.userId === currentUser.id) 
          : [];
        return userRecords.filter((r) => r.supermarketName === name);
      },

      getRecordsByCategory: (category: string): Record[] => {
        const { records, currentUser } = get();
        const userRecords = currentUser 
          ? records.filter(r => r.userId === currentUser.id) 
          : [];
        return userRecords.filter((r) => r.category === category);
      },

      loadFromStorage: () => {
      },
    }),
    {
      name: 'bargain-hunter-storage',
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
        records: state.records,
      }),
    }
  )
);

export const useUserRecords = () => {
  return useStore((state) => {
    if (!state.currentUser) return [];
    return state.records.filter(r => r.userId === state.currentUser!.id);
  });
};
