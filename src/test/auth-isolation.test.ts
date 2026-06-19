import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store/useStore';
import { computeStatsFromRecords } from '../utils/calculations';
import type { Record } from '../types';

const createRecord = (overrides: Partial<Record> & { id: string; userId: string }): Record => ({
  supermarketName: '沃尔玛',
  shelfLocation: '零食区',
  productName: '测试商品',
  category: '零食饮料',
  originalPrice: 100,
  discount: 5,
  expiryDate: '2026-12-31',
  purchaseDate: '2026-06-01',
  notes: '',
  x: 50,
  y: 50,
  ...overrides,
});

describe('用户认证', () => {
  beforeEach(() => {
    useStore.setState({
      users: [],
      currentUser: null,
      records: [],
    });
  });

  describe('注册', () => {
    it('应该成功注册新用户', () => {
      const result = useStore.getState().register('hunter1', 'password123');
      expect(result.success).toBe(true);
      expect(result.message).toBe('注册成功');
    });

    it('注册后应自动登录', () => {
      useStore.getState().register('hunter1', 'password123');
      const { currentUser } = useStore.getState();
      expect(currentUser).not.toBeNull();
      expect(currentUser?.username).toBe('hunter1');
    });

    it('应该拒绝空用户名', () => {
      const result = useStore.getState().register('', 'password123');
      expect(result.success).toBe(false);
      expect(result.message).toBe('用户名和密码不能为空');
    });

    it('应该拒绝过短的用户名', () => {
      const result = useStore.getState().register('ab', 'password123');
      expect(result.success).toBe(false);
      expect(result.message).toBe('用户名至少需要3个字符');
    });

    it('应该拒绝过短的密码', () => {
      const result = useStore.getState().register('hunter1', '12345');
      expect(result.success).toBe(false);
      expect(result.message).toBe('密码至少需要6个字符');
    });

    it('应该拒绝重复的用户名', () => {
      useStore.getState().register('hunter1', 'password123');
      const result = useStore.getState().register('hunter1', 'different');
      expect(result.success).toBe(false);
      expect(result.message).toBe('该用户名已被注册');
    });

    it('应该修剪用户名前后的空格', () => {
      const result = useStore.getState().register('  hunter1  ', 'password123');
      expect(result.success).toBe(true);
      expect(useStore.getState().currentUser?.username).toBe('hunter1');
    });
  });

  describe('登录', () => {
    beforeEach(() => {
      useStore.getState().register('hunter1', 'password123');
      useStore.setState({ currentUser: null });
    });

    it('应该成功登录已注册用户', () => {
      const result = useStore.getState().login('hunter1', 'password123');
      expect(result.success).toBe(true);
      expect(result.message).toBe('登录成功');
    });

    it('登录后应设置 currentUser', () => {
      useStore.getState().login('hunter1', 'password123');
      expect(useStore.getState().currentUser?.username).toBe('hunter1');
    });

    it('应该拒绝不存在的用户', () => {
      const result = useStore.getState().login('nonexistent', 'password123');
      expect(result.success).toBe(false);
      expect(result.message).toBe('用户不存在');
    });

    it('应该拒绝错误的密码', () => {
      const result = useStore.getState().login('hunter1', 'wrongpassword');
      expect(result.success).toBe(false);
      expect(result.message).toBe('密码错误');
    });

    it('应该拒绝空的用户名或密码', () => {
      const result = useStore.getState().login('', 'password123');
      expect(result.success).toBe(false);
    });
  });

  describe('登出', () => {
    it('应该清除 currentUser', () => {
      useStore.getState().register('hunter1', 'password123');
      expect(useStore.getState().currentUser).not.toBeNull();
      useStore.getState().logout();
      expect(useStore.getState().currentUser).toBeNull();
    });
  });
});

