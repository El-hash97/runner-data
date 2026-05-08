# Runner FC/FCD Checksheet Online — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first offline PWA for recording and monitoring runner FC/FCD penuangan (casting pours) at PT TMMIN Casting Division.

**Architecture:** Single-page React app with bottom-tab navigation, all data persisted in localStorage (offline-first, no backend). Three pages: Input, Dashboard, History. Dark industrial theme matching factory floor conditions.

**Tech Stack:** React 18, Vite 5, TypeScript 5, CSS Variables (no framework), Vitest + @testing-library/react for unit tests, vite-plugin-pwa for PWA manifest/service-worker.

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/types.ts` | `PenuanganRecord` interface + enums |
| `src/storage.ts` | Read/write localStorage; pure functions |
| `src/utils.ts` | Date helpers, filter logic, chart data transforms |
| `src/App.tsx` | Root: holds active tab state, renders page + BottomNav |
| `src/index.css` | CSS custom properties (design tokens), reset, utility classes |
| `src/main.tsx` | Vite entry point |
| `src/components/BottomNav.tsx` | 3-tab sticky nav (Input / Dashboard / History) |
| `src/components/ToggleGroup.tsx` | Reusable 2-option toggle (Red/White, Day/Night, Yes/No) |
| `src/components/RunnerGrid.tsx` | 6-button runner type selector |
| `src/components/Toast.tsx` | Auto-dismiss success notification |
| `src/components/StatCard.tsx` | Single stat card (label + number) |
| `src/components/BarChart.tsx` | Horizontal bar chart, custom CSS, no lib |
| `src/components/HistoryCard.tsx` | Single history record row |
| `src/components/EditModal.tsx` | Bottom-sheet slide-up modal for editing a record |
| `src/pages/InputPage.tsx` | Full input form (US-01–US-09) |
| `src/pages/DashboardPage.tsx` | Stat cards + two bar charts (US-10–US-12) |
| `src/pages/HistoryPage.tsx` | Filter chips + record list + edit/delete (US-13–US-16) |
| `public/manifest.json` | PWA web app manifest |
| `vite.config.ts` | Vite config + vite-plugin-pwa |
| `vitest.config.ts` | Vitest config (jsdom environment) |

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1.1: Scaffold Vite project**

```bash
cd C:\Users\El\Documents\runner
npm create vite@latest . -- --template react-ts
```
Answer prompts: select "React", select "TypeScript". When asked about existing files, select "Ignore files and continue".

- [ ] **Step 1.2: Install dependencies**

```bash
npm install
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom vite-plugin-pwa
```

- [ ] **Step 1.3: Replace `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})
```

- [ ] **Step 1.4: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
  },
})
```

- [ ] **Step 1.5: Create `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 1.6: Add test scripts to `package.json`**

In the `"scripts"` block, add:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 1.7: Verify setup compiles**

```bash
npm run build
```
Expected: build succeeds with no errors.

- [ ] **Step 1.8: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Vite React TS project with Vitest and PWA plugin"
```

---

## Task 2: Types & Storage Layer (with tests)

**Files:**
- Create: `src/types.ts`
- Create: `src/storage.ts`
- Create: `src/storage.test.ts`

- [ ] **Step 2.1: Write `src/types.ts`**

```ts
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
```

- [ ] **Step 2.2: Write failing tests for storage**

Create `src/storage.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { getRecords, saveRecord, updateRecord, deleteRecord, getSavedName, saveOperatorName } from './storage'
import type { PenuanganRecord } from './types'
import { STORAGE_KEY, NAME_KEY } from './types'

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
```

- [ ] **Step 2.3: Run tests — verify they FAIL**

