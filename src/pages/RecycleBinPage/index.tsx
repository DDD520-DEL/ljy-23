import { useState, useMemo, useEffect } from 'react';
import { useStore, useUserDeletedRecords, useUserTags } from '../../store/useStore';
import { Trash2, RotateCcw, CheckSquare, Square, X, AlertTriangle, Clock, MapPin, Tag, Coins, Percent, Archive } from 'lucide-react';
import { RECYCLE_BIN_RETENTION_DAYS } from '../../types';
import { calculateDiscountPrice, calculateSavings, calculateDaysUntilExpiry, formatCurrency, formatDiscount, formatShortDate, getExpiryStatus } from '../../utils/calculations';
import { getCategoryColor } from '../../utils/mockData';

const RecycleBinPage = () => {
  const deletedRecords = useUserDeletedRecords();
  const tags = useUserTags();
  const restoreRecord = useStore((state) => state.restoreRecord);
  const permanentDeleteRecord = useStore((state) => state.permanentDeleteRecord);
  const batchRestoreRecords = useStore((state) => state.batchRestoreRecords);
  const batchPermanentDeleteRecords = useStore((state) => state.batchPermanentDeleteRecords);
  const cleanExpiredDeletedRecords = useStore((state) => state.cleanExpiredDeletedRecords);

  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);

  useEffect(() => {
    cleanExpiredDeletedRecords();
  }, [cleanExpiredDeletedRecords]);

  const getRemainingDays = (deletedAt: string): number => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const deletedDate = new Date(deletedAt);
    deletedDate.setHours(0, 0, 0, 0);
    const daysSinceDeleted = Math.floor((now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, RECYCLE_BIN_RETENTION_DAYS - daysSinceDeleted);
  };

  const expiringCount = useMemo(() => {
    return deletedRecords.filter((d) => getRemainingDays(d.deletedAt) <= 3).length;
  }, [deletedRecords]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === deletedRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(deletedRecords.map((d) => d.record.id));
    }
  };

  const handleRestore = (id: string) => {
    restoreRecord(id);
  };

  const handlePermanentDelete = (id: string) => {
    permanentDeleteRecord(id);
    setConfirmDeleteId(null);
  };

  const handleBatchRestore = () => {
    if (selectedIds.length === 0) return;
    batchRestoreRecords(selectedIds);
    setSelectedIds([]);
    setIsBatchMode(false);
  };

  const handleBatchPermanentDelete = () => {
    if (selectedIds.length === 0) return;
    batchPermanentDeleteRecords(selectedIds);
    setSelectedIds([]);
    setIsBatchMode(false);
    setConfirmBatchDelete(false);
  };

  const exitBatchMode = () => {
    setIsBatchMode(false);
    setSelectedIds([]);
  };

  const getRetentionBarColor = (remaining: number): string => {
    if (remaining <= 3) return 'bg-red-500';
    if (remaining <= 7) return 'bg-amber-500';
    return 'bg-forest-700';
  };

  const getRetentionTextColor = (remaining: number): string => {
    if (remaining <= 3) return 'text-red-600';
    if (remaining <= 7) return 'text-amber-600';
    return 'text-forest-700';
  };

  const getRetentionBgColor = (remaining: number): string => {
    if (remaining <= 3) return 'bg-red-50 border-red-300';
    if (remaining <= 7) return 'bg-amber-50 border-amber-300';
    return 'bg-green-50 border-forest-700';
  };

  return (
    <div className="space-y-6">
      {isBatchMode && (
        <div className="card-paper p-4 border-2 border-amber-400 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-amber-600" />
              <span className="font-display text-xl text-amber-900">
                批量操作模式
              </span>
              <span className="badge-stamp stamp-amber">
                已选 {selectedIds.length} 条
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSelectAll}
                className="btn-stamp btn-secondary flex items-center gap-1 text-sm"
              >
                {selectedIds.length === deletedRecords.length ? (
                  <><Square className="w-4 h-4" /> 取消全选</>
                ) : (
                  <><CheckSquare className="w-4 h-4" /> 全选</>
                )}
              </button>
              <button
                onClick={handleBatchRestore}
                disabled={selectedIds.length === 0}
                className={`btn-stamp btn-primary flex items-center gap-1 text-sm ${
                  selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                批量恢复
              </button>
              <button
                onClick={() => setConfirmBatchDelete(true)}
                disabled={selectedIds.length === 0}
                className={`btn-stamp btn-danger flex items-center gap-1 text-sm ${
                  selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Trash2 className="w-4 h-4" />
                批量彻底删除
              </button>
              <button
                onClick={exitBatchMode}
                className="btn-stamp btn-secondary flex items-center gap-1 text-sm"
              >
                <X className="w-4 h-4" />
                退出
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmBatchDelete && (
        <div className="card-paper p-4 border-2 border-red-400 bg-red-50 animate-fadeIn">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <span className="font-display text-lg text-red-800">
              确定要彻底删除选中的 {selectedIds.length} 条记录吗？
            </span>
          </div>
          <p className="text-red-700 text-sm mb-3">
            此操作不可恢复，记录将被永久删除。
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleBatchPermanentDelete}
              className="btn-stamp btn-danger flex items-center gap-1 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              确认彻底删除
            </button>
            <button
              onClick={() => setConfirmBatchDelete(false)}
              className="btn-stamp btn-secondary flex items-center gap-1 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Archive className="w-8 h-8 text-amber-600" />
          <h2 className="title-display text-3xl md:text-4xl text-amber-900">
            回收站
          </h2>
          <Archive className="w-8 h-8 text-amber-600" />
        </div>
        <p className="text-amber-700 font-body text-lg">
          被删除的记录将保留 {RECYCLE_BIN_RETENTION_DAYS} 天，之后自动清理
        </p>
      </div>

      {deletedRecords.length > 0 && (
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setIsBatchMode(!isBatchMode)}
            className={`btn-stamp flex items-center gap-2 ${
              isBatchMode ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            {isBatchMode ? '退出批量操作' : '批量操作'}
          </button>
        </div>
      )}

      {deletedRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deletedRecords.map((deletedItem, index) => {
            const record = deletedItem.record;
            const remaining = getRemainingDays(deletedItem.deletedAt);
            const categoryColor = getCategoryColor(record.category);
            const discountPrice = calculateDiscountPrice(record.originalPrice, record.discount);
            const savings = calculateSavings(record.originalPrice, record.discount);
            const daysUntilExpiry = calculateDaysUntilExpiry(record.expiryDate);
            const expiryStatus = getExpiryStatus(daysUntilExpiry);
            const recordTags = tags.filter((t) => record.tagIds?.includes(t.id));
            const isSelected = selectedIds.includes(record.id);
            const retentionPercentage = (remaining / RECYCLE_BIN_RETENTION_DAYS) * 100;

            return (
              <div
                key={record.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-fadeIn"
              >
                <div
                  className={`card-paper p-5 relative overflow-hidden transition-all duration-300 ${
                    isSelected ? 'ring-4 ring-amber-500 ring-opacity-70' : ''
                  } ${remaining <= 3 ? 'border-2 border-red-300' : ''}`}
                >
                  <div className="tape" style={{ top: '-8px', right: '20px', transform: 'rotate(-5deg)' }} />

                  {isBatchMode && (
                    <div className="absolute top-3 left-3 z-20">
                      <button
                        onClick={() => handleToggleSelect(record.id)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-amber-600 border-amber-600 text-white'
                            : 'bg-white border-amber-300 hover:border-amber-500'
                        }`}
                      >
                        {isSelected && <span className="text-sm font-bold">✓</span>}
                      </button>
                    </div>
                  )}

                  <div className={`rounded-lg p-2.5 mb-3 border-2 ${getRetentionBgColor(remaining)}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-4 h-4 ${getRetentionTextColor(remaining)}`} />
                        <span className={`text-sm font-medium ${getRetentionTextColor(remaining)}`}>
                          {remaining > 0 ? `剩余 ${remaining} 天` : '即将清理'}
                        </span>
                      </div>
                      <span className="text-xs text-amber-500">
                        {new Date(deletedItem.deletedAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getRetentionBarColor(remaining)}`}
                        style={{ width: `${retentionPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-display text-lg text-amber-900 mb-1">
                          {record.productName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-amber-700">
                          <MapPin className="w-4 h-4" />
                          <span>{record.supermarketName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className="badge-stamp mb-1"
                          style={{
                            backgroundColor: `${categoryColor}15`,
                            color: categoryColor,
                            borderColor: categoryColor,
                          }}
                        >
                          {record.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <Tag className="w-3 h-3" />
                          <span>{formatShortDate(record.purchaseDate)}</span>
                        </div>
                      </div>
                    </div>

                    {recordTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {recordTags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                              border: `1px solid ${tag.color}40`,
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-parchment-100 rounded-lg p-1.5 text-center border border-amber-200">
                        <div className="flex items-center justify-center gap-1 text-xs text-amber-600 mb-0.5">
                          <Coins className="w-3 h-3" />
                          <span>原价</span>
                        </div>
                        <p className="font-mono text-sm text-amber-800 line-through">
                          {formatCurrency(record.originalPrice)}
                        </p>
                      </div>
                      <div className="bg-parchment-100 rounded-lg p-1.5 text-center border border-amber-200">
                        <div className="flex items-center justify-center gap-1 text-xs text-amber-600 mb-0.5">
                          <Percent className="w-3 h-3" />
                          <span>折扣</span>
                        </div>
                        <p className="font-mono text-sm text-amber-700">
                          {formatDiscount(record.discount)}
                        </p>
                      </div>
                      <div className={`rounded-lg p-1.5 text-center border-2 ${expiryStatus.bgColor} ${expiryStatus.color} border-current`}>
                        <div className="flex items-center justify-center gap-1 text-xs mb-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{expiryStatus.status}</span>
                        </div>
                        <p className="font-mono text-sm font-bold">
                          {daysUntilExpiry > 0 ? `${daysUntilExpiry}天` : '已过期'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="badge-stamp stamp-green">
                        💰 节省 {formatCurrency(savings)} / ¥{discountPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {!isBatchMode && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t-2 border-amber-200">
                      <button
                        onClick={() => handleRestore(record.id)}
                        className="btn-stamp btn-primary flex items-center gap-1 text-sm flex-1"
                      >
                        <RotateCcw className="w-4 h-4" />
                        恢复
                      </button>
                      {confirmDeleteId === record.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <button
                            onClick={() => handlePermanentDelete(record.id)}
                            className="btn-stamp btn-danger flex items-center gap-1 text-sm flex-1"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            确认
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="btn-stamp btn-secondary flex items-center gap-1 text-sm"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(record.id)}
                          className="btn-stamp btn-danger flex items-center gap-1 text-sm flex-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          彻底删除
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-paper p-12 text-center">
          <div className="text-6xl mb-4">🗑️</div>
          <h3 className="font-display text-2xl text-amber-900 mb-2">
            回收站为空
          </h3>
          <p className="text-amber-700 mb-4">
            没有被删除的记录，删除的记录将在此保留 {RECYCLE_BIN_RETENTION_DAYS} 天
          </p>
        </div>
      )}

      <div className="card-paper p-4 mt-6 sticky bottom-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-amber-600" />
              <span className="font-display text-amber-900">
                回收站总条数：
              </span>
              <span className="badge-stamp stamp-amber">
                {deletedRecords.length} 条
              </span>
            </div>
            {expiringCount > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="font-display text-red-700">
                  即将自动清理：
                </span>
                <span className="badge-stamp" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', borderColor: '#fca5a5' }}>
                  {expiringCount} 条
                </span>
              </div>
            )}
          </div>
          <div className="text-sm text-amber-500">
            记录保留 {RECYCLE_BIN_RETENTION_DAYS} 天后自动清理
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecycleBinPage;
