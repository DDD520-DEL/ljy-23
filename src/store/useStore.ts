import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMemo } from 'react';
import type { StoreState, Record, StatsData, User, PublicStats, ProductPriceHistory, SupermarketScore, SupermarketDetail } from '../types';
import { generateId, calculateTotalSavings, computeStatsFromRecords, computeProductPriceHistory, computeSupermarketScores, computeSupermarketDetail } from '../utils/calculations';
import { defaultSupermarkets, defaultCategories } from '../utils/mockData';
import { uploadToCloud, downloadFromCloud, mergeRecords } from '../services/cloudSync';

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      records: [],
      supermarkets: defaultSupermarkets,
      categories: defaultCategories,
      syncStatus: 'idle',
      lastSyncTime: null,
      syncError: null,

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
        set({
          currentUser: null,
          syncStatus: 'idle',
          syncError: null,
        });
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

      markAlertHandled: (id) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, alertHandled: true } : r
          ),
        }));
      },

      getStats: (): StatsData => {
        const { records, currentUser } = get();
        const userRecords = currentUser
          ? records.filter(r => r.userId === currentUser.id)
          : [];
        return computeStatsFromRecords(userRecords);
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

      getRecordsByProductName: (productName: string): Record[] => {
        const { records, currentUser } = get();
        const userRecords = currentUser
          ? records.filter(r => r.userId === currentUser.id)
          : [];
        return userRecords.filter(
          (r) => r.productName.toLowerCase() === productName.toLowerCase()
        );
      },

      getProductPriceHistory: (productName: string): ProductPriceHistory | null => {
        const { records, currentUser } = get();
        const userRecords = currentUser
          ? records.filter(r => r.userId === currentUser.id)
          : [];
        return computeProductPriceHistory(userRecords, productName);
      },

      getAllProductNames: (): string[] => {
        const { records, currentUser } = get();
        const userRecords = currentUser
          ? records.filter(r => r.userId === currentUser.id)
          : [];
        const productNames = new Set(
          userRecords.map(r => r.productName.toLowerCase())
        );
        const nameMap = new Map<string, string>();
        userRecords.forEach(r => {
          const key = r.productName.toLowerCase();
          if (!nameMap.has(key)) {
            nameMap.set(key, r.productName);
          }
        });
        return Array.from(productNames).map(key => nameMap.get(key)!);
      },

      getSupermarketScores: (): SupermarketScore[] => {
        const { records, currentUser } = get();
        const userRecords = currentUser
          ? records.filter(r => r.userId === currentUser.id)
          : [];
        return computeSupermarketScores(userRecords);
      },

      getSupermarketDetail: (name: string): SupermarketDetail | null => {
        const { records, currentUser } = get();
        const userRecords = currentUser
          ? records.filter(r => r.userId === currentUser.id)
          : [];
        return computeSupermarketDetail(userRecords, name);
      },

      loadFromStorage: () => {
      },

      syncToCloud: async () => {
        const { currentUser, records } = get();
        if (!currentUser) return;

        set({ syncStatus: 'syncing', syncError: null });

        try {
          const userRecords = records.filter(r => r.userId === currentUser.id);
          const result = await uploadToCloud(currentUser.id, userRecords);
          set({
            syncStatus: 'success',
            lastSyncTime: result.lastSyncTime,
          });
          setTimeout(() => {
            if (get().syncStatus === 'success') {
              set({ syncStatus: 'idle' });
            }
          }, 3000);
        } catch (error) {
          set({
            syncStatus: 'error',
            syncError: error instanceof Error ? error.message : '同步失败',
          });
        }
      },

      syncFromCloud: async () => {
        const { currentUser, records } = get();
        if (!currentUser) return;

        set({ syncStatus: 'syncing', syncError: null });

        try {
          const cloudData = await downloadFromCloud(currentUser.id);
          if (cloudData) {
            const userRecords = records.filter(r => r.userId === currentUser.id);
            const otherRecords = records.filter(r => r.userId !== currentUser.id);
            const merged = mergeRecords(userRecords, cloudData.records);
            set({
              records: [...merged, ...otherRecords],
              syncStatus: 'success',
              lastSyncTime: cloudData.lastSyncTime || new Date().toISOString(),
            });
          } else {
            set({ syncStatus: 'success' });
          }
          setTimeout(() => {
            if (get().syncStatus === 'success') {
              set({ syncStatus: 'idle' });
            }
          }, 3000);
        } catch (error) {
          set({
            syncStatus: 'error',
            syncError: error instanceof Error ? error.message : '同步失败',
          });
        }
      },

      syncAll: async () => {
        const { currentUser, records } = get();
        if (!currentUser) return;

        set({ syncStatus: 'syncing', syncError: null });

        try {
          const cloudData = await downloadFromCloud(currentUser.id);
          const userRecords = records.filter(r => r.userId === currentUser.id);
          const otherRecords = records.filter(r => r.userId !== currentUser.id);

          let mergedRecords = userRecords;
          let cloudSyncTime: string | null = null;

          if (cloudData) {
            mergedRecords = mergeRecords(userRecords, cloudData.records);
            cloudSyncTime = cloudData.lastSyncTime;
          }

          set({
            records: [...mergedRecords, ...otherRecords],
          });

          const finalUserRecords = [...mergedRecords];
          const uploadResult = await uploadToCloud(currentUser.id, finalUserRecords);

          set({
            syncStatus: 'success',
            lastSyncTime: uploadResult.lastSyncTime || cloudSyncTime,
          });

          setTimeout(() => {
            if (get().syncStatus === 'success') {
              set({ syncStatus: 'idle' });
            }
          }, 3000);
        } catch (error) {
          set({
            syncStatus: 'error',
            syncError: error instanceof Error ? error.message : '同步失败',
          });
        }
      },
    }),
    {
      name: 'bargain-hunter-storage',
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
        records: state.records,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);

export const useUserRecords = () => {
  const records = useStore((state) => state.records);
  const currentUser = useStore((state) => state.currentUser);
  return useMemo(() => {
    if (!currentUser) return [];
    return records.filter(r => r.userId === currentUser.id);
  }, [records, currentUser]);
};

export const useUserStats = (): StatsData => {
  const records = useUserRecords();
  return useMemo(() => computeStatsFromRecords(records), [records]);
};

export const usePublicStats = (): PublicStats => {
  const records = useStore((state) => state.records);
  const users = useStore((state) => state.users);
  return useMemo(() => {
    const totalSavings = calculateTotalSavings(records);
    return {
      totalRecords: records.length,
      totalSavings: Number(totalSavings.toFixed(2)),
      totalUsers: users.length,
    };
  }, [records, users]);
};

export const useProductPriceHistory = (productName: string): ProductPriceHistory | null => {
  const records = useUserRecords();
  return useMemo(() => {
    return computeProductPriceHistory(records, productName);
  }, [records, productName]);
};

export const useSupermarketScores = (): SupermarketScore[] => {
  const records = useUserRecords();
  return useMemo(() => computeSupermarketScores(records), [records]);
};

export const useSupermarketDetail = (name: string): SupermarketDetail | null => {
  const records = useUserRecords();
  return useMemo(() => computeSupermarketDetail(records, name), [records, name]);
};
