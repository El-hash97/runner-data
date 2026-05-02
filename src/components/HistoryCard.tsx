import type { PenuanganRecord } from '../types'
import './HistoryCard.css'

interface Props {
  record: PenuanganRecord
  onEdit: (record: PenuanganRecord) => void
  onDelete: (id: number) => void
}

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

export default function HistoryCard({ record, onEdit, onDelete }: Props) {
  function handleDelete() {
    if (confirm(`Hapus data penuangan ${record.nama}?`)) onDelete(record.id)
  }

  return (
    <div className="history-card">
      <div className="card-header">
        <span className="operator-name">{record.nama}</span>
        <span className={`team-badge ${record.shift}`}>
          {record.shift === 'red' ? '🔴 Red' : '⚪ White'}
        </span>
      </div>
      <div className="tags">
        <span className="tag">{record.runner}</span>
        <span className="tag">{record.time === 'day' ? 'Day' : 'Night'}</span>
        <span className={`tag${record.shotblast === 'yes' ? ' shotblast-yes' : ''}`}>
          {record.shotblast === 'yes' ? '✅ Shotblast' : 'No Shotblast'}
        </span>
      </div>
      <div className="card-footer">
        <span className="timestamp">{record.tanggal} · {record.jam}</span>
        <div className="actions">
          <button className="btn-icon btn-edit"   aria-label="Edit"  onClick={() => onEdit(record)}><IconEdit /></button>
          <button className="btn-icon btn-delete" aria-label="Hapus" onClick={handleDelete}><IconTrash /></button>
        </div>
      </div>
    </div>
  )
}
