import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { User, Lock, LogIn, UserPlus, Compass, AlertCircle, CheckCircle } from 'lucide-react';

type AuthMode = 'login' | 'register';

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentUser = useStore((state) => state.currentUser);
  const login = useStore((state) => state.login);
  const register = useStore((state) => state.register);
  const syncAll = useStore((state) => state.syncAll);
  const navigate = useNavigate();
  const location = useLocation();

  const triggerSync = useCallback(() => {
    setTimeout(() => {
      syncAll();
    }, 300);
  }, [syncAll]);

  useEffect(() => {
    if (currentUser) {
      const from = (location.state as { from?: string })?.from || '/';
      navigate(from, { replace: true });
    }
  }, [currentUser, location.state, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: '两次输入的密码不一致' });
        return;
      }
      const result = register(username, password);
      setMessage({ type: result.success ? 'success' : 'error', text: result.message });
      if (result.success) {
        triggerSync();
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      }
    } else {
      const result = login(username, password);
      setMessage({ type: result.success ? 'success' : 'error', text: result.message });
      if (result.success) {
        triggerSync();
        const from = (location.state as { from?: string })?.from || '/';
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      }
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setMessage(null);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  if (currentUser) {
    const from = (location.state as { from?: string })?.from || '/';
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card-paper p-8 relative overflow-hidden">
          <div className="tape" style={{ top: '-8px', left: '50%', transform: 'translateX(-50%) rotate(-2deg)' }} />

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-amber-700 rounded-full flex items-center justify-center shadow-stamp border-4 border-amber-900 mx-auto mb-4">
              <Compass className="w-12 h-12 text-parchment-100" />
            </div>
            <h2 className="title-display text-3xl mb-2">
              {mode === 'login' ? '欢迎回来，猎人' : '加入猎人行列'}
            </h2>
            <p className="text-amber-700 text-sm">
              {mode === 'login'
                ? '登录查看你的捡漏战绩'
                : '注册开启你的省钱探险之旅'}
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg border-2 flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-400 text-green-800'
                  : 'bg-red-50 border-red-400 text-red-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-body text-sm">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label-text">
                <User className="inline w-5 h-5 mr-2" />
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label-text">
                <Lock className="inline w-5 h-5 mr-2" />
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="请输入密码"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="label-text">
                  <Lock className="inline w-5 h-5 mr-2" />
                  确认密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="请再次输入密码"
                  autoComplete="new-password"
                />
              </div>
            )}

            <button
              type="submit"
              className="btn-stamp btn-primary w-full flex items-center justify-center gap-2"
            >
              {mode === 'login' ? (
                <>
                  <LogIn className="w-5 h-5" />
                  登录
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  注册
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-amber-200 text-center">
            <p className="text-amber-700 text-sm mb-3">
              {mode === 'login' ? '还没有账号？' : '已有账号？'}
            </p>
            <button
              onClick={switchMode}
              className="btn-stamp btn-secondary w-full flex items-center justify-center gap-2"
            >
              {mode === 'login' ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  立即注册
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  去登录
                </>
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-300">
            <p className="text-xs text-amber-700 text-center">
              💡 提示：用户名至少 3 个字符，密码至少 6 个字符
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
