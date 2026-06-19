import { useState, useRef, useEffect } from 'react';
import {
  X, Upload, FileSpreadsheet, AlertTriangle, CheckCircle,
  XCircle, RefreshCw, SkipForward, Download, Info, ChevronRight,
  Loader2, Trash2, FileText
} from 'lucide-react';
import { useStore, useUserRecords } from '../../store/useStore';
import {
  parseAndValidateImportFile,
  processImport,
  generateImportTemplate,
  type ImportResult,
  type DuplicateRecord,
  type ConflictResolution,
  type ProcessedImportStats,
} from '../../utils/importExport';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ImportStep = 'upload' | 'review' | 'confirm' | 'done';

const ImportModal = ({ isOpen, onClose }: ImportModalProps) => {
  const userRecords = useUserRecords();
  const batchAddRecords = useStore((state) => state.batchAddRecords);
  const batchUpdateRecords = useStore((state) => state.batchUpdateRecords);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<ImportStep>('upload');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duplicateStrategy, setDuplicateStrategy] = useState<ConflictResolution>('ask');
  const [currentConflictIndex, setCurrentConflictIndex] = useState(0);
  const [conflictDecisions, setConflictDecisions] = useState<Map<number, 'overwrite' | 'skip'>>(new Map());
  const [processedStats, setProcessedStats] = useState<ProcessedImportStats | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setStep('upload');
    setImportResult(null);
    setSelectedFile(null);
    setIsParsing(false);
    setIsProcessing(false);
    setDuplicateStrategy('ask');
    setCurrentConflictIndex(0);
    setConflictDecisions(new Map());
    setProcessedStats(null);
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    if (!validExtensions.some(ext => fileName.endsWith(ext))) {
      alert('请选择 Excel (.xlsx, .xls) 或 CSV 文件');
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);

    try {
      const result = await parseAndValidateImportFile(file, userRecords);
      setImportResult(result);

      if (result.validRecords.length === 0 && result.duplicates.length === 0) {
        setStep('review');
      } else if (result.duplicates.length === 0) {
        setStep('confirm');
      } else {
        setStep('review');
      }
    } catch (error) {
      console.error('解析文件失败:', error);
      alert('文件解析失败，请检查文件格式是否正确');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleResolveConflict = (decision: 'overwrite' | 'skip') => {
    const newDecisions = new Map(conflictDecisions);
    newDecisions.set(currentConflictIndex, decision);
    setConflictDecisions(newDecisions);

    if (importResult && currentConflictIndex < importResult.duplicates.length - 1) {
      setCurrentConflictIndex(prev => prev + 1);
    }
  };

  const handleSkipAll = () => {
    if (!importResult) return;
    const newDecisions = new Map(conflictDecisions);
    for (let i = currentConflictIndex; i < importResult.duplicates.length; i++) {
      newDecisions.set(i, 'skip');
    }
    setConflictDecisions(newDecisions);
    setStep('confirm');
  };

  const handleOverwriteAll = () => {
    if (!importResult) return;
    const newDecisions = new Map(conflictDecisions);
    for (let i = currentConflictIndex; i < importResult.duplicates.length; i++) {
      newDecisions.set(i, 'overwrite');
    }
    setConflictDecisions(newDecisions);
    setStep('confirm');
  };

  const handleConfirmImport = async () => {
    if (!importResult) return;

    setIsProcessing(true);
    try {
      const duplicatesToAdd: Array<{ id: string; data: DuplicateRecord['incomingData'] }> = [];
      const duplicatesToSkip: DuplicateRecord[] = [];

      if (duplicateStrategy === 'overwrite') {
        importResult.duplicates.forEach(d => duplicatesToAdd.push({ id: d.existingId, data: d.incomingData }));
      } else if (duplicateStrategy === 'skip') {
        importResult.duplicates.forEach(d => duplicatesToSkip.push(d));
      } else {
        importResult.duplicates.forEach((d, idx) => {
          const decision = conflictDecisions.get(idx);
          if (decision === 'overwrite') {
            duplicatesToAdd.push({ id: d.existingId, data: d.incomingData });
          } else {
            duplicatesToSkip.push(d);
          }
        });
      }

      if (importResult.validRecords.length > 0) {
        batchAddRecords(importResult.validRecords.map(r => r.data));
      }

      if (duplicatesToAdd.length > 0) {
        batchUpdateRecords(duplicatesToAdd.map(d => ({ id: d.id, data: d.data })));
      }

      const stats: ProcessedImportStats = {
        added: importResult.validRecords.length,
        updated: duplicatesToAdd.length,
        skipped: duplicatesToSkip.length,
        errors: importResult.errors.length,
      };
      setProcessedStats(stats);
      setStep('done');
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入过程中发生错误');
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    generateImportTemplate();
  };

  const getCurrentConflict = (): DuplicateRecord | null => {
    if (!importResult) return null;
    return importResult.duplicates[currentConflictIndex] || null;
  };

  if (!isOpen) return null;

  const renderUploadStep = () => (
    <div className="space-y-4">
      <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 space-y-1">
            <p className="font-medium">支持格式说明</p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-700">
              <li>Excel 文件：.xlsx, .xls</li>
              <li>CSV 文件：.csv（UTF-8 编码）</li>
              <li>必填字段：超市名称、商品名称、品类、原价、折扣、保质期、购买日期</li>
            </ul>
          </div>
        </div>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-amber-500 bg-amber-50'
            : 'border-amber-300 bg-parchment-100 hover:border-amber-400 hover:bg-amber-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        />
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 rounded-full bg-amber-100">
            <Upload className="w-10 h-10 text-amber-600" />
          </div>
          <div>
            <p className="font-display text-lg text-amber-900 mb-1">
              点击或拖拽文件到此处上传
            </p>
            <p className="text-sm text-amber-600">
              支持 .xlsx, .xls, .csv 格式
            </p>
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-amber-700" />
              <span className="text-sm text-amber-800 font-medium">{selectedFile.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="p-1 hover:bg-amber-200 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4 text-amber-700" />
              </button>
            </div>
          )}
          {isParsing && (
            <div className="flex items-center gap-2 text-amber-700">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">正在解析文件...</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pt-2">
        <span className="text-sm text-amber-600">第一次导入？</span>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
        >
          <Download className="w-4 h-4" />
          下载导入模板
        </button>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    if (!importResult) return null;

    const total = importResult.totalRows;
    const valid = importResult.validRecords.length;
    const dup = importResult.duplicates.length;
    const err = importResult.errors.length;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-parchment-100 border border-amber-200 text-center">
            <FileText className="w-6 h-6 text-amber-600 mx-auto mb-1" />
            <p className="text-xs text-amber-600">总行数</p>
            <p className="font-mono text-2xl font-bold text-amber-900">{total}</p>
          </div>
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-green-700">新增</p>
            <p className="font-mono text-2xl font-bold text-green-700">{valid}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-center">
            <RefreshCw className="w-6 h-6 text-amber-600 mx-auto mb-1" />
            <p className="text-xs text-amber-700">重复</p>
            <p className="font-mono text-2xl font-bold text-amber-700">{dup}</p>
          </div>
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-center">
            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <p className="text-xs text-red-700">错误</p>
            <p className="font-mono text-2xl font-bold text-red-700">{err}</p>
          </div>
        </div>

        {importResult.errors.length > 0 && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-4 max-h-48 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="font-display text-red-800">校验错误 ({importResult.errors.length})</span>
            </div>
            <ul className="space-y-2 text-sm">
              {importResult.errors.slice(0, 20).map((err, idx) => (
                <li key={idx} className="flex items-start gap-2 text-red-700">
                  <span className="bg-red-200 text-red-800 px-2 py-0.5 rounded text-xs font-mono flex-shrink-0">
                    第{err.rowIndex}行
                  </span>
                  <span>{err.message}（字段: {err.field}，值: {String(err.value) || '空'}）</span>
                </li>
              ))}
              {importResult.errors.length > 20 && (
                <li className="text-red-600 italic">
                  ... 还有 {importResult.errors.length - 20} 条错误未显示
                </li>
              )}
            </ul>
          </div>
        )}

        {importResult.duplicates.length > 0 && (
          <div className="space-y-4">
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="font-display text-amber-800">
                  发现 {importResult.duplicates.length} 条重复记录
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-amber-700 mb-2">请选择重复记录处理策略：</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setDuplicateStrategy('ask')}
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${
                      duplicateStrategy === 'ask'
                        ? 'border-amber-500 bg-amber-100 text-amber-900'
                        : 'border-amber-200 bg-white text-amber-700 hover:border-amber-300'
                    }`}
                  >
                    <div className="font-medium mb-1">逐条询问</div>
                    <div className="text-xs opacity-80">每条单独选择</div>
                  </button>
                  <button
                    onClick={() => setDuplicateStrategy('overwrite')}
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${
                      duplicateStrategy === 'overwrite'
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-amber-200 bg-white text-amber-700 hover:border-amber-300'
                    }`}
                  >
                    <div className="font-medium mb-1">全部覆盖</div>
                    <div className="text-xs opacity-80">用导入数据更新</div>
                  </button>
                  <button
                    onClick={() => setDuplicateStrategy('skip')}
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${
                      duplicateStrategy === 'skip'
                        ? 'border-gray-500 bg-gray-100 text-gray-800'
                        : 'border-amber-200 bg-white text-amber-700 hover:border-amber-300'
                    }`}
                  >
                    <div className="font-medium mb-1">全部跳过</div>
                    <div className="text-xs opacity-80">保留原有数据</div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-amber-200 max-h-40 overflow-y-auto">
                <ul className="divide-y divide-amber-100">
                  {importResult.duplicates.slice(0, 10).map((dup, idx) => (
                    <li key={idx} className="p-3 text-sm flex items-start gap-3">
                      <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded text-xs font-mono flex-shrink-0">
                        第{dup.rowIndex}行
                      </span>
                      <span className="text-amber-800 flex-1">{dup.reason}</span>
                    </li>
                  ))}
                  {importResult.duplicates.length > 10 && (
                    <li className="p-3 text-sm text-amber-600 italic text-center">
                      ... 还有 {importResult.duplicates.length - 10} 条重复未显示
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {duplicateStrategy === 'ask' && (
              <div className="bg-parchment-50 rounded-xl border-2 border-amber-300 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span className="font-display text-amber-900">
                      逐条确认冲突 ({currentConflictIndex + 1} / {importResult.duplicates.length})
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleOverwriteAll}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      剩余全部覆盖
                    </button>
                    <button
                      onClick={handleSkipAll}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      剩余全部跳过
                    </button>
                  </div>
                </div>

                {(() => {
                  const conflict = getCurrentConflict();
                  if (!conflict) return null;
                  const d = conflict.incomingData;
                  const existing = userRecords.find(r => r.id === conflict.existingId);

                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-xs font-medium text-gray-500 mb-2">现有记录</p>
                          {existing && (
                            <dl className="text-xs space-y-1">
                              <div><span className="text-gray-500">商品：</span><span className="text-gray-800 font-medium">{existing.productName}</span></div>
                              <div><span className="text-gray-500">超市：</span><span className="text-gray-800">{existing.supermarketName}</span></div>
                              <div><span className="text-gray-500">原价：</span><span className="text-gray-800">¥{existing.originalPrice.toFixed(2)}</span></div>
                              <div><span className="text-gray-500">折扣：</span><span className="text-gray-800">{existing.discount}折</span></div>
                              <div><span className="text-gray-500">购买：</span><span className="text-gray-800">{existing.purchaseDate.slice(0, 10)}</span></div>
                            </dl>
                          )}
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-300">
                          <p className="text-xs font-medium text-amber-700 mb-2">导入数据</p>
                          <dl className="text-xs space-y-1">
                            <div><span className="text-amber-600">商品：</span><span className="text-amber-900 font-medium">{d.productName}</span></div>
                            <div><span className="text-amber-600">超市：</span><span className="text-amber-800">{d.supermarketName}</span></div>
                            <div><span className="text-amber-600">原价：</span><span className="text-amber-800">¥{Number(d.originalPrice).toFixed(2)}</span></div>
                            <div><span className="text-amber-600">折扣：</span><span className="text-amber-800">{d.discount}折</span></div>
                            <div><span className="text-amber-600">购买：</span><span className="text-amber-800">{String(d.purchaseDate).slice(0, 10)}</span></div>
                          </dl>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-amber-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${((currentConflictIndex + 1) / importResult.duplicates.length) * 100}%` }}
                        />
                      </div>

                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => handleResolveConflict('skip')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                          <SkipForward className="w-4 h-4" />
                          跳过
                        </button>
                        <button
                          onClick={() => handleResolveConflict('overwrite')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          覆盖
                        </button>
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-3 pt-3 border-t border-amber-200 flex flex-wrap gap-2">
                  {importResult.duplicates.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentConflictIndex(idx)}
                      className={`w-8 h-8 rounded-full text-xs font-mono transition-all ${
                        idx === currentConflictIndex
                          ? 'bg-amber-600 text-white scale-110'
                          : conflictDecisions.has(idx)
                            ? conflictDecisions.get(idx) === 'overwrite'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-200 text-gray-600'
                            : 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderConfirmStep = () => {
    if (!importResult) return null;

    let overwriteCount = 0;
    let skipCount = 0;

    if (duplicateStrategy === 'overwrite') {
      overwriteCount = importResult.duplicates.length;
    } else if (duplicateStrategy === 'skip') {
      skipCount = importResult.duplicates.length;
    } else {
      conflictDecisions.forEach((d) => {
        if (d === 'overwrite') overwriteCount++;
        else skipCount++;
      });
    }

    return (
      <div className="space-y-5">
        <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border-2 border-amber-200">
          <h3 className="font-display text-xl text-amber-900 mb-4 text-center">
            📋 导入确认
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">新增记录</p>
              <p className="font-mono text-2xl font-bold text-green-600">{importResult.validRecords.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-white text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">覆盖更新</p>
              <p className="font-mono text-2xl font-bold text-blue-600">{overwriteCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-white text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">跳过</p>
              <p className="font-mono text-2xl font-bold text-gray-500">{skipCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-white text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">错误跳过</p>
              <p className="font-mono text-2xl font-bold text-red-500">{importResult.errors.length}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-amber-200 text-center">
            <p className="text-amber-800">
              共处理 <span className="font-mono font-bold text-amber-900 text-lg">
                {importResult.validRecords.length + overwriteCount}
              </span> 条记录
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-center text-sm text-amber-700">
          <Info className="w-4 h-4" />
          <span>确认无误后，点击"开始导入"按钮完成导入操作</span>
        </div>
      </div>
    );
  };

  const renderDoneStep = () => {
    if (!processedStats) return null;
    const total = processedStats.added + processedStats.updated + processedStats.skipped + processedStats.errors;

    return (
      <div className="space-y-5">
        <div className="text-center py-4">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="font-display text-2xl text-amber-900 mb-1">导入完成！</h3>
          <p className="text-amber-600">数据已成功加入你的捡漏记录库</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs text-green-700 mb-1">新增</p>
            <p className="font-mono text-2xl font-bold text-green-700">{processedStats.added}</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <RefreshCw className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-blue-700 mb-1">更新</p>
            <p className="font-mono text-2xl font-bold text-blue-700">{processedStats.updated}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <SkipForward className="w-6 h-6 text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-1">跳过</p>
            <p className="font-mono text-2xl font-bold text-gray-600">{processedStats.skipped}</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-xs text-red-600 mb-1">错误</p>
            <p className="font-mono text-2xl font-bold text-red-600">{processedStats.errors}</p>
          </div>
        </div>

        {processedStats.errors > 0 && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-sm text-red-700 text-center">
            ⚠️ 有 {processedStats.errors} 条记录因校验错误被跳过，请检查数据后重新导入
          </div>
        )}

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-center text-amber-800">
            本次共处理 <span className="font-bold">{total}</span> 条记录，
            成功导入 <span className="font-bold text-green-700">{processedStats.added + processedStats.updated}</span> 条
          </p>
        </div>
      </div>
    );
  };

  const canProceedToConfirm = (): boolean => {
    if (!importResult) return false;
    if (duplicateStrategy !== 'ask') return true;
    return conflictDecisions.size >= importResult.duplicates.length;
  };

  const getProceedLabel = (): string => {
    if (step === 'review' && importResult) {
      if (importResult.duplicates.length === 0 && importResult.validRecords.length === 0) return '完成';
      return '下一步';
    }
    return '下一步';
  };

  const handleNext = () => {
    if (step === 'review') {
      if (importResult && (importResult.validRecords.length > 0 || importResult.duplicates.length > 0)) {
        setStep('confirm');
      } else {
        onClose();
      }
    } else if (step === 'done') {
      onClose();
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('review');
    } else if (step === 'review') {
      setStep('upload');
      setImportResult(null);
      setSelectedFile(null);
    }
  };

  const stepTitles: Record<ImportStep, { icon: React.ReactNode; title: string; subtitle: string }> = {
    upload: {
      icon: <Upload className="w-6 h-6" />,
      title: '批量导入记录',
      subtitle: '上传 Excel 或 CSV 文件，批量添加历史捡漏记录',
    },
    review: {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: '数据校验结果',
      subtitle: '请检查数据校验结果，并处理重复记录',
    },
    confirm: {
      icon: <CheckCircle className="w-6 h-6" />,
      title: '确认导入',
      subtitle: '确认无误后开始导入数据',
    },
    done: {
      icon: <CheckCircle className="w-6 h-6" />,
      title: '导入成功',
      subtitle: '数据已成功导入',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={step !== 'confirm' && step !== 'done' ? onClose : undefined} />

      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-parchment-50 rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between p-5 border-b-2 border-amber-200 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              {stepTitles[step].icon}
            </div>
            <div>
              <h2 className="font-display text-xl">{stepTitles[step].title}</h2>
              <p className="text-white/80 text-sm">{stepTitles[step].subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && renderUploadStep()}
          {step === 'review' && renderReviewStep()}
          {step === 'confirm' && renderConfirmStep()}
          {step === 'done' && renderDoneStep()}
        </div>

        <div className="p-5 border-t-2 border-amber-200 bg-amber-50">
          {step === 'upload' ? (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="btn-stamp btn-secondary px-8"
              >
                取消
              </button>
            </div>
          ) : step === 'confirm' ? (
            <div className="flex gap-3 justify-between">
              <button
                onClick={handleBack}
                className="btn-stamp btn-secondary flex items-center gap-2"
              >
                返回上一步
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={isProcessing}
                className={`btn-stamp btn-primary flex items-center gap-2 px-8 ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    正在导入...
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-5 h-5" />
                    开始导入
                  </>
                )}
              </button>
            </div>
          ) : step === 'done' ? (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="btn-stamp btn-primary px-8"
              >
                完成
              </button>
            </div>
          ) : (
            <div className="flex gap-3 justify-between">
              <button
                onClick={handleBack}
                className="btn-stamp btn-secondary flex items-center gap-2"
              >
                返回重新上传
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceedToConfirm()}
                className={`btn-stamp btn-primary flex items-center gap-2 px-8 ${
                  !canProceedToConfirm() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {getProceedLabel()}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