```bash
npm run test:run
```
Expected: FAIL — import errors (storage.ts doesn't exist yet).

- [ ] **Step 2.4: Write `src/storage.ts`**

```ts
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
```

- [ ] **Step 2.5: Run tests — verify they PASS**

```bash
npm run test:run
```
Expected: All 8 tests PASS.

- [ ] **Step 2.6: Commit**

```bash
git add src/types.ts src/storage.ts src/storage.test.ts src/test-setup.ts vitest.config.ts
git commit -m "feat: add data types, localStorage storage layer, and tests"
```

---

## Task 3: Utility Functions (with tests)

**Files:**
- Create: `src/utils.ts`
- Create: `src/utils.test.ts`

- [ ] **Step 3.1: Write failing tests**

Create `src/utils.test.ts`:

```ts
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
```

- [ ] **Step 3.2: Run tests — verify they FAIL**

```bash
npm run test:run
```
Expected: FAIL — import errors.

- [ ] **Step 3.3: Write `src/utils.ts`**

```ts
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
  const isFCD = (r: string) => r.includes('FCD')
  const isFC = (r: string) => r.includes('FC') && !r.includes('FCD')
  return [
    { label: 'Red FC',    count: records.filter(r => r.shift === 'red'   && isFC(r.runner)).length,  color: '#E8343A' },
    { label: 'Red FCD',   count: records.filter(r => r.shift === 'red'   && isFCD(r.runner)).length, color: '#B02020' },
    { label: 'White FC',  count: records.filter(r => r.shift === 'white' && isFC(r.runner)).length,  color: '#D4DAF0' },
    { label: 'White FCD', count: records.filter(r => r.shift === 'white' && isFCD(r.runner)).length, color: '#8892AA' },
  ]
}
```

- [ ] **Step 3.4: Run tests — verify they PASS**

```bash
npm run test:run
```
Expected: All tests PASS.

- [ ] **Step 3.5: Commit**

```bash
git add src/utils.ts src/utils.test.ts
git commit -m "feat: add date/time helpers and chart data transforms with tests"
```

---

## Task 4: Global CSS (Design Tokens + Reset)

**Files:**
- Modify: `src/index.css`
- Modify: `src/main.tsx`
- Modify: `src/App.tsx` (placeholder)

- [ ] **Step 4.1: Replace `src/index.css`**

```css
:root {
  --bg: #0A0C10;
  --surface: #11141A;
  --surface-2: #1A1F2B;
  --gold: #C9A84C;
  --gold-dim: #9A7A32;
  --red-team: #E8343A;
  --white-team: #D4DAF0;
  --green: #3ECF8E;
  --blue: #3A7BD5;
  --text-primary: #E2E8F0;
  --text-secondary: #8892AA;
  --border: #1E2430;
  --radius: 12px;
  --radius-sm: 8px;
  --nav-h: 64px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }
body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  min-height: 100dvh;
  overflow-x: hidden;
}
button { cursor: pointer; border: none; background: none; font: inherit; color: inherit; }
input { font: inherit; color: inherit; }

#root { display: flex; flex-direction: column; min-height: 100dvh; }

.page {
  flex: 1;
  padding: 16px;
  padding-bottom: calc(var(--nav-h) + 24px);
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--gold);
  margin-bottom: 20px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
  display: block;
}

.text-input {
  width: 100%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  color: var(--text-primary);
  font-size: 16px;
  outline: none;
  transition: border-color 0.15s;
}
.text-input:focus { border-color: var(--gold); }

.btn-submit {
  width: 100%;
  background: var(--gold);
  color: #0A0C10;
  font-weight: 700;
  font-size: 16px;
  border-radius: var(--radius);
  padding: 16px;
  transition: opacity 0.15s;
}
.btn-submit:active { opacity: 0.85; }
.btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }

.field { margin-bottom: 16px; }
```

- [ ] **Step 4.2: Replace `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 4.3: Placeholder `src/App.tsx`**

```tsx
export default function App() {
  return <div className="page"><h1 className="page-title">Runner FC/FCD</h1></div>
}
```

- [ ] **Step 4.4: Verify in browser**

```bash
npm run dev
```
Open `http://localhost:5173` — gold title on pure black background, no console errors.

- [ ] **Step 4.5: Commit**

```bash
git add src/index.css src/main.tsx src/App.tsx
git commit -m "feat: add dark industrial CSS design tokens and global reset"
```

---

## Task 5: BottomNav Component

**Files:**
- Create: `src/components/BottomNav.tsx`
- Create: `src/components/BottomNav.css`

- [ ] **Step 5.1: Create `src/components/BottomNav.css`**

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-h);
  background: var(--surface);
  border-top: 1px solid var(--border);
  display: flex;
  z-index: 100;
}

