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
import './index.css';

function App() {
  const [userId, setUserId] = useState(authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState('ledger');
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const { t, changeLanguage, lang } = useTranslation();
  const [accountFilter, setAccountFilter] = useState('all');
  const [isNightMode, setIsNightMode] = useState(() => localStorage.getItem('night_mode') === 'true');

  const toggleNightMode = () => {
    const newVal = !isNightMode;
    setIsNightMode(newVal);
    localStorage.setItem('night_mode', newVal);
  };

  const fetchTransactions = async () => {
    if (!userId) return;
    try {
      console.log('[Debug] Fetching transactions for user:', userId);
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
  }, [accountFilter, userId]);

  const handleLogin = (e) => {
    e.preventDefault();
    const id = e.target.userid.value;
    if (id) {
      console.log('[Debug] Logging in with userId:', id);
      authService.login(id);
      setUserId(id);
    }
  };

  const handleLogout = () => {
    console.log('[Debug] Logging out user:', userId);
    authService.logout();
    setUserId(null);
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

  const getThemeClass = () => {
    return isNightMode ? 'theme-deepsea' : 'theme-morning';
  };

  if (!userId) {
    return (
      <div className={getThemeClass()} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div className="bg-evolve" />
        <div className="glass-card fade-in" style={{ width: '90%', maxWidth: '320px', textAlign: 'center', zIndex: 1 }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Boreal</h1>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>Forest Tracker Login</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input id="userid" name="userid" type="text" placeholder="User ID" required style={{ width: '100%' }} autoFocus />
            <button type="submit" className="btn" style={{ width: '100%' }}>Sign In / Sign Up</button>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'ledger':
        return (
          <>
            <div className="glass-card fade-in" style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <p className="text-secondary">{t('home.totalBalance')}</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                {formatCurrency(transactions.reduce((acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount), 0), localStorage.getItem('app_currency') || 'TWD')}
              </h2>
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
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <p className="text-secondary" style={{ marginBottom: '0.5rem' }}>User: {userId}</p>
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
