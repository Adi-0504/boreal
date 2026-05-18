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
  const [expenseViewIndex, setExpenseViewIndex] = useState(0);
  const [accountFilter, setAccountFilter] = useState('all');
  const [isNightMode, setIsNightMode] = useState(() => localStorage.getItem('night_mode') === 'true');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeIconPicker, setActiveIconPicker] = useState(null);
  const [userCategories, setUserCategories] = useState(() => {
    const saved = localStorage.getItem('user_categories');
    return saved ? JSON.parse(saved) : [
      { id: 'food', name: '飲食', icon: 'food' },
      { id: 'transport', name: '交通', icon: 'transport' },
      { id: 'shopping', name: '購物', icon: 'shopping' },
      { id: 'entertainment', name: '娛樂', icon: 'entertainment' },
      { id: 'health', name: '醫療', icon: 'health' },
      { id: 'other', name: '其他', icon: 'other' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('user_categories', JSON.stringify(userCategories));
  }, [userCategories]);

  useEffect(() => {
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

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      let data = await transactionService.getTransactions();
      if (accountFilter !== 'all') {
        data = data.filter(tx => tx.account === accountFilter);
      }
      setTransactions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [accountFilter, user]);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try { await authService.loginWithGoogle(); } catch (err) { setAuthError(err.message); }
  };

  const handleLogout = async () => {
    try { await authService.logout(); setUser(null); } catch (err) { console.error(err); }
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
    } catch (err) { alert(err.message); } finally { setIsUpdatingName(false); }
  };

  const getThemeClass = () => isNightMode ? 'theme-deepsea' : 'theme-morning';

  if (authLoading) return (
    <div className={getThemeClass()} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p className="text-secondary">{t('common.loading')}</p>
    </div>
  );

  if (!user) {
    return (
      <div className={getThemeClass()} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="bg-evolve" />
        <div className="glass-card fade-in" style={{ width: '90%', maxWidth: '340px', textAlign: 'center', zIndex: 1 }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '4px' }}>
            {"Welcome".split('').map((char, index) => (
              <span 
                key={index} 
                style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  color: 'var(--text-primary)',
                  opacity: 0,
                  animation: `fadeInUp 0.5s ease forwards ${index * 0.1}s`
                }}
              >
                {char}
              </span>
            ))}
          </div>
          <h1>{t('home.appTitle')}</h1>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>{t('home.appSubtitle')}</p>
          <button onClick={handleGoogleLogin} className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
            {t('home.loginWithGoogle')}
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'ledger': {
        const d = new Date();
        const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(new Date().setDate(diff)).toISOString().split('T')[0];

        const totalExpenses = transactions.reduce((acc, tx) => acc + (tx.type === 'expense' ? tx.amount : 0), 0);
        const weeklyExpenses = transactions.reduce((acc, tx) => acc + (tx.type === 'expense' && tx.date >= startOfWeek ? tx.amount : 0), 0);
        const monthlyExpenses = transactions.reduce((acc, tx) => acc + (tx.type === 'expense' && tx.date >= startOfMonth ? tx.amount : 0), 0);

        const views = [
          { label: t('home.totalExpenses'), value: totalExpenses },
          { label: t('home.monthlyExpenses'), value: monthlyExpenses },
          { label: t('home.weeklyExpenses'), value: weeklyExpenses }
        ];

        return (
          <>
            <div 
              className="glass-card fade-in" 
              style={{ marginBottom: '2rem', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setExpenseViewIndex((prev) => (prev + 1) % views.length)}
            >
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                {views.map((_, i) => (
                  <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: i === expenseViewIndex ? 'var(--accent)' : 'var(--border)' }} />
                ))}
              </div>
              <p className="text-secondary">{views[expenseViewIndex].label}</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                {formatCurrency(views[expenseViewIndex].value, 'TWD')}
              </h2>
            </div>
            <CalendarView transactions={transactions} t={t} />
          </>
        );
      }
      case 'accounts': {
        const filteredTransactions = transactions.filter(tx => {
          const matchesSearch = (tx.note || '').toLowerCase().includes(searchQuery.toLowerCase());
          const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
          return matchesSearch && matchesCategory;
        });

        const getCatName = (cat) => {
          const trans = t(`categories.${cat.id}`);
          return trans !== `categories.${cat.id}` && ['飲食','交通','購物','娛樂','醫療','其他','健康'].includes(cat.name) ? trans : cat.name;
        };

        return (
          <div className="fade-in">
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.8rem' }}
                />
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                  <Icon name="food" size={20} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
                <button className={`btn ${categoryFilter === 'all' ? '' : 'btn-secondary'}`} onClick={() => setCategoryFilter('all')}>{t('common.all')}</button>
                {userCategories.map(cat => (
                  <button key={cat.id} className={`btn ${categoryFilter === cat.id ? '' : 'btn-secondary'}`} onClick={() => setCategoryFilter(cat.id)}>{getCatName(cat)}</button>
                ))}
              </div>
            </div>

            <TransactionList transactions={filteredTransactions} onDelete={handleDelete} onEdit={handleEdit} categories={userCategories} t={t} />
          </div>
        );
      }
      case 'add': {
        return (
          <div className="fade-in">
            <QuickAdd 
              onAdded={handleSave} 
              editingTransaction={editingTransaction}
              categories={userCategories}
              setCategories={setUserCategories}
              onCancel={() => { setEditingTransaction(null); setActiveTab('ledger'); }}
              t={t}
            />
          </div>
        );
      }
      case 'charts': {
        return <div className="fade-in"><ChartSection transactions={transactions} t={t} /></div>;
      }
      case 'settings': {
        return (
          <div className="glass-card fade-in" style={{ marginBottom: '1.5rem' }}>
            <h3>{t('nav.settings')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div>
                <label className="text-secondary">{t('settings.language')}</label>
                <select value={lang} onChange={(e) => changeLanguage(e.target.value)}>
                  <option value="zh-TW">繁體中文</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <button onClick={toggleNightMode} className="btn btn-secondary">{isNightMode ? t('settings.lightMode') : t('settings.nightMode')}</button>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <button 
                  onClick={() => exportToPDF(transactions, t)} 
                  className="btn btn-secondary" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Icon name="save" size={20} />
                  {t('settings.exportPdf')}
                </button>
              </div>

              <button onClick={handleLogout} className="btn btn-secondary" style={{ color: '#FF8A8A' }}>{t('settings.signOut')}</button>
            </div>
          </div>
        );
      }
      default: return null;
    }
  };

  return (
    <div className={getThemeClass()} style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="bg-evolve" />
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '1.5rem', position: 'relative', zIndex: 1 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{t('home.appTitle')}</h1>
            <p className="text-secondary">{t('home.appSubtitle')}</p>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.6rem' }} onClick={() => setActiveTab('settings')}>
            <Icon name="settings" size={20} />
          </button>
        </header>
        <main style={{ paddingBottom: '100px' }}>{renderContent()}</main>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} t={t} />
      </div>
    </div>
  );
}

export default App;