.nav-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-top: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}

.nav-tab.active {
  color: var(--gold);
  border-top-color: var(--gold);
}

.nav-icon { font-size: 20px; line-height: 1; }
```

- [ ] **Step 5.2: Create `src/components/BottomNav.tsx`**

```tsx
import './BottomNav.css'

export type Tab = 'input' | 'dashboard' | 'history'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'input',     icon: '✏️',  label: 'Input' },
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'history',   icon: '📋', label: 'History' },
]

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab${active === tab.id ? ' active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
```

- [ ] **Step 5.3: Wire into `src/App.tsx`**

```tsx
import { useState } from 'react'
import BottomNav, { type Tab } from './components/BottomNav'

export default function App() {
  const [tab, setTab] = useState<Tab>('input')
  return (
    <>
      <div className="page">
        <h1 className="page-title">Runner FC/FCD</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Active: {tab}</p>
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}
```

- [ ] **Step 5.4: Verify in browser**

3-tab nav fixed to bottom; gold underline on active tab; tapping switches active state.

- [ ] **Step 5.5: Commit**

```bash
git add src/components/BottomNav.tsx src/components/BottomNav.css src/App.tsx
git commit -m "feat: add 3-tab BottomNav component"
```

---

## Task 6: ToggleGroup Component

**Files:**
- Create: `src/components/ToggleGroup.tsx`
- Create: `src/components/ToggleGroup.css`

- [ ] **Step 6.1: Create `src/components/ToggleGroup.css`**

```css
.toggle-group { display: flex; gap: 8px; }

.toggle-btn {
  flex: 1;
  padding: 12px 8px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: var(--surface-2);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.15s;
}

.toggle-btn.active {
  border-color: var(--active-color, var(--gold));
  background: color-mix(in srgb, var(--active-color, var(--gold)) 15%, var(--surface-2));
  color: var(--active-color, var(--gold));
}
```

- [ ] **Step 6.2: Create `src/components/ToggleGroup.tsx`**

```tsx
import './ToggleGroup.css'

interface Option {
  value: string
  label: string
  color?: string
}

interface Props {
  options: Option[]
  value: string
  onChange: (value: string) => void
}

export default function ToggleGroup({ options, value, onChange }: Props) {
  return (
    <div className="toggle-group">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`toggle-btn${value === opt.value ? ' active' : ''}`}
          style={{ '--active-color': opt.color } as React.CSSProperties}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 6.3: Commit**

```bash
git add src/components/ToggleGroup.tsx src/components/ToggleGroup.css
git commit -m "feat: add reusable ToggleGroup component"
```

---

## Task 7: RunnerGrid Component

**Files:**
- Create: `src/components/RunnerGrid.tsx`
- Create: `src/components/RunnerGrid.css`

- [ ] **Step 7.1: Create `src/components/RunnerGrid.css`**

```css
.runner-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.runner-btn {
  padding: 14px 10px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: var(--surface-2);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-align: center;
  transition: all 0.15s;
}

.runner-btn.active {
  border-color: var(--gold);
  background: color-mix(in srgb, var(--gold) 15%, var(--surface-2));
  color: var(--gold);
}

.runner-btn .runner-type {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 2px;
}
```

- [ ] **Step 7.2: Create `src/components/RunnerGrid.tsx`**

```tsx
import { RUNNER_TYPES } from '../types'
import './RunnerGrid.css'

interface Props {
  value: string
  onChange: (runner: string) => void
}

export default function RunnerGrid({ value, onChange }: Props) {
  return (
    <div className="runner-grid">
      {RUNNER_TYPES.map(runner => {
        const isFCD = runner.includes('FCD')
        const type = isFCD ? 'FCD' : 'FC'
        const size = runner.replace('FCD', '').replace('FC', '').trim()
        return (
          <button
            key={runner}
            type="button"
            className={`runner-btn${value === runner ? ' active' : ''}`}
            onClick={() => onChange(runner)}
          >
            <span className="runner-type">{type}</span>
            {size}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 7.3: Commit**

```bash
git add src/components/RunnerGrid.tsx src/components/RunnerGrid.css
git commit -m "feat: add RunnerGrid with 6 runner type buttons"
```

---

## Task 8: Toast Component

**Files:**
- Create: `src/components/Toast.tsx`
- Create: `src/components/Toast.css`

- [ ] **Step 8.1: Create `src/components/Toast.css`**

```css
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(-20px);
  background: var(--green);
  color: #0A0C10;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 24px;
  border-radius: 100px;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  pointer-events: none;
  white-space: nowrap;
  z-index: 200;
}

.toast.visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
```

- [ ] **Step 8.2: Create `src/components/Toast.tsx`**

```tsx
import { useEffect, useState } from 'react'
import './Toast.css'

interface Props {
  message: string
  trigger: number  // increment to show
}

export default function Toast({ message, trigger }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (trigger === 0) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(t)
  }, [trigger])

  return <div className={`toast${visible ? ' visible' : ''}`}>{message}</div>
}
```

- [ ] **Step 8.3: Commit**

```bash
git add src/components/Toast.tsx src/components/Toast.css
git commit -m "feat: add auto-dismiss Toast notification"
```

---

## Task 9: InputPage

**Files:**
- Create: `src/pages/InputPage.tsx`
- Create: `src/pages/InputPage.css`

- [ ] **Step 9.1: Create `src/pages/InputPage.css`**

```css
.input-page .form-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 12px;
}

