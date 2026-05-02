import type { PenuanganRecord } from './types'
import { STORAGE_KEY, NAME_KEY } from './types'

export function getRecords(): PenuanganRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PenuanganRecord[]) : []
  } catch {
    return []
  }
}

export function saveRecord(record: PenuanganRecord): void {
  const records = getRecords()
  records.push(record)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function updateRecord(updated: PenuanganRecord): void {
  const records = getRecords().map(r => (r.id === updated.id ? updated : r))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function deleteRecord(id: number): void {
  const records = getRecords().filter(r => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function getSavedName(): string {
  return localStorage.getItem(NAME_KEY) ?? ''
}

export function saveOperatorName(name: string): void {
  localStorage.setItem(NAME_KEY, name)
}
