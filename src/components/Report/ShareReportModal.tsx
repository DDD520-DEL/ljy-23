import { useState, useMemo, useRef, useEffect } from 'react';
import { X, Download, Link2, Calendar, Store, Globe, Check, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import ReportCard, { ReportDimension } from './ReportCard';
import { useUserRecords, useStore } from '../../store/useStore';
import {
  computeStatsFromRecords,
  filterRecordsByMonth,
  filterRecordsBySupermarket,
  getAvailableMonths,
  getAvailableSupermarkets,
  getMonthLabel,
} from '../../utils/calculations';
import type { StatsData, Record } from '../../types';

export interface ShareReportInitialState {
  dimensionType: 'all' | 'month' | 'supermarket';
  value?: string;
}

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialState?: ShareReportInitialState;
}

const ShareReportModal = ({ isOpen, onClose, initialState }: ShareReportModalProps) => {
  const allRecords = useUserRecords();
  const currentUser = useStore((state) => state.currentUser);

  const [dimensionType, setDimensionType] = useState<'all' | 'month' | 'supermarket'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedSupermarket, setSelectedSupermarket] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const availableMonths = useMemo(() => getAvailableMonths(allRecords), [allRecords]);
  const availableSupermarkets = useMemo(() => getAvailableSupermarkets(allRecords), [allRecords]);

  useEffect(() => {
    if (!isOpen) return;

    if (initialState) {
      setDimensionType(initialState.dimensionType);
      if (initialState.dimensionType === 'month' && initialState.value) {
        setSelectedMonth(initialState.value);
        setSelectedSupermarket('');
      } else if (initialState.dimensionType === 'supermarket' && initialState.value) {
        setSelectedSupermarket(initialState.value);
        setSelectedMonth('');
      } else {
        setSelectedMonth('');
        setSelectedSupermarket('');
      }
    } else {
      setDimensionType('all');
      setSelectedMonth('');
      setSelectedSupermarket('');
    }
  }, [isOpen, initialState]);

  useEffect(() => {
    if (!isOpen) return;
    if (dimensionType === 'month' && selectedMonth && availableMonths.length > 0) {
      if (!availableMonths.includes(selectedMonth)) {
        setSelectedMonth(availableMonths[0]);
      }
    }
    if (dimensionType === 'supermarket' && selectedSupermarket && availableSupermarkets.length > 0) {
      if (!availableSupermarkets.includes(selectedSupermarket)) {
        setSelectedSupermarket(availableSupermarkets[0]);
      }
    }
  }, [isOpen, dimensionType, selectedMonth, selectedSupermarket, availableMonths, availableSupermarkets]);

  const dimension: ReportDimension = useMemo(() => {
    if (dimensionType === 'all') return 'all';
    if (dimensionType === 'month' && selectedMonth) return { type: 'month', value: selectedMonth };
    if (dimensionType === 'supermarket' && selectedSupermarket) return { type: 'supermarket', value: selectedSupermarket };
    return 'all';
  }, [dimensionType, selectedMonth, selectedSupermarket]);

  const filteredRecords: Record[] = useMemo(() => {
    if (dimension === 'all') return allRecords;
    if (dimension.type === 'month') return filterRecordsByMonth(allRecords, dimension.value);
    return filterRecordsBySupermarket(allRecords, dimension.value);
  }, [allRecords, dimension]);

  const stats: StatsData = useMemo(() => computeStatsFromRecords(filteredRecords), [filteredRecords]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#FEF3C7',
      });

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      let filename = '捡漏战报';
      if (dimension !== 'all') {
        filename = dimension.type === 'month'
          ? `捡漏战报_${getMonthLabel(dimension.value)}`
          : `捡漏战报_${dimension.value}`;
      }
      link.download = `${filename}_${timestamp}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (error) {
      console.error('生成图片失败:', error);
      alert('生成图片失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    const params = new URLSearchParams();
    params.set('report', '1');
    if (dimension !== 'all') {
      params.set('reportType', dimension.type);
      params.set('reportValue', encodeURIComponent(dimension.value));
    }
    if (currentUser?.username) {
      params.set('reportUser', encodeURIComponent(currentUser.username));
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (!isOpen) return null;

  const hasData = stats.totalRecords > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-amber-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-parchment-100 rounded-2xl border-4 border-amber-700 shadow-2xl w-full max-w-[720px] max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-amber-300 bg-gradient-to-r from-amber-200 to-parchment-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center">
              <span className="text-2xl">📜</span>
            </div>
            <div>
              <h2 className="font-display text-2xl text-amber-900">生成捡漏战报</h2>
              <p className="text-amber-700 text-sm font-body">选择维度，一键生成精美分享卡片</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-amber-200 hover:bg-amber-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-amber-800" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-amber-200 bg-parchment-50">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => {
                setDimensionType('all');
                setSelectedMonth('');
                setSelectedSupermarket('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm transition-all border-2 ${
                dimensionType === 'all'
                  ? 'bg-amber-700 text-parchment-100 border-amber-900 shadow-md'
                  : 'bg-parchment-100 text-amber-800 border-amber-400 hover:bg-amber-100'
              }`}
            >
              <Globe className="w-4 h-4" />
              全部战绩
            </button>
            <button
              onClick={() => {
                setDimensionType('month');
                if (!selectedMonth && availableMonths.length > 0) {
                  setSelectedMonth(availableMonths[0]);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm transition-all border-2 ${
                dimensionType === 'month'
                  ? 'bg-amber-700 text-parchment-100 border-amber-900 shadow-md'
                  : 'bg-parchment-100 text-amber-800 border-amber-400 hover:bg-amber-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              按月份
            </button>
            <button
              onClick={() => {
                setDimensionType('supermarket');
                if (!selectedSupermarket && availableSupermarkets.length > 0) {
                  setSelectedSupermarket(availableSupermarkets[0]);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm transition-all border-2 ${
                dimensionType === 'supermarket'
                  ? 'bg-amber-700 text-parchment-100 border-amber-900 shadow-md'
                  : 'bg-parchment-100 text-amber-800 border-amber-400 hover:bg-amber-100'
              }`}
            >
              <Store className="w-4 h-4" />
              按超市
            </button>
          </div>

          {dimensionType === 'month' && availableMonths.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableMonths.map((monthKey) => (
                <button
                  key={monthKey}
                  onClick={() => setSelectedMonth(monthKey)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all border-2 ${
                    selectedMonth === monthKey
                      ? 'bg-map-600 text-white border-map-600'
                      : 'bg-white text-amber-800 border-amber-300 hover:border-amber-500'
                  }`}
                >
                  {getMonthLabel(monthKey)}
                </button>
              ))}
            </div>
          )}

          {dimensionType === 'supermarket' && availableSupermarkets.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableSupermarkets.map((sm) => (
                <button
                  key={sm}
                  onClick={() => setSelectedSupermarket(sm)}
                  className={`px-3 py-1.5 rounded-lg font-body text-xs transition-all border-2 ${
                    selectedSupermarket === sm
                      ? 'bg-forest-700 text-white border-forest-700'
                      : 'bg-white text-amber-800 border-amber-300 hover:border-amber-500'
                  }`}
                >
                  🏪 {sm}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gradient-to-b from-amber-50 to-parchment-100">
          {hasData ? (
            <div className="flex justify-center">
              <div ref={cardRef} className="transform scale-75 origin-top">
                <ReportCard
                  stats={stats}
                  dimension={dimension}
                  username={currentUser?.username || '临期猎人'}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="font-display text-2xl text-amber-900 mb-2">暂无数据</h3>
              <p className="text-amber-700 font-body max-w-md">
                该维度下还没有捡漏记录，换个维度试试，或者先去记录一次捡漏吧！
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t-2 border-amber-300 bg-gradient-to-r from-parchment-100 to-amber-200">
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg font-display text-amber-800 bg-parchment-100 border-2 border-amber-400 hover:bg-amber-100 transition-all"
            >
              取消
            </button>
            <button
              onClick={handleCopyLink}
              disabled={!hasData || isGenerating}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-display transition-all border-2 ${
                !hasData || isGenerating
                  ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
                  : copySuccess
                  ? 'bg-green-600 text-white border-green-700'
                  : 'bg-map-600 text-white border-map-600 hover:bg-map-500'
              }`}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : copySuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
              {copySuccess ? '已复制!' : '复制链接'}
            </button>
            <button
              onClick={handleDownload}
              disabled={!hasData || isGenerating}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-display transition-all border-2 ${
                !hasData || isGenerating
                  ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
                  : downloadSuccess
                  ? 'bg-green-600 text-white border-green-700'
                  : 'bg-amber-700 text-parchment-100 border-amber-900 hover:bg-amber-600'
              }`}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : downloadSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {downloadSuccess ? '已保存!' : '保存为图片'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareReportModal;
