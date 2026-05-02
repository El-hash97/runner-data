import { useState } from 'react'
import BottomNav, { type Tab } from './components/BottomNav'

export default function App() {
  const [tab, setTab] = useState<Tab>('input')
  return (
    <>
      <div className="page">
        <h1 className="page-title">Runner FC/FCD</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Active: {tab}</p>
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}
