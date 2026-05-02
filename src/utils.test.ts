import { describe, it, expect } from 'vitest'
import {
  todayString,
  nowTimeString,
  getLast7Days,
  getChartDataByTeamDate,
  getChartDataFCvsFCD,
} from './utils'
import type { PenuanganRecord } from './types'

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

describe('todayString', () => {
  it('returns string in YYYY-MM-DD format', () => {
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('nowTimeString', () => {
  it('returns string in HH:MM format', () => {
    expect(nowTimeString()).toMatch(/^\d{2}:\d{2}$/)
  })
})

describe('getLast7Days', () => {
  it('returns 7 dates ending today', () => {
    const days = getLast7Days()
    expect(days).toHaveLength(7)
    expect(days[6]).toBe(todayString())
  })
})

describe('getChartDataByTeamDate', () => {
  it('groups records by date and team', () => {
    const records = [
      makeRecord({ shift: 'red', tanggal: '2026-05-01' }),
      makeRecord({ shift: 'red', tanggal: '2026-05-01' }),
      makeRecord({ shift: 'white', tanggal: '2026-05-01' }),
    ]
    const data = getChartDataByTeamDate(records, ['2026-05-01'])
    const redEntry = data.find(d => d.tanggal === '2026-05-01' && d.shift === 'red')
    const whiteEntry = data.find(d => d.tanggal === '2026-05-01' && d.shift === 'white')
    expect(redEntry?.count).toBe(2)
    expect(whiteEntry?.count).toBe(1)
  })

  it('omits zero-count entries', () => {
    const records = [makeRecord({ shift: 'red', tanggal: '2026-05-01' })]
    const data = getChartDataByTeamDate(records, ['2026-05-01'])
    expect(data.some(d => d.shift === 'white')).toBe(false)
  })
})

describe('getChartDataFCvsFCD', () => {
  it('counts FC and FCD per team', () => {
    const records = [
      makeRecord({ shift: 'red', runner: 'FC Small' }),
      makeRecord({ shift: 'red', runner: 'FCD Large' }),
      makeRecord({ shift: 'white', runner: 'FC Medium' }),
    ]
    const data = getChartDataFCvsFCD(records)
    expect(data.find(d => d.label === 'Red FC')?.count).toBe(1)
    expect(data.find(d => d.label === 'Red FCD')?.count).toBe(1)
    expect(data.find(d => d.label === 'White FC')?.count).toBe(1)
  })
})
