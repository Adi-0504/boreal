import React, { memo } from 'react';
import { formatCurrency } from '../../shared/utils/formatCurrency';
import Icon from '../../shared/components/IconSystem';

const TransactionList = memo(({ transactions, onDelete, onEdit, categories, t }) => {
  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
        {t('home.recentTransactions')}
      </div>
    );
  }

  const getCategoryInfo = (catId) => {
    const cat = categories?.find(c => c.id === catId);
    if (cat) {
      const trans = t(`categories.${cat.id}`);
      const isDefault = ['飲食','交通','購物','娛樂','醫療','其他','健康'].includes(cat.name);
      return { ...cat, name: (trans !== `categories.${cat.id}` && isDefault) ? trans : cat.name };
    }
    // Fallback to translation for legacy/built-in categories
    const fallbackTrans = t(`categories.${catId}`);
    return { 
      name: fallbackTrans !== `categories.${catId}` ? fallbackTrans : catId, 
      icon: catId 
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingBottom: '2rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {t('home.recentTransactions')}
      </h3>
      {transactions.map((tx) => {
        const catInfo = getCategoryInfo(tx.category);
        return (
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
              <Icon name={catInfo.icon} size={20} />
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{catInfo.name}</div>
              <div className="text-secondary" style={{ fontSize: '0.85rem' }}>{tx.date} • {t(`accounts.${tx.account}`)}</div>
              {tx.note && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.note}</div>}
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
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
        );
      })}
    </div>
  );
});

export default TransactionList;
