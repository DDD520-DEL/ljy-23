import { useState } from 'react';
import { X, Check, Tag as TagIcon, Plus } from 'lucide-react';
import { useStore, useUserTags } from '../../store/useStore';


interface BatchTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecordIds: string[];
}

const BatchTagModal = ({ isOpen, onClose, selectedRecordIds }: BatchTagModalProps) => {
  const tags = useUserTags();
  const batchAddTagsToRecords = useStore((state) => state.batchAddTagsToRecords);
  const batchRemoveTagsFromRecords = useStore((state) => state.batchRemoveTagsFromRecords);
  const addTag = useStore((state) => state.addTag);
  const records = useStore((state) => state.records);
  
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#f59e0b');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const PRESET_COLORS = [
    '#f59e0b', '#ef4444', '#f97316', '#eab308',
    '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  ];

  const selectedRecords = records.filter(r => selectedRecordIds.includes(r.id));
  
  const commonTagIds = selectedRecords.length > 0
    ? tags.filter(t => selectedRecords.every(r => r.tagIds?.includes(t.id))).map(t => t.id)
    : [];

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  const handleCreateTag = () => {
    const result = addTag(newTagName, newTagColor);
    if (result.success && result.tag) {
      setSelectedTagIds(prev => [...prev, result.tag!.id]);
      setNewTagName('');
      setShowNewTag(false);
      showMessage('标签创建成功', 'success');
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleApply = () => {
    if (selectedTagIds.length === 0) {
      showMessage('请至少选择一个标签', 'error');
      return;
    }

    if (mode === 'add') {
      batchAddTagsToRecords(selectedRecordIds, selectedTagIds);
      showMessage(`已为 ${selectedRecordIds.length} 条记录添加标签`, 'success');
    } else {
      batchRemoveTagsFromRecords(selectedRecordIds, selectedTagIds);
      showMessage(`已为 ${selectedRecordIds.length} 条记录移除标签`, 'success');
    }

    setTimeout(() => {
      setSelectedTagIds([]);
      onClose();
    }, 500);
  };

  const handleSelectAll = () => {
    if (selectedTagIds.length === tags.length) {
      setSelectedTagIds([]);
    } else {
      setSelectedTagIds(tags.map(t => t.id));
    }
  };

  const handleSelectCommon = () => {
    setSelectedTagIds(commonTagIds);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card-paper p-6 w-full max-w-lg max-h-[85vh] flex flex-col animate-fadeIn">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TagIcon className="w-6 h-6 text-amber-600" />
            <h2 className="title-display text-2xl text-amber-900">批量打标</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-amber-700" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-amber-800 font-medium">
            已选择 <span className="font-bold text-amber-900">{selectedRecordIds.length}</span> 条记录
          </p>
          {commonTagIds.length > 0 && (
            <p className="text-sm text-amber-600 mt-1">
              这些记录共同拥有 {commonTagIds.length} 个标签
            </p>
          )}
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('add')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              mode === 'add'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            添加标签
          </button>
          <button
            onClick={() => setMode('remove')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              mode === 'remove'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            移除标签
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={handleSelectAll}
            className="text-xs py-1 px-3 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
          >
            {selectedTagIds.length === tags.length ? '取消全选' : '全选'}
          </button>
          {commonTagIds.length > 0 && (
            <button
              onClick={handleSelectCommon}
              className="text-xs py-1 px-3 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
            >
              选择共同标签
            </button>
          )}
        </div>

        {showNewTag && (
          <div className="bg-amber-50 rounded-lg p-3 mb-4 border-2 border-amber-300">
            <div className="space-y-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="input-field py-1 text-sm"
                placeholder="新标签名称"
                autoFocus
              />
              <div className="flex flex-wrap gap-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewTagColor(color)}
                    className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${
                      newTagColor === color ? 'ring-2 ring-offset-1 ring-amber-600' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  className={`text-xs py-1 px-3 rounded bg-green-600 text-white ${
                    !newTagName.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                  }`}
                >
                  创建
                </button>
                <button
                  onClick={() => {
                    setShowNewTag(false);
                    setNewTagName('');
                  }}
                  className="text-xs py-1 px-3 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto border-t border-amber-200 pt-4">
          {tags.length === 0 && !showNewTag ? (
            <div className="text-center py-8 text-amber-600">
              <TagIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="mb-3">暂无标签</p>
              <button
                onClick={() => setShowNewTag(true)}
                className="btn-stamp btn-primary text-sm"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                创建第一个标签
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleToggleTag(tag.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-amber-200 bg-parchment-100 hover:border-amber-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected 
                        ? 'bg-amber-600 border-amber-600 text-white' 
                        : 'border-amber-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span
                      className="font-medium flex-1"
                      style={{ color: tag.color }}
                    >
                      {tag.name}
                    </span>
                    <span className="text-xs text-amber-500">
                      {records.filter(r => r.tagIds?.includes(tag.id)).length} 条
                    </span>
                  </button>
                );
              })}
              
              {!showNewTag && (
                <button
                  onClick={() => setShowNewTag(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-amber-300 text-amber-600 hover:border-amber-500 hover:text-amber-700 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  创建新标签
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-4 pt-4 border-t border-amber-200">
          <button
            onClick={onClose}
            className="btn-stamp btn-secondary flex-1"
          >
            取消
          </button>
          <button
            onClick={handleApply}
            disabled={selectedTagIds.length === 0}
            className={`btn-stamp btn-primary flex-1 ${
              selectedTagIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {mode === 'add' ? '添加' : '移除'} {selectedTagIds.length > 0 && `(${selectedTagIds.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchTagModal;
