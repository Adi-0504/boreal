import React from 'react';
import Icon from './IconSystem';
const BottomNav = ({ activeTab, onTabChange, t }) => {

  const tabs = [
    { id: 'ledger', icon: 'home', label: t('nav.ledger') },
    { id: 'accounts', icon: 'transport', label: t('nav.accounts') },
    { id: 'add', icon: 'plus', label: t('nav.add'), isCenter: true },
    { id: 'charts', icon: 'food', label: t('nav.charts') },
    { id: 'settings', icon: 'settings', label: t('nav.settings') },
  ];

  return (
    <nav className="glass" style={{ 
      position: 'fixed', 
      bottom: '1.5rem', 
      left: '50%', 
      transform: 'translateX(-50%)',
      width: 'calc(100% - 3rem)',
      maxWidth: '400px',
      height: '72px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 100,
      padding: '0 1rem'
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minWidth: '50px'
          }}
        >
          {tab.isCenter ? (
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--accent)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              marginTop: '-32px',
              color: '#fff'
            }}>
              <Icon name={tab.icon} size={24} />
            </div>
          ) : (
            <Icon name={tab.icon} size={24} />
          )}
          <span style={{ fontSize: '10px', fontWeight: '500' }}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
