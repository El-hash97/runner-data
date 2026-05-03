import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import type { DailyGroupEntry } from '../utils'
import './VerticalBarChart.css'

const M = { top: 12, right: 12, bottom: 40, left: 36 }
const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

function formatDate(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d} ${MONTHS[+m - 1]}`
}

function computeAxis(maxVal: number): { axisMax: number; ticks: number[] } {
  if (maxVal <= 0) return { axisMax: 5, ticks: [0, 1, 2, 3, 4, 5] }
  const rawStep = maxVal / 4
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500]
  const step = steps.find(s => s >= rawStep) ?? 500
  const axisMax = Math.ceil(maxVal / step) * step
  const ticks: number[] = []
  for (let t = 0; t <= axisMax; t += step) ticks.push(t)
  return { axisMax, ticks }
}

interface Props { entries: DailyGroupEntry[] }

export default function VerticalBarChart({ entries }: Props) {
  const outerRef = useRef<HTMLDivElement>(null)
  const [cw, setCw] = useState(320)
  const [hover, setHover] = useState<{ gi: number; cx: number } | null>(null)

  useLayoutEffect(() => {
    if (outerRef.current) setCw(outerRef.current.clientWidth || 320)
  }, [])

  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setCw(el.clientWidth || 320))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const CHART_H = cw >= 640 ? 260 : 200
  const totalH  = CHART_H + M.top + M.bottom
  const chartW  = Math.max(cw - M.left - M.right, 60)
  const n       = entries.length || 1

  const rawMax = Math.max(...entries.flatMap(e => [e.redFC, e.redFCD, e.whiteFC, e.whiteFCD]), 1)
  const { axisMax, ticks } = computeAxis(rawMax)

  const groupW  = chartW / n
  const barGap  = Math.max(1, Math.min(3, groupW / 10))
  const pad     = Math.max(groupW * 0.1, 2)

  let barW: number
  let getX: (gi: number, bi: number) => number

  if (n === 1) {
    barW = Math.min(52, Math.max(8, chartW / 7))
    const span = 4 * barW + 3 * barGap
    const x0   = M.left + (chartW - span) / 2
    getX = (_gi, bi) => x0 + bi * (barW + barGap)
  } else {
    barW = Math.max((groupW - 2 * pad - 3 * barGap) / 4, 1)
    getX = (gi, bi) => M.left + gi * groupW + pad + bi * (barW + barGap)
  }

  function toH(v: number) { return v > 0 ? Math.max(2, Math.min(CHART_H, (v / axisMax) * CHART_H)) : 0 }
  function toY(v: number) { return M.top + CHART_H - toH(v) }

  const labelSkip = groupW < 14 ? 5 : groupW < 24 ? 2 : 1

  function onMove(clientX: number, svgRect: DOMRect) {
    const x  = clientX - svgRect.left
    const gi = Math.floor((x - M.left) / groupW)
    if (gi >= 0 && gi < entries.length) {
      const cx = n === 1 ? M.left + chartW / 2 : M.left + gi * groupW + groupW / 2
      setHover({ gi, cx })
    } else setHover(null)
  }

  const he = hover !== null ? entries[hover.gi] : null

  const BARS = [
    { key: 'redFC',    color: '#E8343A', hatch: false },
    { key: 'redFCD',   color: '#E8343A', hatch: true  },
    { key: 'whiteFC',  color: '#D4DAF0', hatch: false },
    { key: 'whiteFCD', color: '#D4DAF0', hatch: true  },
  ] as const

  return (
    <div className="vchart-outer" ref={outerRef}>
      <div className="vchart-legend">
        {[
          { label: 'Red FC',    cls: 'vc-red'                  },
          { label: 'Red FCD',   cls: 'vc-red vc-hatch'         },
          { label: 'White FC',  cls: 'vc-white'                },
          { label: 'White FCD', cls: 'vc-white vc-hatch'       },
        ].map(l => (
          <span key={l.label} className="vchart-legend-item">
            <span className={`vchart-swatch ${l.cls}`} />{l.label}
          </span>
        ))}
      </div>

      <div className="vchart-svg-wrap">
        <svg
          width={cw}
          height={totalH}
          style={{ display: 'block' }}
          onMouseMove={e => onMove(e.clientX, e.currentTarget.getBoundingClientRect())}
          onMouseLeave={() => setHover(null)}
          onTouchStart={e => { e.preventDefault(); const t = e.touches[0]; if (t) onMove(t.clientX, e.currentTarget.getBoundingClientRect()) }}
          onTouchMove={e => { e.preventDefault(); const t = e.touches[0]; if (t) onMove(t.clientX, e.currentTarget.getBoundingClientRect()) }}
          onTouchEnd={() => setTimeout(() => setHover(null), 2500)}
          role="img"
          aria-label="Grafik penuangan per hari"
        >
          <defs>
            <pattern id="vch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,0,0,0.45)" strokeWidth="2.5" />
            </pattern>
          </defs>

          {/* Y gridlines + labels */}
          {ticks.map((t, i) => {
            const y = toY(t)
            return (
              <g key={i}>
                <line
                  x1={M.left} y1={y} x2={M.left + chartW} y2={y}
                  stroke={t === 0 ? '#2A3040' : '#1E2430'}
                  strokeWidth={t === 0 ? 1.5 : 1}
                  strokeDasharray={t === 0 ? undefined : '5 4'}
                />
                <text x={M.left - 6} y={y + 4} textAnchor="end"
                  fill="#8892AA" fontSize="10"
                  fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
                  {t}
                </text>
              </g>
            )
          })}

          {/* Hover column */}
          {hover && (
            <rect
              x={n === 1 ? M.left : M.left + hover.gi * groupW}
              y={M.top} width={n === 1 ? chartW : groupW} height={CHART_H}
              fill="rgba(201,168,76,0.07)" />
          )}

          {/* Bars */}
          {entries.map((e, gi) =>
            BARS.map((b, bi) => {
              const v = e[b.key]
              const h = toH(v)
              if (h < 0.5) return null
              const x = getX(gi, bi)
              const y = toY(v)
              return (
                <g key={`${gi}-${bi}`}>
                  <rect x={x} y={y} width={barW} height={h} fill={b.color} rx="2" ry="2" />
                  {b.hatch && <rect x={x} y={y} width={barW} height={h} fill="url(#vch)" rx="2" ry="2" />}
                </g>
              )
            })
          )}

          {/* X axis line */}
          <line
            x1={M.left} y1={M.top + CHART_H} x2={M.left + chartW} y2={M.top + CHART_H}
            stroke="#2A3040" strokeWidth="1.5" />

          {/* X date labels */}
          {entries.map((e, gi) => {
            if (gi % labelSkip !== 0 && gi !== n - 1) return null
            const cx = n === 1 ? M.left + chartW / 2 : M.left + gi * groupW + groupW / 2
            return (
              <text key={gi} x={cx} y={M.top + CHART_H + 20} textAnchor="middle"
                fill="#8892AA" fontSize="10"
                fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
                {e.label}
              </text>
            )
          })}

          {/* Hover indicator */}
          {hover && (
            <line
              x1={hover.cx} y1={M.top} x2={hover.cx} y2={M.top + CHART_H}
              stroke="rgba(201,168,76,0.35)" strokeWidth="1" strokeDasharray="4 3"
              pointerEvents="none" />
          )}
        </svg>

        {/* Tooltip */}
        {hover && he && (() => {
          const total = he.redFC + he.redFCD + he.whiteFC + he.whiteFCD
          const TIP_W = 152
          let left = hover.cx + 12
          if (left + TIP_W > cw - 4) left = hover.cx - TIP_W - 12
          return (
            <div className="vchart-tip" style={{ left, top: M.top + 4 }}>
              <div className="vchart-tip-date">{formatDate(he.date)}</div>
              {([
                { v: he.redFC,    label: 'Red FC',    color: '#E8343A', hatch: false },
                { v: he.redFCD,   label: 'Red FCD',   color: '#E8343A', hatch: true  },
                { v: he.whiteFC,  label: 'White FC',  color: '#D4DAF0', hatch: false },
                { v: he.whiteFCD, label: 'White FCD', color: '#D4DAF0', hatch: true  },
              ] as const).map(r => r.v > 0 && (
                <div key={r.label} className="vchart-tip-row">
                  <span className={`vchart-tip-dot${r.hatch ? ' vc-hatch' : ''}`}
                    style={{ background: r.color }} />
                  {r.label}<span className="vchart-tip-val">{r.v}</span>
                </div>
              ))}
              {total === 0 && <div className="vchart-tip-empty">Tidak ada data</div>}
              <div className="vchart-tip-total">Total: {total}</div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
