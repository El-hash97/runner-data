import { useState, useMemo } from 'react'
import StatCard from '../components/StatCard'
import VerticalBarChart from '../components/VerticalBarChart'
import { getRecords } from '../storage'
import { todayString, getLast7Days, getLast30Days, getChartDataDaily } from '../utils'
import './DashboardPage.css'

type Period = '1d' | '7d' | '30d'

const PERIODS: { id: Period; label: string }[] = [
  { id: '1d',  label: '1 Hari' },
  { id: '7d',  label: '7 Hari' },
  { id: '30d', label: '30 Hari' },
]

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('1d')

  const records = useMemo(() => getRecords(), [])
  const today   = todayString()

  const days = useMemo(() => {
    if (period === '1d')  return [today]
    if (period === '7d')  return getLast7Days()
    return getLast30Days()
  }, [period, today])

  const totalCount = records.length
  const todayCount = records.filter(r => r.tanggal === today).length
  const fcCount    = records.filter(r => r.runner.includes('FC') && !r.runner.includes('FCD')).length
  const fcdCount   = records.filter(r => r.runner.includes('FCD')).length

  const dailyEntries = useMemo(() => getChartDataDaily(records, days), [records, days])
  const hasData = dailyEntries.some(e => e.redFC + e.redFCD + e.whiteFC + e.whiteFCD > 0)

  const chartTitle = period === '1d' ? 'Hari Ini' : period === '7d' ? '7 Hari Terakhir' : '30 Hari Terakhir'

  return (
    <div className="page dashboard-page">
      <h1 className="page-title">Dashboard</h1>

      <div className="stat-grid">
        <StatCard label="Total Penuangan" value={totalCount} accentColor="var(--gold)" />
        <StatCard label="Hari Ini"        value={todayCount} accentColor="var(--blue)" />
        <StatCard label="FC"              value={fcCount}    accentColor="var(--red-team)" />
        <StatCard label="FCD"             value={fcdCount}   accentColor="var(--green)" />
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <span className="chart-title">Penuangan · {chartTitle}</span>
          <div className="period-filter">
            {PERIODS.map(p => (
              <button
                key={p.id}
                className={`period-btn${period === p.id ? ' active' : ''}`}
                onClick={() => setPeriod(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {!hasData
          ? <p className="empty-chart">Belum ada data</p>
          : <VerticalBarChart entries={dailyEntries} />
        }
      </div>
    </div>
  )
}
