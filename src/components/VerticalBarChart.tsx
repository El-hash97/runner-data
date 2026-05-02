import type { DailyGroupEntry } from '../utils'
import './VerticalBarChart.css'

const CHART_H = 180

interface Props {
  entries: DailyGroupEntry[]
}

export default function VerticalBarChart({ entries }: Props) {
  const max = Math.max(
    ...entries.flatMap(e => [e.redFC, e.redFCD, e.whiteFC, e.whiteFCD]),
    1
  )

  const n = entries.length
  const barW  = n === 1 ? 44 : n <= 7 ? 22 : 10
  const barGap = n === 1 ? 10 : n <= 7 ? 5  : 2

  function barH(v: number) {
    return v > 0 ? Math.max((v / max) * CHART_H, 3) : 0
  }

  return (
    <div className="vchart-wrapper">
      <div className="vchart-legend">
        <span className="vchart-legend-item"><span className="vchart-swatch vc-red" />Red FC</span>
        <span className="vchart-legend-item"><span className="vchart-swatch vc-red vc-hatch" />Red FCD</span>
        <span className="vchart-legend-item"><span className="vchart-swatch vc-white" />White FC</span>
        <span className="vchart-legend-item"><span className="vchart-swatch vc-white vc-hatch" />White FCD</span>
      </div>

      <div className="vchart-scroll">
        <div className="vchart-inner" style={{ height: CHART_H + 32 }}>
          {entries.map((e, i) => (
            <div key={i} className="vchart-group">
              <div className="vchart-bars" style={{ height: CHART_H, gap: barGap }}>
                <div className="vchart-bar vc-red"                style={{ height: barH(e.redFC),    width: barW }} />
                <div className="vchart-bar vc-red  vc-hatch"      style={{ height: barH(e.redFCD),   width: barW }} />
                <div className="vchart-bar vc-white"              style={{ height: barH(e.whiteFC),  width: barW }} />
                <div className="vchart-bar vc-white vc-hatch"     style={{ height: barH(e.whiteFCD), width: barW }} />
              </div>
              <span className="vchart-label">{e.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
