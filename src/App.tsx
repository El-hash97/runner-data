import { useState } from 'react'
import BottomNav, { type Tab } from './components/BottomNav'
import InputPage from './pages/InputPage'
import DashboardPage from './pages/DashboardPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  const [tab, setTab] = useState<Tab>('input')
  return (
    <>
      {tab === 'input'     && <InputPage />}
      {tab === 'dashboard' && <DashboardPage />}
      {tab === 'history'   && <HistoryPage />}
      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}
