import { useState } from 'react';
import {
  MessageSquare,
  Send,
  ArrowLeft,
  CheckCircle,
  Bug,
  Lightbulb,
  HelpCircle,
  Heart,
  Clock,
  AlertTriangle,
  RotateCw,
  Trash2,
  History,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import type { Feedback, FeedbackType } from '@/types';

const APP_VERSION = '1.0.0';

const feedbackTypeOptions: { value: FeedbackType; label: string; icon: typeof Bug; color: string }[] = [
  { value: 'bug', label: 'Bug 反馈', icon: Bug, color: 'text-crimson-600' },
  { value: 'feature', label: '功能建议', icon: Lightbulb, color: 'text-amber-600' },
  { value: 'question', label: '使用问题', icon: HelpCircle, color: 'text-sky-600' },
  { value: 'other', label: '其他反馈', icon: Heart, color: 'text-rose-500' },
];

const getTypeInfo = (type: FeedbackType) => {
  return feedbackTypeOptions.find((o) => o.value === type) || feedbackTypeOptions[3];
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString('zh-CN');
};

const StatusBadge = ({ status }: { status: Feedback['status'] }) => {
  const config = {
    pending: { label: '提交中', icon: Clock, className: 'bg-amber-100 text-amber-700' },
    submitted: { label: '已提交', icon: CheckCircle, className: 'bg-forest-100 text-forest-700' },
    failed: { label: '提交失败', icon: AlertTriangle, className: 'bg-crimson-100 text-crimson-700' },
  };
  const { label, icon: Icon, className } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

const FeedbackItem = ({
  feedback,
  onRetry,
  onDelete,
}: {
  feedback: Feedback;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const typeInfo = getTypeInfo(feedback.type);
  const TypeIcon = typeInfo.icon;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry(feedback.id);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="bg-parchment-50 border border-amber-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-amber-50 transition-colors"
      >
        <div className={`w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center ${typeInfo.color}`}>
          <TypeIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-amber-900 font-medium">{typeInfo.label}</span>
            <StatusBadge status={feedback.status} />
          </div>
          <p className="text-sm text-amber-700 truncate font-body">{feedback.description}</p>
          <p className="text-xs text-amber-400 mt-1 font-body">
            {formatDate(feedback.createdAt)} · v{feedback.version}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-amber-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-amber-400 flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-amber-200 p-4 bg-amber-50/50 space-y-3">
          <div>
            <p className="text-xs text-amber-500 font-body mb-1">详细描述</p>
            <p className="text-sm text-amber-800 font-body whitespace-pre-wrap">{feedback.description}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-amber-500 font-body">
            <span>版本：v{feedback.version}</span>
            <span>提交时间：{new Date(feedback.createdAt).toLocaleString('zh-CN')}</span>
          </div>
          {feedback.status === 'failed' && feedback.errorMessage && (
            <div className="bg-crimson-50 border border-crimson-200 rounded-lg p-3">
              <p className="text-sm text-crimson-700 font-body flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {feedback.errorMessage}
              </p>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            {feedback.status === 'failed' && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="btn-stamp btn-primary flex items-center gap-2 !px-3 !py-2 !text-sm disabled:opacity-50"
              >
                {isRetrying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-parchment-100 border-t-transparent rounded-full animate-spin" />
                    重试中...
                  </>
                ) : (
                  <>
                    <RotateCw className="w-4 h-4" />
                    重新提交
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => onDelete(feedback.id)}
              className="btn-stamp btn-secondary flex items-center gap-2 !px-3 !py-2 !text-sm"
            >
              <Trash2 className="w-4 h-4" />
              删除记录
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FeedbackPage = () => {
  const navigate = useNavigate();
  const feedbacks = useStore((state) => state.feedbacks);
  const addFeedback = useStore((state) => state.addFeedback);
  const submitFeedback = useStore((state) => state.submitFeedback);
  const retryFeedback = useStore((state) => state.retryFeedback);
  const deleteFeedback = useStore((state) => state.deleteFeedback);

  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  const userFeedbacks = feedbacks;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const newFeedback = addFeedback({
        type: feedbackType,
        description: description.trim(),
        version: APP_VERSION,
      });

      await submitFeedback(newFeedback.id);

      setSubmitSuccess(true);
      setDescription('');

      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch {
      // 错误已在 store 中处理
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await retryFeedback(id);
    } catch {
      // 错误已在 store 中处理
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条反馈记录吗？')) {
      deleteFeedback(id);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 mb-4 font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          返回设置
        </button>
        <div className="inline-flex items-center gap-2 mb-2">
          <MessageSquare className="w-6 h-6 text-amber-600" />
          <h2 className="title-display text-3xl md:text-4xl text-amber-900">
            意见反馈
          </h2>
          <MessageSquare className="w-6 h-6 text-amber-600" />
        </div>
        <p className="text-amber-700 font-body text-lg">
          告诉我们你的想法，帮助我们变得更好
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-paper p-6 relative space-y-6">
        <div className="tape" style={{ top: '-8px', left: '30px', transform: 'rotate(-3deg)' }} />

        {submitSuccess && (
          <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-forest-600 flex-shrink-0" />
            <div>
              <p className="font-display text-forest-800 font-medium">反馈提交成功！</p>
              <p className="text-sm text-forest-600 font-body">感谢你的宝贵意见，我们会认真处理。</p>
            </div>
          </div>
        )}

        <div>
          <label className="block font-display text-lg text-amber-900 mb-3">
            问题类型
          </label>
          <div className="grid grid-cols-2 gap-3">
            {feedbackTypeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = feedbackType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFeedbackType(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 shadow-inner'
                      : 'border-amber-200 bg-parchment-50 hover:border-amber-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-amber-500 text-parchment-100' : 'bg-amber-100 text-amber-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`font-body ${isSelected ? 'text-amber-900 font-semibold' : 'text-amber-700'}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block font-display text-lg text-amber-900 mb-3">
            详细描述
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请详细描述你的问题或建议，越具体越好..."
            rows={6}
            className="w-full p-4 rounded-xl border-2 border-amber-200 bg-parchment-50 font-body text-amber-800 placeholder:text-amber-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all resize-none"
          />
          <p className="text-sm text-amber-500 mt-2 font-body">
            {description.length} 字
          </p>
        </div>

        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm text-amber-600 font-body flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-amber-400 rounded-full" />
            当前应用版本：<span className="font-mono font-semibold text-amber-800">v{APP_VERSION}</span>
            <span className="text-amber-400">（将自动附加到反馈中）</span>
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={handleBack}
            className="btn-stamp btn-secondary !px-5 !py-3 !text-base"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={!description.trim() || isSubmitting}
            className="btn-stamp btn-primary flex items-center gap-2 !px-5 !py-3 !text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-parchment-100 border-t-transparent rounded-full animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                提交反馈
              </>
            )}
          </button>
        </div>
      </form>

      <div className="card-paper p-6 relative">
        <div className="tape" style={{ top: '-8px', right: '30px', transform: 'rotate(3deg)' }} />
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between"
        >
          <h3 className="font-display text-xl text-amber-900 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" />
            反馈历史
            <span className="text-sm font-normal text-amber-500">
              （{userFeedbacks.length} 条）
            </span>
          </h3>
          {showHistory ? (
            <ChevronUp className="w-5 h-5 text-amber-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-amber-400" />
          )}
        </button>

        {showHistory && (
          <div className="mt-4 space-y-3">
            {userFeedbacks.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-amber-200 mx-auto mb-3" />
                <p className="text-amber-500 font-body">暂无反馈记录</p>
                <p className="text-sm text-amber-400 font-body mt-1">提交你的第一条反馈吧</p>
              </div>
            ) : (
              userFeedbacks.map((feedback) => (
                <FeedbackItem
                  key={feedback.id}
                  feedback={feedback}
                  onRetry={handleRetry}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
