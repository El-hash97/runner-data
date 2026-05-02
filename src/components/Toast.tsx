import { useEffect, useState } from 'react'
import './Toast.css'

interface Props {
  message: string
  trigger: number
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
