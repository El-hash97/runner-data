import React from 'react'
import './BottomNav.css'

export type Tab = 'input' | 'dashboard' | 'history'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

const IconInput = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="12" width="4" height="9" rx="1"/>
    <rect x="10" y="6" width="4" height="15" rx="1"/>
    <rect x="17" y="3" width="4" height="18" rx="1"/>
  </svg>
)

const IconHistory = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 8v4l3 3"/>
    <path d="M3.05 11a9 9 0 1 1 .5 4M3 15v-4h4"/>
  </svg>
)

const IconBrand = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
)

const TABS: { id: Tab; Icon: () => React.ReactElement; label: string }[] = [
  { id: 'input',     Icon: IconInput,     label: 'Input' },
  { id: 'dashboard', Icon: IconDashboard, label: 'Dashboard' },
  { id: 'history',   Icon: IconHistory,   label: 'History' },
]

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <div className="nav-brand" aria-hidden="true">
        <div className="nav-brand-dot"><IconBrand /></div>
        <div className="nav-brand-text">
          <span className="nav-brand-name">Runner</span>
          <span className="nav-brand-sub">Monitoring</span>
        </div>
      </div>
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab${active === tab.id ? ' active' : ''}`}
          aria-label={tab.label}
          aria-current={active === tab.id ? 'page' : undefined}
          onClick={() => onChange(tab.id)}
        >
          <span className="nav-icon"><tab.Icon /></span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
