import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../shared/utils/formatCurrency';

const ChartSection = ({ transactions, t }) => {
  const data = useMemo(() => {
    const categories = {};
    transactions.filter(tx => tx.type === 'expense').forEach(tx => {
      categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
    });
    return Object.keys(categories).map(name => ({
      name: t(`categories.${name}`),
      value: categories[name],
      key: name
    }));
  }, [transactions, t]);

  const COLORS = ['#5C7F7C', '#8A8F8E', '#2C3E50', '#E67E22', '#8E44AD', '#2980B9'];

  const totalExpense = data.reduce((acc, curr) => acc + curr.value, 0);

  if (transactions.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        {t('charts.notEnoughData')}
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in" style={{ paddingBottom: '100px' }}>
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: '600' }}>{t('charts.expenseStructure')}</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: 'rgba(31, 61, 59, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          {data.map((item, index) => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
              <span className="text-secondary" style={{ fontSize: '0.8rem' }}>{item.name}</span>
              <span style={{ marginLeft: 'auto', fontWeight: '600' }}>
                {Math.round((item.value / totalExpense) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
