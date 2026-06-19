import * as XLSX from 'xlsx';
import type { Record as BargainRecord } from '../types';
import { generateId } from './calculations';
import { defaultSupermarkets } from './mockData';

export interface ExportOptions {
  format: 'excel' | 'csv';
  filename?: string;
}

export interface ImportValidationError {
  rowIndex: number;
  field: string;
  message: string;
  value: unknown;
}

export interface DuplicateRecord {
  rowIndex: number;
  existingId: string;
  incomingData: Partial<BargainRecord>;
  reason: string;
}

export interface ImportResult {
  validRecords: Array<{ rowIndex: number; data: Omit<BargainRecord, 'id' | 'userId'> }>;
  duplicates: DuplicateRecord[];
  errors: ImportValidationError[];
  totalRows: number;
}

export type ConflictResolution = 'overwrite' | 'skip' | 'ask';

export const EXPORT_HEADERS = [
  '超市名称', '货架位置', '商品名称', '品类', '原价',
  '折扣(折)', '保质期', '购买日期', '备注', '坐标X', '坐标Y',
  '是否收藏', '标签ID列表'
] as const;

const HEADER_TO_FIELD: { [key: string]: keyof BargainRecord } = {
  '超市名称': 'supermarketName',
  '货架位置': 'shelfLocation',
  '商品名称': 'productName',
  '品类': 'category',
  '原价': 'originalPrice',
  '折扣(折)': 'discount',
  '保质期': 'expiryDate',
  '购买日期': 'purchaseDate',
  '备注': 'notes',
  '坐标X': 'x',
  '坐标Y': 'y',
  '是否收藏': 'isFavorite',
  '标签ID列表': 'tagIds',
};

const REQUIRED_FIELDS = [
  'supermarketName', 'productName', 'category', 'originalPrice',
  'discount', 'expiryDate', 'purchaseDate'
] as const;

const FIELD_LABELS: { [key: string]: string } = {
  supermarketName: '超市名称',
  shelfLocation: '货架位置',
  productName: '商品名称',
  category: '品类',
  originalPrice: '原价',
  discount: '折扣(折)',
  expiryDate: '保质期',
  purchaseDate: '购买日期',
  notes: '备注',
  x: '坐标X',
  y: '坐标Y',
  isFavorite: '是否收藏',
  tagIds: '标签ID列表',
};

