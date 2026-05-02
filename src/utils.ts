import type { PenuanganRecord } from './types'

export function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function nowTimeString(): string {
  const d = new Date()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export function getLast30Days(): string[] {
  const days: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export interface DailyGroupEntry {
  date: string
  label: string
  redFC: number
  redFCD: number
  whiteFC: number
  whiteFCD: number
}

const isFC  = (r: string) => r.includes('FC') && !r.includes('FCD')
const isFCD = (r: string) => r.includes('FCD')

export function getChartDataDaily(
  records: PenuanganRecord[],
  days: string[]
): DailyGroupEntry[] {
  return days.map(tanggal => {
    const day = records.filter(r => r.tanggal === tanggal)
    const [, , d] = tanggal.split('-')
    return {
      date: tanggal,
      label: d,
      redFC:    day.filter(r => r.shift === 'red'   && isFC(r.runner)).length,
      redFCD:   day.filter(r => r.shift === 'red'   && isFCD(r.runner)).length,
      whiteFC:  day.filter(r => r.shift === 'white' && isFC(r.runner)).length,
      whiteFCD: day.filter(r => r.shift === 'white' && isFCD(r.runner)).length,
    }
  })
}

// kept for test compatibility
export interface TeamDateEntry {
  tanggal: string
  shift: 'red' | 'white'
  label: string
  count: number
}

export function getChartDataByTeamDate(
  records: PenuanganRecord[],
  days: string[]
): TeamDateEntry[] {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const result: TeamDateEntry[] = []
  for (const tanggal of days) {
    for (const shift of ['red', 'white'] as const) {
      const count = records.filter(r => r.tanggal === tanggal && r.shift === shift).length
      if (count === 0) continue
      const [, m, d] = tanggal.split('-')
      const label = `${d}/${months[Number(m) - 1]} ${shift.toUpperCase()}`
      result.push({ tanggal, shift, label, count })
    }
  }
  return result
}

export interface FCvsFCDEntry {
  label: string
  count: number
  color: string
}

export function getChartDataFCvsFCD(records: PenuanganRecord[]): FCvsFCDEntry[] {
  return [
    { label: 'Red FC',    count: records.filter(r => r.shift === 'red'   && isFC(r.runner)).length,  color: '#E8343A' },
    { label: 'Red FCD',   count: records.filter(r => r.shift === 'red'   && isFCD(r.runner)).length, color: '#B02020' },
    { label: 'White FC',  count: records.filter(r => r.shift === 'white' && isFC(r.runner)).length,  color: '#D4DAF0' },
    { label: 'White FCD', count: records.filter(r => r.shift === 'white' && isFCD(r.runner)).length, color: '#8892AA' },
  ]
}
