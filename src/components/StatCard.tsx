import './StatCard.css'

interface Props {
  label: string
  value: number
  accentColor?: string
}

export default function StatCard({ label, value, accentColor }: Props) {
  return (
    <div className="stat-card" style={{ '--accent-color': accentColor } as React.CSSProperties}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  )
}
