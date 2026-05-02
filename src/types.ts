export interface PenuanganRecord {
  id: number
  nama: string
  shift: 'red' | 'white'
  time: 'day' | 'night'
  runner: string
  tanggal: string   // YYYY-MM-DD
  jam: string       // HH:MM
  shotblast: 'yes' | 'no'
  createdAt: string // ISO 8601
}

export const RUNNER_TYPES = [
  'FC Small',
  'FC Medium',
  'FC Large',
  'FCD Small',
  'FCD Medium',
  'FCD Large',
] as const

export type RunnerType = typeof RUNNER_TYPES[number]

export const STORAGE_KEY = 'runner_fcd_data_v2'
export const NAME_KEY = 'runner_saved_name'
