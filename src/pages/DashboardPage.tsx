import { useMemo } from 'react'
import StatCard from '../components/StatCard'
import BarChart from '../components/BarChart'
import { getRecords } from '../storage'
import { todayString, getLast7Days, getChartDataByTeamDate, getChartDataFCvsFCD } from '../utils'
import './DashboardPage.css'

export default function DashboardPage() {
  const records = useMemo(() => getRecords(), [])
  const today = todayString()
  const last7 = getLast7Days()

  const totalCount = records.length
  const todayCount = records.filter(r => r.tanggal === today).length
  const fcCount    = records.filter(r => r.runner.includes('FC') && !r.runner.includes('FCD')).length
  const fcdCount   = records.filter(r => r.runner.includes('FCD')).length

  const teamDateEntries = useMemo(() =>
    getChartDataByTeamDate(records, last7).map(e => ({
      label: e.label,
      count: e.count,
      color: e.shift === 'red' ? '#E8343A' : '#D4DAF0',
    })),
    [records]
  )

  const fcFcdEntries = useMemo(() => getChartDataFCvsFCD(records), [records])

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
        <div className="chart-title">Penuangan per Tim · 7 Hari Terakhir</div>
        {teamDateEntries.length === 0
          ? <p className="empty-chart">Belum ada data</p>
          : <BarChart entries={teamDateEntries} />}
      </div>

      <div className="chart-section">
        <div className="chart-title">FC vs FCD per Tim</div>
        {fcFcdEntries.every(e => e.count === 0)
          ? <p className="empty-chart">Belum ada data</p>
          : <BarChart entries={fcFcdEntries.filter(e => e.count > 0)} />}
      </div>
    </div>
  )
}
