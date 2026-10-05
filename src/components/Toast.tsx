import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

let pushToast: ((msg: string) => void) | null = null

export function toast(msg: string) {
  pushToast?.(msg)
}

export default function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    pushToast = (m: string) => {
      setMsg(m)
      clearTimeout(timer)
      timer = setTimeout(() => setMsg(null), 2600)
    }
    return () => {
      pushToast = null
      clearTimeout(timer)
    }
  }, [])

  if (!msg) return null
  return (
    <div className="toast">
      <CheckCircle2 size={16} color="#34d399" />
      {msg}
    </div>
  )
}
