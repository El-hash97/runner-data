import { useState } from 'react'
import BottomNav, { type Tab } from './components/BottomNav'
import InputPage from './pages/InputPage'
import DashboardPage from './pages/DashboardPage'
import HistoryPage from './pages/HistoryPage'
import HeroPage from './pages/HeroPage'

function hasEnteredApp(): boolean {
  return sessionStorage.getItem('runner_entered') === '1'
}

export default function App() {
  const [entered, setEntered] = useState(hasEnteredApp)
  const [tab, setTab] = useState<Tab>('input')

  if (!entered) {
    return (
      <HeroPage onEnter={() => {
        sessionStorage.setItem('runner_entered', '1')
        setEntered(true)
      }} />
    )
  }

  return (
    <>
      {tab === 'input'     && <InputPage />}
      {tab === 'dashboard' && <DashboardPage />}
      {tab === 'history'   && <HistoryPage />}
      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}
