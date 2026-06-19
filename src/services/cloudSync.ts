import type { Record, UserCloudData } from '../types';

const CLOUD_STORAGE_PREFIX = 'bargain-hunter-cloud-';
const SIMULATED_DELAY = 600;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getCloudKey = (userId: string) => `${CLOUD_STORAGE_PREFIX}${userId}`;

export const uploadToCloud = async (userId: string, records: Record[]): Promise<UserCloudData> => {
  await delay(SIMULATED_DELAY);

  const cloudData: UserCloudData = {
    records,
    lastSyncTime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(getCloudKey(userId), JSON.stringify(cloudData));
  } catch (e) {
    throw new Error('云端存储失败，请检查浏览器存储空间');
  }

  return cloudData;
};

export const downloadFromCloud = async (userId: string): Promise<UserCloudData | null> => {
  await delay(SIMULATED_DELAY);

  try {
    const raw = localStorage.getItem(getCloudKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as UserCloudData;
  } catch (e) {
    throw new Error('云端数据解析失败');
  }
};

export const mergeRecords = (localRecords: Record[], cloudRecords: Record[]): Record[] => {
  const recordMap = new Map<string, Record>();

  cloudRecords.forEach(record => {
    recordMap.set(record.id, record);
  });

  localRecords.forEach(record => {
    const existing = recordMap.get(record.id);
    if (!existing) {
      recordMap.set(record.id, record);
    } else {
      const localTime = new Date(record.purchaseDate).getTime();
      const cloudTime = new Date(existing.purchaseDate).getTime();
      if (localTime >= cloudTime) {
        recordMap.set(record.id, record);
      }
    }
  });

  return Array.from(recordMap.values());
};
