import React, { useState } from 'react';
import { useTranslation } from '../../shared/hooks/useTranslation';
import { transactionService } from './transaction.service';
import Icon from '../../shared/components/IconSystem';
import { getSupportedCurrencies } from '../../shared/utils/formatCurrency';

export default function QuickAdd({ onAdded, editingTransaction, onCancel, categories, setCategories }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(categories[0]?.id || 'food');
  const [account, setAccount] = useState('cash');
  const [currency, setCurrency] = useState(localStorage.getItem('app_currency') || 'TWD');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  
  const [isManaging, setIsManaging] = useState(false);
  const [activeIconPicker, setActiveIconPicker] = useState(null);

  React.useEffect(() => {
    if (editingTransaction) {
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setAccount(editingTransaction.account);
      setCurrency(editingTransaction.currency);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
    } else {
      setAmount('');
      setNote('');
    }
  }, [editingTransaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;

    const data = {
      amount: parseFloat(amount),
      type,
      category,
      account,
      currency,
      date,
      note
    };

    if (editingTransaction) {
      await transactionService.updateTransaction({ ...data, id: editingTransaction.id, createdAt: editingTransaction.createdAt });
      onCancel();
    } else {
      await transactionService.addTransaction(data);
    }

    setAmount('');
    if (onAdded) onAdded();
  };

  const iconOptions = ['food', 'coffee', 'grocery', 'transport', 'shopping', 'phone', 'utilities', 'home_rent', 'health', 'beauty', 'fitness', 'entertainment', 'education', 'gift', 'investment', 'travel', 'pet', 'subscription', 'work', 'other'];

  return (
    <div className="glass-card fade-in">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            type="button" 
            className={`btn ${type === 'expense' ? '' : 'btn-secondary'}`}
            onClick={() => setType('expense')}
            style={{ flex: 1 }}
          >
            {t('common.expense')}
          </button>
          <button 
            type="button" 
            className={`btn ${type === 'income' ? '' : 'btn-secondary'}`}
            onClick={() => setType('income')}
            style={{ flex: 1 }}
          >
            {t('common.income')}
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <input
            type="number"
            placeholder={t('common.amount')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{ fontSize: '1.5rem', fontWeight: '600', textAlign: 'center' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{ flex: 1 }}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsManaging(!isManaging)}
              style={{ padding: '0.6rem', minWidth: '40px' }}
            >
              <Icon name="settings" size={18} />
            </button>
          </div>
          <select value={account} onChange={(e) => setAccount(e.target.value)}>
            <option value="cash">{t('accounts.cash')}</option>
            <option value="bank">{t('accounts.bank')}</option>
            <option value="card">{t('accounts.card')}</option>
          </select>
        </div>

        {/* Inline Category Management */}
        {isManaging && (
          <div className="fade-in" style={{ 
            background: 'rgba(0,0,0,0.1)', 
            padding: '1rem', 
            borderRadius: '12px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.8rem',
            border: '1px dashed var(--border)'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>類別管理</div>
            {categories.map(cat => (
              <div key={cat.id} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <button 
                    type="button"
                    onClick={() => setActiveIconPicker(activeIconPicker === cat.id ? null : cat.id)}
                    style={{ background: 'var(--accent)', border: 'none', padding: '0.3rem', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}
                  >
                    <Icon name={cat.icon} size={16} />
                  </button>
                  <input 
                    type="text" 
                    value={cat.name} 
                    onChange={(e) => {
                      const newCats = categories.map(c => c.id === cat.id ? { ...c, name: e.target.value } : c);
                      setCategories(newCats);
                    }}
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.85rem', color: 'var(--text-primary)' }}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (categories.length > 1) {
                        setCategories(categories.filter(c => c.id !== cat.id));
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: '#FF8A8A', cursor: 'pointer', marginLeft: 'auto' }}
                  >
                    ✕
                  </button>
                </div>
                {/* Icon Picker Modal - Improved Glassy Modal */}
                {activeIconPicker === cat.id && (
                  <div 
                    style={{ 
                      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(20, 40, 38, 0.7)', backdropFilter: 'blur(10px)',
                      padding: '1.5rem'
                    }}
                    onClick={() => setActiveIconPicker(null)}
                  >
                    <div 
                      className="glass-card fade-in" 
                      style={{ 
                        width: '100%', maxWidth: '340px', padding: '1.5rem', 
                        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.8rem',
                        background: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(35px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 20px 60px rgba(10, 25, 23, 0.4)',
                        borderRadius: '28px'
                      }} 
                      onClick={e => e.stopPropagation()}
                    >
                      <div style={{ gridColumn: 'span 5', textAlign: 'center', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>選擇圖示</div>
                      {iconOptions.map(iconName => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => {
                            const newCats = categories.map(c => c.id === cat.id ? { ...c, icon: iconName } : c);
                            setCategories(newCats);
                            setActiveIconPicker(null);
                          }}
                          style={{ 
                            background: cat.icon === iconName ? 'var(--accent)' : 'rgba(255,255,255,0.05)', 
                            border: 'none', 
                            padding: '0.8rem', 
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          <Icon name={iconName} size={24} />
                        </button>
                      ))}
                      <button 
                        type="button"
                        onClick={() => setActiveIconPicker(null)}
                        style={{ gridColumn: 'span 5', marginTop: '1rem', background: 'var(--surface)', border: 'none', color: 'var(--text-primary)', padding: '0.6rem', borderRadius: '12px', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        完成
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button 
              type="button"
              onClick={() => {
                const newId = `custom_${Date.now()}`;
                setCategories([...categories, { id: newId, name: '新類別', icon: 'other' }]);
              }}
              className="btn btn-secondary"
              style={{ padding: '0.4rem', fontSize: '0.75rem' }}
            >
              + 新增類別
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {getSupportedCurrencies().map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>

        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="備註 (選填)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          {editingTransaction && (
            <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
              {t('common.cancel')}
            </button>
          )}
          <button type="submit" className="btn" style={{ flex: 2 }}>
            <Icon name={editingTransaction ? "save" : "plus"} size={20} />
            {editingTransaction ? t('common.save') : t('common.add')}
          </button>
        </div>
      </form>
    </div>
  );
}

