import React, { useState, useEffect } from 'react';
import QuickAdd from './features/transactions/QuickAdd';
import TransactionList from './features/transactions/TransactionList';
import CalendarView from './features/transactions/CalendarView';
import ChartSection from './features/transactions/ChartSection';
import BottomNav from './shared/components/BottomNav';
import { transactionService } from './features/transactions/transaction.service.js';
import { useTranslation } from './shared/hooks/useTranslation.js';
import Icon from './shared/components/IconSystem';
import { formatCurrency } from './shared/utils/formatCurrency.js';
import { authService } from './features/auth/auth.service.js';
import { exportToPDF } from './shared/utils/exportUtils.js';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [authError, setAuthError] = useState(null);
  const [activeTab, setActiveTab] = useState('ledger');
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const { t, changeLanguage, lang } = useTranslation();
  const [accountFilter, setAccountFilter] = useState('all');
  const [isNightMode, setIsNightMode] = useState(() => localStorage.getItem('night_mode') === 'true');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // 監聽 Supabase 登入狀態
  useEffect(() => {
    // 檢查 URL 中是否有 OAuth 重新導向的錯誤 (例如 provider 未啟用或取消授權)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');
    if (errorDesc) {
      setAuthError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
      // 清除 URL 參數避免重整時重複顯示錯誤
      window.history.replaceState(null, '', window.location.pathname);
    }

    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const toggleNightMode = () => {
    const newVal = !isNightMode;
    setIsNightMode(newVal);
    localStorage.setItem('night_mode', newVal);
  };

  const calculateWeeklyExpenses = (txs) => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    return txs.reduce((acc, tx) => {
      const txDate = new Date(tx.date);
      if (tx.type === 'expense' && txDate >= startOfWeek) {
        return acc + tx.amount;
      }
      return acc;
    }, 0);
  };

  const calculateMonthlyExpenses = (txs) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return txs.reduce((acc, tx) => {
      const txDate = new Date(tx.date);
      if (tx.type === 'expense' && txDate >= startOfMonth) {
        return acc + tx.amount;
      }
      return acc;
    }, 0);
  };

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      console.log('[Debug] Fetching transactions for user:', user.id);
      let data = await transactionService.getTransactions();
      if (accountFilter !== 'all') {
        data = data.filter(tx => tx.account === accountFilter);
      }
      setTransactions(data);
      console.log('[Debug] Data fetched:', data.length, 'records');
    } catch (err) {
      console.error('[Debug] Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [accountFilter, user]);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await authService.loginWithGoogle();
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await authService.loginWithEmail(emailInput);
      setEmailSent(true);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('[Auth] Logout error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.delete') + '?')) {
      await transactionService.deleteTransaction(id);
      fetchTransactions();
    }
  };

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    setEditingTransaction(null);
    setActiveTab('ledger');
    fetchTransactions();
  };

  const handleSaveName = async () => {
    setIsUpdatingName(true);
    try {
      await authService.updateProfile({ full_name: editNameValue });
      setIsEditingName(false);
    } catch (err) {
      alert('Failed to update name: ' + err.message);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const getThemeClass = () => {
    return isNightMode ? 'theme-deepsea' : 'theme-morning';
  };

  // 等待 Supabase session 初始化
  if (authLoading) {
    return (
      <div className={getThemeClass()} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="bg-evolve" />
        <p className="text-secondary" style={{ zIndex: 1 }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={getThemeClass()} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div className="bg-evolve" />
        <div className="glass-card fade-in" style={{ width: '90%', maxWidth: '340px', textAlign: 'center', zIndex: 1 }}>
          <h1 style={{ marginBottom: '0.25rem' }}>Boreal</h1>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>Forest Tracker</p>

          {/* Google OAuth */}
          <button
            id="btn-google-login"
            onClick={handleGoogleLogin}
            className="btn"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '1rem' }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
              <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
              <path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.791 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
            </svg>
            Continue with Google
          </button>

          {/* 分隔線 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span className="text-secondary" style={{ fontSize: '0.8rem' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Magic Link Email */}
          {emailSent ? (
            <div style={{ padding: '1rem', background: 'rgba(100,200,100,0.1)', borderRadius: '0.5rem' }}>
              <p style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>✉️ 確認信已寄出！</p>
              <p className="text-secondary" style={{ fontSize: '0.85rem' }}>請前往 {emailInput} 點擊確認連結登入。</p>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                id="email-input"
                type="email"
                placeholder="your@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                style={{ width: '100%' }}
              />
              <button id="btn-email-login" type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
                Send Magic Link
              </button>
            </form>
          )}

          {/* 錯誤訊息 */}
          {authError && (
            <p style={{ color: '#FF8A8A', fontSize: '0.85rem', marginTop: '1rem' }}>{authError}</p>
          )}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'ledger':
        return (
          <>
            <div className="glass-card fade-in" style={{ marginBottom: '2rem', padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scrollbar">
                <div style={{ flex: '0 0 100%', scrollSnapAlign: 'start', padding: '1.5rem', textAlign: 'center' }}>
                  <p className="text-secondary">{t('home.totalExpenses') || '總花費'}</p>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                    {formatCurrency(transactions.reduce((acc, tx) => acc + (tx.type === 'expense' ? tx.amount : 0), 0), localStorage.getItem('app_currency') || 'TWD')}
                  </h2>
                </div>
                <div style={{ flex: '0 0 100%', scrollSnapAlign: 'start', padding: '1.5rem', textAlign: 'center' }}>
                  <p className="text-secondary">{t('home.weeklyExpenses') || '本週花費'}</p>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                    {formatCurrency(calculateWeeklyExpenses(transactions), localStorage.getItem('app_currency') || 'TWD')}
                  </h2>
                </div>
                <div style={{ flex: '0 0 100%', scrollSnapAlign: 'start', padding: '1.5rem', textAlign: 'center' }}>
                  <p className="text-secondary">{t('home.monthlyExpenses') || '本月花費'}</p>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                    {formatCurrency(calculateMonthlyExpenses(transactions), localStorage.getItem('app_currency') || 'TWD')}
                  </h2>
                </div>
              </div>
            </div>
            <CalendarView transactions={transactions} t={t} />
          </>
        );
      case 'accounts':
        return (
          <div className="fade-in">
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {['all', 'cash', 'bank', 'card'].map(acc => (
                <button 
                  key={acc}
                  className={`btn ${accountFilter === acc ? '' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                  onClick={() => setAccountFilter(acc)}
                >
                  {acc === 'all' ? 'All' : t(`accounts.${acc}`)}
                </button>
              ))}
            </div>
            <TransactionList 
              transactions={transactions} 
              onDelete={handleDelete} 
              onEdit={handleEdit}
            />
          </div>
        );
      case 'add':
        return (
          <div className="fade-in">
            <QuickAdd 
              onAdded={handleSave} 
              editingTransaction={editingTransaction}
              onCancel={() => {
                setEditingTransaction(null);
                setActiveTab('ledger');
              }}
            />
          </div>
        );
      case 'charts':
        return (
          <div className="fade-in">
            <ChartSection transactions={transactions} t={t} />
          </div>
        );
      case 'settings':
        return (
          <div className="glass-card fade-in" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{t('common.settings')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>{t('settings.language')}</label>
                <select value={lang} onChange={(e) => changeLanguage(e.target.value)}>
                  <option value="zh-TW">繁體中文</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <div>
                <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>{t('settings.theme') || 'Night Mode'}</label>
                <button 
                  onClick={toggleNightMode} 
                  className={`btn ${isNightMode ? '' : 'btn-secondary'}`}
                  style={{ width: '100%' }}
                >
                  {isNightMode ? (lang === 'zh-TW' ? '關閉夜間模式' : 'Disable Night Mode') : (lang === 'zh-TW' ? '開啟夜間模式' : 'Enable Night Mode')}
                </button>
              </div>
              <div>
                <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>Data Management</label>
                <button 
                  onClick={() => exportToPDF(transactions, t, localStorage.getItem('app_currency') || 'TWD')} 
                  className="btn btn-secondary"
                  style={{ width: '100%', gap: '0.6rem' }}
                >
                  <Icon name="download" size={18} />
                  {lang === 'zh-TW' ? '匯出 PDF 報表' : 'Export PDF Report'}
                </button>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>Profile</label>
                {isEditingName ? (
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input 
                      type="text" 
                      value={editNameValue} 
                      onChange={(e) => setEditNameValue(e.target.value)} 
                      placeholder="Your Name"
                      autoFocus
                    />
                    <button className="btn" onClick={handleSaveName} disabled={isUpdatingName} style={{ padding: '0.8rem' }}>
                      {isUpdatingName ? '...' : t('common.save') || 'Save'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setIsEditingName(false)} style={{ padding: '0.8rem' }}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--surface)', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: '500', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'}
                      </div>
                      <div className="text-secondary" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.email}
                      </div>
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setEditNameValue(user?.user_metadata?.full_name || user?.user_metadata?.name || '');
                        setIsEditingName(true);
                      }}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', flexShrink: 0 }}
                    >
                      Edit
                    </button>
                  </div>
                )}
                
                <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', color: '#FF8A8A' }}>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={getThemeClass()} style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="bg-evolve" />
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '1.5rem', width: '100%', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', letterSpacing: '-0.02em' }}>Boreal</h1>
            <p className="text-secondary">Forest Tracker</p>
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.6rem' }}
            onClick={() => setActiveTab('settings')}
          >
            <Icon name="settings" size={20} />
          </button>
        </header>

        <main style={{ paddingBottom: '100px' }}>
          {renderContent()}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

export default App;