.input-page .autocomplete-list {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-top: 4px;
  overflow: hidden;
}

.input-page .autocomplete-item {
  display: block;
  width: 100%;
  padding: 10px 14px;
  text-align: left;
  font-size: 14px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
}
.input-page .autocomplete-item:last-child { border-bottom: none; }
.input-page .autocomplete-item:active { background: var(--surface); }

.input-page .datetime-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
```

- [ ] **Step 9.2: Create `src/pages/InputPage.tsx`**

```tsx
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
```

- [ ] **Step 9.3: Wire InputPage into `src/App.tsx`**

```tsx
import { useState } from 'react'
import BottomNav, { type Tab } from './components/BottomNav'
import InputPage from './pages/InputPage'

export default function App() {
  const [tab, setTab] = useState<Tab>('input')
  return (
    <>
      {tab === 'input'     && <InputPage />}
      {tab === 'dashboard' && <div className="page"><h1 className="page-title">Dashboard</h1></div>}
      {tab === 'history'   && <div className="page"><h1 className="page-title">History</h1></div>}
      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}
```

- [ ] **Step 9.4: Manual smoke test**

```bash
npm run dev
```
- Fill all fields → Submit → green toast appears.
- Refresh → name auto-fills.
- DevTools → Application → localStorage → `runner_fcd_data_v2` has 1 entry.

- [ ] **Step 9.5: Commit**

```bash
git add src/pages/InputPage.tsx src/pages/InputPage.css src/App.tsx
git commit -m "feat: implement InputPage with autosave, toggles, and toast"
```

---

## Task 10: StatCard + BarChart Components

**Files:**
- Create: `src/components/StatCard.tsx`
- Create: `src/components/StatCard.css`
- Create: `src/components/BarChart.tsx`
- Create: `src/components/BarChart.css`

- [ ] **Step 10.1: Create `src/components/StatCard.css`**

```css
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stat-card .stat-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
}
.stat-card .stat-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}
.stat-card .stat-accent {
  width: 32px;
  height: 3px;
  border-radius: 2px;
  background: var(--accent-color, var(--gold));
  margin-top: 4px;
}
```

- [ ] **Step 10.2: Create `src/components/StatCard.tsx`**

```tsx
import './StatCard.css'

interface Props {
  label: string
  value: number
  accentColor?: string
}

export default function StatCard({ label, value, accentColor }: Props) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      <div className="stat-accent" style={{ '--accent-color': accentColor } as React.CSSProperties} />
    </div>
  )
}
```

- [ ] **Step 10.3: Create `src/components/BarChart.css`**

```css
.bar-chart { display: flex; flex-direction: column; gap: 8px; }

