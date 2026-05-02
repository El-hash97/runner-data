import type { PenuanganRecord } from '../types'
import './HistoryCard.css'

interface Props {
  record: PenuanganRecord
  onEdit: (record: PenuanganRecord) => void
  onDelete: (id: number) => void
}

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
        <span className="tag">{record.time === 'day' ? '☀️ Day' : '🌙 Night'}</span>
        <span className={`tag${record.shotblast === 'yes' ? ' shotblast-yes' : ''}`}>
          {record.shotblast === 'yes' ? '✅ Shotblast' : 'No Shotblast'}
        </span>
      </div>
      <div className="card-footer">
        <span className="timestamp">{record.tanggal} · {record.jam}</span>
        <div className="actions">
          <button className="btn-edit"   onClick={() => onEdit(record)}>Edit</button>
          <button className="btn-delete" onClick={handleDelete}>Hapus</button>
        </div>
      </div>
    </div>
  )
}
