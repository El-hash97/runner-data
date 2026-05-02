import { useState } from 'react'
import type { PenuanganRecord } from '../types'
import ToggleGroup from './ToggleGroup'
import RunnerGrid from './RunnerGrid'
import './EditModal.css'

interface Props {
  record: PenuanganRecord | null
  onSave: (updated: PenuanganRecord) => void
  onClose: () => void
}

export default function EditModal({ record, onSave, onClose }: Props) {
  const [form, setForm] = useState<PenuanganRecord | null>(record)

  if (!record || !form) return null

  function update<K extends keyof PenuanganRecord>(key: K, value: PenuanganRecord[K]) {
    setForm(prev => prev ? { ...prev, [key]: value } : prev)
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-sheet">
        <div className="modal-header">
          <span className="modal-title">Edit Penuangan</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="field">
          <label className="field-label">Nama Operator</label>
          <input className="text-input" value={form.nama} onChange={e => update('nama', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Team Shift</label>
          <ToggleGroup
            options={[{ value: 'red', label: '🔴 Red', color: 'var(--red-team)' }, { value: 'white', label: '⚪ White', color: 'var(--white-team)' }]}
            value={form.shift} onChange={v => update('shift', v as 'red' | 'white')} />
        </div>
        <div className="field">
          <label className="field-label">Waktu</label>
          <ToggleGroup
            options={[{ value: 'day', label: '☀️ Day', color: '#F6C90E' }, { value: 'night', label: '🌙 Night', color: 'var(--blue)' }]}
            value={form.time} onChange={v => update('time', v as 'day' | 'night')} />
        </div>
        <div className="field">
          <label className="field-label">Jenis Runner</label>
          <RunnerGrid value={form.runner} onChange={v => update('runner', v)} />
        </div>
        <div className="field">
          <label className="field-label">Tanggal</label>
          <input className="text-input" type="date" value={form.tanggal} onChange={e => update('tanggal', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Jam Penuangan</label>
          <input className="text-input" type="time" value={form.jam} onChange={e => update('jam', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Shotblast</label>
          <ToggleGroup
            options={[{ value: 'yes', label: '✅ Yes', color: 'var(--green)' }, { value: 'no', label: '❌ No', color: 'var(--text-secondary)' }]}
            value={form.shotblast} onChange={v => update('shotblast', v as 'yes' | 'no')} />
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Batal</button>
          <button className="btn-save"   onClick={() => onSave(form)}>Simpan</button>
        </div>
      </div>
    </div>
  )
}