const isValidDate = (value: string): boolean => {
  if (!value) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

const formatDateForExport = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getSupermarketCoords = (name: string): { x: number; y: number } | null => {
  const sm = defaultSupermarkets.find(s => s.name === name);
  return sm ? { x: sm.x, y: sm.y } : null;
};

export const exportRecords = (records: BargainRecord[], options: ExportOptions): void => {
  const { format, filename } = options;

  const exportData = records.map(record => {
    const discountPrice = record.originalPrice * (record.discount / 10);
    const savings = record.originalPrice - discountPrice;
    return {
      '超市名称': record.supermarketName,
      '货架位置': record.shelfLocation || '',
      '商品名称': record.productName,
      '品类': record.category,
      '原价': record.originalPrice,
      '折扣(折)': record.discount,
      '折后价': Number(discountPrice.toFixed(2)),
      '节省金额': Number(savings.toFixed(2)),
      '保质期': formatDateForExport(record.expiryDate),
      '购买日期': formatDateForExport(record.purchaseDate),
      '备注': record.notes || '',
      '坐标X': record.x,
      '坐标Y': record.y,
      '是否收藏': record.isFavorite ? '是' : '否',
      '标签ID列表': record.tagIds?.join(', ') || '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '捡漏记录');

  const defaultFilename = `临期猎人_捡漏记录_${new Date().toISOString().slice(0, 10)}`;
  const finalFilename = filename || defaultFilename;

  if (format === 'csv') {
    XLSX.writeFile(wb, `${finalFilename}.csv`);
  } else {
    XLSX.writeFile(wb, `${finalFilename}.xlsx`);
  }
};

const parseCellValue = (cell: unknown, field: string): unknown => {
  if (cell === null || cell === undefined) return cell;
  if (typeof cell === 'number') {
    if (field === 'expiryDate' || field === 'purchaseDate') {
      const epoch = new Date(Date.UTC(1899, 11, 30));
      const date = new Date(epoch.getTime() + cell * 86400000);
      if (!isNaN(date.getTime())) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }
    return cell;
  }
  if (typeof cell === 'string') {
    const trimmed = cell.trim();
    if (field === 'isFavorite') {
      return trimmed === '是' || trimmed.toLowerCase() === 'true' || trimmed === '1';
    }
    if (field === 'tagIds') {
      return trimmed.split(/[,，;；\s]+/).filter(Boolean);
    }
    if ((field === 'originalPrice' || field === 'discount' || field === 'x' || field === 'y') && trimmed !== '') {
      const num = Number(trimmed);
      if (!isNaN(num)) return num;
    }
    return trimmed;
  }
  return cell;
};

const validateField = (
  field: string,
  value: unknown,
  rowIndex: number
): ImportValidationError | null => {
  const label = FIELD_LABELS[field] || field;

  if (REQUIRED_FIELDS.includes(field as typeof REQUIRED_FIELDS[number])) {
    if (value === null || value === undefined || value === '') {
      return {
        rowIndex,
        field,
        message: `${label}不能为空`,
        value,
      };
    }
  }

  switch (field) {
    case 'originalPrice':
      if (value !== '' && value !== null && value !== undefined) {
        if (typeof value !== 'number' || value < 0) {
          return {
            rowIndex,
            field,
            message: `${label}必须是非负数字`,
            value,
          };
        }
      }
      break;
    case 'discount':
      if (value !== '' && value !== null && value !== undefined) {
        if (typeof value !== 'number' || value < 0 || value > 10) {
          return {
            rowIndex,
            field,
            message: `${label}必须是0-10之间的数字`,
            value,
          };
        }
      }
      break;
    case 'expiryDate':
    case 'purchaseDate':
      if (typeof value === 'string' && value !== '') {
        if (!isValidDate(value)) {
          return {
            rowIndex,
            field,
            message: `${label}格式不正确，应为 YYYY-MM-DD`,
            value,
          };
        }
      }
      break;
    case 'x':
    case 'y':
      if (value !== '' && value !== null && value !== undefined) {
        if (typeof value !== 'number' || value < 0 || value > 100) {
          return {
            rowIndex,
            field,
            message: `${label}必须是0-100之间的数字`,
            value,
          };
        }
      }
      break;
  }

  return null;
};

export const parseAndValidateImportFile = async (
  file: File,
  existingRecords: BargainRecord[]
): Promise<ImportResult> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: true,
  }) as Array<{ [key: string]: unknown }>;

  const validRecords: ImportResult['validRecords'] = [];
  const duplicates: ImportResult['duplicates'] = [];
  const errors: ImportResult['errors'] = [];

  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    const rowIndex = i + 2;
    const rowErrors: ImportValidationError[] = [];
    const parsedData: Partial<BargainRecord> = {};

    for (const [headerZh, field] of Object.entries(HEADER_TO_FIELD)) {
      const rawValue = row[headerZh] ?? row[field as string] ?? '';
      const parsedValue = parseCellValue(rawValue, field as string);
      (parsedData as { [key: string]: unknown })[field] = parsedValue;

      const fieldError = validateField(field as string, parsedValue, rowIndex);
      if (fieldError) {
        rowErrors.push(fieldError);
      }
    }

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      continue;
    }

    const finalData = parsedData as Omit<BargainRecord, 'id' | 'userId'>;

    if (finalData.shelfLocation === undefined) finalData.shelfLocation = '';
    if (finalData.notes === undefined) finalData.notes = '';
    if (finalData.isFavorite === undefined) finalData.isFavorite = false;

    if ((finalData.x === undefined || finalData.y === undefined)) {
      const coords = getSupermarketCoords(finalData.supermarketName);
      if (coords) {
        finalData.x = coords.x;
        finalData.y = coords.y;
      } else {
        finalData.x = finalData.x ?? 50;
        finalData.y = finalData.y ?? 50;
      }
    }

    const duplicate = findDuplicate(finalData, existingRecords);
    if (duplicate) {
      duplicates.push({
        rowIndex,
        existingId: duplicate.id,
        incomingData: finalData,
        reason: `商品"${finalData.productName}"在${finalData.supermarketName}于${formatDateForExport(finalData.purchaseDate)}已有记录`,
      });
    } else {
      validRecords.push({
        rowIndex,
        data: finalData,
      });
    }
  }

  return {
    validRecords,
    duplicates,
    errors,
    totalRows: jsonData.length,
  };
};

