import React, { memo } from 'react';
import { useTranslation } from '../../shared/hooks/useTranslation';
import { formatCurrency } from '../../shared/utils/formatCurrency';
import Icon from '../../shared/components/IconSystem';

const TransactionList = memo(({ transactions, onDelete, onEdit }) => {
  const { t } = useTranslation();

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
        {t('home.recentTransactions')}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingBottom: '2rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {t('home.recentTransactions')}
      </h3>
      {transactions.map((tx) => (
        <div key={tx.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: 'var(--accent)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            opacity: 0.8
          }}>
            <Icon name={tx.category} size={20} />
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '500' }}>{t(`categories.${tx.category}`)}</div>
            <div className="text-secondary">{tx.date} • {t(`accounts.${tx.account}`)}</div>
            {tx.note && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{tx.note}</div>}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontWeight: '600', 
              color: tx.type === 'expense' ? '#FF8A8A' : '#8AFFBD' 
            }}>
              {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount, tx.currency)}
            </div>
          </div>

          <button 
            onClick={() => onEdit(tx)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <Icon name="edit" size={18} />
          </button>

          <button 
            onClick={() => onDelete(tx.id)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <Icon name="trash" size={18} />
          </button>
        </div>
      ))}
    </div>
  );
});

export default TransactionList;
