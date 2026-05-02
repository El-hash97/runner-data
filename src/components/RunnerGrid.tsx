import { RUNNER_TYPES } from '../types'
import './RunnerGrid.css'

interface Props {
  value: string
  onChange: (runner: string) => void
}

export default function RunnerGrid({ value, onChange }: Props) {
  return (
    <div className="runner-grid">
      {RUNNER_TYPES.map(runner => (
        <button
          key={runner}
          type="button"
          className={`runner-btn${value === runner ? ' active' : ''}${runner === 'FCD' ? ' fcd' : ''}`}
          onClick={() => onChange(runner)}
        >
          {runner}
        </button>
      ))}
    </div>
  )
}