const findDuplicate = (data: Omit<BargainRecord, 'id' | 'userId'>, existingRecords: BargainRecord[]): BargainRecord | null => {
  const normDataPurchaseDate = formatDateForExport(data.purchaseDate);

  for (const record of existingRecords) {
    const normRecordPurchaseDate = formatDateForExport(record.purchaseDate);
    const normRecordExpiryDate = formatDateForExport(record.expiryDate);
    const normDataExpiryDate = formatDateForExport(data.expiryDate);

    const sameProduct = record.productName.trim().toLowerCase() === data.productName.trim().toLowerCase();
    const sameSupermarket = record.supermarketName.trim() === data.supermarketName.trim();
    const samePurchaseDate = normRecordPurchaseDate === normDataPurchaseDate;
    const sameOriginalPrice = Math.abs(record.originalPrice - data.originalPrice) < 0.01;

    if (sameProduct && sameSupermarket && samePurchaseDate && sameOriginalPrice) {
      return record;
    }

    if (sameProduct && sameSupermarket && samePurchaseDate && normRecordExpiryDate === normDataExpiryDate) {
      return record;
    }
  }

  return null;
};

export interface ProcessImportOptions {
  result: ImportResult;
  existingRecords: BargainRecord[];
  duplicateStrategy: ConflictResolution;
  onConflict?: (duplicate: DuplicateRecord) => Promise<'overwrite' | 'skip'>;
  addRecord: (record: Omit<BargainRecord, 'id' | 'userId'>) => void;
  updateRecord: (id: string, record: Partial<BargainRecord>) => void;
}

export interface ProcessedImportStats {
  added: number;
  updated: number;
  skipped: number;
  errors: number;
}

export const processImport = async (
  options: ProcessImportOptions
): Promise<ProcessedImportStats> => {
  const { result, duplicateStrategy, onConflict, addRecord, updateRecord } = options;
  const stats: ProcessedImportStats = {
    added: 0,
    updated: 0,
    skipped: 0,
    errors: result.errors.length,
  };

  for (const item of result.validRecords) {
    addRecord(item.data);
    stats.added++;
  }

  for (const dup of result.duplicates) {
    let resolution: 'overwrite' | 'skip';

    if (duplicateStrategy === 'ask' && onConflict) {
      resolution = await onConflict(dup);
    } else if (duplicateStrategy === 'ask') {
      resolution = 'skip';
    } else {
      resolution = duplicateStrategy as 'overwrite' | 'skip';
    }

    if (resolution === 'overwrite') {
      updateRecord(dup.existingId, dup.incomingData);
      stats.updated++;
    } else {
      stats.skipped++;
    }
  }

  return stats;
};

export const generateImportTemplate = (): void => {
  const templateData = [
    {
      '超市名称': '盒马鲜生',
      '货架位置': 'A区-冷藏柜第3层',
      '商品名称': '伊利纯牛奶250ml',
      '品类': '乳制品',
      '原价': 69.9,
      '折扣(折)': 5,
      '保质期': '2026-06-30',
      '购买日期': '2026-06-19',
      '备注': '买一送一，非常划算！',
      '坐标X': 25,
      '坐标Y': 65,
      '是否收藏': '是',
      '标签ID列表': '',
    },
    {
      '超市名称': '永辉超市',
      '货架位置': '',
      '商品名称': '乐事薯片原味75g',
      '品类': '零食',
      '原价': 9.9,
      '折扣(折)': 3.5,
      '保质期': '2026-08-15',
      '购买日期': '2026-06-18',
      '备注': '',
      '坐标X': '',
      '坐标Y': '',
      '是否收藏': '否',
      '标签ID列表': '',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const colWidths = [
    { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 10 },
    { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
    { wch: 25 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 15 },
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '导入模板');

  const infoSheet = XLSX.utils.aoa_to_sheet([
    ['【导入模板说明】'],
    [''],
    ['必填字段（带*为必填）：'],
    ['* 超市名称、商品名称、品类、原价、折扣(折)、保质期、购买日期'],
    [''],
    ['字段格式说明：'],
    ['• 原价：非负数字，单位元（如：69.9）'],
    ['• 折扣(折)：0-10之间的数字（如：5表示5折，3.5表示3.5折）'],
    ['• 日期：YYYY-MM-DD格式（如：2026-06-30）或Excel日期格式'],
    ['• 坐标X/Y：0-100之间的数字（可选，留空将根据超市自动填充）'],
    ['• 是否收藏：填写"是"或"否"'],
    ['• 标签ID列表：多个标签用逗号分隔（系统内部ID，建议留空）'],
    [''],
    ['注意事项：'],
    ['1. 第一行为表头，请勿修改或删除'],
    ['2. 坐标留空时会根据超市名称自动匹配默认坐标'],
    ['3. 重复记录判定：相同商品+相同超市+相同购买日期+相同原价'],
    ['4. 品类可填写：零食、饮料、乳制品、生鲜、粮油、日化、其他'],
  ]);
  infoSheet['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, infoSheet, '填写说明');

  XLSX.writeFile(wb, '临期猎人_导入模板.xlsx');
};
