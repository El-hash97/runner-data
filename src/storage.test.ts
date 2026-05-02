import { describe, it, expect, beforeEach } from 'vitest'
import { getRecords, saveRecord, updateRecord, deleteRecord, getSavedName, saveOperatorName } from './storage'
import type { PenuanganRecord } from './types'
import { STORAGE_KEY } from './types'

const makeRecord = (overrides: Partial<PenuanganRecord> = {}): PenuanganRecord => ({
  id: 1000,
  nama: 'Budi',
  shift: 'red',
  time: 'day',
  runner: 'FC Small',
  tanggal: '2026-05-01',
  jam: '08:00',
  shotblast: 'yes',
  createdAt: '2026-05-01T01:00:00.000Z',
  ...overrides,
})

beforeEach(() => {
  localStorage.clear()
})

describe('getRecords', () => {
  it('returns empty array when storage is empty', () => {
    expect(getRecords()).toEqual([])
  })

  it('returns parsed records from localStorage', () => {
    const records = [makeRecord()]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    expect(getRecords()).toEqual(records)
  })
})

describe('saveRecord', () => {
  it('appends a record to empty storage', () => {
    const record = makeRecord()
    saveRecord(record)
    expect(getRecords()).toHaveLength(1)
    expect(getRecords()[0]).toEqual(record)
  })

  it('appends a record to existing records', () => {
    const r1 = makeRecord({ id: 1 })
    const r2 = makeRecord({ id: 2 })
    saveRecord(r1)
    saveRecord(r2)
    expect(getRecords()).toHaveLength(2)
  })
})

describe('updateRecord', () => {
  it('replaces record with matching id', () => {
    const original = makeRecord({ id: 1, nama: 'Budi' })
    saveRecord(original)
    const updated = { ...original, nama: 'Soni' }
    updateRecord(updated)
    const records = getRecords()
    expect(records).toHaveLength(1)
    expect(records[0].nama).toBe('Soni')
  })
})

describe('deleteRecord', () => {
  it('removes record with matching id', () => {
    const r1 = makeRecord({ id: 1 })
    const r2 = makeRecord({ id: 2 })
    saveRecord(r1)
    saveRecord(r2)
    deleteRecord(1)
    expect(getRecords()).toHaveLength(1)
    expect(getRecords()[0].id).toBe(2)
  })
})

describe('getSavedName / saveOperatorName', () => {
  it('returns empty string when no name saved', () => {
    expect(getSavedName()).toBe('')
  })

  it('returns saved name', () => {
    saveOperatorName('Soni')
    expect(getSavedName()).toBe('Soni')
  })
})