.bar-row {
  display: grid;
  grid-template-columns: 100px 1fr 32px;
  align-items: center;
  gap: 8px;
}

.bar-row-label {
  font-size: 11px;
  color: var(--text-secondary);
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-track {
  height: 24px;
  background: var(--surface-2);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--bar-color, var(--gold));
  transition: width 0.4s ease;
  min-width: 4px;
}

.bar-count {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}
```

- [ ] **Step 10.4: Create `src/components/BarChart.tsx`**

```tsx
import './BarChart.css'

export interface BarEntry {
  label: string
  count: number
  color: string
}

interface Props {
  entries: BarEntry[]
}

export default function BarChart({ entries }: Props) {
  const max = Math.max(...entries.map(e => e.count), 1)
  return (
    <div className="bar-chart">
      {entries.map((entry, i) => (
        <div key={i} className="bar-row">
          <span className="bar-row-label">{entry.label}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(entry.count / max) * 100}%`, '--bar-color': entry.color } as React.CSSProperties}
            />
          </div>
          <span className="bar-count">{entry.count}</span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 10.5: Commit**

```bash
git add src/components/StatCard.tsx src/components/StatCard.css src/components/BarChart.tsx src/components/BarChart.css
git commit -m "feat: add StatCard and BarChart components"
```

---

## Task 11: DashboardPage

**Files:**
- Create: `src/pages/DashboardPage.tsx`
- Create: `src/pages/DashboardPage.css`

- [ ] **Step 11.1: Create `src/pages/DashboardPage.css`**

```css
.dashboard-page .stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}
.dashboard-page .chart-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 12px;
}
.dashboard-page .chart-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 14px;
}
.dashboard-page .empty-chart {
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  padding: 16px 0;
}
```

- [ ] **Step 11.2: Create `src/pages/DashboardPage.tsx`**

```tsx
import { useMemo } from 'react'
import StatCard from '../components/StatCard'
import BarChart from '../components/BarChart'
import { getRecords } from '../storage'
import { todayString, getLast7Days, getChartDataByTeamDate, getChartDataFCvsFCD } from '../utils'
import './DashboardPage.css'

export default function DashboardPage() {
  const records = useMemo(() => getRecords(), [])
  const today = todayString()
  const last7 = getLast7Days()

  const totalCount = records.length
  const todayCount = records.filter(r => r.tanggal === today).length
  const fcCount    = records.filter(r => r.runner.includes('FC') && !r.runner.includes('FCD')).length
  const fcdCount   = records.filter(r => r.runner.includes('FCD')).length

  const teamDateEntries = useMemo(() =>
    getChartDataByTeamDate(records, last7).map(e => ({
      label: e.label,
      count: e.count,
      color: e.shift === 'red' ? '#E8343A' : '#D4DAF0',
    })),
    [records]
  )

  const fcFcdEntries = useMemo(() => getChartDataFCvsFCD(records), [records])

  return (
    <div className="page dashboard-page">
      <h1 className="page-title">Dashboard</h1>

      <div className="stat-grid">
        <StatCard label="Total Penuangan" value={totalCount} accentColor="var(--gold)" />
        <StatCard label="Hari Ini"        value={todayCount} accentColor="var(--blue)" />
        <StatCard label="FC"              value={fcCount}    accentColor="var(--red-team)" />
        <StatCard label="FCD"             value={fcdCount}   accentColor="var(--green)" />
      </div>

      <div className="chart-section">
        <div className="chart-title">Penuangan per Tim · 7 Hari Terakhir</div>
        {teamDateEntries.length === 0
          ? <p className="empty-chart">Belum ada data</p>
          : <BarChart entries={teamDateEntries} />}
      </div>

      <div className="chart-section">
        <div className="chart-title">FC vs FCD per Tim</div>
        {fcFcdEntries.every(e => e.count === 0)
          ? <p className="empty-chart">Belum ada data</p>
          : <BarChart entries={fcFcdEntries.filter(e => e.count > 0)} />}
      </div>
    </div>
  )
}
```

- [ ] **Step 11.3: Wire DashboardPage into `src/App.tsx`**

```tsx
import { useState } from 'react'
import BottomNav, { type Tab } from './components/BottomNav'
import InputPage from './pages/InputPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const [tab, setTab] = useState<Tab>('input')
  return (
    <>
      {tab === 'input'     && <InputPage />}
      {tab === 'dashboard' && <DashboardPage />}
      {tab === 'history'   && <div className="page"><h1 className="page-title">History</h1></div>}
      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}
```

- [ ] **Step 11.4: Manual smoke test**

Add 3 records via Input tab. Switch to Dashboard — stat cards update, bar charts render with colored bars.

- [ ] **Step 11.5: Commit**

```bash
git add src/pages/DashboardPage.tsx src/pages/DashboardPage.css src/App.tsx
git commit -m "feat: implement DashboardPage with stat cards and bar charts"
```

---

## Task 12: HistoryCard + EditModal Components

**Files:**
- Create: `src/components/HistoryCard.tsx`
- Create: `src/components/HistoryCard.css`
- Create: `src/components/EditModal.tsx`
- Create: `src/components/EditModal.css`

- [ ] **Step 12.1: Create `src/components/HistoryCard.css`**

```css
.history-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  margin-bottom: 10px;
}
.history-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.history-card .operator-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}
.team-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.team-badge.red   { background: color-mix(in srgb, var(--red-team)   20%, transparent); color: var(--red-team); }
.team-badge.white { background: color-mix(in srgb, var(--white-team) 15%, transparent); color: var(--white-team); }

