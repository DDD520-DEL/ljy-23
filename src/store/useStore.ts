import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMemo } from 'react';
import type { StoreState, Record, StatsData, User, PublicStats } from '../types';
import { generateId, calculateTotalSavings, computeStatsFromRecords } from '../utils/calculations';
import { defaultSupermarkets, defaultCategories } from '../utils/mockData';

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

export const useUserStats = (): StatsData => {
  const records = useUserRecords();
  return useMemo(() => computeStatsFromRecords(records), [records]);
};
