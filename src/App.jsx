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
      <p className="text-secondary">Loading...</p>
    </div>
  );

  if (!user) {
    return (
      <div className={getThemeClass()} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="bg-evolve" />
        <div className="glass-card fade-in" style={{ width: '90%', maxWidth: '340px', textAlign: 'center', zIndex: 1 }}>
          <h1>Boreal</h1>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>Forest Tracker</p>
          <button onClick={handleGoogleLogin} className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'ledger': {
        return (
          <>
            <div className="glass-card fade-in" style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <p className="text-secondary">{t('home.totalExpenses')}</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                {formatCurrency(transactions.reduce((acc, tx) => acc + (tx.type === 'expense' ? tx.amount : 0), 0), 'TWD')}
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

        return (
          <div className="fade-in">
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="搜尋..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.8rem' }}
                />
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                  <Icon name="food" size={20} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
                <button className={`btn ${categoryFilter === 'all' ? '' : 'btn-secondary'}`} onClick={() => setCategoryFilter('all')}>All</button>
                {userCategories.map(cat => (
                  <button key={cat.id} className={`btn ${categoryFilter === cat.id ? '' : 'btn-secondary'}`} onClick={() => setCategoryFilter(cat.id)}>{cat.name}</button>
                ))}
              </div>
            </div>

            <TransactionList transactions={filteredTransactions} onDelete={handleDelete} onEdit={handleEdit} categories={userCategories} />
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
            <h3>{t('common.settings')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div>
                <label className="text-secondary">Language</label>
                <select value={lang} onChange={(e) => changeLanguage(e.target.value)}>
                  <option value="zh-TW">繁體中文</option>
                  <option value="en">English</option>
                </select>
              </div>
              <button onClick={toggleNightMode} className="btn btn-secondary">{isNightMode ? 'Light Mode' : 'Night Mode'}</button>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <label className="text-secondary">Categories</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {userCategories.map(cat => (
                    <div key={cat.id} style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'var(--surface)', padding: '0.6rem 1rem', borderRadius: '10px' }}>
                        <button onClick={() => setActiveIconPicker(activeIconPicker === cat.id ? null : cat.id)} className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '8px' }}>
                          <Icon name={cat.icon} size={18} />
                        </button>
                        <input 
                          type="text" 
                          value={cat.name} 
                          onChange={(e) => setUserCategories(userCategories.map(c => c.id === cat.id ? { ...c, name: e.target.value } : c))}
                          style={{ background: 'none', border: 'none', color: 'var(--text-primary)' }}
                        />
                      </div>
                      {activeIconPicker === cat.id && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }} onClick={() => setActiveIconPicker(null)}>
                          <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.8rem', maxWidth: '340px' }} onClick={e => e.stopPropagation()}>
                            {['food', 'coffee', 'grocery', 'transport', 'shopping', 'phone', 'utilities', 'home_rent', 'health', 'beauty', 'fitness', 'entertainment', 'education', 'gift', 'investment', 'travel', 'pet', 'subscription', 'work', 'other'].map(iconName => (
                              <button key={iconName} className="btn-secondary" onClick={() => { setUserCategories(userCategories.map(c => c.id === cat.id ? { ...c, icon: iconName } : c)); setActiveIconPicker(null); }}>
                                <Icon name={iconName} size={24} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setUserCategories([...userCategories, { id: `custom_${Date.now()}`, name: 'New', icon: 'other' }])} className="btn btn-secondary">+ Add</button>
                  <button onClick={() => { if (window.confirm('Reset?')) setUserCategories([{ id: 'food', name: '飲食', icon: 'food' }, { id: 'transport', name: '交通', icon: 'transport' }, { id: 'shopping', name: '購物', icon: 'shopping' }, { id: 'entertainment', name: '娛樂', icon: 'entertainment' }, { id: 'health', name: '醫療', icon: 'health' }, { id: 'other', name: '其他', icon: 'other' }]); }} className="btn btn-secondary" style={{ color: '#FF8A8A' }}>↺ Reset</button>
                </div>
              </div>

              <button onClick={handleLogout} className="btn btn-secondary" style={{ color: '#FF8A8A' }}>Sign Out</button>
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
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Boreal</h1>
            <p className="text-secondary">Forest Tracker</p>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.6rem' }} onClick={() => setActiveTab('settings')}>
            <Icon name="settings" size={20} />
          </button>
        </header>
        <main style={{ paddingBottom: '100px' }}>{renderContent()}</main>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

export default App;
