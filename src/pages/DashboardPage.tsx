import { useMemo } from 'react'
import StatCard from '../components/StatCard'
import VerticalBarChart from '../components/VerticalBarChart'
import { getRecords } from '../storage'
import { todayString, getLast30Days, getChartDataDaily } from '../utils'
import './DashboardPage.css'

export default function DashboardPage() {
  const records = useMemo(() => getRecords(), [])
  const today   = todayString()
  const last30  = getLast30Days()

  const totalCount = records.length
  const todayCount = records.filter(r => r.tanggal === today).length
  const fcCount    = records.filter(r => r.runner.includes('FC') && !r.runner.includes('FCD')).length
  const fcdCount   = records.filter(r => r.runner.includes('FCD')).length

  const dailyEntries = useMemo(() => getChartDataDaily(records, last30), [records])
  const hasData = dailyEntries.some(e => e.redFC + e.redFCD + e.whiteFC + e.whiteFCD > 0)

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
        <div className="chart-title">Penuangan per Hari · 30 Hari Terakhir</div>
        {!hasData
          ? <p className="empty-chart">Belum ada data</p>
          : <VerticalBarChart entries={dailyEntries} />
        }
      </div>
    </div>
  )
}
