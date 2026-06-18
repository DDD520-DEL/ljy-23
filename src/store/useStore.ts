import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreState, Record, StatsData, SupermarketStat, CategoryStat, MonthStat } from '../types';
import { generateId, calculateSavings, calculateTotalSavings, calculateAverageDiscount, getMonthKey, getMonthLabel } from '../utils/calculations';
import { defaultSupermarkets, defaultCategories, generateMockRecords, getCategoryColor } from '../utils/mockData';

const initialRecords = generateMockRecords();

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      records: initialRecords,
      supermarkets: defaultSupermarkets,
      categories: defaultCategories,

      addRecord: (recordData) => {
        const newRecord: Record = {
          ...recordData,
          id: generateId(),
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
        const { records } = get();
        
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
      },

      getRecordsBySupermarket: (name: string): Record[] => {
        const { records } = get();
        return records.filter((r) => r.supermarketName === name);
      },

      getRecordsByCategory: (category: string): Record[] => {
        const { records } = get();
        return records.filter((r) => r.category === category);
      },

      loadFromStorage: () => {
      },
    }),
    {
      name: 'bargain-hunter-storage',
      partialize: (state) => ({ records: state.records }),
    }
  )
);
