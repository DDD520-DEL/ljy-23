import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, X, MapPin, Coins, Percent, Clock } from 'lucide-react';
import { useUserRecords } from '../../store/useStore';
import { calculateSavings, calculateDiscountPrice, formatCurrency, formatDiscount, calculateDaysUntilExpiry, getExpiryStatus } from '../../utils/calculations';
import { getCategoryColor } from '../../utils/mockData';
import type { Record } from '../../types';

interface DayData {
  date: string;
  records: Record[];
  totalSavings: number;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfWeek = (year: number, month: number): number => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
};

const toDateKey = (dateStr: string): string => {
  return dateStr.split('T')[0];
};

const getSavingsLevel = (savings: number, maxSavings: number): number => {
  if (maxSavings === 0 || savings === 0) return 0;
  const ratio = savings / maxSavings;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
};

const HEAT_COLORS = [
  'bg-amber-50 border-amber-200',
  'bg-green-100 border-green-300',
  'bg-green-300 border-green-400',
  'bg-green-500 border-green-600',
  'bg-green-700 border-green-800',
];

const HEAT_TEXT_COLORS = [
  'text-amber-800',
  'text-green-800',
  'text-green-900',
  'text-white',
  'text-white',
];

const HEAT_SUBTEXT_COLORS = [
  'text-amber-500',
  'text-green-600',
  'text-green-700',
  'text-green-100',
  'text-green-100',
];

