import type { DailyGroupEntry } from '../utils'
import './VerticalBarChart.css'

const CHART_H = 180

interface Props {
  entries: DailyGroupEntry[]
}

export default function VerticalBarChart({ entries }: Props) {
  const max = Math.max(
    ...entries.flatMap(e => [e.redFC + e.redFCD, e.whiteFC + e.whiteFCD]),
    1
  )

  return (
    <div className="vchart-wrapper">
      <div className="vchart-legend">
        <span className="vchart-legend-item">
          <span className="vchart-swatch vc-red" />Red FC
        </span>
        <span className="vchart-legend-item">
          <span className="vchart-swatch vc-red vc-hatch" />Red FCD
        </span>
        <span className="vchart-legend-item">
          <span className="vchart-swatch vc-white" />White FC
        </span>
        <span className="vchart-legend-item">
          <span className="vchart-swatch vc-white vc-hatch" />White FCD
        </span>
      </div>

      <div className="vchart-scroll">
        <div className="vchart-inner" style={{ height: CHART_H + 28 }}>
          {entries.map((e, i) => {
            const redTotal   = e.redFC + e.redFCD
            const whiteTotal = e.whiteFC + e.whiteFCD
            const redH   = redTotal   > 0 ? Math.max((redTotal   / max) * CHART_H, 3) : 0
            const whiteH = whiteTotal > 0 ? Math.max((whiteTotal / max) * CHART_H, 3) : 0
            return (
              <div key={i} className="vchart-group">
                <div className="vchart-bars" style={{ height: CHART_H }}>
                  <div className="vchart-bar" style={{ height: redH }}>
                    {e.redFCD > 0 && <div className="vchart-seg vc-red vc-hatch" style={{ flex: e.redFCD }} />}
                    {e.redFC  > 0 && <div className="vchart-seg vc-red"          style={{ flex: e.redFC  }} />}
                  </div>
                  <div className="vchart-bar" style={{ height: whiteH }}>
                    {e.whiteFCD > 0 && <div className="vchart-seg vc-white vc-hatch" style={{ flex: e.whiteFCD }} />}
                    {e.whiteFC  > 0 && <div className="vchart-seg vc-white"          style={{ flex: e.whiteFC  }} />}
                  </div>
                </div>
                <span className="vchart-label">{e.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
