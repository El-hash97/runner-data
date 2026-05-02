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
