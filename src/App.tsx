import { useState } from 'react'
import BottomNav, { type Tab } from './components/BottomNav'
import InputPage from './pages/InputPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const [tab, setTab] = useState<Tab>('input')
  return (
    <>
      {tab === 'input'     && <InputPage />}
      {tab === 'dashboard' && <DashboardPage />}
      {tab === 'history'   && <div className="page"><h1 className="page-title">History</h1></div>}
      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}
