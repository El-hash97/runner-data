import { useState, useMemo } from 'react'
import HistoryCard from '../components/HistoryCard'
import EditModal from '../components/EditModal'
import { getRecords, updateRecord, deleteRecord } from '../storage'
import { todayString } from '../utils'
import type { PenuanganRecord } from '../types'
import './HistoryPage.css'

type Filter = 'all' | 'red' | 'white' | 'fc' | 'fcd' | 'today'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',   label: 'Semua' },
  { id: 'red',   label: '🔴 Red' },
  { id: 'white', label: '⚪ White' },
  { id: 'fc',    label: 'FC' },
  { id: 'fcd',   label: 'FCD' },
  { id: 'today', label: 'Hari Ini' },
]

function applyFilter(records: PenuanganRecord[], filter: Filter): PenuanganRecord[] {
  const today = todayString()
  switch (filter) {
    case 'red':   return records.filter(r => r.shift === 'red')
    case 'white': return records.filter(r => r.shift === 'white')
    case 'fc':    return records.filter(r => r.runner.includes('FC') && !r.runner.includes('FCD'))
    case 'fcd':   return records.filter(r => r.runner.includes('FCD'))
    case 'today': return records.filter(r => r.tanggal === today)
    default:      return records
  }
}

export default function HistoryPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [records, setRecords] = useState<PenuanganRecord[]>(() => getRecords().slice().reverse())
  const [editTarget, setEditTarget] = useState<PenuanganRecord | null>(null)

  const displayed = useMemo(() => applyFilter(records, filter), [records, filter])

  function handleDelete(id: number) {
    deleteRecord(id)
    setRecords(getRecords().slice().reverse())
  }

  function handleSave(updated: PenuanganRecord) {
    updateRecord(updated)
    setRecords(getRecords().slice().reverse())
    setEditTarget(null)
  }

  return (
    <div className="page history-page">
      <h1 className="page-title">History</h1>

      <div className="filter-chips">
        {FILTERS.map(f => (
          <button key={f.id} className={`chip${filter === f.id ? ' active' : ''}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      <p className="record-count">{displayed.length} record</p>

      {displayed.length === 0
        ? <p className="empty-state">Belum ada data penuangan</p>
        : (
          <div className="cards-grid">
            {displayed.map(r => (
              <HistoryCard key={r.id} record={r} onEdit={setEditTarget} onDelete={handleDelete} />
            ))}
          </div>
        )
      }

      <EditModal record={editTarget} onSave={handleSave} onClose={() => setEditTarget(null)} />
    </div>
  )
}
