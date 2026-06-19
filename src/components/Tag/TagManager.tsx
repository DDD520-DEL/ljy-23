import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Palette, Tag as TagIcon } from 'lucide-react';
import { useStore, useUserTags } from '../../store/useStore';
import type { Tag } from '../../types';

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#f59e0b',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
];

const TagManager = ({ isOpen, onClose }: TagManagerProps) => {
  const tags = useUserTags();
  const addTag = useStore((state) => state.addTag);
  const updateTag = useStore((state) => state.updateTag);
  const deleteTag = useStore((state) => state.deleteTag);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(PRESET_COLORS[0]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleAddTag = () => {
    const result = addTag(newTagName, newTagColor);
    if (result.success) {
      setNewTagName('');
      setNewTagColor(PRESET_COLORS[0]);
      setIsAdding(false);
      showMessage(result.message, 'success');
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleEditTag = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const result = updateTag(editingId, editName, editColor);
    if (result.success) {
      setEditingId(null);
      showMessage(result.message, 'success');
    } else {
      showMessage(result.message, 'error');
    }
  };

  const handleDeleteTag = (id: string) => {
    if (confirm('确定要删除这个标签吗？相关记录中的该标签也会被移除。')) {
      const result = deleteTag(id);
      showMessage(result.message, result.success ? 'success' : 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card-paper p-6 w-full max-w-md max-h-[80vh] flex flex-col animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TagIcon className="w-6 h-6 text-amber-600" />
            <h2 className="title-display text-2xl text-amber-900">标签管理</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-amber-700" />
          </button>
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

        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="btn-stamp btn-primary flex items-center justify-center gap-2 mb-4 w-full"
          >
            <Plus className="w-5 h-5" />
            新建标签
          </button>
        )}

        {isAdding && (
          <div className="bg-amber-50 rounded-lg p-4 mb-4 border-2 border-amber-300">
            <h3 className="font-display text-lg text-amber-900 mb-3">新建标签</h3>
            <div className="space-y-3">
              <div>
                <label className="label-text text-sm">
                  <TagIcon className="inline w-4 h-4 mr-1" />
                  标签名称
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="input-field"
                  placeholder="输入标签名称"
                  autoFocus
                />
              </div>
              <div>
                <label className="label-text text-sm">
                  <Palette className="inline w-4 h-4 mr-1" />
                  标签颜色
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                        newTagColor === color ? 'ring-2 ring-offset-2 ring-amber-600' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddTag}
                  disabled={!newTagName.trim()}
                  className={`btn-stamp btn-primary flex-1 flex items-center justify-center gap-1 ${
                    !newTagName.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Check className="w-4 h-4" />
                  创建
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewTagName('');
                  }}
                  className="btn-stamp btn-secondary flex items-center justify-center gap-1"
                >
                  <X className="w-4 h-4" />
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {tags.length === 0 ? (
            <div className="text-center py-8 text-amber-600">
              <TagIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无标签，点击上方按钮创建</p>
            </div>
          ) : (
            tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-3 p-3 bg-parchment-100 rounded-lg border border-amber-200"
              >
                {editingId === tag.id ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-field py-1 text-sm"
                      autoFocus
                    />
                    <div className="flex flex-wrap gap-1">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditColor(color)}
                          className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${
                            editColor === color ? 'ring-2 ring-offset-1 ring-amber-600' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editName.trim()}
                        className={`p-1 rounded text-green-600 hover:bg-green-100 ${
                          !editName.trim() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded text-gray-600 hover:bg-gray-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span
                      className="flex-1 font-medium"
                      style={{ color: tag.color }}
                    >
                      {tag.name}
                    </span>
                    <span className="text-xs text-amber-500">
                      {tags.reduce((acc, t) => 
                        acc + (useStore.getState().records.filter(r => r.tagIds?.includes(t.id)).length), 0
                      )} 条记录
                    </span>
                    <button
                      onClick={() => handleEditTag(tag)}
                      className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                      title="编辑标签"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="删除标签"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TagManager;
