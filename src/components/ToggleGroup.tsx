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
