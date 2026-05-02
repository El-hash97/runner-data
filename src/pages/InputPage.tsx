import { useState, useEffect } from 'react'
import ToggleGroup from '../components/ToggleGroup'
import RunnerGrid from '../components/RunnerGrid'
import Toast from '../components/Toast'
import { saveRecord, getSavedName, saveOperatorName } from '../storage'
import { todayString, nowTimeString } from '../utils'
import type { PenuanganRecord } from '../types'
import './InputPage.css'

const KNOWN_NAMES_KEY = 'runner_known_names'

function getKnownNames(): string[] {
  try {
    const raw = localStorage.getItem(KNOWN_NAMES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function addKnownName(name: string) {
  const names = getKnownNames()
  if (!names.includes(name)) {
    names.push(name)
    localStorage.setItem(KNOWN_NAMES_KEY, JSON.stringify(names))
  }
}

export default function InputPage() {
  const [nama, setNama] = useState(getSavedName)
  const [shift, setShift] = useState<'red' | 'white' | ''>('')
  const [time, setTime] = useState<'day' | 'night' | ''>('')
  const [runner, setRunner] = useState('')
  const [tanggal, setTanggal] = useState(todayString)
  const [jam, setJam] = useState(nowTimeString)
  const [shotblast, setShotblast] = useState<'yes' | 'no' | ''>('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [toastTrigger, setToastTrigger] = useState(0)

  useEffect(() => {
    if (!nama.trim()) { setSuggestions([]); return }
    const matches = getKnownNames().filter(n =>
      n.toLowerCase().startsWith(nama.toLowerCase()) && n !== nama
    )
    setSuggestions(matches)
  }, [nama])

  const isValid = nama.trim() && shift && time && runner && tanggal && jam && shotblast

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    const record: PenuanganRecord = {
      id: Date.now(),
      nama: nama.trim(),
      shift: shift as 'red' | 'white',
      time: time as 'day' | 'night',
      runner,
      tanggal,
      jam,
      shotblast: shotblast as 'yes' | 'no',
      createdAt: new Date().toISOString(),
    }
    saveRecord(record)
    saveOperatorName(nama.trim())
    addKnownName(nama.trim())
    setToastTrigger(t => t + 1)
    setShift('')
    setTime('')
    setRunner('')
    setShotblast('')
    setJam(nowTimeString())
  }

  return (
    <div className="page input-page">
      <Toast message="Data berhasil disimpan!" trigger={toastTrigger} />
      <h1 className="page-title">Input Penuangan</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="field">
            <label className="field-label">Nama Operator</label>
            <input
              className="text-input"
              type="text"
              value={nama}
              onChange={e => setNama(e.target.value)}
              placeholder="Masukkan nama..."
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <div className="autocomplete-list">
                {suggestions.map(s => (
                  <button key={s} type="button" className="autocomplete-item"
                    onClick={() => { setNama(s); setSuggestions([]) }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <div className="field">
            <label className="field-label">Team Shift</label>
            <ToggleGroup
              options={[
                { value: 'red',   label: '🔴 Red',   color: 'var(--red-team)' },
                { value: 'white', label: '⚪ White', color: 'var(--white-team)' },
              ]}
              value={shift}
              onChange={v => setShift(v as 'red' | 'white')}
            />
          </div>
          <div className="field">
            <label className="field-label">Waktu</label>
            <ToggleGroup
              options={[
                { value: 'day',   label: '☀️ Day',   color: '#F6C90E' },
                { value: 'night', label: '🌙 Night', color: 'var(--blue)' },
              ]}
              value={time}
              onChange={v => setTime(v as 'day' | 'night')}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label">Jenis Runner</label>
            <RunnerGrid value={runner} onChange={setRunner} />
          </div>
        </div>

        <div className="form-section">
          <div className="datetime-row">
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">Tanggal</label>
              <input className="text-input" type="date" value={tanggal}
                onChange={e => setTanggal(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">Jam Penuangan</label>
              <input className="text-input" type="time" value={jam}
                onChange={e => setJam(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label">Shotblast</label>
            <ToggleGroup
              options={[
                { value: 'yes', label: '✅ Yes', color: 'var(--green)' },
                { value: 'no',  label: '❌ No',  color: 'var(--text-secondary)' },
              ]}
              value={shotblast}
              onChange={v => setShotblast(v as 'yes' | 'no')}
            />
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={!isValid}>
          Simpan Penuangan
        </button>
      </form>
    </div>
  )
}
