import { useEffect, useRef, useState } from 'react'

/** A compact multi-select dropdown: a button that opens a checkbox list. */
export default function MultiSelect({
  label,
  options,
  selected,
  onChange,
  max,
  placeholder,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (vals: string[]) => void
  /** Optional cap — once reached, unchecked options are disabled. */
  max?: number
  /** Text shown when nothing is selected (defaults to "All <label>"). */
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const atMax = max != null && selected.length >= max
  const summary =
    selected.length === 0
      ? placeholder ?? `All ${label}`
      : selected.length === 1
        ? selected[0]
        : `${label}: ${selected.length}`

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className={`toggle${selected.length ? ' on' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title={selected.length ? selected.join(', ') : summary}
        style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {summary} ▾
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 200,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            boxShadow: 'var(--shadow-lg)',
            padding: 8,
            minWidth: 240,
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '2px 6px 8px',
              borderBottom: '1px solid var(--border)',
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)', fontWeight: 700 }}>
              {label}
              {max != null ? ` (max ${max})` : ''}
            </span>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Clear
              </button>
            )}
          </div>
          {options.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '4px 6px' }}>No values</div>}
          {options.map((opt) => {
            const checked = selected.includes(opt)
            const disabled = !checked && atMax
            return (
              <label
                key={opt}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 6px',
                  fontSize: 13,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.45 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onChange(checked ? selected.filter((v) => v !== opt) : [...selected, opt])}
                />
                {opt}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
