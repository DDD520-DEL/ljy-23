import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Clock, Package } from 'lucide-react';
import { useStore, useUserRecords } from '../../store/useStore';
import { calculateDaysUntilExpiry, formatShortDate } from '../../utils/calculations';
import type { Record } from '../../types';

interface AlertRecord extends Record {
  daysUntilExpiry: number;
}

const ExpiryAlertBanner = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const markAlertHandled = useStore((state) => state.markAlertHandled);
  const records = useUserRecords();

  const alertRecords: AlertRecord[] = useMemo(() => {
    return records
      .filter((r) => {
        if (r.alertHandled) return false;
        const days = calculateDaysUntilExpiry(r.expiryDate);
        return days <= 3 && days >= 0;
      })
      .map((r) => ({
        ...r,
        daysUntilExpiry: calculateDaysUntilExpiry(r.expiryDate),
      }))
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [records]);

  const urgentCount = alertRecords.filter((r) => r.daysUntilExpiry <= 0).length;
  const warningCount = alertRecords.filter((r) => r.daysUntilExpiry > 0 && r.daysUntilExpiry <= 3).length;

  if (alertRecords.length === 0) {
    return null;
  }

  const getAlertBadgeStyle = (days: number) => {
    if (days <= 0) {
      return 'bg-crimson-700 text-white';
    } else if (days <= 1) {
      return 'bg-orange-600 text-white';
    } else {
      return 'bg-amber-600 text-white';
    }
  };

  const getAlertLabel = (days: number) => {
    if (days <= 0) return '今天过期';
    if (days === 1) return '明天过期';
    return `还剩 ${days} 天`;
  };

  return (
    <div className="sticky top-20 z-40 border-b-4 shadow-md" style={{ borderColor: '#B91C1C', backgroundColor: '#FEF2F2' }}>
      <div className="container mx-auto px-4">
        <div className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: '#DC2626' }}>
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-amber-900">
                    临期预警提醒
                  </h2>
                  {urgentCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-crimson-700 text-white">
                      {urgentCount} 件今日过期
                    </span>
                  )}
                  {warningCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white">
                      {warningCount} 件即将过期
                    </span>
                  )}
                </div>
                <p className="text-sm text-amber-700">
                  共有 {alertRecords.length} 件商品需要您关注
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-red-100 transition-all text-amber-800"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          {isExpanded && (
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-2">
              {alertRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white border-2 border-amber-200 shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-amber-700" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base font-semibold text-amber-900 truncate">
                          {record.productName}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${getAlertBadgeStyle(record.daysUntilExpiry)}`}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {getAlertLabel(record.daysUntilExpiry)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-amber-600">
                        <span>{record.supermarketName}</span>
                        <span>保质期至: {formatShortDate(record.expiryDate)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => markAlertHandled(record.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-forest-700 text-white font-medium text-sm hover:bg-forest-800 transition-all hover:scale-105 flex-shrink-0"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>已处理</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpiryAlertBanner;
