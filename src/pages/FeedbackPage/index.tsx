import { useState } from 'react';
import { MessageSquare, Send, ArrowLeft, CheckCircle, Bug, Lightbulb, HelpCircle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const APP_VERSION = '1.0.0';

type FeedbackType = 'bug' | 'feature' | 'question' | 'other';

const feedbackTypeOptions: { value: FeedbackType; label: string; icon: typeof Bug }[] = [
  { value: 'bug', label: 'Bug 反馈', icon: Bug },
  { value: 'feature', label: '功能建议', icon: Lightbulb },
  { value: 'question', label: '使用问题', icon: HelpCircle },
  { value: 'other', label: '其他反馈', icon: Heart },
];

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      console.log('Feedback submitted:', {
        type: feedbackType,
        description,
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
      });

      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (submitted) {
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
        </div>

        <div className="card-paper p-8 relative text-center">
          <div className="tape" style={{ top: '-8px', left: '50%', transform: 'translateX(-50%) rotate(-2deg)' }} />
          <div className="w-20 h-20 bg-forest-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-parchment-100" />
          </div>
          <h2 className="title-display text-3xl text-amber-900 mb-3">
            反馈提交成功！
          </h2>
          <p className="font-body text-amber-700 text-lg mb-6">
            感谢你的宝贵意见，我们会认真处理每一条反馈。
          </p>
          <div className="bg-amber-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-amber-600 font-body">
              <span className="font-semibold text-amber-800">应用版本：</span>
              v{APP_VERSION}
            </p>
            <p className="text-sm text-amber-600 font-body mt-2">
              <span className="font-semibold text-amber-800">反馈类型：</span>
              {feedbackTypeOptions.find(o => o.value === feedbackType)?.label}
            </p>
          </div>
          <button
            onClick={handleBack}
            className="btn-stamp btn-primary flex items-center gap-2 !px-6 !py-3 !text-lg mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            返回设置页
          </button>
        </div>
      </div>
    );
  }

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
    </div>
  );
};

export default FeedbackPage;
