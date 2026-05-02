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