.history-card .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.tag {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 100px;
  background: var(--surface-2);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}
.tag.shotblast-yes { background: color-mix(in srgb, var(--green) 15%, transparent); color: var(--green); border-color: transparent; }

.history-card .card-footer { display: flex; justify-content: space-between; align-items: center; }
.history-card .timestamp { font-size: 12px; color: var(--text-secondary); }
.history-card .actions { display: flex; gap: 8px; }
.btn-edit   { font-size: 12px; font-weight: 600; color: var(--blue);     padding: 4px 10px; border: 1px solid var(--blue);     border-radius: 6px; }
.btn-delete { font-size: 12px; font-weight: 600; color: var(--red-team); padding: 4px 10px; border: 1px solid var(--red-team); border-radius: 6px; }
```

- [ ] **Step 12.2: Create `src/components/HistoryCard.tsx`**

```tsx
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
```

- [ ] **Step 12.3: Create `src/components/EditModal.css`**

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 150;
  display: flex;
  align-items: flex-end;
}
.modal-sheet {
  background: var(--surface);
  border-radius: var(--radius) var(--radius) 0 0;
  border-top: 1px solid var(--border);
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 20px 16px 32px;
  max-height: 85dvh;
  overflow-y: auto;
  animation: slide-up 0.2s ease;
}
@keyframes slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-title  { font-size: 18px; font-weight: 700; color: var(--gold); }
.modal-close  { font-size: 22px; color: var(--text-secondary); padding: 4px 8px; }
.modal-actions { display: flex; gap: 10px; margin-top: 20px; }
.btn-cancel { flex: 1; padding: 14px; border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-secondary); font-weight: 600; }
.btn-save   { flex: 2; padding: 14px; background: var(--gold); color: #0A0C10; font-weight: 700; border-radius: var(--radius); }
```

- [ ] **Step 12.4: Create `src/components/EditModal.tsx`**

```tsx
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
```

- [ ] **Step 12.5: Commit**

```bash
git add src/components/HistoryCard.tsx src/components/HistoryCard.css src/components/EditModal.tsx src/components/EditModal.css
git commit -m "feat: add HistoryCard and EditModal components"
```

---

## Task 13: HistoryPage

**Files:**
- Create: `src/pages/HistoryPage.tsx`
- Create: `src/pages/HistoryPage.css`

- [ ] **Step 13.1: Create `src/pages/HistoryPage.css`**

```css
.history-page .filter-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 16px;
  scrollbar-width: none;
}
.history-page .filter-chips::-webkit-scrollbar { display: none; }

.chip {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.15s;
}
.chip.active { background: var(--gold); border-color: var(--gold); color: #0A0C10; }

.history-page .empty-state {
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  padding: 40px 0;
}
.history-page .record-count {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}
```

