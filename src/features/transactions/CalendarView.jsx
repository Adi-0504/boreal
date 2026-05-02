import React, { useState, useMemo } from 'react';
import Icon from '../../shared/components/IconSystem';
import { formatCurrency } from '../../shared/utils/formatCurrency';

const CalendarView = ({ transactions, t }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);

  // Padding
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map transactions to dates for dots
  const dailyStats = useMemo(() => {
    const stats = {};
    transactions.forEach(tx => {
      if (!stats[tx.date]) stats[tx.date] = { income: 0, expense: 0 };
      if (tx.type === 'income') stats[tx.date].income += tx.amount;
      else stats[tx.date].expense += tx.amount;
    });
    return stats;
  }, [transactions]);

  const selectedDayTransactions = useMemo(() => {
    return transactions.filter(tx => tx.date === selectedDate);
  }, [transactions, selectedDate]);

  return (
    <div className="fade-in" style={{ paddingBottom: '100px' }}>
      {/* Month Selector */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        padding: '0 0.5rem'
      }}>
        <button 
          onClick={() => setCurrentDate(new Date(year, month - 1))}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <Icon name="transport" size={20} />
        </button>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>
          {year}年 {month + 1}月
        </h2>
        <button 
          onClick={() => setCurrentDate(new Date(year, month + 1))}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <Icon name="transport" size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card" style={{ padding: '1rem', borderRadius: '24px', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.8rem' }}>
          {weekDays.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              {d}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {days.map((day, i) => {
            if (!day) return <div key={`p-${i}`} />;
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            const hasData = dailyStats[dateStr];

            return (
              <button 
                key={i} 
                onClick={() => setSelectedDate(dateStr)}
                style={{ 
                  height: '44px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  color: isSelected ? '#fff' : 'var(--text-primary)',
                  backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
              >
                {day}
                {hasData && !isSelected && (
                  <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                    {hasData.expense > 0 && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FF8A8A' }} />}
                    {hasData.income > 0 && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8AFFBD' }} />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Transactions */}
      <div className="fade-in">
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', paddingLeft: '0.5rem' }}>
          {selectedDate === new Date().toISOString().split('T')[0] ? '今天' : selectedDate} 紀錄
        </h3>
        
        {selectedDayTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }} className="glass-card">
            沒有記錄
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {selectedDayTransactions.map(tx => (
              <div key={tx.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
                  <Icon name={tx.category} size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>{t(`categories.${tx.category}`)}</div>
                  {tx.note && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tx.note}</div>}
                </div>
                <div style={{ textAlign: 'right', fontWeight: '600', color: tx.type === 'expense' ? '#FF8A8A' : '#8AFFBD' }}>
                  {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount, tx.currency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
