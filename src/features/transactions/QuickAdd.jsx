import React, { useState } from 'react';
import { useTranslation } from '../../shared/hooks/useTranslation';
import { transactionService } from './transaction.service';
import Icon from '../../shared/components/IconSystem';
import { getSupportedCurrencies } from '../../shared/utils/formatCurrency';

export default function QuickAdd({ onAdded, editingTransaction, onCancel }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('food');
  const [account, setAccount] = useState('cash');
  const [currency, setCurrency] = useState(localStorage.getItem('app_currency') || 'TWD');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="food">{t('categories.food')}</option>
            <option value="transport">{t('categories.transport')}</option>
            <option value="shopping">{t('categories.shopping')}</option>
            <option value="entertainment">{t('categories.entertainment')}</option>
            <option value="health">{t('categories.health')}</option>
            <option value="other">{t('categories.other')}</option>
          </select>
          <select value={account} onChange={(e) => setAccount(e.target.value)}>
            <option value="cash">{t('accounts.cash')}</option>
            <option value="bank">{t('accounts.bank')}</option>
            <option value="card">{t('accounts.card')}</option>
          </select>
        </div>

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
