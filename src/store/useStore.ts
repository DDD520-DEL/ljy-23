import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMemo } from 'react';
import type { StoreState, Record, StatsData, User, PublicStats, ProductPriceHistory, SupermarketScore, SupermarketDetail, BudgetStatus, MonthlyBudget, Tag, ShoppingListItem, Feedback, Achievement, Notification, DeletedRecord } from '../types';
import { generateId, calculateTotalSavings, computeStatsFromRecords, computeProductPriceHistory, computeSupermarketScores, computeSupermarketDetail, computeBudgetStatus, achievementConfigs, checkAchievementUnlocked, getAchievementProgress } from '../utils/calculations';
import { RECYCLE_BIN_RETENTION_DAYS } from '../types';
import { defaultSupermarkets, defaultCategories } from '../utils/mockData';
import { uploadToCloud, downloadFromCloud, mergeRecords } from '../services/cloudSync';

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      records: [],
      deletedRecords: [],
      tags: [],
      supermarkets: defaultSupermarkets,
      categories: defaultCategories,
      syncPhase: 'idle',
      lastSyncTime: null,
      syncError: null,
      monthlyBudgets: [],
      shoppingList: [],
      feedbacks: [],
      achievements: [],
      notifications: [],

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
          syncPhase: 'idle',
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

        setTimeout(() => {
          get().checkAndUnlockAchievements();
        }, 100);
      },

      deleteRecord: (id) => {
        const { records } = get();
        const record = records.find((r) => r.id === id);
        if (!record) return;
        const deletedItem: DeletedRecord = {
          record,
          deletedAt: new Date().toISOString(),
        };
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
          deletedRecords: [deletedItem, ...state.deletedRecords],
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

      toggleFavorite: (id) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
          ),
        }));
      },

      addTag: (name, color) => {
        const { tags, currentUser } = get();
        if (!currentUser) return { success: false, message: '请先登录' };

        const trimmedName = name.trim();
        if (!trimmedName) return { success: false, message: '标签名称不能为空' };

        const userTags = tags.filter(t => t.userId === currentUser.id);
        if (userTags.some(t => t.name.toLowerCase() === trimmedName.toLowerCase())) {
          return { success: false, message: '该标签名称已存在' };
        }

        const newTag: Tag = {
          id: generateId(),
          userId: currentUser.id,
          name: trimmedName,
          color: color || '#f59e0b',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          tags: [...state.tags, newTag],
        }));

        return { success: true, message: '标签创建成功', tag: newTag };
      },

      updateTag: (id, name, color) => {
        const { tags, currentUser } = get();
        if (!currentUser) return { success: false, message: '请先登录' };

        const trimmedName = name.trim();
        if (!trimmedName) return { success: false, message: '标签名称不能为空' };

        const tag = tags.find(t => t.id === id);
        if (!tag || tag.userId !== currentUser.id) {
          return { success: false, message: '标签不存在或无权限修改' };
        }

        const userTags = tags.filter(t => t.userId === currentUser.id && t.id !== id);
        if (userTags.some(t => t.name.toLowerCase() === trimmedName.toLowerCase())) {
          return { success: false, message: '该标签名称已存在' };
        }

        set((state) => ({
          tags: state.tags.map((t) =>
            t.id === id ? { ...t, name: trimmedName, color } : t
          ),
        }));

        return { success: true, message: '标签更新成功' };
      },

      deleteTag: (id) => {
        const { tags, currentUser } = get();
        if (!currentUser) return { success: false, message: '请先登录' };

        const tag = tags.find(t => t.id === id);
        if (!tag || tag.userId !== currentUser.id) {
          return { success: false, message: '标签不存在或无权限删除' };
        }

        set((state) => ({
          tags: state.tags.filter((t) => t.id !== id),
          records: state.records.map((r) => ({
            ...r,
            tagIds: r.tagIds?.filter((tid) => tid !== id),
          })),
        }));

        return { success: true, message: '标签删除成功' };
      },

      addTagToRecord: (recordId, tagId) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === recordId
              ? { ...r, tagIds: [...(r.tagIds || []), tagId] }
              : r
          ),
        }));
      },

      removeTagFromRecord: (recordId, tagId) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === recordId
              ? { ...r, tagIds: r.tagIds?.filter((tid) => tid !== tagId) }
              : r
          ),
        }));
      },

      batchAddTagsToRecords: (recordIds, tagIdsToAdd) => {
        set((state) => ({
          records: state.records.map((r) => {
            if (!recordIds.includes(r.id)) return r;
            const newTagIds = [...(r.tagIds || [])];
            tagIdsToAdd.forEach((tid) => {
              if (!newTagIds.includes(tid)) {
                newTagIds.push(tid);
              }
            });
            return { ...r, tagIds: newTagIds };
          }),
        }));
      },

      batchRemoveTagsFromRecords: (recordIds, tagIdsToRemove) => {
        set((state) => ({
          records: state.records.map((r) => {
            if (!recordIds.includes(r.id)) return r;
            return {
              ...r,
              tagIds: r.tagIds?.filter((tid) => !tagIdsToRemove.includes(tid)),
            };
          }),
        }));
      },

      addShoppingListItem: (itemData) => {
        const { currentUser } = get();
        if (!currentUser) return;
        const newItem: ShoppingListItem = {
          ...itemData,
          id: generateId(),
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          shoppingList: [...state.shoppingList, newItem],
        }));
      },

      updateShoppingListItem: (id, itemData) => {
        set((state) => ({
          shoppingList: state.shoppingList.map((item) =>
            item.id === id ? { ...item, ...itemData } : item
          ),
        }));
      },

      deleteShoppingListItem: (id) => {
        set((state) => ({
          shoppingList: state.shoppingList.filter((item) => item.id !== id),
        }));
      },

      completeShoppingListItem: (id) => {
        set((state) => ({
          shoppingList: state.shoppingList.map((item) =>
            item.id === id
              ? { ...item, completed: true, completedAt: new Date().toISOString() }
              : item
          ),
        }));
      },

      uncompleteShoppingListItem: (id) => {
        set((state) => ({
          shoppingList: state.shoppingList.map((item) =>
            item.id === id
              ? { ...item, completed: false, completedAt: undefined }
              : item
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

      getMonthlyBudget: (): number => {
        const { monthlyBudgets, currentUser } = get();
        if (!currentUser) return 0;
        const budget = monthlyBudgets.find(b => b.userId === currentUser.id);
        return budget ? budget.limit : 0;
      },

      setMonthlyBudget: (limit: number) => {
        const { monthlyBudgets, currentUser } = get();
        if (!currentUser) return;

        const existingIndex = monthlyBudgets.findIndex(b => b.userId === currentUser.id);
        const newBudget: MonthlyBudget = { userId: currentUser.id, limit };

        if (existingIndex >= 0) {
          const newBudgets = [...monthlyBudgets];
          newBudgets[existingIndex] = newBudget;
          set({ monthlyBudgets: newBudgets });
        } else {
          set({ monthlyBudgets: [...monthlyBudgets, newBudget] });
        }
      },

      getBudgetStatus: (): BudgetStatus => {
        const { records, currentUser, getMonthlyBudget } = get();
        const userRecords = currentUser
          ? records.filter(r => r.userId === currentUser.id)
          : [];
        const limit = getMonthlyBudget();
        return computeBudgetStatus(userRecords, limit);
      },

      loadFromStorage: () => {
      },

      syncToCloud: async () => {
        const { currentUser, records } = get();
        if (!currentUser) return;

        set({ syncPhase: 'uploading', syncError: null });

        try {
          const userRecords = records.filter(r => r.userId === currentUser.id);
          const result = await uploadToCloud(currentUser.id, userRecords);
          set({
            syncPhase: 'success',
            lastSyncTime: result.lastSyncTime,
          });
          setTimeout(() => {
            if (get().syncPhase === 'success') {
              set({ syncPhase: 'idle' });
            }
          }, 3000);
        } catch (error) {
          set({
            syncPhase: 'error',
            syncError: error instanceof Error ? error.message : '上传同步失败',
          });
        }
      },

      syncFromCloud: async () => {
        const { currentUser, records } = get();
        if (!currentUser) return;

        set({ syncPhase: 'downloading', syncError: null });

        try {
          const cloudData = await downloadFromCloud(currentUser.id);

          set({ syncPhase: 'merging' });

          if (cloudData) {
            const userRecords = records.filter(r => r.userId === currentUser.id);
            const otherRecords = records.filter(r => r.userId !== currentUser.id);
            const merged = mergeRecords(userRecords, cloudData.records);
            set({
              records: [...merged, ...otherRecords],
              syncPhase: 'success',
              lastSyncTime: cloudData.lastSyncTime || new Date().toISOString(),
            });
          } else {
            set({ syncPhase: 'success' });
          }

          setTimeout(() => {
            if (get().syncPhase === 'success') {
              set({ syncPhase: 'idle' });
            }
          }, 3000);
        } catch (error) {
          set({
            syncPhase: 'error',
            syncError: error instanceof Error ? error.message : '下载同步失败',
          });
        }
      },

      syncAll: async () => {
        const { currentUser, records } = get();
        if (!currentUser) return;

        set({ syncPhase: 'downloading', syncError: null });

        try {
          const cloudData = await downloadFromCloud(currentUser.id);

          set({ syncPhase: 'merging' });

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

          set({ syncPhase: 'uploading' });

          const finalUserRecords = [...mergedRecords];
          const uploadResult = await uploadToCloud(currentUser.id, finalUserRecords);

          set({
            syncPhase: 'success',
            lastSyncTime: uploadResult.lastSyncTime || cloudSyncTime,
          });

          setTimeout(() => {
            if (get().syncPhase === 'success') {
              set({ syncPhase: 'idle' });
            }
          }, 3000);
        } catch (error) {
          set({
            syncPhase: 'error',
            syncError: error instanceof Error ? error.message : '同步失败，请重试',
          });
        }
      },

      batchAddRecords: (recordList) => {
        const { currentUser } = get();
        if (!currentUser) return;

        const newRecords: Record[] = recordList.map((recordData) => ({
          ...recordData,
          id: generateId(),
          userId: currentUser.id,
        }));
        set((state) => ({
          records: [...newRecords, ...state.records],
        }));
      },

      batchUpdateRecords: (updates) => {
        set((state) => {
          const updateMap = new Map(updates.map(u => [u.id, u.data]));
          const updatedRecords = state.records.map((r) => {
            const updateData = updateMap.get(r.id);
            if (updateData) {
              return { ...r, ...updateData };
            }
            return r;
          });
          return { records: updatedRecords };
        });
      },

      addFeedback: (feedbackData) => {
        const { currentUser } = get();
        if (!currentUser) return { success: false, message: '请先登录后再提交反馈' };

        const newFeedback: Feedback = {
          id: generateId(),
          userId: currentUser.id,
          type: feedbackData.type,
          description: feedbackData.description,
          version: feedbackData.version,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          feedbacks: [newFeedback, ...state.feedbacks],
        }));
        return { success: true, message: '反馈已保存', feedback: newFeedback };
      },

      updateFeedbackStatus: (id, status, errorMessage) => {
        set((state) => ({
          feedbacks: state.feedbacks.map((f) =>
            f.id === id
              ? {
                  ...f,
                  status,
                  errorMessage,
                  submittedAt: status === 'submitted' ? new Date().toISOString() : f.submittedAt,
                }
              : f
          ),
        }));
      },

      submitFeedback: async (id) => {
        const { feedbacks, currentUser } = get();
        const feedback = feedbacks.find((f) => f.id === id);
        if (!feedback) {
          throw new Error('反馈记录不存在');
        }

        const hasPermission = currentUser
          ? feedback.userId === currentUser.id
          : feedback.userId === null;

        if (!hasPermission) {
          throw new Error('无权限操作该反馈');
        }

        get().updateFeedbackStatus(id, 'pending');

        try {
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              const shouldFail = Math.random() < 0.1;
              if (shouldFail) {
                reject(new Error('网络连接失败，请稍后重试'));
              } else {
                resolve(true);
              }
            }, 1000);
          });

          get().updateFeedbackStatus(id, 'submitted');
        } catch (error) {
          get().updateFeedbackStatus(
            id,
            'failed',
            error instanceof Error ? error.message : '提交失败'
          );
          throw error;
        }
      },

      retryFeedback: async (id) => {
        await get().submitFeedback(id);
      },

      deleteFeedback: (id) => {
        const { feedbacks, currentUser } = get();
        const feedback = feedbacks.find((f) => f.id === id);
        if (!feedback) return { success: false, message: '反馈记录不存在' };

        if (currentUser) {
          if (feedback.userId !== currentUser.id) {
            return { success: false, message: '无权限删除该反馈' };
          }
        } else {
          if (feedback.userId !== null) {
            return { success: false, message: '无权限删除该反馈' };
          }
        }

        set((state) => ({
          feedbacks: state.feedbacks.filter((f) => f.id !== id),
        }));
        return { success: true, message: '删除成功' };
      },

      unlockAchievement: (achievementId: string) => {
        const { achievements, currentUser } = get();
        if (!currentUser) return;

        const alreadyUnlocked = achievements.some(
          (a) => a.id === achievementId && a.unlockedAt
        );
        if (alreadyUnlocked) return;

        const config = achievementConfigs.find((c) => c.id === achievementId);
        if (!config) return;

        const newAchievement: Achievement = {
          id: config.id,
          name: config.name,
          description: config.description,
          icon: config.icon,
          color: config.color,
          unlockedAt: new Date().toISOString(),
        };

        set((state) => {
          const filteredAchievements = state.achievements.filter(
            (a) => !(a.id === achievementId)
          );
          return {
            achievements: [...filteredAchievements, newAchievement],
          };
        });
      },

      checkAndUnlockAchievements: () => {
        const { currentUser, records, achievements, unlockAchievement, addNotification } = get();
        if (!currentUser) return [];

        const userRecords = records.filter((r) => r.userId === currentUser.id);
        const stats = computeStatsFromRecords(userRecords);
        const newlyUnlocked: Achievement[] = [];

        achievementConfigs.forEach((config) => {
          const isUnlocked = checkAchievementUnlocked(stats, userRecords, config.id);
          const alreadyUnlocked = achievements.some(
            (a) => a.id === config.id && a.unlockedAt
          );

          if (isUnlocked && !alreadyUnlocked) {
            unlockAchievement(config.id);
            newlyUnlocked.push({
              id: config.id,
              name: config.name,
              description: config.description,
              icon: config.icon,
              color: config.color,
              unlockedAt: new Date().toISOString(),
            });
            addNotification({
              type: 'achievement',
              title: '🎉 新成就解锁！',
              content: `恭喜你解锁了「${config.name}」成就：${config.description}`,
              relatedId: config.id,
            });
          }
        });

        return newlyUnlocked;
      },

      addNotification: (notificationData) => {
        const { currentUser } = get();
        if (!currentUser) return;

        const newNotification: Notification = {
          ...notificationData,
          id: generateId(),
          userId: currentUser.id,
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        const { currentUser } = get();
        if (!currentUser) return;
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.userId === currentUser.id ? { ...n, read: true } : n
          ),
        }));
      },

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAllNotifications: () => {
        const { currentUser } = get();
        if (!currentUser) return;
        set((state) => ({
          notifications: state.notifications.filter((n) => n.userId !== currentUser.id),
        }));
      },

      restoreRecord: (id) => {
        const { deletedRecords } = get();
        const deletedItem = deletedRecords.find((d) => d.record.id === id);
        if (!deletedItem) return;
        set((state) => ({
          deletedRecords: state.deletedRecords.filter((d) => d.record.id !== id),
          records: [deletedItem.record, ...state.records],
        }));
      },

      permanentDeleteRecord: (id) => {
        set((state) => ({
          deletedRecords: state.deletedRecords.filter((d) => d.record.id !== id),
        }));
      },

      batchRestoreRecords: (ids) => {
        const { deletedRecords } = get();
        const toRestore = deletedRecords.filter((d) => ids.includes(d.record.id));
        if (toRestore.length === 0) return;
        set((state) => ({
          deletedRecords: state.deletedRecords.filter((d) => !ids.includes(d.record.id)),
          records: [...toRestore.map((d) => d.record), ...state.records],
        }));
      },

      batchPermanentDeleteRecords: (ids) => {
        set((state) => ({
          deletedRecords: state.deletedRecords.filter((d) => !ids.includes(d.record.id)),
        }));
      },

      cleanExpiredDeletedRecords: () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        set((state) => ({
          deletedRecords: state.deletedRecords.filter((d) => {
            const deletedDate = new Date(d.deletedAt);
            deletedDate.setHours(0, 0, 0, 0);
            const daysSinceDeleted = Math.floor((now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysSinceDeleted < RECYCLE_BIN_RETENTION_DAYS;
          }),
        }));
      },

      clearAllData: () => {
        set({
          currentUser: null,
          records: [],
          deletedRecords: [],
          tags: [],
          monthlyBudgets: [],
          shoppingList: [],
          feedbacks: [],
          achievements: [],
          notifications: [],
          syncPhase: 'idle',
          lastSyncTime: null,
          syncError: null,
        });
        localStorage.removeItem('bargain-hunter-storage');
        localStorage.removeItem('theme');
      },
    }),
    {
      name: 'bargain-hunter-storage',
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
        records: state.records,
        deletedRecords: state.deletedRecords,
        tags: state.tags,
        lastSyncTime: state.lastSyncTime,
        monthlyBudgets: state.monthlyBudgets,
        shoppingList: state.shoppingList,
        feedbacks: state.feedbacks,
        achievements: state.achievements,
        notifications: state.notifications,
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

export const useUserTags = () => {
  const tags = useStore((state) => state.tags);
  const currentUser = useStore((state) => state.currentUser);
  return useMemo(() => {
    if (!currentUser) return [];
    return tags.filter(t => t.userId === currentUser.id);
  }, [tags, currentUser]);
};

export const useUserShoppingList = () => {
  const shoppingList = useStore((state) => state.shoppingList);
  const currentUser = useStore((state) => state.currentUser);
  return useMemo(() => {
    if (!currentUser) return [];
    return shoppingList.filter(item => item.userId === currentUser.id);
  }, [shoppingList, currentUser]);
};

export const useUserFeedbacks = () => {
  const feedbacks = useStore((state) => state.feedbacks);
  const currentUser = useStore((state) => state.currentUser);
  return useMemo(() => {
    if (!currentUser) return [];
    return feedbacks.filter((f) => f.userId === currentUser.id);
  }, [feedbacks, currentUser]);
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

export const useBudgetStatus = (): BudgetStatus => {
  const records = useUserRecords();
  const currentUser = useStore((state) => state.currentUser);
  const monthlyBudgets = useStore((state) => state.monthlyBudgets);
  const limit = useMemo(() => {
    if (!currentUser) return 0;
    const budget = monthlyBudgets.find(b => b.userId === currentUser.id);
    return budget ? budget.limit : 0;
  }, [monthlyBudgets, currentUser]);
  return useMemo(() => computeBudgetStatus(records, limit), [records, limit]);
};

export interface AchievementWithStatus {
  id: string;
  name: string;
  description: string;
  requirement: string;
  icon: string;
  color: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
}

export const useAchievements = (): AchievementWithStatus[] => {
  const achievements = useStore((state) => state.achievements);
  const records = useUserRecords();
  const stats = useUserStats();

  return useMemo(() => {
    return achievementConfigs.map((config) => {
      const unlockedAchievement = achievements.find(
        (a) => a.id === config.id && a.unlockedAt
      );
      const isUnlocked = checkAchievementUnlocked(stats, records, config.id);
      const progress = getAchievementProgress(stats, records, config.id) || {
        current: 0,
        total: 1,
        percentage: 0,
      };

      return {
        id: config.id,
        name: config.name,
        description: config.description,
        requirement: config.requirement,
        icon: config.icon,
        color: config.color,
        isUnlocked: isUnlocked || !!unlockedAchievement,
        unlockedAt: unlockedAchievement?.unlockedAt,
        progress,
      };
    });
  }, [achievements, records, stats]);
};

export const useUserNotifications = () => {
  const notifications = useStore((state) => state.notifications);
  const currentUser = useStore((state) => state.currentUser);
  return useMemo(() => {
    if (!currentUser) return [];
    return notifications
      .filter(n => n.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, currentUser]);
};

export const useUnreadNotificationCount = () => {
  const userNotifications = useUserNotifications();
  return useMemo(() => {
    return userNotifications.filter(n => !n.read).length;
  }, [userNotifications]);
};

export const useUserDeletedRecords = () => {
  const deletedRecords = useStore((state) => state.deletedRecords);
  const currentUser = useStore((state) => state.currentUser);
  return useMemo(() => {
    if (!currentUser) return [];
    return deletedRecords
      .filter((d) => d.record.userId === currentUser.id)
      .sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
  }, [deletedRecords, currentUser]);
};
