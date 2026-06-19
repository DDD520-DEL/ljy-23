import type { Record, UserCloudData } from '../types';

const API_BASE = '/api/cloud';
const REQUEST_TIMEOUT = 10000;

class CloudSyncError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'CloudSyncError';
    this.code = code;
  }
}

const fetchWithTimeout = async (url: string, options: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new CloudSyncError('连接超时，请检查网络后重试', 'TIMEOUT');
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new CloudSyncError('无法连接到云端服务器，请检查网络连接', 'NETWORK_ERROR');
    }
    throw new CloudSyncError(
      error instanceof Error ? error.message : '网络请求失败',
      'FETCH_ERROR'
    );
  } finally {
    clearTimeout(timeoutId);
  }
};

export const uploadToCloud = async (userId: string, records: Record[]): Promise<UserCloudData> => {
  const payload: UserCloudData = {
    records,
    lastSyncTime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const response = await fetchWithTimeout(`${API_BASE}/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const statusTexts: { [key: number]: string } = {
      400: '请求格式错误，请更新应用后重试',
      401: '认证失败，请重新登录',
      403: '无权限访问该数据',
      500: '服务器内部错误，请稍后重试',
    };
    const msg = statusTexts[response.status] || `上传失败（HTTP ${response.status}）`;
    throw new CloudSyncError(msg, 'UPLOAD_ERROR');
  }

  const result = await response.json();
  return result.data as UserCloudData;
};

export const downloadFromCloud = async (userId: string): Promise<UserCloudData | null> => {
  const response = await fetchWithTimeout(`${API_BASE}/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const statusTexts: { [key: number]: string } = {
      400: '请求格式错误，请更新应用后重试',
      401: '认证失败，请重新登录',
      403: '无权限访问该数据',
      404: '云端暂无数据',
      500: '服务器内部错误，请稍后重试',
    };
    const msg = statusTexts[response.status] || `下载失败（HTTP ${response.status}）`;
    throw new CloudSyncError(msg, 'DOWNLOAD_ERROR');
  }

  const result = await response.json();
  return result.data as UserCloudData | null;
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