describe('用户数据隔离', () => {
  let user1Id: string;
  let user2Id: string;

  beforeEach(() => {
    useStore.setState({
      users: [],
      currentUser: null,
      records: [],
    });

    useStore.getState().register('hunter1', 'password111');
    user1Id = useStore.getState().currentUser!.id;

    useStore.getState().addRecord(createRecord({
      id: 'r1',
      userId: user1Id,
      productName: '用户1的商品A',
      originalPrice: 50,
      discount: 5,
    }));

    useStore.getState().addRecord(createRecord({
      id: 'r2',
      userId: user1Id,
      productName: '用户1的商品B',
      originalPrice: 30,
      discount: 3,
      supermarketName: '永辉超市',
    }));

    useStore.getState().logout();
    useStore.getState().register('hunter2', 'password222');
    user2Id = useStore.getState().currentUser!.id;

    useStore.getState().addRecord(createRecord({
      id: 'r3',
      userId: user2Id,
      productName: '用户2的商品C',
      originalPrice: 80,
      discount: 4,
    }));

    useStore.getState().addRecord(createRecord({
      id: 'r4',
      userId: user2Id,
      productName: '用户2的商品D',
      originalPrice: 20,
      discount: 6,
      supermarketName: '盒马鲜生',
    }));

    useStore.getState().addRecord(createRecord({
      id: 'r5',
      userId: user2Id,
      productName: '用户2的商品E',
      originalPrice: 60,
      discount: 7,
    }));
  });

  it('全局应包含所有用户的5条记录', () => {
    expect(useStore.getState().records.length).toBe(5);
  });

  it('getStats 应仅返回当前登录用户的统计', () => {
    const stats = useStore.getState().getStats();
    expect(stats.totalRecords).toBe(3);
  });

  it('切换用户后 getStats 应返回对应用户的统计', () => {
    useStore.getState().logout();
    useStore.getState().login('hunter1', 'password111');
    const stats = useStore.getState().getStats();
    expect(stats.totalRecords).toBe(2);
  });

  it('用户1统计应只包含用户1的数据', () => {
    useStore.getState().logout();
    useStore.getState().login('hunter1', 'password111');
    const stats = useStore.getState().getStats();
    expect(stats.totalRecords).toBe(2);
    expect(stats.latestRecord?.productName).toMatch(/用户1/);
  });

  it('用户2统计应只包含用户2的数据', () => {
    useStore.getState().logout();
    useStore.getState().login('hunter2', 'password222');
    const stats = useStore.getState().getStats();
    expect(stats.totalRecords).toBe(3);
    expect(stats.latestRecord?.productName).toMatch(/用户2/);
  });

  it('用户1看不到用户2的超市数据', () => {
    useStore.getState().logout();
    useStore.getState().login('hunter1', 'password111');
    const stats = useStore.getState().getStats();
    const supermarketNames = stats.bySupermarket.map(s => s.name);
    expect(supermarketNames).not.toContain('盒马鲜生');
  });

  it('用户2看不到用户1的超市数据', () => {
    const stats = useStore.getState().getStats();
    const supermarketNames = stats.bySupermarket.map(s => s.name);
    expect(supermarketNames).not.toContain('永辉超市');
  });

  it('未登录时 getStats 应返回空统计', () => {
    useStore.getState().logout();
    const stats = useStore.getState().getStats();
    expect(stats.totalRecords).toBe(0);
    expect(stats.totalSavings).toBe(0);
    expect(stats.bySupermarket).toHaveLength(0);
    expect(stats.byCategory).toHaveLength(0);
    expect(stats.byMonth).toHaveLength(0);
  });

  it('getPublicStats 应返回所有用户的汇总数据', () => {
    useStore.getState().logout();
    const publicStats = useStore.getState().getPublicStats();
    expect(publicStats.totalRecords).toBe(5);
    expect(publicStats.totalUsers).toBe(2);
    expect(publicStats.totalSavings).toBeGreaterThan(0);
  });

  it('新添加的记录应属于当前登录用户', () => {
    useStore.getState().logout();
    useStore.getState().login('hunter1', 'password111');
    useStore.getState().addRecord(createRecord({
      id: 'r6',
      userId: user1Id,
      productName: '用户1的新商品',
      originalPrice: 40,
      discount: 5,
    }));
    const stats = useStore.getState().getStats();
    expect(stats.totalRecords).toBe(3);
    expect(stats.latestRecord?.productName).toBe('用户1的新商品');
  });

  it('删除记录不应影响其他用户的数据', () => {
    useStore.getState().logout();
    useStore.getState().login('hunter2', 'password222');
    const user2Records = useStore.getState().records.filter(r => r.userId === user2Id);
    const beforeDelete = useStore.getState().getStats();
    expect(beforeDelete.totalRecords).toBe(3);
    const recordToDelete = user2Records[0];
    useStore.getState().deleteRecord(recordToDelete.id);
    const stats2 = useStore.getState().getStats();
    expect(stats2.totalRecords).toBe(2);

    useStore.getState().logout();
    useStore.getState().login('hunter1', 'password111');
    const stats1 = useStore.getState().getStats();
    expect(stats1.totalRecords).toBe(2);
  });
});

describe('computeStatsFromRecords 纯函数', () => {
  it('空记录应返回零值统计', () => {
    const stats = computeStatsFromRecords([]);
    expect(stats.totalRecords).toBe(0);
    expect(stats.totalSavings).toBe(0);
    expect(stats.averageDiscount).toBe(0);
    expect(stats.latestRecord).toBeNull();
  });

  it('应正确计算总捡漏次数', () => {
    const records = [
      createRecord({ id: '1', userId: 'u1' }),
      createRecord({ id: '2', userId: 'u1' }),
    ];
    const stats = computeStatsFromRecords(records);
    expect(stats.totalRecords).toBe(2);
  });

  it('应正确计算节省金额', () => {
    const records = [
      createRecord({ id: '1', userId: 'u1', originalPrice: 100, discount: 5 }),
    ];
    const stats = computeStatsFromRecords(records);
    expect(stats.totalSavings).toBe(50);
  });

  it('应正确计算平均折扣', () => {
    const records = [
      createRecord({ id: '1', userId: 'u1', discount: 5 }),
      createRecord({ id: '2', userId: 'u1', discount: 7 }),
    ];
    const stats = computeStatsFromRecords(records);
    expect(stats.averageDiscount).toBe(6);
  });

  it('应按超市分组统计', () => {
    const records = [
      createRecord({ id: '1', userId: 'u1', supermarketName: '沃尔玛' }),
      createRecord({ id: '2', userId: 'u1', supermarketName: '永辉超市' }),
      createRecord({ id: '3', userId: 'u1', supermarketName: '沃尔玛' }),
    ];
    const stats = computeStatsFromRecords(records);
    expect(stats.bySupermarket).toHaveLength(2);
    const wm = stats.bySupermarket.find(s => s.name === '沃尔玛');
    expect(wm?.count).toBe(2);
  });

  it('应按品类分组统计', () => {
    const records = [
      createRecord({ id: '1', userId: 'u1', category: '零食饮料' }),
      createRecord({ id: '2', userId: 'u1', category: '奶制品' }),
    ];
    const stats = computeStatsFromRecords(records);
    expect(stats.byCategory).toHaveLength(2);
  });
});
