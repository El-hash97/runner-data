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

const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const DAYS_ID   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return `${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
}

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

  const chartPeriodLabel = period === '1d' ? 'Hari Ini' : period === '7d' ? '7 Hari Terakhir' : '30 Hari Terakhir'

  return (
    <div className="page dashboard-page">
      <div className="dash-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="dash-date">{formatDisplayDate(today)}</p>
        </div>
        <div className="dash-status">
          <span className="dash-status-dot" />
          Live
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total Penuangan" value={totalCount} accentColor="var(--gold)" />
        <StatCard label="Hari Ini"        value={todayCount} accentColor="var(--blue)" />
        <StatCard label="FC"              value={fcCount}    accentColor="var(--red-team)" />
        <StatCard label="FCD"             value={fcdCount}   accentColor="var(--green)" />
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <div className="chart-title-group">
            <span className="chart-title">Grafik Penuangan</span>
            <span className="chart-subtitle">{chartPeriodLabel}</span>
          </div>
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
          ? (
            <div className="empty-chart-wrap">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ color: 'var(--border)' }}>
                <rect x="3" y="12" width="4" height="9" rx="1"/>
                <rect x="10" y="6" width="4" height="15" rx="1"/>
                <rect x="17" y="3" width="4" height="18" rx="1"/>
              </svg>
              <p className="empty-chart">Belum ada data untuk periode ini</p>
            </div>
          )
          : <VerticalBarChart entries={dailyEntries} />
        }
      </div>
    </div>
  )
}
