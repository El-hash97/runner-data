import './BottomNav.css'

export type Tab = 'input' | 'dashboard' | 'history'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'input',     icon: '✏️',  label: 'Input' },
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'history',   icon: '📋', label: 'History' },
]

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab${active === tab.id ? ' active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