const CalendarPage = () => {
  const records = useUserRecords();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const monthRecordsMap = useMemo(() => {
    const map = new Map<string, DayData>();
    records.forEach(record => {
      const dateKey = toDateKey(record.purchaseDate);
      if (!map.has(dateKey)) {
        map.set(dateKey, { date: dateKey, records: [], totalSavings: 0 });
      }
      const dayData = map.get(dateKey)!;
      dayData.records.push(record);
      dayData.totalSavings += calculateSavings(record.originalPrice, record.discount);
    });
    return map;
  }, [records]);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
    const days: (DayData | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = monthRecordsMap.get(dateKey);
      if (dayData) {
        days.push(dayData);
      } else {
        days.push({ date: dateKey, records: [], totalSavings: 0 });
      }
    }

    return days;
  }, [currentYear, currentMonth, monthRecordsMap]);

  const maxSavings = useMemo(() => {
    let max = 0;
    monthRecordsMap.forEach(day => {
      if (day.totalSavings > max) max = day.totalSavings;
    });
    return max;
  }, [monthRecordsMap]);

  const monthSavings = useMemo(() => {
    let total = 0;
    monthRecordsMap.forEach(day => {
      const dayDate = new Date(day.date);
      if (dayDate.getFullYear() === currentYear && dayDate.getMonth() === currentMonth) {
        total += day.totalSavings;
      }
    });
    return total;
  }, [monthRecordsMap, currentYear, currentMonth]);

  const monthRecordCount = useMemo(() => {
    let count = 0;
    monthRecordsMap.forEach(day => {
      const dayDate = new Date(day.date);
      if (dayDate.getFullYear() === currentYear && dayDate.getMonth() === currentMonth) {
        count += day.records.length;
      }
    });
    return count;
  }, [monthRecordsMap, currentYear, currentMonth]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    return monthRecordsMap.get(selectedDate) || { date: selectedDate, records: [], totalSavings: 0 };
  }, [selectedDate, monthRecordsMap]);

  const goToPrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDate(null);
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDate(null);
  }, [currentMonth]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(null);
  }, []);

  const handleDayClick = useCallback((dateKey: string) => {
    setSelectedDate(prev => prev === dateKey ? null : dateKey);
  }, []);

  const closePopup = useCallback(() => {
    setSelectedDate(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setSelectedDate(null);
      }
    };
    if (selectedDate) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedDate]);

  const isToday = (dateKey: string) => {
    const now = new Date();
    return dateKey === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const monthLabel = `${currentYear}年${currentMonth + 1}月`;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <CalendarDays className="w-6 h-6 text-amber-600" />
          <h2 className="title-display text-3xl md:text-4xl text-amber-900">
            捡漏日历
          </h2>
          <CalendarDays className="w-6 h-6 text-amber-600" />
        </div>
        <p className="text-amber-700 font-body text-lg">
          回顾每一天的省钱战绩，发现你的捡漏规律
        </p>
      </div>

      <div className="card-paper p-4 md:p-6 relative">
        <div className="tape" style={{ top: '-8px', right: '30px', transform: 'rotate(5deg)' }} />

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPrevMonth}
            className="btn-stamp btn-secondary !px-3 !py-2 !text-base flex items-center gap-1"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">上月</span>
          </button>

          <div className="flex items-center gap-3">
            <h3 className="font-display text-2xl md:text-3xl text-amber-900">
              {monthLabel}
            </h3>
            <button
              onClick={goToToday}
              className="badge-stamp stamp-amber text-xs cursor-pointer hover:scale-105 transition-transform"
            >
              回到今天
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="btn-stamp btn-secondary !px-3 !py-2 !text-base flex items-center gap-1"
          >
            <span className="hidden sm:inline">下月</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-parchment-100 rounded-lg p-3 text-center border border-amber-200">
            <p className="text-xs text-amber-600 mb-1">本月捡漏</p>
            <p className="font-mono text-2xl font-bold text-amber-800">{monthRecordCount}</p>
            <p className="text-xs text-amber-500">次</p>
          </div>
          <div className="bg-parchment-100 rounded-lg p-3 text-center border border-amber-200">
            <p className="text-xs text-amber-600 mb-1">本月省钱</p>
            <p className="font-mono text-2xl font-bold text-forest-700">¥{monthSavings.toFixed(0)}</p>
            <p className="text-xs text-amber-500">元</p>
          </div>
          <div className="bg-parchment-100 rounded-lg p-3 text-center border border-amber-200">
            <p className="text-xs text-amber-600 mb-1">活跃天数</p>
            <p className="font-mono text-2xl font-bold text-map-600">
              {calendarDays.filter(d => d && d.records.length > 0).length}
            </p>
            <p className="text-xs text-amber-500">天</p>
          </div>
          <div className="bg-parchment-100 rounded-lg p-3 text-center border border-amber-200">
            <p className="text-xs text-amber-600 mb-1">日均省钱</p>
            <p className="font-mono text-2xl font-bold text-green-600">
              ¥{monthRecordCount > 0 ? (monthSavings / calendarDays.filter(d => d && d.records.length > 0).length).toFixed(0) : '0'}
            </p>
            <p className="text-xs text-amber-500">元/天</p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map(day => (
            <div
              key={day}
              className="text-center font-display text-sm text-amber-700 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 relative">
          {calendarDays.map((dayData, index) => {
            if (!dayData) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dayNum = parseInt(dayData.date.split('-')[2], 10);
            const hasRecords = dayData.records.length > 0;
            const level = hasRecords ? getSavingsLevel(dayData.totalSavings, maxSavings) : 0;
            const todayHighlight = isToday(dayData.date);
            const isSelected = selectedDate === dayData.date;

            return (
              <button
                key={dayData.date}
                onClick={() => handleDayClick(dayData.date)}
                className={`
                  aspect-square rounded-lg border-2 flex flex-col items-center justify-center
                  transition-all duration-200 relative cursor-pointer
                  ${HEAT_COLORS[level]}
                  ${todayHighlight ? 'ring-2 ring-amber-500 ring-offset-1 ring-offset-parchment-50' : ''}
                  ${isSelected ? 'ring-2 ring-amber-600 ring-offset-2 ring-offset-parchment-50 scale-105 z-10' : ''}
                  ${hasRecords ? 'hover:scale-105 hover:z-10 hover:shadow-md' : 'hover:bg-amber-100'}
                `}
              >
                <span className={`font-mono text-sm font-bold ${HEAT_TEXT_COLORS[level]} ${todayHighlight ? 'underline' : ''}`}>
                  {dayNum}
                </span>
                {hasRecords && (
                  <span className={`font-mono text-xs ${HEAT_SUBTEXT_COLORS[level]}`}>
                    ¥{dayData.totalSavings.toFixed(0)}
                  </span>
                )}
                {hasRecords && (
                  <span className={`absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full ${level >= 3 ? 'bg-yellow-300' : 'bg-green-500'}`} />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-amber-200">
          <span className="text-xs text-amber-600 font-display">省钱热度</span>
          <div className="flex items-center gap-1">
            {HEAT_COLORS.map((color, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className={`w-4 h-4 rounded border ${color}`} />
                <span className="text-xs text-amber-500">
                  {i === 0 ? '无' : i === 1 ? '低' : i === 2 ? '中' : i === 3 ? '高' : '极高'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedDate && selectedDayData && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={closePopup}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            ref={popupRef}
            className="relative w-full max-w-lg mx-4 mb-0 sm:mb-0 max-h-[70vh] flex flex-col card-paper rounded-t-2xl sm:rounded-2xl overflow-hidden stamp-animation"
            onClick={e => e.stopPropagation()}
          >
            <div className="tape" style={{ top: '-8px', left: '20px' }} />

            <div className="flex items-center justify-between p-4 border-b-2 border-amber-200 bg-parchment-100">
              <div>
                <h3 className="font-display text-xl text-amber-900">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                </h3>
                {selectedDayData.records.length > 0 ? (
                  <p className="text-sm text-amber-600 mt-1">
                    捡漏 {selectedDayData.records.length} 次，省钱 <span className="font-mono font-bold text-forest-700">¥{selectedDayData.totalSavings.toFixed(2)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-amber-500 mt-1 italic">这天没有捡漏记录</p>
                )}
              </div>
              <button
                onClick={closePopup}
                className="p-2 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {selectedDayData.records.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-amber-600 font-display">这天没有捡漏记录</p>
                  <p className="text-sm text-amber-500 mt-1">快去淘临期好物吧！</p>
                </div>
              ) : (
                selectedDayData.records.map(record => {
                  const savings = calculateSavings(record.originalPrice, record.discount);
                  const discountPrice = calculateDiscountPrice(record.originalPrice, record.discount);
                  const daysUntilExpiry = calculateDaysUntilExpiry(record.expiryDate);
                  const expiryStatus = getExpiryStatus(daysUntilExpiry);
                  const categoryColor = getCategoryColor(record.category);

                  return (
                    <div key={record.id} className="bg-parchment-100 rounded-lg p-3 border border-amber-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display text-lg text-amber-900 truncate">
                            {record.productName}
                          </h4>
                          <div className="flex items-center gap-1 text-sm text-amber-700">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{record.supermarketName}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span
                            className="badge-stamp text-xs"
                            style={{
                              backgroundColor: `${categoryColor}15`,
                              color: categoryColor,
                              borderColor: categoryColor,
                            }}
                          >
                            {record.category}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-parchment-50 rounded p-1.5 text-center border border-amber-100">
                          <div className="flex items-center justify-center gap-0.5 text-xs text-amber-500">
                            <Coins className="w-3 h-3" />
                            <span>原价</span>
                          </div>
                          <p className="font-mono text-sm text-amber-800 line-through">{formatCurrency(record.originalPrice)}</p>
                        </div>
                        <div className="bg-parchment-50 rounded p-1.5 text-center border border-amber-100">
                          <div className="flex items-center justify-center gap-0.5 text-xs text-amber-500">
                            <Percent className="w-3 h-3" />
                            <span>折扣</span>
                          </div>
                          <p className="font-mono text-sm text-amber-700">{formatDiscount(record.discount)}</p>
                        </div>
                        <div className="bg-green-50 rounded p-1.5 text-center border border-green-200">
                          <div className="flex items-center justify-center gap-0.5 text-xs text-forest-700">
                            <Coins className="w-3 h-3" />
                            <span>节省</span>
                          </div>
                          <p className="font-mono text-sm font-bold text-forest-700">{formatCurrency(savings)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-amber-500">
                          <Clock className="w-3 h-3" />
                          <span>折后 {formatCurrency(discountPrice)}</span>
                        </div>
                        <span className={`text-xs font-mono ${expiryStatus.color}`}>
                          {expiryStatus.status} {daysUntilExpiry > 0 ? `${daysUntilExpiry}天` : ''}
                        </span>
                      </div>

                      {record.notes && (
                        <p className="text-xs text-amber-500 italic mt-1.5 border-t border-amber-100 pt-1.5">
                          "{record.notes}"
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