- [ ] **Step 13.2: Create `src/pages/HistoryPage.tsx`**

```tsx
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
        : displayed.map(r => (
            <HistoryCard key={r.id} record={r} onEdit={setEditTarget} onDelete={handleDelete} />
          ))
      }

      <EditModal record={editTarget} onSave={handleSave} onClose={() => setEditTarget(null)} />
    </div>
  )
}
```

- [ ] **Step 13.3: Wire HistoryPage into `src/App.tsx` (final)**

```tsx
import { useState } from 'react'
import BottomNav, { type Tab } from './components/BottomNav'
import InputPage from './pages/InputPage'
import DashboardPage from './pages/DashboardPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  const [tab, setTab] = useState<Tab>('input')
  return (
    <>
      {tab === 'input'     && <InputPage />}
      {tab === 'dashboard' && <DashboardPage />}
      {tab === 'history'   && <HistoryPage />}
      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}
```

- [ ] **Step 13.4: Manual smoke test**

```bash
npm run dev
```
- History tab → all records listed newest-first.
- Filter chips → correct subsets.
- Edit → modal opens, change runner, Simpan → card updates.
- Hapus → confirm dialog → record removed.

- [ ] **Step 13.5: Commit**

```bash
git add src/pages/HistoryPage.tsx src/pages/HistoryPage.css src/App.tsx
git commit -m "feat: implement HistoryPage with filter chips, edit modal, and delete"
```

---

## Task 14: PWA Setup + Final Build

**Files:**
- Create: `public/manifest.json`
- Modify: `index.html`

- [ ] **Step 14.1: Create `public/manifest.json`**

```json
{
  "name": "Runner FC/FCD Checksheet",
  "short_name": "Runner FCD",
  "description": "Checksheet penuangan runner FC/FCD — Casting Division TMMIN",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A0C10",
  "theme_color": "#C9A84C",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 14.2: Replace `index.html` head**

```html
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#C9A84C" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="description" content="Checksheet penuangan runner FC/FCD — Casting Division TMMIN" />
    <link rel="manifest" href="/manifest.json" />
    <title>Runner FC/FCD</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 14.3: Run full test suite**

```bash
npm run test:run
```
Expected: All tests PASS.

- [ ] **Step 14.4: Production build**

```bash
npm run build
npm run preview
```
Open `http://localhost:4173` — verify all 3 tabs, form submit, toast, history filter, edit modal, delete all work. Check DevTools console for zero errors.

- [ ] **Step 14.5: Final commit**

```bash
git add public/manifest.json index.html
git commit -m "feat: add PWA manifest and meta tags for installable offline app"
```

---

## Spec Coverage Checklist

| US | Requirement | Task |
|----|-------------|------|
| US-01 | Nama wajib diisi sebelum submit | Task 9 — `isValid` guard |
| US-02 | Autofill nama dari localStorage | Task 9 — `getSavedName()` on mount |
| US-03 | Toggle Red/White | Task 6 + Task 9 |
| US-04 | Toggle Day/Night | Task 6 + Task 9 |
| US-05 | Min 6 runner types | Task 7 — 6 items in `RUNNER_TYPES` |
| US-06 | Tanggal default hari ini | Task 9 — `todayString()` default |
| US-07 | Jam default sekarang | Task 9 — `nowTimeString()` default |
| US-08 | Toggle Shotblast Yes/No | Task 6 + Task 9 |
| US-09 | Toast konfirmasi | Task 8 + Task 9 |
| US-10 | 4 stat cards | Task 10 + Task 11 |
| US-11 | Bar chart 7 hari per tim | Task 3 + Task 10 + Task 11 |
| US-12 | Chart FC vs FCD per tim | Task 3 + Task 10 + Task 11 |
| US-13 | Halaman history | Task 13 |
| US-14 | Filter chips 6 opsi | Task 13 |
| US-15 | Edit modal bottom sheet | Task 12 + Task 13 |
| US-16 | Hapus dengan konfirmasi | Task 12 — `confirm()` |
