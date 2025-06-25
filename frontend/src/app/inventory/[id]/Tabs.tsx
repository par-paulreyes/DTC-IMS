import React, { useState } from 'react';

interface TabsProps {
  tabs: string[];
  children: React.ReactNode[];
}

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  background: '#fff',
  borderRadius: '12px 12px 0 0',
  overflow: 'hidden',
  marginBottom: 0,
  borderBottom: '1.5px solid #e5e7eb',
  flexWrap: 'wrap',
};
const tabStyle: React.CSSProperties = {
  flex: 1,
  padding: '14px 0',
  textAlign: 'center',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '1rem',
  color: '#888',
  background: '#fff',
  border: 'none',
  outline: 'none',
  textTransform: 'uppercase',
  letterSpacing: 1,
  borderBottom: '3px solid transparent',
  transition: 'color 0.2s, border-bottom 0.2s',
};
const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  color: '#182848',
  borderBottom: '3px solid #182848',
  background: '#fff',
};

export default function Tabs({ tabs, children }: TabsProps) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div style={tabBarStyle}>
        {tabs.map((tab, i) => (
          <button
            key={tab}
            style={i === active ? activeTabStyle : tabStyle}
            onClick={() => setActive(i)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
      <style>{`
        @media (max-width: 600px) {
          div[style*='display: flex'][style*='border-bottom'] {
            flex-direction: column !important;
            border-radius: 12px 12px 0 0 !important;
          }
          button[style*='padding: 14px 0'] {
            width: 100% !important;
            min-width: 0 !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
      <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', padding: 24, minHeight: 120 }}>
        {children[active]}
      </div>
    </div>
  );
} 